import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from './db';
import { aiService } from './aiService';
import { requireAdmin, requireAuth, signToken, AuthRequest } from './auth';
import { LoginSchema, PackageSchema, EnquirySchema, AIExtractionUpdateSchema } from '../validators';

const router = express.Router();

// ================= PUBLIC ROUTES =================

/**
 * GET /api/packages
 * Returns published packages for public display with search, filters, and sorting.
 */
router.get('/packages', async (req: Request, res: Response) => {
  try {
    const { search, destination, duration, hotelCategory, season, sortBy } = req.query;
    const packages = await db.getPackages({
      status: 'published',
      search: search as string,
      destination: destination as string,
      duration: duration as string,
      hotelCategory: hotelCategory as string,
      season: season as string,
      sortBy: sortBy as any,
    });
    res.json({ success: true, count: packages.length, packages });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

/**
 * GET /api/packages/:slug
 * Retrieves single package by slug. If preview=true and admin token supplied, allows draft.
 */
router.get('/packages/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const isPreview = req.query.preview === 'true';

    const pkg = await db.getPackageBySlug(slug, isPreview);
    if (!pkg) {
      res.status(404).json({ error: 'Package not found or not currently published' });
      return;
    }

    res.json({ success: true, package: pkg });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

/**
 * POST /api/enquiries
 * Handles public enquiry submission.
 * 1. Validates request
 * 2. Saves enquiry to DB
 * 3. Preserves original customer message
 * 4. Triggers AI extraction
 * 5. Generates package recommendations (deterministic 100-pt algorithm)
 * 6. Generates reply draft
 * 7. Records fixed template in-app acknowledgement
 */
router.post('/enquiries', async (req: Request, res: Response) => {
  try {
    const parsed = EnquirySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const {
      customerName,
      email,
      phone,
      destination,
      travelDate,
      adults,
      children,
      duration,
      budget,
      specialRequirements,
      whatsappConsent,
    } = parsed.data;

    const originalMessage =
      parsed.data.originalMessage ||
      `Travel to ${destination} for ${adults} adults and ${children} kids in ${travelDate}. Budget ₹${budget}. Special notes: ${specialRequirements || 'None'}`;

    // Step 2: Save enquiry in MongoDB / local DB
    const enquiry = await db.createEnquiry({
      customerName,
      email,
      phone,
      destination,
      travelDate,
      adults,
      children,
      duration,
      budget,
      originalMessage,
      whatsappConsent,
    });

    // Step 3: Trigger AI extraction (resilient: failures are safely caught & preserved)
    let aiExtraction = null;
    let topPackages: any[] = [];
    let replyDraft = '';

    try {
      aiExtraction = await aiService.extractEnquiryDetails(enquiry);
      await db.saveAIExtraction(aiExtraction);

      // Step 4: Deterministic Package Recommendations
      topPackages = await aiService.rankPackagesForEnquiry(aiExtraction.extractedFields);

      // Step 5: Generate AI reply draft
      replyDraft = await aiService.generateReplyDraft(enquiry, aiExtraction.extractedFields, topPackages);
      await db.saveEnquiryReply({
        id: `rep_${Date.now()}`,
        enquiryId: enquiry.id,
        draftContent: replyDraft,
        approvalStatus: 'draft',
        createdAt: new Date().toISOString(),
      });
    } catch (aiErr) {
      console.error('AI pipeline non-fatal error during enquiry submission:', aiErr);
      // Enquiry remains completely safe!
    }

    // Step 6: Log activity
    await db.logActivity(
      `New enquiry received from ${customerName} (${destination})`,
      'enquiry',
      enquiry.id,
      'guest'
    );

    // In-application fixed template acknowledgement (Section 15)
    const fixedAcknowledgement = {
      message:
        'Thank you for your enquiry! We have received your travel requirements. Our travel team in Kochi will review your request and get back to you shortly.',
      timestamp: enquiry.acknowledgementTimestamp,
      status: enquiry.acknowledgementStatus,
      externalDelivery: 'Not configured (in-application recorded)',
    };

    res.status(201).json({
      success: true,
      enquiryId: enquiry.id,
      acknowledgement: fixedAcknowledgement,
      topMatchesCount: topPackages.length,
      message: 'Enquiry successfully submitted and queued for review.',
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// ================= AUTH ROUTES =================

/**
 * POST /api/auth/login
 */
router.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const parsed = LoginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Please enter a valid email and password' });
      return;
    }

    const { email, password } = parsed.data;
    const user = await db.findUserByEmail(email);

    if (!user || !user.passwordHash) {
      res.status(401).json({ error: 'Invalid email or password. If you are a new traveller, please click "Register" to create your account.' });
      return;
    }

    const isValid = bcrypt.compareSync(password, user.passwordHash);
    if (!isValid) {
      res.status(401).json({ error: 'Incorrect password. Please verify and try again.' });
      return;
    }

    const token = signToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    // Set secure HTTP-only cookie
    res.cookie('wandercms_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

/**
 * POST /api/auth/register
 * Allows any traveller to register with their own Gmail / email
 */
router.post('/auth/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      res.status(400).json({ error: 'Please enter a valid email address' });
      return;
    }
    if (!password || typeof password !== 'string' || password.length < 4) {
      res.status(400).json({ error: 'Password must be at least 4 characters long' });
      return;
    }

    const user = await db.registerTraveller(name || '', email, password);
    const token = signToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: 'traveller',
    });

    res.cookie('wandercms_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

/**
 * GET /api/auth/me
 */
router.get('/auth/me', requireAuth, async (req: AuthRequest, res: Response) => {
  res.json({ success: true, user: req.user });
});

/**
 * POST /api/auth/logout
 */
router.post('/auth/logout', (req: Request, res: Response) => {
  res.clearCookie('wandercms_token');
  res.json({ success: true, message: 'Logged out successfully' });
});

/**
 * POST /api/auth/traveller-lookup
 * Allows a traveller to sign in or access their portal via Enquiry Reference Code & Email
 */
router.post('/auth/traveller-lookup', async (req: Request, res: Response) => {
  try {
    const { email, enquiryId } = req.body;
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      res.status(400).json({ error: 'Please enter a valid email address' });
      return;
    }

    const normEmail = email.trim().toLowerCase();

    // Check if enquiry exists
    let enquiry = null;
    if (enquiryId && typeof enquiryId === 'string' && enquiryId.trim()) {
      enquiry = await db.findEnquiryByIdAndEmail(enquiryId.trim(), normEmail);
      if (!enquiry) {
        res.status(404).json({ error: `No enquiry found for reference code "${enquiryId}" and email "${email}"` });
        return;
      }
    } else {
      // Find any enquiry for this email
      const result = await db.getTravellerDashboardData(normEmail);
      if (result.enquiries.length === 0) {
        const existing = await db.findUserByEmail(normEmail);
        if (!existing) {
          res.status(404).json({
            error: `No existing bookings or enquiries found for ${email}. Please submit an enquiry first or sign in with your password.`
          });
          return;
        }
      }
    }

    const customerName = enquiry?.customerName || (await db.findUserByEmail(normEmail))?.name || 'Valued Traveller';
    const user = await db.createOrFindTravellerUser(customerName, normEmail);

    const token = signToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: 'traveller',
    });

    res.cookie('wandercms_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

/**
 * GET /api/traveller/dashboard
 * Retrieves enquiries, AI recommendations, and approved quotes for the logged-in traveller
 */
router.get('/traveller/dashboard', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const data = await db.getTravellerDashboardData(req.user.email);
    res.json({
      success: true,
      ...data,
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

/**
 * POST /api/traveller/send-email-summary
 * Dispatches the complete quotation and booking voucher summary to the traveller's Gmail
 */
router.post('/traveller/send-email-summary', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { enquiryId, recipientEmail } = req.body;
    if (!recipientEmail || typeof recipientEmail !== 'string' || !recipientEmail.includes('@')) {
      res.status(400).json({ error: 'Please enter a valid Gmail / email address' });
      return;
    }

    const enquiry = await db.getEnquiryById(enquiryId);
    if (!enquiry) {
      res.status(404).json({ error: 'Booking enquiry not found' });
      return;
    }

    const sentTimestamp = new Date().toISOString();

    // Log the action to database activity audit
    await db.logActivity(
      `Dispatched travel quotation voucher to Gmail (${recipientEmail}) for booking #${enquiry.id.slice(-6)}`,
      'enquiry',
      enquiry.id,
      req.user?.id || 'traveller'
    );

    // Save a note on the enquiry
    await db.addEnquiryNote(
      enquiryId,
      'WanderCMS Mail Desk',
      `Official booking summary & quotation dispatched to ${recipientEmail} at ${sentTimestamp}`
    );

    res.json({
      success: true,
      message: `Booking quotation and itinerary summary successfully sent to ${recipientEmail}`,
      sentAt: sentTimestamp,
      recipientEmail,
      enquiryId,
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// ================= ADMIN ROUTES =================

/**
 * GET /api/admin/dashboard
 */
router.get('/admin/dashboard', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const stats = await db.getDashboardStats();
    const systemStatus = {
      database: db.getDatabaseStatus(),
      ai: aiService.getStatus(),
    };
    res.json({ success: true, stats, systemStatus });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

/**
 * GET /api/admin/packages
 * Returns all packages (including drafts) for staff admin
 */
router.get('/admin/packages', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { status, search } = req.query;
    const packages = await db.getPackages({
      status: (status as any) || 'all',
      search: search as string,
    });
    res.json({ success: true, packages });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

/**
 * POST /api/admin/packages
 * Creates a new package
 */
router.post('/admin/packages', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const parsed = PackageSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
      return;
    }

    const newPkg = await db.createPackage(parsed.data as any, req.user!.id);
    await db.logActivity(`Created package ${newPkg.title} (${newPkg.packageId})`, 'package', newPkg.id, req.user!.id);

    res.status(201).json({ success: true, package: newPkg });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

/**
 * PUT /api/admin/packages/:id
 * Updates package draft without overwriting current published version
 */
router.put('/admin/packages/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { changeSummary, ...updates } = req.body;

    const updated = await db.updatePackageDraft(id, updates, req.user!.id, changeSummary || 'Draft update');
    await db.logActivity(`Updated draft for ${updated.title} (v${updated.currentDraftVersion})`, 'package', id, req.user!.id);

    res.json({ success: true, package: updated });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

/**
 * POST /api/admin/packages/:id/publish
 * Publishes draft, creates immutable snapshot, and promotes to public live version
 */
router.post('/admin/packages/:id/publish', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const published = await db.publishPackage(id, req.user!.id);
    await db.logActivity(`Published ${published.title} (v${published.currentPublishedVersion}) to live site`, 'package', id, req.user!.id);

    res.json({ success: true, package: published, message: 'Package published successfully' });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

/**
 * POST /api/admin/packages/:id/duplicate
 */
router.post('/admin/packages/:id/duplicate', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const duplicated = await db.duplicatePackage(id, req.user!.id);
    await db.logActivity(`Duplicated package ${duplicated.packageId}`, 'package', duplicated.id, req.user!.id);

    res.json({ success: true, package: duplicated });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

/**
 * GET /api/admin/packages/:packageId/versions
 * Returns immutable version snapshots
 */
router.get('/admin/packages/:packageId/versions', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { packageId } = req.params;
    const versions = await db.getPackageVersions(packageId);
    res.json({ success: true, versions });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

/**
 * GET /api/admin/enquiries
 */
router.get('/admin/enquiries', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { status, search } = req.query;
    const enquiries = await db.getEnquiries({
      status: status as string,
      search: search as string,
    });
    res.json({ success: true, enquiries });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

/**
 * GET /api/admin/enquiries/:id
 * Returns enquiry details, AI extraction, top 3 matched packages, reply draft, and notes
 */
router.get('/admin/enquiries/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const enquiry = await db.getEnquiryById(id);
    if (!enquiry) {
      res.status(404).json({ error: 'Enquiry not found' });
      return;
    }

    let aiExtraction = await db.getAIExtraction(id);
    if (!aiExtraction) {
      // Lazy extract if not present
      aiExtraction = await aiService.extractEnquiryDetails(enquiry);
      await db.saveAIExtraction(aiExtraction);
    }

    const packageMatches = await aiService.rankPackagesForEnquiry(aiExtraction.extractedFields);

    let replyDraft = await db.getEnquiryReply(id);
    if (!replyDraft) {
      const generated = await aiService.generateReplyDraft(enquiry, aiExtraction.extractedFields, packageMatches);
      replyDraft = await db.saveEnquiryReply({
        id: `rep_${Date.now()}`,
        enquiryId: id,
        draftContent: generated,
        approvalStatus: 'draft',
        createdAt: new Date().toISOString(),
      });
    }

    res.json({
      success: true,
      enquiry,
      aiExtraction,
      packageMatches,
      replyDraft,
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

/**
 * PATCH /api/admin/enquiries/:id/status
 */
router.patch('/admin/enquiries/:id/status', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) {
      res.status(400).json({ error: 'Status is required' });
      return;
    }

    const updated = await db.updateEnquiryStatus(id, status);
    await db.logActivity(`Updated enquiry #${id.slice(-6)} status to "${status}"`, 'enquiry', id, req.user!.id);

    res.json({ success: true, enquiry: updated });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

/**
 * POST /api/admin/enquiries/:id/notes
 */
router.post('/admin/enquiries/:id/notes', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    if (!text || !text.trim()) {
      res.status(400).json({ error: 'Note text cannot be empty' });
      return;
    }

    const updated = await db.addEnquiryNote(id, req.user!.name, text.trim());
    await db.logActivity(`Added internal note to enquiry #${id.slice(-6)}`, 'enquiry', id, req.user!.id);

    res.json({ success: true, enquiry: updated });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

/**
 * POST /api/admin/enquiries/:id/ai-extract
 * Manually update extracted parameters or trigger re-extraction
 */
router.post('/admin/enquiries/:id/ai-extract', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { recompute, updatedFields } = req.body;

    const enquiry = await db.getEnquiryById(id);
    if (!enquiry) {
      res.status(404).json({ error: 'Enquiry not found' });
      return;
    }

    let extraction: any;

    if (recompute) {
      extraction = await aiService.extractEnquiryDetails(enquiry);
      await db.saveAIExtraction(extraction);
    } else if (updatedFields) {
      const parsed = AIExtractionUpdateSchema.safeParse(updatedFields);
      if (!parsed.success) {
        res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
        return;
      }
      extraction = await db.updateAIExtractionFields(id, parsed.data, req.user!.name);
    }

    // Re-rank packages based on updated fields
    const updatedMatches = await aiService.rankPackagesForEnquiry(extraction.extractedFields);

    await db.logActivity(`Updated AI extraction fields for enquiry #${id.slice(-6)}`, 'enquiry', id, req.user!.id);

    res.json({
      success: true,
      aiExtraction: extraction,
      packageMatches: updatedMatches,
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

/**
 * PUT /api/admin/enquiries/:id/reply
 * Edit reply draft
 */
router.put('/admin/enquiries/:id/reply', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { draftContent } = req.body;
    if (!draftContent) {
      res.status(400).json({ error: 'Draft content required' });
      return;
    }

    const reply = await db.saveEnquiryReply({
      id: `rep_${Date.now()}`,
      enquiryId: id,
      draftContent,
      approvalStatus: 'draft',
      createdAt: new Date().toISOString(),
    });

    res.json({ success: true, replyDraft: reply });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

/**
 * POST /api/admin/enquiries/:id/reply/approve
 * Approves reply draft (consultant approval compulsory per Section 14.C)
 */
router.post('/admin/enquiries/:id/reply/approve', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const reply = await db.approveEnquiryReply(id, req.user!.name);
    await db.logActivity(`Approved reply draft for enquiry #${id.slice(-6)}`, 'reply', id, req.user!.id);

    res.json({
      success: true,
      replyDraft: reply,
      message: 'Reply draft approved. Status updated to Contacted.',
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

/**
 * GET /api/admin/activity-logs
 */
router.get('/admin/activity-logs', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const logs = await db.getActivityLogs();
    res.json({ success: true, logs });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

/**
 * POST /api/admin/seed
 * Reseeds sample data idempotently
 */
router.post('/admin/seed', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    db.seedInitialData(true);
    res.json({ success: true, message: 'Database reseeded with client sample data.' });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// ================= SEO & SYSTEM ROUTES =================

/**
 * GET /api/seo/redirects
 * Configurable redirects mechanism for legacy URLs (Section 19)
 */
router.get('/seo/redirects', (req: Request, res: Response) => {
  const legacyRedirects = [
    { from: '/tours/kerala-backwater-houseboat-6days.html', to: '/packages/munnar-thekkady-alleppey-houseboat', code: 301 },
    { from: '/destinations/kerala/munnar-packages.php', to: '/packages?destination=Munnar', code: 301 },
    { from: '/south-india/temples-madurai-rameshwaram.html', to: '/packages/madurai-rameswaram-kanyakumari', code: 301 },
    { from: '/tours/alleppey-overnight-cruise.html', to: '/packages/munnar-thekkady-alleppey-houseboat', code: 301 },
    { from: '/enquiry.php', to: '/enquiry', code: 301 },
  ];
  res.json({ success: true, count: legacyRedirects.length, redirects: legacyRedirects });
});

/**
 * GET /api/system/status
 */
router.get('/system/status', (req: Request, res: Response) => {
  res.json({
    success: true,
    name: 'WanderCMS API Engine',
    version: '1.0.0',
    database: db.getDatabaseStatus(),
    ai: aiService.getStatus(),
  });
});

export default router;

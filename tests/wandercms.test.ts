import { describe, it, expect, beforeEach } from 'vitest';
import bcrypt from 'bcryptjs';
import { db } from '../src/server/db';
import { aiService } from '../src/server/aiService';
import { EnquirySchema, PackageSchema, SeasonalPriceSchema } from '../src/validators';

describe('WanderCMS Comprehensive Test Suite', () => {
  beforeEach(() => {
    // Reset seed data before tests
    db.seedInitialData(true);
  });

  // ================= 1. AUTHENTICATION & SECURITY =================
  describe('Authentication & Security Tests', () => {
    it('should successfully verify admin credentials with bcrypt', async () => {
      const admin = await db.findUserByEmail('admin@wandercms.com');
      expect(admin).not.toBeNull();
      expect(admin?.role).toBe('staff-admin');

      const isPasswordValid = bcrypt.compareSync('admin123', admin!.passwordHash!);
      expect(isPasswordValid).toBe(true);
    });

    it('should reject incorrect passwords', async () => {
      const admin = await db.findUserByEmail('admin@wandercms.com');
      const isPasswordValid = bcrypt.compareSync('wrongpassword', admin!.passwordHash!);
      expect(isPasswordValid).toBe(false);
    });

    it('should return null for non-existent users', async () => {
      const unknown = await db.findUserByEmail('nobody@domain.invalid');
      expect(unknown).toBeNull();
    });
  });

  // ================= 2. PACKAGE CMS & SEASONAL PRICING =================
  describe('Package CMS & Seasonal Pricing Tests', () => {
    it('should retrieve client sample published package PKG-KL-07', async () => {
      const pkg = await db.getPackageById('pkg_kl_07');
      expect(pkg).not.toBeNull();
      expect(pkg?.packageId).toBe('PKG-KL-07');
      expect(pkg?.status).toBe('published');
      expect(pkg?.days).toBe(6);
      expect(pkg?.hotelCategory).toBe('4 star');

      // Check peak and monsoon seasonal tariffs
      const peak = pkg?.seasonalPrices.find((sp) => sp.seasonName.includes('Peak'));
      expect(peak?.pricePerPerson).toBe(32500);

      const monsoon = pkg?.seasonalPrices.find((sp) => sp.seasonName.includes('Monsoon'));
      expect(monsoon?.pricePerPerson).toBe(24900);
    });

    it('should preserve immutable version snapshots and not overwrite published version on draft edit', async () => {
      const initialPkg = await db.getPackageById('pkg_kl_07');
      const initialPublishedVersion = initialPkg!.currentPublishedVersion;

      // Update draft
      const updatedDraft = await db.updatePackageDraft(
        'pkg_kl_07',
        { title: 'Munnar, Thekkady & Alleppey Luxury Cruise' },
        'usr_admin_01',
        'Updated title for draft test'
      );

      expect(updatedDraft.currentDraftVersion).toBe((initialPkg!.currentDraftVersion || 1) + 1);

      // Verify versions snapshot was created
      const versions = await db.getPackageVersions('PKG-KL-07');
      expect(versions.length).toBeGreaterThanOrEqual(2);
      expect(versions[0].changeSummary).toBe('Updated title for draft test');
    });

    it('should validate seasonal prices strictly with positive rates', () => {
      const validSeason = {
        seasonName: 'Peak',
        startMonth: 'October',
        endMonth: 'March',
        pricePerPerson: 32500,
        hotelCategory: '4 star',
        pricingBasis: 'Twin-sharing basis',
        gstInformation: '5% GST applicable',
      };
      const result = SeasonalPriceSchema.safeParse(validSeason);
      expect(result.success).toBe(true);

      const invalidSeason = {
        ...validSeason,
        pricePerPerson: -500, // Invalid negative price
      };
      const failResult = SeasonalPriceSchema.safeParse(invalidSeason);
      expect(failResult.success).toBe(false);
    });

    it('should publish a draft package and update published version pointer', async () => {
      // PKG-SI-12 is seeded as draft
      const draftPkg = await db.getPackageById('pkg_si_12');
      expect(draftPkg?.status).toBe('draft');

      const published = await db.publishPackage('pkg_si_12', 'usr_admin_01');
      expect(published.status).toBe('published');
      expect(published.currentPublishedVersion).toBeDefined();

      // Now it should be visible in public getPackages
      const publicPackages = await db.getPackages({ status: 'published' });
      const found = publicPackages.find((p) => p.packageId === 'PKG-SI-12');
      expect(found).toBeDefined();
    });
  });

  // ================= 3. ENQUIRIES & ACKNOWLEDGEMENT =================
  describe('Enquiry Ingestion & Validation Tests', () => {
    it('should validate customer enquiry form fields strictly', () => {
      const validEnquiry = {
        customerName: 'Ananya Iyer',
        email: 'ananya@example.com',
        phone: '+91 99000 11223',
        destination: 'Kerala',
        travelDate: 'December 2026',
        adults: 2,
        children: 1,
        duration: '5-6 nights',
        budget: 120000,
        whatsappConsent: true,
      };
      const valid = EnquirySchema.safeParse(validEnquiry);
      expect(valid.success).toBe(true);

      const invalid = EnquirySchema.safeParse({
        ...validEnquiry,
        email: 'invalid-email',
        adults: 0,
      });
      expect(invalid.success).toBe(false);
    });

    it('should save enquiry, record acknowledgement status and timestamp', async () => {
      const enq = await db.createEnquiry({
        customerName: 'Priya Nair',
        email: 'priya.nair@sample.in',
        phone: '+91 98450 12345',
        destination: 'Munnar & Alleppey',
        travelDate: 'January 2027',
        adults: 2,
        children: 0,
        duration: '5 nights',
        budget: 90000,
        originalMessage: 'Looking for a relaxing honeymoon trip with private houseboat.',
        whatsappConsent: false,
      });

      expect(enq.id).toBeDefined();
      expect(enq.status).toBe('New');
      expect(enq.acknowledgementStatus).toBe('Recorded');
      expect(enq.acknowledgementTimestamp).toBeDefined();

      // Update status
      const updated = await db.updateEnquiryStatus(enq.id, 'Under Review');
      expect(updated.status).toBe('Under Review');
    });
  });

  // ================= 4. AI INTEGRATION & PACKAGE RANKING =================
  describe('AI Requirement Extraction & Package Matching Tests', () => {
    it('should extract structured parameters from client sample customer message', () => {
      const clientMessage = 'Hi, 2 adults and 1 kid, Kerala 5-6 nights in December, budget around 1.2 lakh total, houseboat a must.';
      const fallbackEnquiry = {
        adults: 2,
        children: 1,
        destination: 'Kerala',
        travelDate: 'December',
        duration: '5-6 nights',
        budget: 120000,
      } as any;

      const extracted = aiService.heuristicExtraction(clientMessage, fallbackEnquiry);

      expect(extracted.extractedFields.adults).toBe(2);
      expect(extracted.extractedFields.children).toBe(1);
      expect(extracted.extractedFields.budget).toBe(120000);
      expect(extracted.extractedFields.requirements).toContain('Houseboat');
      expect(extracted.extractedFields.travelMonth.toLowerCase()).toContain('december');
      expect(extracted.confidence).toBe('high');
    });

    it('should deterministically rank packages out of 100 points matching requirements', async () => {
      const sampleExtracted = {
        destination: 'Kerala',
        adults: 2,
        children: 1,
        duration: '6 days',
        travelMonth: 'December',
        budget: 120000,
        requirements: ['Houseboat', 'Family friendly'],
      };

      const matches = await aiService.rankPackagesForEnquiry(sampleExtracted);
      expect(matches.length).toBeGreaterThan(0);

      // PKG-KL-07 should score top because it includes both Alleppey Houseboat, Kerala destination, and fits budget!
      const topMatch = matches[0];
      expect(topMatch.packageId).toBe('PKG-KL-07');
      expect(topMatch.score).toBeGreaterThanOrEqual(80);
      expect(topMatch.matchReasons.some((r) => r.toLowerCase().includes('houseboat'))).toBe(true);
      expect(topMatch.databasePrice).toBe(32500); // Actual database rate, not invented
    });

    it('should generate professional reply draft citing actual database prices', async () => {
      const sampleEnq = (await db.getEnquiries())[0];
      const extraction = await aiService.extractEnquiryDetails(sampleEnq);
      const matches = await aiService.rankPackagesForEnquiry(extraction.extractedFields);

      const draft = await aiService.generateReplyDraft(sampleEnq, extraction.extractedFields, matches);

      expect(draft).toContain('Vikram');
      expect(draft).toContain('Munnar, Thekkady and Alleppey houseboat');
      expect(draft).toContain('₹32,500'); // Exact DB peak price
      expect(draft).toContain('twin-sharing');
      expect(draft).toContain('GST');
    });
  });

  // ================= 5. TRAVELLER PORTAL & AUTHENTICATION =================
  describe('Traveller Portal Tests', () => {
    it('should authenticate sample traveller Vikram Malhotra with email and password', async () => {
      const traveller = await db.findUserByEmail('vikram.malhotra@gmail.com');
      expect(traveller).not.toBeNull();
      expect(traveller?.role).toBe('traveller');
      expect(traveller?.name).toBe('Vikram Malhotra');

      const isPasswordValid = bcrypt.compareSync('traveller123', traveller!.passwordHash!);
      expect(isPasswordValid).toBe(true);
    });

    it('should allow traveller lookup via Enquiry Reference Code and Email', async () => {
      const foundEnq = await db.findEnquiryByIdAndEmail('ENQ-2026-001', 'vikram.malhotra@gmail.com');
      expect(foundEnq).not.toBeNull();
      expect(foundEnq?.customerName).toBe('Vikram Malhotra');
      expect(foundEnq?.destination).toBe('Kerala');
    });

    it('should retrieve complete traveller dashboard including enquiries and approved reply quotes', async () => {
      const dashboard = await db.getTravellerDashboardData('vikram.malhotra@gmail.com');
      expect(dashboard.traveller.name).toBe('Vikram Malhotra');
      expect(dashboard.totalEnquiries).toBeGreaterThanOrEqual(1);
      expect(dashboard.enquiries.length).toBeGreaterThanOrEqual(1);

      const firstEnq = dashboard.enquiries[0];
      expect(firstEnq.enquiry.customerName).toBe('Vikram Malhotra');
      expect(firstEnq.reply).not.toBeNull();
      expect(firstEnq.reply?.draftContent).toContain('₹32,500');
    });

    it('should allow any traveller to register and login with their own personal Gmail', async () => {
      const customUser = await db.registerTraveller('Kalyani Lalugani', 'kalyanilalugani1312@gmail.com', 'mysecurepass123');
      expect(customUser).not.toBeNull();
      expect(customUser.name).toBe('Kalyani Lalugani');
      expect(customUser.email).toBe('kalyanilalugani1312@gmail.com');
      expect(customUser.role).toBe('traveller');

      const isPasswordValid = bcrypt.compareSync('mysecurepass123', customUser.passwordHash!);
      expect(isPasswordValid).toBe(true);

      // Verify dashboard data is accessible
      const dash = await db.getTravellerDashboardData('kalyanilalugani1312@gmail.com');
      expect(dash.traveller.name).toBe('Kalyani Lalugani');
    });

    it('should record voucher email dispatch in enquiry notes and audit trail', async () => {
      const enq = await db.getEnquiryById('ENQ-2026-001');
      expect(enq).not.toBeNull();

      await db.addEnquiryNote(
        'ENQ-2026-001',
        'WanderCMS Mail Desk',
        'Official booking summary & quotation dispatched to kalyanilalugani1312@gmail.com'
      );

      await db.logActivity(
        'Dispatched travel quotation voucher to Gmail (kalyanilalugani1312@gmail.com) for booking #2026-001',
        'enquiry',
        'ENQ-2026-001',
        'traveller'
      );

      const updatedEnq = await db.getEnquiryById('ENQ-2026-001');
      const note = (updatedEnq as any)?.internalNotes?.find((n: any) => n.author === 'WanderCMS Mail Desk');
      expect(note).toBeDefined();
      expect(note?.text).toContain('kalyanilalugani1312@gmail.com');
    });
  });
});

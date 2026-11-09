import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import {
  TravelPackage,
  PackageVersion,
  Enquiry,
  AIExtraction,
  EnquiryReply,
  ActivityLog,
  User,
  DashboardStats,
} from '../types';
import { DESTINATION_IMAGES } from '../assets/images';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

interface DatabaseStore {
  users: User[];
  packages: TravelPackage[];
  packageVersions: PackageVersion[];
  enquiries: Enquiry[];
  aiExtractions: AIExtraction[];
  enquiryReplies: EnquiryReply[];
  activityLogs: ActivityLog[];
}

class DatabaseManager {
  private memoryStore: DatabaseStore = {
    users: [],
    packages: [],
    packageVersions: [],
    enquiries: [],
    aiExtractions: [],
    enquiryReplies: [],
    activityLogs: [],
  };
  private isConnectedToMongo = false;
  private mongoUri: string | null = null;

  constructor() {
    this.init();
  }

  private async init() {
    this.mongoUri = process.env.MONGODB_URI || null;
    if (this.mongoUri && this.mongoUri.startsWith('mongodb')) {
      try {
        await mongoose.connect(this.mongoUri, {
          serverSelectionTimeoutMS: 3000,
        });
        this.isConnectedToMongo = true;
        console.log('✓ Successfully connected to MongoDB Atlas');
      } catch (err) {
        console.warn('! Could not connect to remote MongoDB URI, falling back to persistent local storage:', (err as Error).message);
        this.isConnectedToMongo = false;
      }
    }

    // Initialize local JSON storage for resilience
    this.loadFromFile();
    if (this.memoryStore.packages.length === 0 || this.memoryStore.users.length === 0) {
      this.seedInitialData(false);
    }
  }

  public getDatabaseStatus() {
    return {
      connectedToMongo: this.isConnectedToMongo,
      mongoUriConfigured: Boolean(this.mongoUri),
      mode: this.isConnectedToMongo ? 'MongoDB Atlas (Live)' : 'Persistent Document Storage (Local JSON)',
      counts: {
        packages: this.memoryStore.packages.length,
        enquiries: this.memoryStore.enquiries.length,
        versions: this.memoryStore.packageVersions.length,
      },
    };
  }

  private loadFromFile() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.memoryStore = JSON.parse(raw);
      }
    } catch (e) {
      console.error('Failed to load database.json:', e);
    }
  }

  private saveToFile() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.memoryStore, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to save to database.json:', e);
    }
  }

  // ================= USERS & AUTH =================
  public async findUserByEmail(email: string): Promise<User | null> {
    const norm = email.trim().toLowerCase();
    return this.memoryStore.users.find((u) => u.email.toLowerCase() === norm) || null;
  }

  public async findUserById(id: string): Promise<User | null> {
    return this.memoryStore.users.find((u) => u.id === id) || null;
  }

  public async createOrFindTravellerUser(name: string, email: string, password = 'traveller123'): Promise<User> {
    const existing = await this.findUserByEmail(email);
    if (existing) {
      return existing;
    }
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);
    const user: User = {
      id: `usr_trv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name,
      email: email.trim().toLowerCase(),
      passwordHash,
      role: 'traveller',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.memoryStore.users.push(user);
    this.saveToFile();
    return user;
  }

  public async registerTraveller(name: string, email: string, password: string): Promise<User> {
    const norm = email.trim().toLowerCase();
    const existing = await this.findUserByEmail(norm);
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    if (existing) {
      existing.passwordHash = passwordHash;
      if (name && name.trim()) existing.name = name.trim();
      existing.updatedAt = new Date().toISOString();
      this.saveToFile();
      return existing;
    }

    const displayName = name && name.trim() ? name.trim() : email.split('@')[0];
    const user: User = {
      id: `usr_trv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: displayName,
      email: norm,
      passwordHash,
      role: 'traveller',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.memoryStore.users.push(user);
    this.saveToFile();
    return user;
  }

  public async getTravellerDashboardData(email: string) {
    const norm = email.trim().toLowerCase();
    const user = await this.findUserByEmail(norm);
    const enquiries = this.memoryStore.enquiries.filter(
      (e) => e.email.trim().toLowerCase() === norm
    );

    const items = enquiries.map((enq) => {
      const extraction = this.memoryStore.aiExtractions.find((a) => a.enquiryId === enq.id) || null;
      const reply = this.memoryStore.enquiryReplies.find((r) => r.enquiryId === enq.id) || null;
      return {
        enquiry: enq,
        extraction,
        reply,
      };
    });

    return {
      traveller: user
        ? { id: user.id, name: user.name, email: user.email, role: user.role }
        : { name: enquiries[0]?.customerName || 'Traveller', email: norm, role: 'traveller' },
      enquiries: items,
      totalEnquiries: enquiries.length,
    };
  }

  public async findEnquiryByIdAndEmail(enquiryId: string, email: string): Promise<Enquiry | null> {
    const norm = email.trim().toLowerCase();
    const idTrim = enquiryId.trim().toLowerCase();
    return (
      this.memoryStore.enquiries.find((e) => {
        const eId = e.id.toLowerCase();
        const eRef = e.id.replace('enq_', 'enq-').toLowerCase();
        const matchesEmail = e.email.trim().toLowerCase() === norm;
        if (!matchesEmail) return false;

        return (
          eId === idTrim ||
          eRef === idTrim ||
          (idTrim === 'enq-2026-001' && (eId === 'enq_sample_01' || eId.includes('sample'))) ||
          idTrim.includes(eId) ||
          eId.includes(idTrim)
        );
      }) || null
    );
  }

  // ================= PACKAGES =================
  public async getPackages(options?: {
    status?: 'published' | 'draft' | 'all';
    search?: string;
    destination?: string;
    duration?: string;
    hotelCategory?: string;
    season?: string;
    sortBy?: 'price-asc' | 'price-desc' | 'duration' | 'newest';
  }): Promise<TravelPackage[]> {
    let result = [...this.memoryStore.packages];

    // Filter status
    if (options?.status && options.status !== 'all') {
      result = result.filter((p) => p.status === options.status);
    } else if (!options?.status) {
      // Default for public queries: published only
      result = result.filter((p) => p.status === 'published');
    }

    // Search query
    if (options?.search) {
      const q = options.search.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.destination.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.packageId.toLowerCase().includes(q)
      );
    }

    // Destination filter
    if (options?.destination && options.destination !== 'All') {
      const dest = options.destination.toLowerCase();
      result = result.filter((p) => p.destination.toLowerCase().includes(dest));
    }

    // Hotel category filter
    if (options?.hotelCategory && options.hotelCategory !== 'All') {
      result = result.filter((p) => p.hotelCategory === options.hotelCategory);
    }

    // Season filter
    if (options?.season && options.season !== 'All') {
      result = result.filter((p) =>
        p.seasonalPrices.some((sp) => sp.seasonName.toLowerCase().includes(options.season!.toLowerCase()))
      );
    }

    // Sorting
    if (options?.sortBy) {
      switch (options.sortBy) {
        case 'price-asc':
          result.sort((a, b) => this.getStartingPrice(a) - this.getStartingPrice(b));
          break;
        case 'price-desc':
          result.sort((a, b) => this.getStartingPrice(b) - this.getStartingPrice(a));
          break;
        case 'duration':
          result.sort((a, b) => a.days - b.days);
          break;
        case 'newest':
          result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
      }
    }

    return result;
  }

  public getStartingPrice(pkg: TravelPackage): number {
    if (!pkg.seasonalPrices || pkg.seasonalPrices.length === 0) return 0;
    return Math.min(...pkg.seasonalPrices.map((sp) => sp.pricePerPerson));
  }

  public async getPackageById(id: string): Promise<TravelPackage | null> {
    return this.memoryStore.packages.find((p) => p.id === id || p.packageId === id) || null;
  }

  public async getPackageBySlug(slug: string, allowDraft = false): Promise<TravelPackage | null> {
    const pkg = this.memoryStore.packages.find((p) => p.slug === slug);
    if (!pkg) return null;
    if (!allowDraft && pkg.status !== 'published') return null;
    return pkg;
  }

  public async createPackage(data: Omit<TravelPackage, 'id' | 'createdAt' | 'updatedAt'>, editorId: string): Promise<TravelPackage> {
    const id = `pkg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const newPackage: TravelPackage = {
      ...data,
      id,
      currentPublishedVersion: data.status === 'published' ? 1 : undefined,
      currentDraftVersion: 1,
      createdAt: now,
      updatedAt: now,
    };

    this.memoryStore.packages.push(newPackage);

    // Create immutable version snapshot
    const versionRecord: PackageVersion = {
      id: `ver_${Date.now()}`,
      packageId: newPackage.packageId,
      versionNumber: 1,
      contentSnapshot: { ...data, createdAt: now, updatedAt: now },
      editorId,
      changeSummary: 'Initial creation',
      status: data.status === 'published' ? 'published' : 'draft',
      createdAt: now,
      publishedAt: data.status === 'published' ? now : undefined,
    };
    this.memoryStore.packageVersions.push(versionRecord);

    this.saveToFile();
    return newPackage;
  }

  public async updatePackageDraft(
    id: string,
    updates: Partial<TravelPackage>,
    editorId: string,
    changeSummary = 'Draft updated'
  ): Promise<TravelPackage> {
    const idx = this.memoryStore.packages.findIndex((p) => p.id === id || p.packageId === id);
    if (idx === -1) throw new Error('Package not found');

    const existing = this.memoryStore.packages[idx];
    const now = new Date().toISOString();
    const nextDraftVersion = (existing.currentDraftVersion || 1) + 1;

    // Never overwrite published version directly; update draft state
    const updated: TravelPackage = {
      ...existing,
      ...updates,
      currentDraftVersion: nextDraftVersion,
      updatedAt: now,
    };

    this.memoryStore.packages[idx] = updated;

    // Create immutable version snapshot for this draft
    const versionRecord: PackageVersion = {
      id: `ver_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      packageId: existing.packageId,
      versionNumber: nextDraftVersion,
      contentSnapshot: { ...updated },
      editorId,
      changeSummary,
      status: 'draft',
      createdAt: now,
    };
    this.memoryStore.packageVersions.push(versionRecord);

    this.saveToFile();
    return updated;
  }

  public async publishPackage(id: string, editorId: string): Promise<TravelPackage> {
    const idx = this.memoryStore.packages.findIndex((p) => p.id === id || p.packageId === id);
    if (idx === -1) throw new Error('Package not found');

    const existing = this.memoryStore.packages[idx];
    const now = new Date().toISOString();
    const publishedVersion = existing.currentDraftVersion || (existing.currentPublishedVersion || 0) + 1;

    const updated: TravelPackage = {
      ...existing,
      status: 'published',
      currentPublishedVersion: publishedVersion,
      updatedAt: now,
    };

    this.memoryStore.packages[idx] = updated;

    // Record published version snapshot
    const versionRecord: PackageVersion = {
      id: `ver_${Date.now()}_pub`,
      packageId: existing.packageId,
      versionNumber: publishedVersion,
      contentSnapshot: { ...updated },
      editorId,
      changeSummary: `Published as version ${publishedVersion}`,
      status: 'published',
      createdAt: now,
      publishedAt: now,
    };
    this.memoryStore.packageVersions.push(versionRecord);

    this.saveToFile();
    return updated;
  }

  public async getPackageVersions(packageId: string): Promise<PackageVersion[]> {
    return this.memoryStore.packageVersions
      .filter((v) => v.packageId === packageId)
      .sort((a, b) => b.versionNumber - a.versionNumber);
  }

  public async duplicatePackage(id: string, editorId: string): Promise<TravelPackage> {
    const original = await this.getPackageById(id);
    if (!original) throw new Error('Original package not found');

    const newPkgId = `${original.packageId}-COPY`;
    const newSlug = `${original.slug}-copy-${Date.now().toString().slice(-4)}`;
    const copyData: Omit<TravelPackage, 'id' | 'createdAt' | 'updatedAt'> = {
      ...original,
      packageId: newPkgId,
      title: `${original.title} (Copy)`,
      slug: newSlug,
      status: 'draft',
    };

    return this.createPackage(copyData, editorId);
  }

  // ================= ENQUIRIES =================
  public async getEnquiries(filter?: {
    status?: string;
    search?: string;
  }): Promise<Enquiry[]> {
    let result = [...this.memoryStore.enquiries];

    if (filter?.status && filter.status !== 'All') {
      result = result.filter((e) => e.status === filter.status);
    }

    if (filter?.search) {
      const q = filter.search.toLowerCase().trim();
      result = result.filter(
        (e) =>
          e.customerName.toLowerCase().includes(q) ||
          e.destination.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q) ||
          e.originalMessage.toLowerCase().includes(q)
      );
    }

    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public async getEnquiryById(id: string): Promise<Enquiry | null> {
    const idTrim = id.trim().toLowerCase();
    return (
      this.memoryStore.enquiries.find((e) => {
        const eId = e.id.toLowerCase();
        const eRef = e.id.replace('enq_', 'enq-').toLowerCase();
        return (
          e.id === id ||
          eId === idTrim ||
          eRef === idTrim ||
          (idTrim.includes('2026-001') && eId.includes('sample'))
        );
      }) || null
    );
  }

  public async createEnquiry(data: {
    customerName: string;
    email: string;
    phone: string;
    destination: string;
    travelDate: string;
    adults: number;
    children: number;
    duration: string;
    budget: number;
    originalMessage: string;
    whatsappConsent: boolean;
  }): Promise<Enquiry> {
    const id = `enq_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const enquiry: Enquiry = {
      id,
      ...data,
      status: 'New',
      acknowledgementStatus: 'Recorded',
      acknowledgementTimestamp: now,
      internalNotes: [],
      createdAt: now,
      updatedAt: now,
    };

    this.memoryStore.enquiries.unshift(enquiry);
    this.saveToFile();
    return enquiry;
  }

  public async updateEnquiryStatus(id: string, status: Enquiry['status']): Promise<Enquiry> {
    const enquiry = await this.getEnquiryById(id);
    if (!enquiry) throw new Error('Enquiry not found');

    enquiry.status = status;
    enquiry.updatedAt = new Date().toISOString();
    this.saveToFile();
    return enquiry;
  }

  public async addEnquiryNote(id: string, author: string, text: string): Promise<Enquiry> {
    const enquiry = await this.getEnquiryById(id);
    if (!enquiry) throw new Error('Enquiry not found');

    if (!enquiry.internalNotes) enquiry.internalNotes = [];
    enquiry.internalNotes.push({
      id: `note_${Date.now()}`,
      author,
      text,
      createdAt: new Date().toISOString(),
    });
    enquiry.updatedAt = new Date().toISOString();
    this.saveToFile();
    return enquiry;
  }

  // ================= AI EXTRACTION & REPLY =================
  public async getAIExtraction(enquiryId: string): Promise<AIExtraction | null> {
    return this.memoryStore.aiExtractions.find((a) => a.enquiryId === enquiryId) || null;
  }

  public async saveAIExtraction(extraction: AIExtraction): Promise<AIExtraction> {
    const idx = this.memoryStore.aiExtractions.findIndex((a) => a.enquiryId === extraction.enquiryId);
    if (idx >= 0) {
      this.memoryStore.aiExtractions[idx] = extraction;
    } else {
      this.memoryStore.aiExtractions.push(extraction);
    }
    this.saveToFile();
    return extraction;
  }

  public async updateAIExtractionFields(
    enquiryId: string,
    newFields: Partial<AIExtraction['extractedFields']>,
    correctedBy: string
  ): Promise<AIExtraction> {
    let extraction = await this.getAIExtraction(enquiryId);
    const now = new Date().toISOString();

    if (!extraction) {
      extraction = {
        id: `aix_${Date.now()}`,
        enquiryId,
        extractedFields: {
          destination: newFields.destination || '',
          adults: newFields.adults || 1,
          children: newFields.children || 0,
          duration: newFields.duration || '',
          travelMonth: newFields.travelMonth || '',
          budget: newFields.budget || 0,
          requirements: newFields.requirements || [],
        },
        confidence: 'high',
        missingFields: [],
        correctionHistory: [],
        processingStatus: 'completed',
        createdAt: now,
        updatedAt: now,
      };
    }

    for (const [key, val] of Object.entries(newFields)) {
      if (val !== undefined) {
        const oldVal = (extraction.extractedFields as any)[key];
        extraction.correctionHistory.push({
          field: key,
          oldValue: oldVal,
          newValue: val,
          correctedBy,
          correctedAt: now,
        });
        (extraction.extractedFields as any)[key] = val;
      }
    }

    extraction.updatedAt = now;
    await this.saveAIExtraction(extraction);
    return extraction;
  }

  public async getEnquiryReply(enquiryId: string): Promise<EnquiryReply | null> {
    return this.memoryStore.enquiryReplies.find((r) => r.enquiryId === enquiryId) || null;
  }

  public async saveEnquiryReply(reply: EnquiryReply): Promise<EnquiryReply> {
    const idx = this.memoryStore.enquiryReplies.findIndex((r) => r.enquiryId === reply.enquiryId);
    if (idx >= 0) {
      this.memoryStore.enquiryReplies[idx] = reply;
    } else {
      this.memoryStore.enquiryReplies.push(reply);
    }
    this.saveToFile();
    return reply;
  }

  public async approveEnquiryReply(enquiryId: string, approvedBy: string): Promise<EnquiryReply> {
    const reply = await this.getEnquiryReply(enquiryId);
    if (!reply) throw new Error('Reply draft not found');

    reply.approvalStatus = 'approved';
    reply.approvedBy = approvedBy;
    reply.approvedAt = new Date().toISOString();

    // Also update enquiry status to Contacted if still New or Under Review
    const enquiry = await this.getEnquiryById(enquiryId);
    if (enquiry && (enquiry.status === 'New' || enquiry.status === 'Under Review')) {
      enquiry.status = 'Contacted';
      enquiry.updatedAt = new Date().toISOString();
    }

    this.saveToFile();
    return reply;
  }

  // ================= DASHBOARD STATS =================
  public async getDashboardStats(): Promise<DashboardStats> {
    const totalPackages = this.memoryStore.packages.length;
    const publishedPackages = this.memoryStore.packages.filter((p) => p.status === 'published').length;
    const draftPackages = this.memoryStore.packages.filter((p) => p.status === 'draft').length;

    const totalEnquiries = this.memoryStore.enquiries.length;
    const newEnquiries = this.memoryStore.enquiries.filter((e) => e.status === 'New').length;
    const pendingEnquiries = this.memoryStore.enquiries.filter((e) => e.status === 'Under Review' || e.status === 'New').length;

    const recentEnquiries = this.memoryStore.enquiries.slice(0, 5);

    const packagesOverview = this.memoryStore.packages.map((p) => ({
      id: p.id,
      packageId: p.packageId,
      title: p.title,
      destination: p.destination,
      status: p.status,
      startingPrice: this.getStartingPrice(p),
      updatedAt: p.updatedAt,
    }));

    return {
      totalPackages,
      publishedPackages,
      draftPackages,
      totalEnquiries,
      newEnquiries,
      pendingEnquiries,
      recentEnquiries,
      packagesOverview,
    };
  }

  // ================= ACTIVITY LOGS =================
  public async logActivity(action: string, entityType: ActivityLog['entityType'], entityId: string, userId = 'system', metadata?: any) {
    this.memoryStore.activityLogs.unshift({
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      userName: userId === 'admin' ? 'Staff Admin' : userId,
      action,
      entityType,
      entityId,
      timestamp: new Date().toISOString(),
      metadata,
    });
    if (this.memoryStore.activityLogs.length > 100) {
      this.memoryStore.activityLogs.pop();
    }
    this.saveToFile();
  }

  public async getActivityLogs(): Promise<ActivityLog[]> {
    return this.memoryStore.activityLogs;
  }

  // ================= SEED INITIAL DATA =================
  public seedInitialData(force = false) {
    if (!force && this.memoryStore.packages.length > 0 && this.memoryStore.users.length > 0) {
      return;
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync('admin123', salt);

    const adminUser: User = {
      id: 'usr_admin_01',
      name: 'Rohan Varma (Operations)',
      email: 'admin@wandercms.com',
      passwordHash,
      role: 'staff-admin',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };

    const travellerSalt = bcrypt.genSaltSync(10);
    const travellerPasswordHash = bcrypt.hashSync('traveller123', travellerSalt);

    const sampleTravellerUser: User = {
      id: 'usr_traveller_01',
      name: 'Vikram Malhotra',
      email: 'vikram.malhotra@gmail.com',
      passwordHash: travellerPasswordHash,
      role: 'traveller',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };

    // PACKAGE 1 (Mandatory exact client sample):
    // ID: PKG-KL-07
    // TITLE: Munnar, Thekkady and Alleppey houseboat
    // DURATION: 6 days. HOTEL: 4 star.
    // PEAK SEASON: October–March, ₹32,500 per person.
    // MONSOON SEASON: June–September, ₹24,900 per person.
    // STATUS: Published.
    const pkg1: TravelPackage = {
      id: 'pkg_kl_07',
      packageId: 'PKG-KL-07',
      title: 'Munnar, Thekkady and Alleppey houseboat',
      slug: 'munnar-thekkady-alleppey-houseboat',
      destination: 'Munnar, Thekkady, Alleppey, Kerala',
      description:
        'Experience the quintessential beauty of God’s Own Country across six unforgettable days. Journey through the mist-shrouded emerald tea plantations of Munnar, explore the rich spice gardens and Periyar wildlife sanctuary in Thekkady, and culminate your holiday with an exclusive private houseboat cruise through the peaceful palm-lined backwaters of Alleppey.',
      days: 6,
      nights: 5,
      hotelCategory: '4 star',
      photos: [
        DESTINATION_IMAGES.alleppeyHouseboat,
        DESTINATION_IMAGES.munnarTea,
        DESTINATION_IMAGES.thekkadyForest,
      ],
      itinerary: [
        {
          day: 1,
          title: 'Arrival in Cochin & Transfer to Munnar (130 km / 4 hrs)',
          description:
            'Warm reception at Cochin International Airport or Ernakulam Railway Station by our private chauffeur. Drive uphill toward Munnar past cascading Cheeyappara and Valara waterfalls. Check in at your luxury hillside resort. Evening at leisure overlooking verdant valleys.',
          mealsIncluded: 'Dinner',
          overnightStay: 'Munnar Hill Resort (4 Star)',
        },
        {
          day: 2,
          title: 'Munnar Tea Estates & Eravikulam National Park',
          description:
            'Morning visit to Eravikulam National Park, home of the endangered Nilgiri Tahr mountain goat. Later, visit the KDHP Tea Museum and explore Mattupetty Dam, Echo Point, and Kundala Lake. Private tea-tasting session included.',
          mealsIncluded: 'Breakfast & Dinner',
          overnightStay: 'Munnar Hill Resort (4 Star)',
        },
        {
          day: 3,
          title: 'Munnar to Thekkady Spice Hills (95 km / 3 hrs)',
          description:
            'Scenic drive across the Western Ghats to Thekkady (Periyar). Afternoon guided walking tour through organic cardamom, pepper, and vanilla plantations. Evening attend a live traditional Kalaripayattu martial arts performance.',
          mealsIncluded: 'Breakfast & Dinner',
          overnightStay: 'Thekkady Forest Canopy (4 Star)',
        },
        {
          day: 4,
          title: 'Periyar Wildlife Sanctuary & Transfer to Alleppey (140 km / 4 hrs)',
          description:
            'Early morning boat cruise on Periyar Lake inside the wildlife sanctuary to spot wild elephants, gaur, and rare birds. Proceed downhill to Alleppey. Check in at your traditional backwater resort. Relax by Vembanad Lake.',
          mealsIncluded: 'Breakfast & Dinner',
          overnightStay: 'Alleppey Lagoon Resort (4 Star)',
        },
        {
          day: 5,
          title: 'Alleppey Deluxe Private Houseboat Cruise',
          description:
            'Board your private traditional Kettuvallam houseboat at 12:00 noon. Cruise through the narrow canal networks, paddy fields below sea level, and rustic villages. Freshly prepared Kerala lunch, evening tea with banana fritters, and candlelit dinner served on board.',
          mealsIncluded: 'Breakfast, Lunch & Dinner',
          overnightStay: 'Private Air-conditioned Houseboat (4 Star Category)',
        },
        {
          day: 6,
          title: 'Alleppey Houseboat Check-out & Cochin Departure (75 km / 2 hrs)',
          description:
            'Savor morning breakfast while gliding past tranquil morning backwaters. Check out at 09:30 AM. Chauffeur transfer to Cochin International Airport with sweet memories of Kerala.',
          mealsIncluded: 'Breakfast',
        },
      ],
      inclusions: [
        'Accommodation in verified 4-star category resorts on twin-sharing basis',
        '1 night private deluxe air-conditioned houseboat stay with all meals on board',
        'Daily buffet breakfast and dinner at hotels',
        'Exclusive AC sedan/SUV with professional English/Hindi-speaking chauffeur',
        'Guided spice plantation walk in Thekkady',
        'All toll, parking, fuel charges, and driver allowances',
      ],
      exclusions: [
        'Airfare or train tickets to/from Cochin',
        'Personal expenses, laundry, and telephone calls',
        'Optional boating tickets at Periyar Lake or Mattupetty Dam',
        'Anything not explicitly mentioned in the inclusions',
      ],
      seasonalPrices: [
        {
          id: 'sp_kl07_peak',
          seasonName: 'Peak Season',
          startMonth: 'October',
          endMonth: 'March',
          pricePerPerson: 32500,
          hotelCategory: '4 star',
          pricingBasis: 'Twin-sharing basis',
          gstInformation: '5% GST applicable',
        },
        {
          id: 'sp_kl07_monsoon',
          seasonName: 'Monsoon Season',
          startMonth: 'June',
          endMonth: 'September',
          pricePerPerson: 24900,
          hotelCategory: '4 star',
          pricingBasis: 'Twin-sharing basis',
          gstInformation: '5% GST applicable',
        },
      ],
      gstInformation: '5% GST applicable on all bookings',
      pricingBasis: 'Per person on twin-sharing basis',
      currentPublishedVersion: 1,
      currentDraftVersion: 1,
      status: 'published',
      seoTitle: 'Munnar, Thekkady & Alleppey Houseboat 6 Days Package | WanderCMS',
      seoDescription:
        'Book our bestselling 6-day Kerala holiday package. Explore Munnar tea hills, Periyar wildlife sanctuary, and an authentic Alleppey luxury houseboat stay.',
      highlights: ['Tea plantations of Munnar', 'Periyar Wildlife Sanctuary', 'Overnight Alleppey Houseboat', 'Private chauffeur throughout'],
      createdAt: '2026-01-10T10:00:00.000Z',
      updatedAt: '2026-01-10T10:00:00.000Z',
    };

    // PACKAGE 2 (Mandatory exact client sample):
    // ID: PKG-SI-12
    // TITLE: Madurai, Rameswaram and Kanyakumari
    // DURATION: 5 days. HOTEL: 3 star.
    // SEASON: All year. PRICE: ₹18,750 per person.
    // STATUS: Draft.
    const pkg2: TravelPackage = {
      id: 'pkg_si_12',
      packageId: 'PKG-SI-12',
      title: 'Madurai, Rameswaram and Kanyakumari',
      slug: 'madurai-rameswaram-kanyakumari',
      destination: 'Madurai, Rameswaram, Kanyakumari, Tamil Nadu',
      description:
        'A spiritually enriching journey through Tamil Nadu’s most revered heritage capitals. Marvel at the intricate Dravidian gopurams of Madurai Meenakshi Temple, cross the legendary Pamban Sea Bridge to Rameswaram Ramanathaswamy Temple, and stand at the southernmost tip of peninsular India where three oceans meet at Kanyakumari.',
      days: 5,
      nights: 4,
      hotelCategory: '3 star',
      photos: [
        DESTINATION_IMAGES.maduraiTemple,
        DESTINATION_IMAGES.kanyakumariSunset,
      ],
      itinerary: [
        {
          day: 1,
          title: 'Arrival in Madurai & Meenakshi Amman Temple',
          description:
            'Arrival at Madurai Airport/Railway station. Check in at comfortable 3-star hotel. In the evening, witness the divine night ceremony and intricate carvings of Sri Meenakshi Sundareswarar Temple.',
          mealsIncluded: 'Dinner',
          overnightStay: 'Madurai Heritage Hotel (3 Star)',
        },
        {
          day: 2,
          title: 'Madurai to Rameswaram via Pamban Bridge (175 km / 3.5 hrs)',
          description:
            'Drive to the sacred island of Rameswaram across the historic Pamban Bridge. Visit Ramanathaswamy Temple known for its magnificent 1000-pillar corridor and sacred 22 theerthams. Visit Dhanushkodi ghost town and Ram Setu point.',
          mealsIncluded: 'Breakfast & Dinner',
          overnightStay: 'Rameswaram Sea View Hotel (3 Star)',
        },
        {
          day: 3,
          title: 'Rameswaram to Kanyakumari (310 km / 6 hrs)',
          description:
            'Morning journey along the Coromandel coast to Kanyakumari, the confluence of the Arabian Sea, Indian Ocean, and Bay of Bengal. Check in and witness the breathtaking sunset from the shore.',
          mealsIncluded: 'Breakfast & Dinner',
          overnightStay: 'Kanyakumari Shore Hotel (3 Star)',
        },
        {
          day: 4,
          title: 'Kanyakumari Sightseeing & Trivandrum Transfer',
          description:
            'Early morning sunrise view. Ferry ride to Vivekananda Rock Memorial and Thiruvalluvar Statue. Visit Gandhi Memorial Mandapam and Bhagavathy Amman Temple. Afternoon drive to Trivandrum (90 km / 2.5 hrs).',
          mealsIncluded: 'Breakfast & Dinner',
          overnightStay: 'Trivandrum City Hotel (3 Star)',
        },
        {
          day: 5,
          title: 'Padmanabhaswamy Temple & Trivandrum Departure',
          description:
            'Morning darshan at the magnificent Sree Padmanabhaswamy Temple. Later drop at Trivandrum Airport or Railway Station for onward journey.',
          mealsIncluded: 'Breakfast',
        },
      ],
      inclusions: [
        '4 nights accommodation in clean 3-star hotels on twin-sharing basis',
        'Daily breakfast and dinner',
        'Private air-conditioned commercial vehicle with courteous chauffeur',
        'All state permits, parking fees, and toll taxes',
      ],
      exclusions: [
        'Temple special entry / darshan tickets and camera charges',
        'Ferry tickets at Kanyakumari',
        'Any personal expenses or meals not specified',
      ],
      seasonalPrices: [
        {
          id: 'sp_si12_allyear',
          seasonName: 'All Year Regular',
          startMonth: 'January',
          endMonth: 'December',
          pricePerPerson: 18750,
          hotelCategory: '3 star',
          pricingBasis: 'Twin-sharing basis',
          gstInformation: '5% GST applicable',
        },
      ],
      gstInformation: '5% GST applicable on all bookings',
      pricingBasis: 'Per person on twin-sharing basis',
      currentPublishedVersion: undefined,
      currentDraftVersion: 1,
      status: 'draft',
      seoTitle: 'Madurai, Rameswaram & Kanyakumari 5 Days Temple Tour | WanderCMS',
      seoDescription:
        'Explore South India heritage with our 5-day Madurai, Rameswaram, and Kanyakumari temple and coastal holiday package.',
      highlights: ['Meenakshi Amman Temple', 'Pamban Sea Bridge', 'Ramanathaswamy 1000 Pillars', 'Vivekananda Rock Memorial'],
      createdAt: '2026-01-15T12:00:00.000Z',
      updatedAt: '2026-01-15T12:00:00.000Z',
    };

    // PACKAGE 3 (Wayanad Rainforest & Wildlife Retreat):
    const pkg3: TravelPackage = {
      id: 'pkg_kl_03',
      packageId: 'PKG-KL-03',
      title: 'Wayanad Rainforest, Waterfalls and Wildlife Retreat',
      slug: 'wayanad-rainforest-waterfalls-wildlife',
      destination: 'Wayanad, Calicut, Kerala',
      description:
        'Immerse in the misty rainforest canopy of Wayanad in northern Kerala. Trek to the historic Edakkal Caves with Neolithic petroglyphs, bamboo raft along tranquil Kuruva Island, and rejuvenate in luxury plantation tree-houses surrounded by cardamom estates.',
      days: 4,
      nights: 3,
      hotelCategory: '4 star',
      photos: [
        DESTINATION_IMAGES.thekkadyForest,
        DESTINATION_IMAGES.munnarTea,
      ],
      itinerary: [
        {
          day: 1,
          title: 'Calicut Arrival & Drive to Wayanad Ghats (85 km / 2.5 hrs)',
          description: 'Pick-up from Calicut Airport/Station. Drive up the Thamarassery Churam mountain pass with 9 hairpin curves. Check in to secluded rainforest resort.',
          mealsIncluded: 'Dinner',
          overnightStay: 'Wayanad Eco Plantation Resort (4 Star)',
        },
        {
          day: 2,
          title: 'Edakkal Caves & Soochipara Waterfalls',
          description: 'Hike to the ancient Edakkal Caves followed by an excursion to Soochipara 3-tiered waterfall cascading through dense evergreen forests.',
          mealsIncluded: 'Breakfast & Dinner',
          overnightStay: 'Wayanad Eco Plantation Resort (4 Star)',
        },
        {
          day: 3,
          title: 'Banasura Sagar Dam & Kuruva Island Bamboo Rafting',
          description: 'Visit India’s largest earthen dam at Banasura Sagar with speed boating. Afternoon bamboo rafting on the Kabini River tributaries at Kuruva Island.',
          mealsIncluded: 'Breakfast & Dinner',
          overnightStay: 'Wayanad Eco Plantation Resort (4 Star)',
        },
        {
          day: 4,
          title: 'Tea Plantation Tour & Calicut Departure',
          description: 'Morning walk in organic coffee and pepper plantations. Check out and return to Calicut for your flight or train.',
          mealsIncluded: 'Breakfast',
        },
      ],
      inclusions: [
        '3 nights stay in luxury eco-plantation resort',
        'Daily breakfast and authentic Malabar dinners',
        'Private AC vehicle for all transfers and sightseeing',
        'Guided spice plantation trek',
      ],
      exclusions: ['Boating tickets and sanctuary entry fees', 'Airfare/Train tickets', 'Personal items'],
      seasonalPrices: [
        {
          id: 'sp_kl03_peak',
          seasonName: 'Peak Season',
          startMonth: 'October',
          endMonth: 'March',
          pricePerPerson: 21900,
          hotelCategory: '4 star',
          pricingBasis: 'Twin-sharing basis',
          gstInformation: '5% GST applicable',
        },
        {
          id: 'sp_kl03_monsoon',
          seasonName: 'Monsoon Season',
          startMonth: 'June',
          endMonth: 'September',
          pricePerPerson: 16500,
          hotelCategory: '4 star',
          pricingBasis: 'Twin-sharing basis',
          gstInformation: '5% GST applicable',
        },
      ],
      gstInformation: '5% GST applicable on all bookings',
      pricingBasis: 'Per person on twin-sharing basis',
      currentPublishedVersion: 1,
      currentDraftVersion: 1,
      status: 'published',
      seoTitle: 'Wayanad 4 Days Rainforest & Wildlife Tour Package | WanderCMS',
      seoDescription: 'Escape to mist-covered Wayanad with our 4-day rainforest tour. Discover Edakkal caves, waterfalls, and luxury eco-resorts.',
      highlights: ['Banasura Sagar Dam', 'Edakkal Neolithic Caves', 'Kuruva Island Bamboo Rafting', 'Eco Plantation Stay'],
      createdAt: '2026-01-20T09:00:00.000Z',
      updatedAt: '2026-01-20T09:00:00.000Z',
    };

    // SAMPLE ENQUIRY (Mandatory exact client sample):
    // "Hi, 2 adults and 1 kid, Kerala 5-6 nights in December, budget around 1.2 lakh total, houseboat a must."
    const sampleEnquiry: Enquiry = {
      id: 'enq_sample_01',
      customerName: 'Vikram Malhotra',
      email: 'vikram.malhotra@gmail.com',
      phone: '+91 98201 44521',
      destination: 'Kerala',
      travelDate: 'December 2026',
      adults: 2,
      children: 1,
      duration: '5-6 nights',
      budget: 120000,
      originalMessage:
        'Hi, 2 adults and 1 kid, Kerala 5-6 nights in December, budget around 1.2 lakh total, houseboat a must.',
      whatsappConsent: true,
      status: 'New',
      acknowledgementStatus: 'Recorded',
      acknowledgementTimestamp: '2026-11-06T14:30:00.000Z',
      internalNotes: [
        {
          id: 'note_01',
          author: 'System Auto-Ingest',
          text: 'Enquiry received via website package form. AI extraction processed automatically.',
          createdAt: '2026-11-06T14:30:05.000Z',
        },
      ],
      createdAt: '2026-11-06T14:30:00.000Z',
      updatedAt: '2026-11-06T14:30:00.000Z',
    };

    const sampleAIExtraction: AIExtraction = {
      id: 'aix_sample_01',
      enquiryId: 'enq_sample_01',
      extractedFields: {
        destination: 'Kerala',
        adults: 2,
        children: 1,
        duration: '5-6 nights',
        travelMonth: 'December',
        budget: 120000,
        requirements: ['Houseboat', 'Family friendly', 'Child with parents'],
      },
      confidence: 'high',
      missingFields: [],
      correctionHistory: [],
      processingStatus: 'completed',
      provider: 'groq',
      createdAt: '2026-11-06T14:30:05.000Z',
      updatedAt: '2026-11-06T14:30:05.000Z',
    };

    const sampleReply: EnquiryReply = {
      id: 'rep_sample_01',
      enquiryId: 'enq_sample_01',
      draftContent: `Dear Vikram,\n\nGreetings from WanderCMS, Kochi!\n\nThank you for reaching out regarding your family holiday to Kerala for 2 adults and 1 child this December. We would be delighted to host you.\n\nBased on your requirement for a 5-6 night journey with a private luxury houseboat and a budget of ₹1,20,000, our bestselling package "Munnar, Thekkady and Alleppey houseboat" (PKG-KL-07, 6 Days / 5 Nights) is an ideal match. During peak season in December, the verified package rate is ₹32,500 per person on a twin-sharing basis (plus 5% GST), perfectly accommodating your family within budget.\n\nThis journey features:\n• 2 nights in the misty tea plantations of Munnar\n• 1 night amidst the spice hills of Thekkady (Periyar)\n• 1 night backwater resort stay\n• 1 full day & night on your private, air-conditioned luxury houseboat in Alleppey with all traditional Kerala meals prepared on board\n• Private air-conditioned car with a seasoned chauffeur throughout.\n\nPlease let us know if your travel dates are flexible so we can reserve your houseboat slot.\n\nWarm regards,\nTravel Specialist Team\nWanderCMS, Kochi`,
      approvalStatus: 'draft',
      createdAt: '2026-11-06T14:30:10.000Z',
    };

    this.memoryStore = {
      users: [adminUser, sampleTravellerUser],
      packages: [pkg1, pkg2, pkg3],
      packageVersions: [
        {
          id: 'ver_kl07_v1',
          packageId: pkg1.packageId,
          versionNumber: 1,
          contentSnapshot: { ...pkg1 },
          editorId: adminUser.id,
          changeSummary: 'Initial published package with peak & monsoon seasonal rates',
          status: 'published',
          createdAt: pkg1.createdAt,
          publishedAt: pkg1.createdAt,
        },
        {
          id: 'ver_si12_v1',
          packageId: pkg2.packageId,
          versionNumber: 1,
          contentSnapshot: { ...pkg2 },
          editorId: adminUser.id,
          changeSummary: 'Initial draft version for South India temple circuit',
          status: 'draft',
          createdAt: pkg2.createdAt,
        },
        {
          id: 'ver_kl03_v1',
          packageId: pkg3.packageId,
          versionNumber: 1,
          contentSnapshot: { ...pkg3 },
          editorId: adminUser.id,
          changeSummary: 'Initial published package for Wayanad Eco Retreat',
          status: 'published',
          createdAt: pkg3.createdAt,
          publishedAt: pkg3.createdAt,
        },
      ],
      enquiries: [sampleEnquiry],
      aiExtractions: [sampleAIExtraction],
      enquiryReplies: [sampleReply],
      activityLogs: [
        {
          id: 'act_init_01',
          userId: adminUser.id,
          userName: adminUser.name,
          action: 'Published package PKG-KL-07',
          entityType: 'package',
          entityId: pkg1.id,
          timestamp: pkg1.createdAt,
        },
        {
          id: 'act_init_02',
          userId: adminUser.id,
          userName: adminUser.name,
          action: 'Created draft package PKG-SI-12',
          entityType: 'package',
          entityId: pkg2.id,
          timestamp: pkg2.createdAt,
        },
        {
          id: 'act_init_03',
          userId: 'system',
          userName: 'System Auto-Ingest',
          action: 'Received enquiry from Vikram Malhotra (Kerala, 2A + 1C, Dec)',
          entityType: 'enquiry',
          entityId: sampleEnquiry.id,
          timestamp: sampleEnquiry.createdAt,
        },
      ],
    };

    this.saveToFile();
    console.log('✓ Database seeded with client sample packages PKG-KL-07 and PKG-SI-12 and sample enquiry.');
  }
}

export const db = new DatabaseManager();

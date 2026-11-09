export type UserRole = 'staff-admin' | 'traveller';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash?: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface SeasonalPrice {
  id: string;
  seasonName: string; // 'Peak', 'Monsoon', 'Regular', 'All Year'
  startMonth: string; // e.g. 'October', 'June', 'January'
  endMonth: string; // e.g. 'March', 'September', 'December'
  pricePerPerson: number;
  hotelCategory: string; // e.g. '4 star', '3 star', '5 star Luxury'
  pricingBasis: string; // 'Twin-sharing basis'
  gstInformation: string; // '5% GST applicable'
}

export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  mealsIncluded?: string;
  overnightStay?: string;
}

export type PackageStatus = 'published' | 'draft' | 'archived';

export interface TravelPackage {
  id: string;
  packageId: string; // e.g. 'PKG-KL-07'
  title: string;
  slug: string;
  destination: string;
  description: string;
  days: number;
  nights: number;
  hotelCategory: string;
  photos: string[];
  itinerary: ItineraryDay[];
  inclusions: string[];
  exclusions: string[];
  seasonalPrices: SeasonalPrice[];
  gstInformation: string;
  pricingBasis: string;
  currentPublishedVersion?: number;
  currentDraftVersion?: number;
  status: PackageStatus;
  seoTitle?: string;
  seoDescription?: string;
  highlights?: string[];
  createdAt: string;
  updatedAt: string;
}

export function getStartingPrice(pkg: TravelPackage): number {
  if (!pkg.seasonalPrices || pkg.seasonalPrices.length === 0) return 0;
  return Math.min(...pkg.seasonalPrices.map((sp) => sp.pricePerPerson));
}

export interface PackageVersion {
  id: string;
  packageId: string;
  versionNumber: number;
  contentSnapshot: Omit<TravelPackage, 'id' | 'currentPublishedVersion' | 'currentDraftVersion'>;
  editorId: string;
  editorName?: string;
  changeSummary?: string;
  status: 'published' | 'draft';
  createdAt: string;
  publishedAt?: string;
}

export type EnquiryStatus = 'New' | 'Under Review' | 'Contacted' | 'Qualified' | 'Closed';

export interface InternalNote {
  id: string;
  author: string;
  text: string;
  createdAt: string;
}

export interface Enquiry {
  id: string;
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
  status: EnquiryStatus;
  assignedTo?: string;
  acknowledgementStatus: 'Recorded' | 'Pending' | 'Delivered';
  acknowledgementTimestamp?: string;
  internalNotes?: InternalNote[];
  createdAt: string;
  updatedAt: string;
}

export interface ExtractedFields {
  destination: string;
  adults: number;
  children: number;
  duration: string;
  travelMonth: string;
  budget: number;
  requirements: string[];
}

export interface CorrectionRecord {
  field: string;
  oldValue: any;
  newValue: any;
  correctedBy: string;
  correctedAt: string;
}

export interface AIExtraction {
  id: string;
  enquiryId: string;
  extractedFields: ExtractedFields;
  confidence: 'high' | 'medium' | 'low';
  missingFields: string[];
  correctionHistory: CorrectionRecord[];
  processingStatus: 'completed' | 'failed' | 'pending' | 'unconfigured';
  errorDetails?: string;
  provider?: 'groq' | 'heuristic-fallback' | 'gemini';
  createdAt: string;
  updatedAt: string;
}

export interface PackageMatch {
  packageId: string;
  packageTitle: string;
  slug: string;
  destination: string;
  duration: string;
  databasePrice: number;
  pricingBasis: string;
  gstInformation: string;
  score: number; // 0 - 100
  scoreBreakdown: {
    destinationScore: number; // max 35
    budgetScore: number; // max 25
    durationScore: number; // max 20
    requirementsScore: number; // max 20
  };
  matchReasons: string[];
}

export interface EnquiryReply {
  id: string;
  enquiryId: string;
  draftContent: string;
  approvalStatus: 'draft' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName?: string;
  action: string;
  entityType: 'package' | 'enquiry' | 'version' | 'reply' | 'auth';
  entityId: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface DashboardStats {
  totalPackages: number;
  publishedPackages: number;
  draftPackages: number;
  totalEnquiries: number;
  newEnquiries: number;
  pendingEnquiries: number;
  recentEnquiries: Enquiry[];
  packagesOverview: {
    id: string;
    packageId: string;
    title: string;
    destination: string;
    status: PackageStatus;
    startingPrice: number;
    updatedAt: string;
  }[];
}

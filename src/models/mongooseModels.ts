import mongoose, { Schema, Document } from 'mongoose';

// User Schema
export const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['staff-admin', 'traveller'], default: 'staff-admin' },
  },
  { timestamps: true }
);

// Seasonal Pricing Sub-schema
export const SeasonalPriceSchema = new Schema({
  seasonName: { type: String, required: true },
  startMonth: { type: String, required: true },
  endMonth: { type: String, required: true },
  pricePerPerson: { type: Number, required: true },
  hotelCategory: { type: String, required: true },
  pricingBasis: { type: String, default: 'Twin-sharing basis' },
  gstInformation: { type: String, default: '5% GST applicable' },
});

// Itinerary Day Sub-schema
export const ItineraryDaySchema = new Schema({
  day: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  mealsIncluded: { type: String },
  overnightStay: { type: String },
});

// Package Schema
export const PackageSchema = new Schema(
  {
    packageId: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    destination: { type: String, required: true, index: true },
    description: { type: String, required: true },
    days: { type: Number, required: true },
    nights: { type: Number, required: true },
    hotelCategory: { type: String, required: true },
    photos: [{ type: String }],
    itinerary: [ItineraryDaySchema],
    inclusions: [{ type: String }],
    exclusions: [{ type: String }],
    seasonalPrices: [SeasonalPriceSchema],
    gstInformation: { type: String, required: true },
    pricingBasis: { type: String, required: true },
    currentPublishedVersion: { type: Number, default: 1 },
    currentDraftVersion: { type: Number, default: 1 },
    status: { type: String, enum: ['published', 'draft', 'archived'], default: 'draft', index: true },
    seoTitle: { type: String },
    seoDescription: { type: String },
    highlights: [{ type: String }],
  },
  { timestamps: true }
);

// PackageVersion Schema (Immutable version snapshots)
export const PackageVersionSchema = new Schema({
  packageId: { type: String, required: true, index: true },
  versionNumber: { type: Number, required: true },
  contentSnapshot: { type: Schema.Types.Mixed, required: true },
  editorId: { type: String, required: true },
  editorName: { type: String },
  changeSummary: { type: String },
  status: { type: String, enum: ['published', 'draft'], default: 'draft' },
  createdAt: { type: Date, default: Date.now },
  publishedAt: { type: Date },
});

// Enquiry Schema
export const EnquirySchema = new Schema(
  {
    customerName: { type: String, required: true },
    email: { type: String, required: true, index: true },
    phone: { type: String, required: true },
    destination: { type: String, required: true },
    travelDate: { type: String, required: true },
    adults: { type: Number, required: true, min: 1 },
    children: { type: Number, default: 0, min: 0 },
    duration: { type: String, required: true },
    budget: { type: Number, required: true },
    originalMessage: { type: String, required: true },
    whatsappConsent: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['New', 'Under Review', 'Contacted', 'Qualified', 'Closed'],
      default: 'New',
      index: true,
    },
    assignedTo: { type: String },
    acknowledgementStatus: { type: String, enum: ['Recorded', 'Pending', 'Delivered'], default: 'Recorded' },
    acknowledgementTimestamp: { type: Date, default: Date.now },
    internalNotes: [
      {
        author: { type: String, required: true },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// AI Extraction Schema
export const AIExtractionSchema = new Schema(
  {
    enquiryId: { type: String, required: true, unique: true, index: true },
    extractedFields: {
      destination: { type: String },
      adults: { type: Number },
      children: { type: Number },
      duration: { type: String },
      travelMonth: { type: String },
      budget: { type: Number },
      requirements: [{ type: String }],
    },
    confidence: { type: String, enum: ['high', 'medium', 'low'], default: 'high' },
    missingFields: [{ type: String }],
    correctionHistory: [
      {
        field: { type: String },
        oldValue: { type: Schema.Types.Mixed },
        newValue: { type: Schema.Types.Mixed },
        correctedBy: { type: String },
        correctedAt: { type: Date, default: Date.now },
      },
    ],
    processingStatus: {
      type: String,
      enum: ['completed', 'failed', 'pending', 'unconfigured'],
      default: 'pending',
    },
    errorDetails: { type: String },
    provider: { type: String },
  },
  { timestamps: true }
);

// Enquiry Reply Schema
export const EnquiryReplySchema = new Schema(
  {
    enquiryId: { type: String, required: true, index: true },
    draftContent: { type: String, required: true },
    approvalStatus: { type: String, enum: ['draft', 'approved', 'rejected'], default: 'draft' },
    approvedBy: { type: String },
    approvedAt: { type: Date },
  },
  { timestamps: true }
);

// Activity Log Schema
export const ActivityLogSchema = new Schema({
  userId: { type: String, required: true },
  userName: { type: String },
  action: { type: String, required: true },
  entityType: { type: String, enum: ['package', 'enquiry', 'version', 'reply', 'auth'], required: true },
  entityId: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  metadata: { type: Schema.Types.Mixed },
});

export const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);
export const PackageModel = mongoose.models.Package || mongoose.model('Package', PackageSchema);
export const PackageVersionModel = mongoose.models.PackageVersion || mongoose.model('PackageVersion', PackageVersionSchema);
export const EnquiryModel = mongoose.models.Enquiry || mongoose.model('Enquiry', EnquirySchema);
export const AIExtractionModel = mongoose.models.AIExtraction || mongoose.model('AIExtraction', AIExtractionSchema);
export const EnquiryReplyModel = mongoose.models.EnquiryReply || mongoose.model('EnquiryReply', EnquiryReplySchema);
export const ActivityLogModel = mongoose.models.ActivityLog || mongoose.model('ActivityLog', ActivityLogSchema);

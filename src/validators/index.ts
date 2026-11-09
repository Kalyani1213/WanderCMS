import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const SeasonalPriceSchema = z.object({
  id: z.string().optional(),
  seasonName: z.string().min(1, 'Season name is required'),
  startMonth: z.string().min(1, 'Start month is required'),
  endMonth: z.string().min(1, 'End month is required'),
  pricePerPerson: z.number().positive('Price must be greater than zero'),
  hotelCategory: z.string().min(1, 'Hotel category is required'),
  pricingBasis: z.string().default('Twin-sharing basis'),
  gstInformation: z.string().default('5% GST applicable'),
});

export const ItineraryDaySchema = z.object({
  day: z.number().int().positive(),
  title: z.string().min(2, 'Day title is required'),
  description: z.string().min(5, 'Day description is required'),
  mealsIncluded: z.string().optional(),
  overnightStay: z.string().optional(),
});

export const PackageSchema = z.object({
  packageId: z.string().min(2, 'Package ID is required (e.g. PKG-KL-07)'),
  title: z.string().min(3, 'Package title is required'),
  slug: z.string().min(2, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  destination: z.string().min(2, 'Destination is required'),
  description: z.string().min(10, 'Detailed description is required'),
  days: z.number().int().min(1, 'Days must be at least 1'),
  nights: z.number().int().min(0, 'Nights cannot be negative'),
  hotelCategory: z.string().min(1, 'Hotel category is required'),
  photos: z.array(z.string()).min(1, 'At least one photo is required'),
  itinerary: z.array(ItineraryDaySchema).min(1, 'At least one itinerary day is required'),
  inclusions: z.array(z.string()).min(1, 'At least one inclusion is required'),
  exclusions: z.array(z.string()).default([]),
  seasonalPrices: z.array(SeasonalPriceSchema).min(1, 'At least one seasonal price record is required'),
  gstInformation: z.string().min(1, 'GST information is required'),
  pricingBasis: z.string().min(1, 'Pricing basis is required'),
  status: z.enum(['published', 'draft', 'archived']).default('draft'),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  highlights: z.array(z.string()).optional(),
});

export const EnquirySchema = z.object({
  customerName: z.string().trim().min(2, 'Full name is required'),
  email: z.string().trim().email('Valid email is required'),
  phone: z.string().trim().min(7, 'Valid phone number is required'),
  destination: z.string().trim().min(2, 'Destination is required'),
  travelDate: z.string().trim().min(4, 'Valid travel date or month is required'),
  adults: z.number().int().min(1, 'Adults must be at least 1'),
  children: z.number().int().min(0, 'Children cannot be negative').default(0),
  duration: z.string().trim().min(1, 'Duration is required'),
  budget: z.number().positive('Budget must be a valid positive amount'),
  specialRequirements: z.string().optional().default(''),
  originalMessage: z.string().optional(),
  whatsappConsent: z.boolean().default(false),
});

export const AIExtractionUpdateSchema = z.object({
  destination: z.string().min(1),
  adults: z.number().int().min(1),
  children: z.number().int().min(0),
  duration: z.string().min(1),
  travelMonth: z.string().min(1),
  budget: z.number().positive(),
  requirements: z.array(z.string()),
});

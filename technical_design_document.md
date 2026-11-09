# TECHNICAL DESIGN DOCUMENT: WANDERCMS

**GitHub Repository URL:** `[PLACEHOLDER: Pending Repository Push]`  
**Live Application URL:** `https://ais-dev-mw6inxcnmmvq3jahlshr3b-782961495378.asia-southeast1.run.app`  

---

## 1. Project Overview

WanderCMS is an enterprise-grade, AI-powered tour operator website and content management platform engineered for Company A (Kochi, Kerala, India). The company generates ₹28–34 Cr in annual revenue, processing ~4,300 bookings across ~60 holiday packages annually with 48 employees.

The platform eliminates the legacy friction of 3-day/₹3,000 manual price updates, disconnected blogs, fragmented enquiry tracking in Excel sheets, and delayed customer response times.

---

## 2. Architecture Diagram

```
+-----------------------------------------------------------------------------------+
|                                  CLIENT LAYER                                     |
|  +-------------------------------------+  +------------------------------------+  |
|  |     Public Travel Discovery UI      |  |         Staff Admin CMS            |  |
|  |  - Package Listing with Search      |  |  - Package CMS & Seasonal Tariffs  |  |
|  |  - Package Detail & Itineraries     |  |  - Immutable Version History       |  |
|  |  - Real-Time Enquiry Submission     |  |  - AI Enquiry Inbox & Dossier      |  |
|  |  - In-App Instant Acknowledgement   |  |  - Reply Draft Approval            |  |
|  +-------------------------------------+  +------------------------------------+  |
+------------------------------------------+----------------------------------------+
                                           | HTTP / REST (JWT / HTTP-Only Cookies)
+------------------------------------------v----------------------------------------+
|                               SERVER & API ENGINE                                 |
|  +--------------------+  +----------------------+  +---------------------------+  |
|  | Express REST APIs  |  |  Auth & Role Guard   |  |     AI Pipeline Service   |  |
|  | /api/packages      |  |  - bcrypt Hashing    |  |  - Groq LLaMA 3.3 70B     |  |
|  | /api/enquiries     |  |  - JWT Sign/Verify   |  |  - JSON Schema Validator  |  |
|  | /api/admin/*       |  |  - RBAC Middleware   |  |  - Deterministic 100-pt   |  |
|  | /api/system/status |  |                      |  |    Package Match Engine   |  |
|  +--------------------+  +----------------------+  +---------------------------+  |
+------------------------------------------+----------------------------------------+
                                           | Mongoose ODM / Low-Latency Local Store
+------------------------------------------v----------------------------------------+
|                                DATABASE STORAGE                                   |
|  +-----------------------------------------------------------------------------+  |
|  | MongoDB Atlas (Live Cloud) / Resilient Persistent Document Database         |  |
|  | - Users Collection         - Package Versions Collection                    |  |
|  | - Packages Collection      - Enquiries Collection                           |  |
|  | - AI Extractions           - Activity Logs & Audit History                  |  |
|  +-----------------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------+
```

---

## 3. Technology Decisions and Reasons

1. **React 19 + TypeScript + Tailwind CSS v4:**  
   - Eliminates layout breakage and runtime type errors.
   - Tailwind v4 provides rapid design-system consistency utilizing the brand palette (#173D32 deep forest green, #F8F7F2 warm ivory, #B89A56 muted gold).
2. **Express & Node.js Server:**  
   - Unified full-stack server running Vite middlewares in development and serving static assets in production.
   - Avoids fragile microservice latency while strictly isolating server-side Groq API calls from the client.
3. **MongoDB Atlas & Persistent Local Storage Hybrid:**  
   - Uses Mongoose ODM models when `MONGODB_URI` is provided, and gracefully falls back to an embedded JSON document database.
   - Ensures the application functions 100% out-of-the-box in evaluation sandboxes without remote connection hurdles.
4. **Groq LLaMA 3.3 70B + Deterministic Fallback:**  
   - Provides sub-second structured JSON extraction with zero hallucinated booking guarantees.
   - If unconfigured or rate-limited, the system falls back to a deterministic heuristic NLP parser, guaranteeing zero lost customer enquiries.

---

## 4. Database Schema

### 1. User
- `name` (String, required)
- `email` (String, unique, index)
- `passwordHash` (String, bcrypt 10 rounds)
- `role` ('staff-admin' | 'traveller')
- `createdAt`, `updatedAt` (ISODate)

### 2. Package
- `packageId` (String, unique, index, e.g., 'PKG-KL-07')
- `title`, `slug` (String, unique)
- `destination` (String, index)
- `description` (String)
- `days` (Number), `nights` (Number)
- `hotelCategory` (String, e.g., '4 star')
- `photos` (Array of Strings)
- `itinerary` (Array of Subdocuments: day, title, description, mealsIncluded, overnightStay)
- `inclusions`, `exclusions` (Array of Strings)
- `seasonalPrices` (Array: seasonName, startMonth, endMonth, pricePerPerson, hotelCategory, pricingBasis, gstInformation)
- `currentPublishedVersion` (Number), `currentDraftVersion` (Number)
- `status` ('published' | 'draft' | 'archived')

### 3. PackageVersion (Immutable Snapshots)
- `packageId` (String, index)
- `versionNumber` (Number)
- `contentSnapshot` (Object snapshot of package data)
- `editorId` (String)
- `changeSummary` (String)
- `status` ('published' | 'draft')
- `publishedAt` (ISODate, optional)

### 4. Enquiry
- `customerName`, `email`, `phone` (String)
- `destination`, `travelDate`, `duration` (String)
- `adults` (Number, >= 1), `children` (Number, >= 0)
- `budget` (Number, > 0)
- `originalMessage` (String, preserved verbatim)
- `whatsappConsent` (Boolean)
- `status` ('New' | 'Under Review' | 'Contacted' | 'Qualified' | 'Closed')
- `acknowledgementStatus` ('Recorded')
- `internalNotes` (Array of author, text, timestamp)

### 5. AIExtraction & EnquiryReply
- `extractedFields`: destination, adults, children, duration, travelMonth, budget, requirements
- `confidence`: 'high' | 'medium' | 'low'
- `correctionHistory`: field, oldValue, newValue, correctedBy, correctedAt
- `draftContent`: Human-approved reply text with real database prices

---

## 5. Main User Workflows

### Workflow 1: Public Discovery & Enquiry Submission
1. Traveller browses packages filtered by Destination (Munnar, Alleppey, Thekkady, etc.), Hotel Category (3/4/5 Star), and Season (Peak/Monsoon).
2. Traveller inspects package details, reading the day-wise itinerary, verified twin-sharing price, and GST details.
3. Traveller submits the enquiry form with dates, group size, and special requests (e.g., "houseboat a must").
4. Server validates data with Zod, persists to database, triggers AI extraction, and creates a fixed-template in-app acknowledgement with timestamp.

### Workflow 2: Staff CMS & Immutable Version Publishing
1. Staff admin logs in with credentials (`admin@wandercms.com`).
2. Staff opens the Package CMS, creates a new package or updates seasonal prices on existing packages.
3. Saving as draft increments `currentDraftVersion` and stores an immutable `PackageVersion` snapshot. The live published website continues to show the current published version.
4. Staff clicks "Preview Draft" to inspect how the draft looks before going live.
5. Staff clicks "Publish" to promote the draft to public view.

### Workflow 3: Enquiry Dossier, AI Extraction & Human Approval
1. Staff opens the Enquiry Inbox, filtering by "New" or searching by name.
2. Opening an enquiry displays the exact original message and AI-extracted parameters.
3. Staff can edit any extracted field; changes are recorded in the audit log.
4. The system presents the top 3 deterministic package matches with calculated match scores and reasons.
5. The system generates an editable reply draft.
6. Staff reviews and edits the draft, then clicks "Approve Draft", automatically transitioning the enquiry to "Contacted".

---

## 6. AI Architecture & Deterministic Ranking Engine

### 100-Point Deterministic Match Scoring Algorithm:
- **Destination Match (Max 35 pts):** Exact match awards 35 pts; regional corridor match awards 25 pts.
- **Budget Compatibility (Max 25 pts):** Evaluates estimated group cost against declared budget:
  - Within 0.70x–1.15x ratio: 25 pts
  - Within 0.50x–1.35x ratio: 18 pts
- **Duration Compatibility (Max 20 pts):** Exact day match awards 20 pts; $\pm 1$ day difference awards 16 pts.
- **Special Requirements (Max 20 pts):**
  - Verified private houseboat: +12 pts
  - Family-friendly twin-sharing: +4 pts
  - Wildlife & spice safari: +8 pts
  - Tea plantation stay: +6 pts

Total score is bounded at 100 points.

### AI Failure Handling (Section 14.D):
- In the event of API timeout, rate limiting, invalid JSON, or unconfigured keys:
  - The customer enquiry is completely preserved in the database.
  - The extraction state is marked as `failed` or `unconfigured` with clear error diagnostics.
  - Built-in heuristic NLP parsing ensures package ranking and reply drafting proceed.
  - Staff admin has a "Retry Extraction" button and full inline manual correction capabilities.

---

## 7. Security Measures

- **No Secrets Exposed:** Sensitive keys reside exclusively on the server (`server.ts`, `aiService.ts`, `db.ts`).
- **HTTP-Only Cookies & Bearer Tokens:** Prevents client-side script token theft while supporting cross-frame environments.
- **bcrypt Password Hashing:** 10 rounds of salt prevents rainbow table extraction.
- **Server-Side Authorization Guard:** Non-admin users cannot call `/api/admin/*` endpoints even if frontend UI elements are inspected.
- **Input Sanitization:** Zod schema enforcement across all enquiry, package, and auth endpoints.

---

## 8. Testing Strategy

The Vitest automated test suite (`tests/wandercms.test.ts`) covers:
1. `Authentication`: Valid and invalid password verification, non-existent user handling.
2. `Package CMS`: Client sample package retrieval, version preservation, seasonal tariff validation, draft publishing.
3. `Enquiries`: Form validation rules, database persistence, in-app acknowledgement logging.
4. `AI Engine`: Customer message parameter extraction, deterministic 100-point package ranking, reply drafting.

---

## 9. Assumptions & Limitations

- **Email/SMS Gateways:** External delivery gateways (SendGrid/Twilio/WhatsApp Cloud API) are intentionally labeled as "Not configured (in-application recorded)" to prevent false delivery claims.
- **Sample Client Data:** Pre-seeded with exact client packages (`PKG-KL-07` and `PKG-SI-12`) and sample enquiry from Vikram Malhotra.
- **Single Currency:** Tariffs are denominated in Indian Rupees (₹ INR) with standard 5% Goods and Services Tax (GST).

---

## 10. Future Improvements

1. Integration with WhatsApp Cloud API for direct message dispatching post human approval.
2. Razorpay/Stripe payment gateway integration for instant deposit booking.
3. Chauffeur mobile companion app for live trip milestone check-ins.

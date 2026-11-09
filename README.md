# WanderCMS: AI-Powered Tour Operator Platform & Content Management System

> **Tagline:** Discover South India. Experience More.  
> **Client:** Company A, Kochi, Kerala, India  
> **Operational Scope:** ~48 employees, ₹28–34 Cr annual revenue, ~4,300 bookings annually, 60+ holiday circuits.

---

## 1. Project Overview & Business Problem Solved

WanderCMS replaces an outdated 6-year-old tour website and manual Excel enquiry management process with a modern, high-performance, full-stack travel platform.

### Problems Solved:
1. **Slow and Costly Content Edits:** Previously, updating tariffs and itineraries took 3 days and cost ₹3,000 per modification. With WanderCMS, authorized staff update seasonal rates, itinerary days, and publish drafts immediately.
2. **Disconnected Content:** Travel inspiration articles and blogs were hosted on separate platforms without direct connection to packages. WanderCMS provides unified contextual linking between guides and packages.
3. **Manual Excel Enquiry Tracking & Delayed Replies:** Inbound enquiries previously arrived across disparate channels and sat in Excel sheets, sometimes taking over 12 hours for a response. WanderCMS centralizes all enquiries in a real-time inbox.
4. **AI Requirements Extraction & Deterministic Matching:** The system extracts passenger counts, dates, budgets, and houseboat requirements, deterministically scoring catalog packages (out of 100 points) and drafting replies for staff approval.

---

## 2. Technology Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Lucide React, Zod schema validation.
- **Backend:** Node.js, Express, RESTful APIs, JWT authentication, bcrypt password hashing, HTTP-only cookie support.
- **Database:** MongoDB Atlas / Mongoose ODM models with an embedded persistent document fallback for zero-setup execution.
- **AI Engine:** Server-side Groq API (`llama-3.3-70b-versatile`) with structured JSON schema enforcement, alongside a resilient deterministic heuristic NLP extractor fallback when API keys are not provided.
- **Ranking Engine:** 100-point deterministic package recommendation algorithm based on destination (35 pts), budget compatibility (25 pts), duration (20 pts), and specific requirements like houseboats (20 pts).
- **Testing:** Vitest automated test suite covering auth, package CMS, seasonal tariffs, enquiry validation, and AI ranking.

---

## 3. Architecture & Data Models

WanderCMS operates with clean separation of concerns:
```
wander-cms/
├── src/
│   ├── assets/images/     # Verified high-fidelity travel photography
│   ├── components/
│   │   ├── admin/         # CMS Form, Version History Modal, Enquiry Dossier Modal
│   │   └── public/        # Top Bar (3-zone), Footer, Package Cards, Enquiry Modal
│   ├── context/           # AuthContext (JWT session management)
│   ├── models/            # Mongoose Schema definitions for MongoDB Atlas
│   ├── screens/           # 8 Main Screens (Public + Admin)
│   ├── server/            # Express APIs, Database Manager, AI Service, Auth
│   ├── types/             # TypeScript interfaces
│   └── validators/        # Zod validation schemas
├── scripts/seed.ts        # Idempotent database seed script
├── tests/                 # Vitest automated test suite
├── .env.example           # Environment variable template
├── deployment.md          # Production deployment guide
└── server.ts              # Full-stack server entry point
```

### Core MongoDB Models:
1. **User:** Secure admin accounts with bcrypt password hashes and role validation (`staff-admin`, `traveller`).
2. **Package:** Travel package catalog with days/nights, destinations, hotel category, and seasonal prices.
3. **PackageVersion:** Immutable version records preserving content snapshots, editor IDs, and timestamps.
4. **Enquiry:** Real-time customer requests with pax breakdown, budget, WhatsApp consent, and in-app acknowledgement.
5. **AIExtraction:** Parsed requirements with confidence score, missing fields, and staff correction audit logs.
6. **EnquiryReply:** Human-approved reply drafts incorporating exact database prices and twin-sharing terms.
7. **ActivityLog:** Complete audit trail of admin publishing, editing, and enquiry actions.

---

## 4. Getting Started Locally

### Prerequisites:
- Node.js 18+ or 20+
- npm or yarn

### Installation:
```bash
# 1. Clone repository
git clone <repository-url>
cd wandercms

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Optional: Set GROQ_API_KEY and MONGODB_URI in .env

# 4. Run database seed script
npx tsx scripts/seed.ts

# 5. Start development server
npm run dev
```

The application will be live at `http://localhost:3000`.

### Demo Credentials:

#### 1. Staff / Admin CMS:
- **Email:** `admin@wandercms.com`
- **Password:** `admin123`
- **Features:** Manage holiday circuits, edit seasonal twin-sharing tariffs, review AI-extracted requirements, and approve quotations.

#### 2. Sample Traveller Portal:
- **Email:** `vikram.malhotra@gmail.com`
- **Password:** `traveller123`
- **Enquiry Reference:** `ENQ-2026-001`
- **Features:** Track inquiry status, inspect official quotation breakdown (+5% GST), and dispatch booking voucher to Gmail.
- *(Note: Any user can also register with their own personal Gmail directly on the login screen.)*

---

## 5. Running Tests

Execute the comprehensive automated test suite:
```bash
npm test
```
This runs Vitest tests validating password encryption, package versioning, seasonal pricing validation, enquiry persistence, and deterministic AI package matching.

# WanderCMS: Production Deployment & Operations Guide

This guide details step-by-step instructions for deploying WanderCMS to Vercel and connecting to MongoDB Atlas.

---

## 1. Prerequisites

- A [Vercel](https://vercel.com) account
- A [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (M0 Free or dedicated)
- A [Groq Console](https://console.groq.com) account (for `GROQ_API_KEY`)
- Node.js 18.x or 20.x

---

## 2. Environment Variables Configuration

Configure the following environment variables in your Vercel Project Settings or local `.env`:

| Variable Name | Description | Example / Default |
|---------------|-------------|-------------------|
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://admin:pass@cluster.mongodb.net/wandercms?retryWrites=true&w=majority` |
| `GROQ_API_KEY` | Groq API key for LLaMA 3.3 extraction | `gsk_...` |
| `JWT_SECRET` | Secret key used to sign JWT auth cookies | `your_strong_random_jwt_secret_key_2026` |
| `NEXT_PUBLIC_APP_URL` | Base application URL | `https://wandercms.yourdomain.com` |
| `PORT` | Local dev / production port | `3000` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary name (optional for image uploads) | `wandercms` |
| `CLOUDINARY_API_KEY` | Cloudinary API Key (optional) | `...` |
| `CLOUDINARY_API_SECRET` | Cloudinary API Secret (optional) | `...` |

*Security Note: Never commit actual secret keys to git repositories.*

---

## 3. MongoDB Atlas Database Setup

1. Create a free M0 cluster on MongoDB Atlas in the Mumbai or Singapore AWS/GCP region.
2. In **Database Access**, create a user `wandercms_user` with read/write privileges.
3. In **Network Access**, allow access from anywhere (`0.0.0.0/0`) or add Vercel's IP ranges.
4. Copy your connection string into `MONGODB_URI`:
   ```
   MONGODB_URI=mongodb+srv://wandercms_user:<password>@cluster0.xyz.mongodb.net/wandercms?retryWrites=true&w=majority
   ```
5. Run the seed script to initialize required indexes, client sample packages (`PKG-KL-07` and `PKG-SI-12`), and the admin account:
   ```bash
   npm run build
   npx tsx scripts/seed.ts
   ```

---

## 4. Local Startup & Verification

```bash
# Clone and install dependencies
git clone <repo-url>
cd wandercms
npm install

# Seed sample data
npx tsx scripts/seed.ts

# Run tests
npm test

# Start full-stack server
npm run dev
```

Visit `http://localhost:3000` to browse packages, submit sample enquiries, and log in to the staff dashboard.

---

## 5. Vercel Deployment Instructions

1. Push your repository to GitHub.
2. Log into Vercel and click **Add New Project**.
3. Import your repository.
4. Set Build and Output Settings:
   - **Framework Preset:** Other / Node.js
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Add the Environment Variables from Section 2.
6. Click **Deploy**.

---

## 6. Demo Account Credentials

For review and evaluation:
- **Role:** Staff Administrator
- **Email:** `admin@wandercms.com`
- **Password:** `admin123`
*(Auto-fill button is also available on the `/login` screen for rapid testing).*

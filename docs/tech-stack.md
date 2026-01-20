# Technical Source of Truth: Professional Growth SaaS

## 1. Project Vision
A high-performance "Professional Growth Tool" that allows users to build grid-based, highly customized portfolios. The platform features a "Digital LEGO" workspace, advanced recruiter analytics, and professional brand optimization tools.

## 2. Technical Stack
* **Framework:** Next.js 14+ (App Router)
* **Language:** TypeScript (Strict)
* **Database:** MongoDB (Official Node.js Driver)
* **Authentication:** Auth.js v5 (next-auth@beta) with @auth/mongodb-adapter
* **Styling:** Tailwind CSS + shadcn/ui + next-themes
* **Grid Engine:** react-grid-layout or dnd-kit (for the "Digital LEGO" workspace)
* **File Storage:** UploadThing (For Resumes and Brand Assets)
* **Internationalization:** Bilingual (English/French) via browser-cookie/toggle system
* **Emails/Alerts:** Resend/Nodemailer for contact forms and instant notifications
* **Containerization:** Docker + Docker Compose for development and production

## 3. Advanced Feature Logic
* **Analytics Radar:** Track project clicks, resume downloads, and visitor referral sources. Data is stored in a UserAnalytics collection.
* **Grid Editor (Digital LEGO):** A draggable/resizable grid system with "Smart Snapping" for desktop and mobile layouts.
* **Atmosphere Themes:** A configuration object in the DB storing CSS variable sets (e.g., "The Minimalist", "The Bold Innovator").
* **Color Extraction:** Automatically suggest brand color palettes based on uploaded user logos.

## 4. Requirement Compliance
* **Fully Dynamic:** Every "Block" on the grid is a database entry; no hard-coded content.
* **Bilingual:** Every text field and uploaded document must support EN/FR versions.
* **Multi-Tenant Admin:** Every registered user is the "Admin" of their own data and analytics.
* **Asset Management:** Users can upload multiple CVs, tagged by language and tracked for downloads.
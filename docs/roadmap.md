# Development Roadmap: DevPort — Professional Growth SaaS

> **Guiding Principle:** Complete all MVP phases before moving to Extended Features.

---

## 🎯 MVP — Core Portfolio Requirements

These phases fulfill the **original portfolio requirements** from `mvp.md`.

### Phase 1: Foundation & Infrastructure
> *Setting up the core technical foundation*

- [x] **Project Setup**
  - [x] Configure Next.js 14+ with App Router and TypeScript (strict mode)
  - [x] Set up Tailwind CSS + shadcn/ui + next-themes
  - [x] Create Dockerfile for Next.js application
  - [x] Set up docker-compose.dev.yml for local development
  - [x] Set up docker-compose.prod.yml for production deployment
  - [x] Configure MongoDB container with persistent volume
  - [x] Configure ESLint, Prettier, and project structure

- [x] **Database Layer**
  - [x] Set up MongoDB connection using the official Node.js driver
  - [x] Create database schema for Users, Skills, Projects, Experience, Education, Contact, and Testimonials
  - [x] Implement data access layer with proper error handling

- [x] **Authentication**
  - [x] Integrate Auth.js v5 (next-auth@beta) with @auth/mongodb-adapter
  - [x] Implement secure registration and login flows
  - [x] Create protected route middleware for admin areas

---

### Phase 2: Bilingual System
> *Full English/French support with real-time switching*

- [x] **Internationalization (i18n)**
  - [x] Create translation files for EN/FR
  - [x] Implement language toggle using browser-cookie system
  - [x] Ensure all database text fields support bilingual content
  - [x] Create language-aware components

---

### Phase 3: Admin Dashboard
> *Private management dashboard for content control*

- [x] **Auth UI**
  - [x] Login page with email/password
  - [x] Register page with email verification
  - [x] Verification code page
  - [x] Registration and verification API endpoints

- [x] **Dashboard Layout**
  - [x] Build `/dashboard` route group with protected access
  - [x] Create responsive sidebar navigation
  - [x] Implement dashboard home with content overview

- [x] **Content Management (CRUD)**
  - [x] Skills management (create, read, update, delete)
  - [x] Projects management with image uploads
  - [x] Work Experience management
  - [x] Education management
  - [x] Contact Info / Profile settings
  - [x] Hobbies/Interests management

- [x] **Resume Management**
  - [x] Integrate UploadThing for CV file uploads
  - [x] Support bilingual CV uploads (EN/FR versions)
  - [x] Implement CV download tracking

---

### Phase 4: Public Portfolio Pages ✅
> *Dynamic, database-driven public pages*

- [x] **Portfolio Sections**
  - [x] Skills showcase page/section
  - [x] Projects gallery with detail views
  - [x] Work Experience timeline
  - [x] Education section
  - [x] Hobbies section

- [x] **Resume Download**
  - [x] Public CV download button (language-aware)
  - [x] Track download events

- [x] **Contact System**
  - [x] Contact form with validation
  - [x] Store messages in database
  - [x] Display messages in admin inbox

---

### Phase 5: Testimonials System ✅
> *Community feedback with moderation workflow*

- [x] **Public Submission**
  - [x] Testimonial submission form
  - [x] Validation and sanitization

- [x] **Admin Moderation**
  - [x] Testimonials review queue in dashboard
  - [x] Accept/Approve testimonials
  - [x] Reject testimonials
  - [x] Delete testimonials

- [x] **Display**
  - [x] Only approved testimonials visible publicly
  - [x] Testimonials section on portfolio

---

### Phase 6: Deployment & Polish ✅
> *Production readiness and final touches*

- [x] **Deployment**
  - [x] Configure production environment (vercel.json)
  - [x] Document environment variables (docs/environment-variables.md)
  - [ ] Deploy to Vercel (manual step required)

- [x] **Security & Quality**
  - [x] Input validation and sanitization (lib/sanitize.ts)
  - [x] XSS and injection protection
  - [x] Rate limiting on public endpoints (lib/rate-limit.ts)
  - [x] Security headers in middleware
  - [x] Accessibility improvements (skip link, ARIA, SEO)

- [ ] **Responsiveness** (Manual testing required)
  - [ ] Test and refine mobile layouts
  - [ ] Test and refine tablet layouts
  - [ ] Cross-browser testing

---

## ✨ Extended Features — Professional Growth Platform

> **Prerequisites:** All MVP phases must be complete and deployed.

These phases implement the advanced features from `product-specification.md`.

### Phase 7: Digital LEGO Workspace (Grid Editor)
> *Drag-and-drop portfolio customization*

- [ ] **Grid Engine**
  - [ ] Integrate react-grid-layout or dnd-kit
  - [ ] Create draggable/resizable block system
  - [ ] Implement Smart Snapping for alignment

- [ ] **Block Types**
  - [ ] Text blocks (headings, paragraphs)
  - [ ] Image blocks
  - [ ] Skill progress bars
  - [ ] Social feed embeds
  - [ ] Video introduction spots

- [ ] **Magic Preview**
  - [ ] Real-time mobile/desktop layout toggle
  - [ ] Separate layout configurations per device

---

### Phase 8: Atmosphere Themes
> *One-click aesthetic transformations*

- [ ] **Theme System**
  - [ ] Store theme configurations in database
  - [ ] Implement CSS variable-based theming
  - [ ] Create pre-designed themes ("The Minimalist", "The Bold Innovator", etc.)

- [ ] **Brand Color Matching**
  - [ ] Logo upload for color extraction
  - [ ] Automatic palette suggestion algorithm
  - [ ] Apply extracted colors to theme

---

### Phase 9: Success Insights (Analytics)
> *Track how recruiters interact with your portfolio*

- [ ] **Tracking API**
  - [ ] Log page views and project clicks
  - [ ] Track resume downloads
  - [ ] Record contact form submissions
  - [ ] Store analytics in UserAnalytics collection

- [ ] **Analytics Dashboard**
  - [ ] Popularity Heatmap (most clicked projects)
  - [ ] Visitor location insights
  - [ ] Referral source tracking
  - [ ] Action/Conversion reports

---

### Phase 10: Growth Toolkit
> *Professional tools for career growth*

- [ ] **Instant Alerts**
  - [ ] Configure Resend/Nodemailer for notifications
  - [ ] Email when CV is downloaded
  - [ ] Email when contact form is submitted
  - [ ] Notification preferences in dashboard

- [ ] **Short-Links**
  - [ ] Clean vanity URLs (site.com/username)
  - [ ] Username uniqueness validation
  - [ ] URL redirection system

---

### Phase 11: Public Gallery
> *Community showcase of portfolios*

- [ ] **Gallery Page**
  - [ ] Opt-in portfolio visibility setting
  - [ ] Browse all public portfolios
  - [ ] Search and filter by skills/industry

- [ ] **Discovery Features**
  - [ ] Featured portfolios
  - [ ] "Get Inspired" recommendations

---

## 📊 Progress Summary

| Phase | Category | Status |
|-------|----------|--------|
| 1. Foundation & Infrastructure | MVP | ✅ Complete |
| 2. Bilingual System | MVP | ✅ Complete |
| 3. Admin Dashboard | MVP | ✅ Complete |
| 4. Public Portfolio Pages | MVP | ✅ Complete |
| 5. Testimonials System | MVP | ✅ Complete |
| 6. Deployment & Polish | MVP | ✅ Complete |
| 7. Digital LEGO Workspace | Extended | Blocked (requires MVP) |
| 8. Atmosphere Themes | Extended | Blocked (requires MVP) |
| 9. Success Insights | Extended | Blocked (requires MVP) |
| 10. Growth Toolkit | Extended | Blocked (requires MVP) |
| 11. Public Gallery | Extended | Blocked (requires MVP) |

---

## 📚 Reference Documents

- **[mvp.md](./mvp.md)** — Original portfolio requirements (MVP scope)
- **[product-specification.md](./product-specification.md)** — Extended feature specifications
- **[tech-stack.md](./tech-stack.md)** — Technical stack decisions
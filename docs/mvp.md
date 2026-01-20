# Original Portfolio Requirements (MVP)

## 1. General Requirements
* **Dynamic Content:** The website must be fully dynamic, with no static or hard-coded content.
* **Data Management:** All displayed content must be retrieved from a database and managed through user dashboards.
* **Responsiveness:** Must function properly on desktop, tablet, and mobile devices.
* **Online Hosting:** The project must be hosted online.
* **Bilingual Support:** Must support two languages with the ability to switch.

## 2. User Roles

### Guests (Public)
* Can view any public portfolio
* Can sign up for an account

### Users (Registered)
* **Email Verification:** Required to activate account
* **Own Portfolio:** Each user manages their own portfolio content
* **Dashboard:** Access to manage Skills, Projects, Experience, Education, Resume, Contact Info, and Hobbies
* **Real-time Updates:** Changes reflect immediately on their public portfolio

### Admin (Platform Owner)
* Single admin account with platform-wide access
* Testimonial moderation (approve/reject/delete)
* Future: User management, analytics, platform settings

## 3. Public Pages
* **Portfolio Sections:** Displaying Skills, Projects, Work experience, and Education.
* **Resume:** Ability for visitors to download the CV.
* **Contact Page:** A form where visitors can send messages stored in the portfolio owner's inbox.

## 4. Testimonials
* **Moderation Workflow:** Testimonials submitted must be approved before publishing.
* **User Controls:** Portfolio owners can manage testimonials on their own profile.
* **Admin Override:** Admin can moderate any testimonial across the platform.

## 5. Technical Expectations
* **Security:** Proper authentication and authorization with role-based access.
* **Email Verification:** Account activation via verification code.
* **Data Integrity:** Validation and sanitization of all user inputs.
* **Multi-Tenant:** Each user's data is isolated to their account.
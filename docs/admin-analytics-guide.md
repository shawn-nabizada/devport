# Admin & Advanced Analytics Guide

## 1. Advanced Analytics (Visitor Intelligence)
The Analytics Dashboard now includes two powerful new features:

### A. Visitor Locations
- **What it is**: Automatically tracks the country of origin for every visitor.
- **Where to see it**: In the Analytics overview, a new card "Top Countries" appears next to Referrers.
- **How it works**: Uses Vercel/Cloudflare headers to resolve IP locations without external API costs.

### B. Click Heatmap
- **What it is**: Visualizes which blocks on your portfolio are getting the most interaction.
- **Where to see it**: Click the "Heatmap" tab in the Analytics Dashboard.
- **Usage**: Shows your actual Desktop layout with color-coded overlays indicating click intensity. Red = High interaction.

## 2. Admin Dashboard (Platform Oversight)
Access: `/admin` (Requires user role `admin`).

### A. Platform Overview
- Displays high-level metrics:
    - Total Users
    - Active Users (24h)
    - Total Projects & Views
    - Pending Testimonials count

### B. User Management (`/admin/users`)
- **Combined List**: Searchable table of all platform users.
- **Moderation**:
    - View User Profile (Public Link).
    - **Delete User**: Permanently removes a user and ALL their data (Portfolios, Analytics, etc.). **Action is irreversible.**

### C. Testimonial Moderation
- Approve or Reject testimonials for *any* user on the platform.

## 3. Middleware Security
- Critical routes `/dashboard` and `/admin` are now protected by global middleware.
- Unauthenticated users are redirected to login.
- Non-admin users attempting to access `/admin` are redirected to `/dashboard`.

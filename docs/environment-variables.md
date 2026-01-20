# DevPort - Environment Variables Configuration

This document describes all environment variables needed to run DevPort.

## Required Variables

### Database
```
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
```
MongoDB connection string. For production, use MongoDB Atlas or a managed MongoDB service.

### Authentication
```
AUTH_SECRET=<random-32-character-string>
AUTH_URL=https://yourdomain.com
NEXTAUTH_URL=https://yourdomain.com
```
- `AUTH_SECRET`: Generate with `openssl rand -base64 32`
- `AUTH_URL` / `NEXTAUTH_URL`: Your production domain URL

### Email Service (Resend)
```
RESEND_API_KEY=re_xxxxxxxxxxxx
EMAIL_FROM=DevPort <noreply@yourdomain.com>
```
Get your API key from [resend.com](https://resend.com).

### File Uploads (UploadThing)
```
UPLOADTHING_TOKEN=<your-uploadthing-token>
```
Get your token from [uploadthing.com](https://uploadthing.com).

---

## Optional Variables

### Application
```
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

---

## Environment Files

### Local Development
Create a `.env.local` file in the project root with your development values.

### Production (Vercel)
Add these variables in your Vercel project settings:
1. Go to your project on Vercel
2. Navigate to Settings → Environment Variables
3. Add each variable for the "Production" environment

---

## Security Best Practices

1. **Never commit `.env.local` or any `.env.*` files containing secrets**
2. **Rotate `AUTH_SECRET` if compromised**
3. **Use different API keys for development and production**
4. **Enable IP rate limiting on your MongoDB Atlas cluster**
5. **Set up Resend domain verification for custom email domain**

---

## Example .env.local for Development

```bash
# Database
MONGODB_URI=mongodb://localhost:27017/devport

# Auth
AUTH_SECRET=development-secret-change-in-production
AUTH_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000

# Email (optional for dev - codes will be logged to console)
RESEND_API_KEY=re_test_xxxxx
EMAIL_FROM=DevPort <onboarding@resend.dev>

# File Uploads
UPLOADTHING_TOKEN=<your-dev-token>
```

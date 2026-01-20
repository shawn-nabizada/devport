# DevPort Deployment Checklist

This document provides step-by-step instructions to deploy DevPort to production.

---

## 📋 Pre-Deployment Checklist

Before deploying, ensure you have:

- [ ] A [Vercel](https://vercel.com) account (free tier works)
- [ ] A [MongoDB Atlas](https://www.mongodb.com/atlas) account with a cluster
- [ ] A [Resend](https://resend.com) account for email
- [ ] An [UploadThing](https://uploadthing.com) account for file uploads
- [ ] Your domain name (optional, Vercel provides free `.vercel.app` subdomain)

---

## 🚀 Deployment Steps

### Step 1: Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas) and create an account
2. Create a new **FREE** cluster (M0 Sandbox)
3. Under **Database Access**, create a database user
4. Under **Network Access**, add `0.0.0.0/0` to allow access from anywhere (or use Vercel's IP ranges)
5. Click **Connect** on your cluster and copy the connection string
6. Replace `<password>` with your database user password
7. Add your database name (e.g., `devport`) before the `?` in the URL

**Example connection string:**
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/devport?retryWrites=true&w=majority
```

### Step 2: Set Up Resend

1. Go to [Resend](https://resend.com) and create an account
2. Get your API key from the dashboard
3. (Optional) Add and verify your custom domain for better deliverability

### Step 3: Set Up UploadThing

1. Go to [UploadThing](https://uploadthing.com) and create an account
2. Create a new app
3. Get your `UPLOADTHING_TOKEN` from the dashboard

### Step 4: Deploy to Vercel

#### Option A: Deploy via GitHub (Recommended)

1. Push your code to a GitHub repository
2. Go to [Vercel](https://vercel.com) and sign in with GitHub
3. Click **Add New** → **Project**
4. Import your DevPort repository
5. Configure the project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
6. Add Environment Variables (click **Environment Variables**):

```
MONGODB_URI=mongodb+srv://...your-connection-string...
AUTH_SECRET=[generate with: openssl rand -base64 32]
AUTH_URL=https://your-project.vercel.app
NEXTAUTH_URL=https://your-project.vercel.app
RESEND_API_KEY=re_xxxxx
EMAIL_FROM=DevPort <noreply@yourdomain.com>
UPLOADTHING_TOKEN=your-uploadthing-token
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
```

7. Click **Deploy**

#### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy (from project root)
vercel

# Follow the prompts to configure your project
# Add environment variables when prompted or via the dashboard
```

### Step 5: Configure Environment Variables in Vercel

1. Go to your project on Vercel dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add all required variables (see `docs/environment-variables.md`)
4. Make sure to add them to **Production** environment

### Step 6: Set Up Custom Domain (Optional)

1. Go to **Settings** → **Domains** in your Vercel project
2. Add your custom domain
3. Follow Vercel's instructions to configure DNS records
4. Update `AUTH_URL`, `NEXTAUTH_URL`, and `NEXT_PUBLIC_APP_URL` to use your custom domain

---

## ✅ Post-Deployment Verification

After deployment, verify these work:

1. **Homepage**: Visit your deployed URL
2. **Registration**: Create a test account
3. **Email Verification**: Check that verification email arrives
4. **Login**: Log in with test account
5. **Dashboard**: Access `/dashboard`
6. **File Upload**: Upload a resume
7. **Public Portfolio**: Visit `yourdomain.com/yourusername`
8. **Contact Form**: Submit a test message
9. **Language Toggle**: Switch between EN/FR

---

## 🔧 Troubleshooting

### Common Issues

**1. "MongoServerError: bad auth"**
- Check your MongoDB connection string password
- Ensure the database user has read/write permissions

**2. "Email not sending"**
- Verify your Resend API key
- Check Resend dashboard for email logs
- Ensure `EMAIL_FROM` uses a verified domain or `@resend.dev`

**3. "Unauthorized" on protected routes**
- Ensure `AUTH_SECRET` is set
- Check that `AUTH_URL` and `NEXTAUTH_URL` match your domain

**4. "Upload failed"**
- Verify `UPLOADTHING_TOKEN` is correct
- Check UploadThing dashboard for errors

**5. Build fails**
- Run `npm run build` locally to check for errors
- Check Vercel build logs for specific error messages

---

## 📊 Monitoring

For production monitoring, consider:

1. **Vercel Analytics** - Built-in analytics (enable in Vercel dashboard)
2. **MongoDB Atlas Metrics** - Database performance monitoring
3. **Resend Dashboard** - Email delivery tracking

---

## 🔒 Security Reminders

1. ✅ Never commit `.env.local` to version control
2. ✅ Use strong, unique passwords for all services
3. ✅ Enable 2FA on Vercel, MongoDB Atlas, and other services
4. ✅ Regularly rotate `AUTH_SECRET` and API keys
5. ✅ Set up IP allowlisting on MongoDB Atlas for production

---

## 📝 Maintenance

### Updating the Application

```bash
# Pull latest changes
git pull origin main

# Vercel will automatically redeploy on push to main
# Or manually trigger a redeploy from Vercel dashboard
```

### Database Backups

MongoDB Atlas provides automatic backups on paid tiers. For M0 (free tier):
- Use `mongodump` to create manual backups
- Export important data periodically

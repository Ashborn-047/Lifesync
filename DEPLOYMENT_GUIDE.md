# LifeSync Web Deployment Guide

This guide explains how to deploy the LifeSync web app so your colleagues can view and test it.

## 🚀 Quick Deploy Options

### Option 1: Vercel (Recommended - Easiest for Next.js)

Vercel is the easiest way to deploy Next.js apps with automatic deployments.

#### Step 1: Sign up for Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign up with your GitHub account
3. Import your repository: `Ashborn-047/Lifesync`

#### Step 2: Configure Project
1. **Root Directory**: Set to `web`
2. **Framework Preset**: Next.js (auto-detected)
3. **Build Command**: `npm run build` (auto-detected)
4. **Output Directory**: `.next` (auto-detected)

#### Step 3: Set Environment Variables
In Vercel project settings, add:
- `NEXT_PUBLIC_API_URL` = Your backend API URL
  - For local testing: `http://localhost:5174` (won't work from Vercel)
  - For production: Your deployed backend URL (e.g., `https://api.lifesync.com`)

#### Step 4: Deploy
- Click "Deploy"
- Vercel will automatically deploy on every push to `main` branch
- You'll get a URL like: `https://lifesync-web.vercel.app`

**✅ Done!** Your colleagues can now access the web app.

---

### Option 2: Netlify

#### Step 1: Sign up
1. Go to [netlify.com](https://netlify.com)
2. Sign up with GitHub
3. Click "New site from Git"

#### Step 2: Configure
1. **Repository**: Select `Ashborn-047/Lifesync`
2. **Base directory**: `web`
3. **Build command**: `npm run build`
4. **Publish directory**: `web/.next`

#### Step 3: Environment Variables
Add in Netlify settings:
- `NEXT_PUBLIC_API_URL` = Your backend API URL

#### Step 4: Deploy
- Click "Deploy site"
- Netlify will build and deploy automatically

---

### Option 3: GitHub Pages (Static Export)

For static hosting (requires Next.js static export):

1. Update `next.config.mjs`:
```javascript
const nextConfig = {
  output: 'export',
  images: { unoptimized: true }
};
```

2. Build and deploy:
```bash
cd web
npm run build
# Deploy the 'out' folder to GitHub Pages
```

---

### Option 4: Self-Hosted (Docker)

#### Create Dockerfile
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY web/package*.json ./
RUN npm ci
COPY web/ ./
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
```

#### Deploy
```bash
docker build -t lifesync-web .
docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=http://your-backend:5174 lifesync-web
```

---

## 🔄 Automated Deployment (GitHub Actions)

The repository includes a GitHub Actions workflow that:
- ✅ Builds the web app on every push
- ✅ Runs tests and linting
- ✅ Creates preview builds for PRs
- ✅ Can deploy to Vercel automatically

### Setup GitHub Actions Secrets

1. Go to: `Settings` → `Secrets and variables` → `Actions`
2. Add these secrets:
   - `NEXT_PUBLIC_API_URL` - Your backend API URL
   - `VERCEL_TOKEN` (optional) - For auto-deployment to Vercel
   - `VERCEL_ORG_ID` (optional) - Your Vercel organization ID
   - `VERCEL_PROJECT_ID` (optional) - Your Vercel project ID

### Workflow Triggers

The workflow runs automatically when:
- Code is pushed to `main` branch (in `web/` folder)
- Pull requests are created
- Manually triggered from Actions tab

---

## 🌐 Backend Requirements

**Important:** The web app needs the backend API to be accessible.

### For Local Development:
- Backend must run on `http://localhost:5174`
- Or set `NEXT_PUBLIC_API_URL` in `.env.local`

### For Production Deployment:
- Backend must be publicly accessible
- Set `NEXT_PUBLIC_API_URL` to your production backend URL
- Example: `https://api.lifesync.com` or `https://lifesync-backend.herokuapp.com`

### Backend Deployment Options:
1. **Heroku** - Easy PaaS deployment
2. **Railway** - Simple deployment platform
3. **Render** - Free tier available
4. **DigitalOcean App Platform** - Scalable hosting
5. **AWS/GCP/Azure** - Enterprise solutions

---

## 📋 Deployment Checklist

Before deploying, ensure:

- [ ] Backend API is deployed and accessible
- [ ] `NEXT_PUBLIC_API_URL` is set correctly
- [ ] All environment variables are configured
- [ ] Build passes locally: `npm run build`
- [ ] No TypeScript errors: `npm run lint`
- [ ] Test the deployed app works with backend

---

## 🔗 Sharing with Colleagues

Once deployed, share:

1. **Web App URL**: `https://your-app.vercel.app`
2. **Backend API URL**: `https://your-backend.com`
3. **GitHub Repository**: `https://github.com/Ashborn-047/Lifesync`

### For Local Testing:
If colleagues want to run locally:
```bash
git clone https://github.com/Ashborn-047/Lifesync.git
cd lifesync/web
npm install
cp .env.example .env.local
# Edit .env.local with backend URL
npm run dev
```

---

## 🐛 Troubleshooting

### Build Fails
- Check Node.js version (needs 18+)
- Verify all dependencies installed
- Check for TypeScript errors

### API Connection Errors
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check backend is running and accessible
- Check CORS settings on backend

### Deployment Issues
- Check build logs in Vercel/Netlify dashboard
- Verify environment variables are set
- Ensure backend is publicly accessible

---

## 📊 Monitoring

### Vercel Analytics
- Built-in analytics available
- View page views, performance metrics
- Monitor API errors

### Custom Analytics
The app includes analytics tracking (see `web/lib/analytics.ts`)
- Events are sent to backend API
- Can be viewed in Supabase dashboard

---

## 🔄 Continuous Deployment

With GitHub Actions + Vercel:
1. Push code to `main` branch
2. GitHub Actions builds and tests
3. Vercel automatically deploys
4. Colleagues see updates immediately

**No manual steps required!** 🎉

---

## 📝 Notes

- The web app is a Next.js 14 application
- Uses App Router (not Pages Router)
- Requires Node.js 18+
- Backend must be running for full functionality
- Static pages can work without backend (limited functionality)

---

## 🆘 Need Help?

- Check GitHub Actions logs: `Actions` tab in GitHub
- Check Vercel deployment logs: Vercel dashboard
- Review build errors in terminal: `npm run build`
- Check backend connectivity: Test API endpoint directly


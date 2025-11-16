# GitHub Pages Setup Guide

## 🚀 Quick Setup (2 minutes)

### Step 1: Enable GitHub Pages
1. Go to: `https://github.com/Ashborn-047/Lifesync/settings/pages`
2. Under **Source**, select: **GitHub Actions**
3. Click **Save**

### Step 2: Set Environment Variable (Optional)
1. Go to: `Settings` → `Secrets and variables` → `Actions`
2. Click **New repository secret**
3. Add:
   - **Name**: `NEXT_PUBLIC_API_URL`
   - **Value**: Your backend API URL (e.g., `https://your-backend.com`)
4. Click **Add secret**

### Step 3: Deploy
1. Push to `main` branch (or manually trigger workflow)
2. Go to **Actions** tab to see deployment
3. Your site will be live at: `https://ashborn-047.github.io/Lifesync/`

---

## ✅ What's Already Configured

- ✅ Next.js static export enabled (`web/next.config.mjs`)
- ✅ GitHub Actions workflow (`.github/workflows/deploy-github-pages.yml`)
- ✅ Automatic deployment on push to `main`
- ✅ Build and test before deployment

---

## 🔄 How It Works

1. **Push to main** → Triggers workflow
2. **Build** → Runs `npm run build` in `web/` directory
3. **Deploy** → Uploads `web/out` folder to GitHub Pages
4. **Live** → Site available at `https://ashborn-047.github.io/Lifesync/`

---

## 📝 Important Notes

### Static Export
- The app is configured for static export
- All pages are pre-rendered at build time
- Client-side routing works normally
- API calls work (must be to publicly accessible backend)

### Backend Requirements
- Backend must be publicly accessible
- Set `NEXT_PUBLIC_API_URL` in GitHub Secrets
- CORS must be enabled on backend for GitHub Pages domain

### Custom Domain
To use a custom domain:
1. Add `CNAME` file in `web/public/` with your domain
2. Configure DNS records
3. Update GitHub Pages settings

---

## 🐛 Troubleshooting

### Build Fails
- Check Actions tab for error logs
- Verify Node.js version (needs 18+)
- Check for TypeScript errors

### Site Not Loading
- Wait 1-2 minutes after deployment
- Check GitHub Pages settings
- Verify workflow completed successfully

### API Not Working
- Check `NEXT_PUBLIC_API_URL` is set correctly
- Verify backend is publicly accessible
- Check CORS settings on backend

---

## 🔗 Your Site URL

Once deployed, your site will be at:
- **Default**: `https://ashborn-047.github.io/Lifesync/`
- **Custom Domain**: If configured

---

## 📊 Monitoring

- View deployment status: **Actions** tab
- View site: GitHub Pages URL
- Check build logs: Click on workflow run

---

**That's it!** Your web app will automatically deploy on every push to `main`. 🎉


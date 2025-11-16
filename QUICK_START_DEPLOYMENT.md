# 🚀 Quick Start: Deploy LifeSync Web for Your Team

This is a **5-minute guide** to get your web app live so colleagues can see it.

## Option 1: GitHub Pages (Free & Automatic) ⭐⭐

### Step 1: Enable GitHub Pages (1 minute)
1. Go to your repository: `https://github.com/Ashborn-047/Lifesync`
2. Click **Settings** → **Pages** (left sidebar)
3. Under **Source**, select: **GitHub Actions**
4. Click **Save**

### Step 2: Set Environment Variable (Optional)
1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add:
   - **Name**: `NEXT_PUBLIC_API_URL`
   - **Value**: Your backend API URL
4. Click **Add secret**

### Step 3: Deploy (Automatic!)
1. Push any change to `main` branch (or manually trigger workflow)
2. Go to **Actions** tab to watch deployment
3. **Done!** Your site will be live at:
   - `https://ashborn-047.github.io/Lifesync/`

### ✅ Benefits:
- **Free** - No cost
- **Automatic** - Deploys on every push
- **HTTPS** - Secure by default
- **Custom Domain** - Can use your own domain

---

## Option 2: Vercel (Easiest - 3 minutes)

### Step 1: Sign Up
1. Go to **[vercel.com](https://vercel.com)** and sign up with GitHub
2. Click **"Add New Project"**

### Step 2: Import Repository
1. Select **"Import Git Repository"**
2. Choose: **`Ashborn-047/Lifesync`**
3. Click **"Import"**

### Step 3: Configure
1. **Root Directory**: Change to `web`
2. **Framework**: Next.js (auto-detected)
3. **Build Command**: `npm run build` (auto)
4. **Output Directory**: `.next` (auto)

### Step 4: Set Environment Variable
1. Click **"Environment Variables"**
2. Add:
   - **Name**: `NEXT_PUBLIC_API_URL`
   - **Value**: Your backend URL (e.g., `http://localhost:5174` for testing, or your production backend URL)
3. Click **"Save"**

### Step 5: Deploy
1. Click **"Deploy"**
2. Wait 2-3 minutes
3. **Done!** You'll get a URL like: `https://lifesync-web.vercel.app`

### ✅ Share with Team
Send them the Vercel URL - it updates automatically on every push to `main`!

---

## Option 2: Manual Build & Share (Local)

If you want to share locally without deploying:

### Step 1: Build
```bash
cd web
npm install
npm run build
npm start
```

### Step 2: Share Your IP
1. Find your local IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
2. Share: `http://YOUR_IP:3000`
3. Make sure colleagues are on the same network

---

## What Gets Deployed?

✅ **Web App** (Next.js frontend)
- Personality quiz interface
- Results dashboard
- Beautiful UI with animations

⚠️ **Backend Required**
- The web app needs the backend API running
- Set `NEXT_PUBLIC_API_URL` to your backend URL
- Backend must be accessible (not `localhost` for production)

---

## Automatic Deployments

Once set up with Vercel:
- ✅ Every push to `main` = automatic deployment
- ✅ Preview deployments for pull requests
- ✅ Zero manual steps needed

---

## Troubleshooting

**"Cannot connect to backend"**
- Make sure backend is running
- Check `NEXT_PUBLIC_API_URL` is set correctly
- For production, backend must be publicly accessible

**"Build failed"**
- Check Node.js version (needs 18+)
- Verify all dependencies installed
- Check GitHub Actions logs

---

## Next Steps

1. **Deploy Backend** (if not already):
   - See `backend/README.md` for backend deployment
   - Use Railway, Render, or Heroku

2. **Set Production URLs**:
   - Update `NEXT_PUBLIC_API_URL` in Vercel to production backend URL

3. **Share with Team**:
   - Send Vercel URL
   - Or share GitHub repo for local setup

---

## Full Documentation

For detailed deployment options, see: **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)**

---

**Questions?** Check the GitHub Actions workflow or Vercel deployment logs!


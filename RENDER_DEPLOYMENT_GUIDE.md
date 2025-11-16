# 🚀 Deploy LifeSync Backend to Render - Step-by-Step Guide

This guide will walk you through deploying your LifeSync backend API to Render so it's publicly accessible for your GitHub Pages frontend.

---

## 📋 Prerequisites

Before starting, make sure you have:
- ✅ GitHub repository: `Ashborn-047/Lifesync` (already done!)
- ✅ Supabase account and credentials
- ✅ API keys (OpenAI, Gemini, or Grok - at least one)
- ✅ Render account (free tier works!)

---

## 🎯 Step 1: Sign Up / Log In to Render

1. Go to **[render.com](https://render.com)**
2. Click **"Get Started"** or **"Sign Up"**
3. Sign up with your **GitHub account** (recommended - easier integration)

---

## 🎯 Step 2: Create a New Web Service

1. Once logged in, you'll see the **"Get Started"** page
2. Under **"Deploy your code"**, click **"GitHub"** button
3. Authorize Render to access your GitHub repositories
4. Select repository: **`Ashborn-047/Lifesync`**

---

## 🎯 Step 3: Configure the Web Service

After selecting your repository, you'll see the configuration form. Fill it out as follows:

### Basic Settings

- **Name**: `lifesync-backend` (or any name you prefer)
- **Region**: Choose closest to you (e.g., `Oregon (US West)`)
- **Branch**: `main`
- **Root Directory**: `backend` ⚠️ **IMPORTANT!**

### Build & Deploy Settings

- **Runtime**: `Python 3`
- **Build Command**: 
  ```bash
  pip install -r requirements.txt
  ```
- **Start Command**: 
  ```bash
  uvicorn src.api.server:app --host 0.0.0.0 --port $PORT
  ```

**Note**: Render automatically sets the `$PORT` environment variable, so use that instead of hardcoding port 5174.

### Environment Variables

Click **"Add Environment Variable"** and add these one by one:

#### Required Variables:

1. **SUPABASE_URL**
   - Value: `https://your-project.supabase.co`
   - Get this from: Supabase Dashboard → Settings → API → Project URL

2. **SUPABASE_KEY**
   - Value: Your Supabase anon/public key
   - Get this from: Supabase Dashboard → Settings → API → Project API keys → `anon` `public`

3. **SUPABASE_SERVICE_ROLE** (Optional but recommended)
   - Value: Your Supabase service role key
   - Get this from: Supabase Dashboard → Settings → API → Project API keys → `service_role` `secret`
   - ⚠️ Keep this secret! Never expose it in frontend code.

4. **OPENAI_API_KEY** (If using OpenAI)
   - Value: `sk-...` (your OpenAI API key)
   - Get this from: [platform.openai.com/api-keys](https://platform.openai.com/api-keys)

5. **GEMINI_API_KEY** (If using Gemini - Recommended)
   - Value: Your Google Gemini API key
   - Get this from: [makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)

6. **GROK_API_KEY** (If using Grok)
   - Value: Your Grok API key
   - Get this from: [x.ai](https://x.ai)

#### Optional Variables:

7. **LLM_PROVIDER**
   - Value: `gemini` (or `openai` or `grok`)
   - Default: `gemini`

8. **API_HOST**
   - Value: `0.0.0.0` (already handled by uvicorn)

9. **API_PORT**
   - Value: `$PORT` (Render sets this automatically)

---

## 🎯 Step 4: Advanced Settings (Optional)

Click **"Advanced"** to configure:

- **Auto-Deploy**: `Yes` (deploys automatically on every push to `main`)
- **Health Check Path**: `/health` (optional, but recommended)

---

## 🎯 Step 5: Create the Service

1. Review all your settings
2. Click **"Create Web Service"**
3. Render will start building and deploying your backend
4. This takes about 5-10 minutes

---

## 🎯 Step 6: Wait for Deployment

You'll see the build logs in real-time:

1. **Installing dependencies** - Installing Python packages
2. **Building** - Setting up the environment
3. **Starting** - Launching your FastAPI server
4. **Live** - Your service is running! ✅

**Watch for errors** in the logs. Common issues:
- Missing environment variables
- Import errors
- Port conflicts

---

## 🎯 Step 7: Get Your Backend URL

Once deployment is complete:

1. You'll see a **"Your service is live"** message
2. Your backend URL will be: `https://lifesync-backend.onrender.com` (or your custom name)
3. **Test it**: Open `https://your-backend-url.onrender.com/health` in your browser
4. You should see: `{"status":"healthy","service":"LifeSync Personality Engine API"}`

---

## 🎯 Step 8: Update Frontend to Use Backend URL

Now that your backend is live, update your frontend:

1. Go to GitHub: `https://github.com/Ashborn-047/Lifesync`
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Add:
   - **Name**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://your-backend-url.onrender.com` (your Render URL)
5. Click **"Add secret"**

---

## 🎯 Step 9: Trigger Frontend Deployment

1. Make a small change to trigger deployment (or wait for next push)
2. Go to **Actions** tab in GitHub
3. Watch the GitHub Pages deployment
4. Once complete, your frontend will use the new backend URL

---

## ✅ Verification

Test the full flow:

1. **Backend Health Check**:
   ```
   https://your-backend-url.onrender.com/health
   ```
   Should return: `{"status":"healthy",...}`

2. **Frontend**:
   ```
   https://ashborn-047.github.io/Lifesync/
   ```
   Should load and connect to backend

3. **Full Test**:
   - Take the quiz on the frontend
   - Submit answers
   - Results should load from backend

---

## 🔧 Troubleshooting

### Build Fails

**Error**: `Module not found` or `Import error`
- **Fix**: Check that `Root Directory` is set to `backend`
- **Fix**: Verify `requirements.txt` exists in `backend/` folder

**Error**: `Port already in use`
- **Fix**: Make sure start command uses `$PORT` not hardcoded port

### Service Won't Start

**Error**: `Environment variable not set`
- **Fix**: Check all required environment variables are added
- **Fix**: Verify no typos in variable names

**Error**: `Supabase connection failed`
- **Fix**: Verify `SUPABASE_URL` and `SUPABASE_KEY` are correct
- **Fix**: Check Supabase project is active

### CORS Errors

If frontend can't connect:
- **Fix**: Backend CORS is already configured to allow all origins (`allow_origins=["*"]`)
- **Fix**: Verify backend URL is correct in `NEXT_PUBLIC_API_URL`

### Service Goes to Sleep (Free Tier)

Render free tier services **spin down after 15 minutes of inactivity**:
- First request after sleep takes ~30 seconds (cold start)
- Subsequent requests are fast
- **Solution**: Upgrade to paid plan for always-on, or use a service like Railway

---

## 📊 Monitoring

### View Logs

1. Go to Render dashboard
2. Click on your service
3. Click **"Logs"** tab
4. See real-time logs and errors

### Health Checks

Render automatically checks `/health` endpoint:
- If it fails, Render will restart your service
- Make sure `/health` endpoint works

---

## 🔄 Auto-Deploy

With auto-deploy enabled:
- Every push to `main` branch = automatic deployment
- Render rebuilds and redeploys automatically
- No manual steps needed!

---

## 💰 Pricing

### Free Tier
- ✅ 750 hours/month (enough for most projects)
- ✅ Automatic SSL/HTTPS
- ✅ Custom domains
- ⚠️ Spins down after 15 min inactivity (cold start delay)

### Paid Plans
- Always-on service (no spin-down)
- More resources
- Better performance

---

## 🎉 Success!

Once everything is set up:

- ✅ Backend: `https://your-backend-url.onrender.com`
- ✅ Frontend: `https://ashborn-047.github.io/Lifesync/`
- ✅ They work together automatically
- ✅ Auto-deploys on every push

**Your colleagues can now use the full LifeSync app!** 🚀

---

## 📝 Quick Reference

### Render Service Settings Summary

```
Name: lifesync-backend
Region: Oregon (US West)
Branch: main
Root Directory: backend
Runtime: Python 3
Build Command: pip install -r requirements.txt
Start Command: uvicorn src.api.server:app --host 0.0.0.0 --port $PORT
```

### Required Environment Variables

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_ROLE=your-service-role-key
OPENAI_API_KEY=sk-... (or GEMINI_API_KEY or GROK_API_KEY)
LLM_PROVIDER=gemini
```

---

## 🆘 Need Help?

- **Render Docs**: [render.com/docs](https://render.com/docs)
- **Render Support**: Check logs in Render dashboard
- **GitHub Issues**: Check your repository's Actions tab

---

**That's it!** Your backend is now live and accessible to your frontend! 🎊


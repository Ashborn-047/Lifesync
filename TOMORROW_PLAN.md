# LifeSync - Tomorrow's Action Plan

## Priority 1: Mirror Web Changes to Mobile 📱

### Changes to Apply from Web → Mobile
- [ ] Update API error handling to show user-friendly messages
- [ ] Fix any favicon/image asset issues (check for corrupted files)
- [ ] Ensure `package.json` dependencies match between web and mobile
- [ ] Apply the same ESLint configuration fixes
- [ ] Verify all components render correctly with the current backend structure

### Testing Checklist
- [ ] Test quiz flow with backend API
- [ ] Test results display
- [ ] Test dashboard loading
- [ ] Test navigation between screens
- [ ] Verify mobile build compiles without errors

---

## Priority 2: Backend Migration Plan 🚀

### Current Issue with Render
- Free tier spins down after inactivity (500ms+ cold start)
- Unreliable for production use
- 404 errors on analytics endpoints

### Recommended Free Backend Hosting Options

#### Option 1: **Railway** (RECOMMENDED) ⭐
**Pros:**
- $5 free credit per month (enough for small apps)
- No sleep/spin-down on free tier
- Excellent Python support
- Easy GitHub integration
- Fast cold starts
- Dashboard is clean and simple

**Cons:**
- Requires credit card (but won't charge unless you exceed free tier)
- Free tier might not last forever

**Migration Steps:**
1. Sign up at [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select `Ashborn-047/Lifesync` repository
4. Set root directory to `/backend`
5. Railway auto-detects Python and uses your `requirements.txt`
6. Add environment variables (database URL, API keys, etc.)
7. Deploy!

---

#### Option 2: **Fly.io**
**Pros:**
- Generous free tier (3 small VMs)
- No credit card required for free tier
- Global deployment (good for latency)
- PostgreSQL included

**Cons:**
- Slightly more complex setup
- Requires CLI tool installation

**Migration Steps:**
1. Install Fly CLI: `curl -L https://fly.io/install.sh | sh` (or use Powershell installer)
2. Create `fly.toml` in backend directory
3. Run `fly launch` and follow prompts
4. Deploy with `fly deploy`

---

#### Option 3: **Vercel** (for API Routes)
**Pros:**
- Completely free for hobby projects
- Instant deployment from GitHub
- Serverless (scales automatically)
- Great for Next.js integration

**Cons:**
- Not ideal for long-running Python backends
- Better suited for serverless functions
- 10-second execution limit on free tier

**Only Use If:** You're willing to refactor backend to serverless functions

---

#### Option 4: **Koyeb**
**Pros:**
- True free tier (no credit card)
- No sleep time
- Simple deployment

**Cons:**
- Smaller community
- Limited to 1 service on free tier

---

### Migration Checklist (Railway Example)

#### Pre-Migration
- [ ] Export all environment variables from Render
- [ ] Document current database connection string
- [ ] Note current API endpoint: `https://lifesync-hzx1.onrender.com`
- [ ] Backup database (if using Supabase, already backed up)

#### During Migration
- [ ] Sign up for Railway
- [ ] Connect GitHub account
- [ ] Deploy backend from `/backend` directory
- [ ] Add environment variables:
  - `DATABASE_URL` (Supabase connection)
  - `OPENAI_API_KEY` (if used)
  - `GEMINI_API_KEY` (if used)
  - Any other secrets
- [ ] Wait for build to complete
- [ ] Test `/health` endpoint
- [ ] Test `/v1/questions` endpoint

#### Post-Migration
- [ ] Update GitHub secret `NEXT_PUBLIC_API_URL` to new Railway URL
- [ ] Trigger GitHub Actions workflow to redeploy web app
- [ ] Test quiz flow end-to-end
- [ ] Update mobile app API URL
- [ ] Delete Render service (optional, or keep as backup)

---

## Priority 3: Quick Fixes for Current Setup 🔧

### If You Want to Test Before Migration
You can temporarily fix the Render backend:

1. **Keep it alive:**
   - Use a free uptime monitor (e.g., [UptimeRobot](https://uptimerobot.com/))
   - Ping your `/health` endpoint every 5 minutes
   - This prevents spin-down

2. **Fix the 404 errors:**
   - Check backend logs to see which routes are failing
   - Verify analytics routes are properly defined in your FastAPI app

---

## Timeline Suggestion

### Today (Completed ✅)
- ✅ Fixed web deployment to GitHub Pages
- ✅ Identified backend connectivity issues

### Tomorrow Morning
- [ ] Deploy backend to Railway (30 minutes)
- [ ] Update web app with new backend URL (5 minutes)
- [ ] Test web app quiz flow (10 minutes)

### Tomorrow Afternoon
- [ ] Mirror web changes to mobile (1-2 hours)
- [ ] Update mobile app backend URL
- [ ] Test mobile app end-to-end

### Optional: Tomorrow Evening
- [ ] Set up Supabase database backups
- [ ] Add monitoring/logging to backend
- [ ] Create a simple admin dashboard

---

## Notes & Recommendations

1. **Railway is your best bet** - It's developer-friendly, fast, and the free tier is generous enough for your use case.

2. **Keep Render as fallback** - Don't delete it immediately. Once Railway is stable, you can decommission Render.

3. **Environment Variables** - Make sure to check `.env.example` in your backend to ensure you're not missing any required env vars.

4. **Database** - If you're using Supabase, the connection string stays the same regardless of where you host the backend.

5. **API URL Update** - Remember to update it in **3 places**:
   - GitHub repository secret (`NEXT_PUBLIC_API_URL`)
   - Mobile app configuration
   - Any documentation/README files

---

## Backup Plan

If all free tiers fail or have issues, you can:
- Use **Supabase Edge Functions** (free tier, serverless)
- Deploy to **AWS Lambda** (free tier for 1M requests/month)
- Self-host on a **home server** or **Raspberry Pi** (if you have one)

But Railway should work perfectly for now! 🚀

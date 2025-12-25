# Mobile App Migration Plan - Railway Backend Integration

**Date Created**: November 26, 2025  
**Objective**: Connect the mobile app to the new Railway backend and ensure full functionality

> **⚠️ Important**: Railway displays domains without the `https://` protocol. Always add `https://` when configuring API URLs!

---

## ✅ What We've Completed Today

- [x] Deployed backend to Railway
- [x] Backend is live at: `https://lifesync-production.up.railway.app`
- [x] Health check confirmed working
- [x] Updated GitHub secret `NEXT_PUBLIC_API_URL` for web app
- [x] Triggered web app redeployment with new backend URL

---

## 📱 Tomorrow's Tasks - Mobile App

### Task 1: Configure Mobile Environment

**Create** `.env.local` file in the `mobile/` directory:

```bash
EXPO_PUBLIC_API_URL=https://lifesync-production.up.railway.app
```

**Why?** The mobile app reads the API URL from this environment variable (see `mobile/app/lib/config.ts`)

---

### Task 2: Mirror Web Fixes to Mobile

From the web deployment fixes, apply similar changes to mobile if needed:

#### Changes to Review:
- [ ] Check if API error handling needs updates
- [ ] Verify all components are compatible with current backend
- [ ] Review dependencies in `mobile/package.json`
- [ ] Check for any asset/image issues
- [ ] Verify TypeScript types match backend responses

#### Files to Check:
- `mobile/app/lib/api.ts` - API client
- `mobile/app/lib/config.ts` - Configuration
- `mobile/app/lib/types.ts` - Type definitions
- `mobile/app/(tabs)/quiz.tsx` - Quiz flow
- `mobile/app/(tabs)/results.tsx` - Results page

---

### Task 3: Test Mobile App End-to-End

#### Pre-Testing Setup
1. Make sure backend is running on Railway
2. Create `.env.local` with Railway URL
3. Clear any cached data from previous tests
4. Install dependencies if needed: `npm install`

#### Testing Checklist

**Basic Connectivity:**
- [ ] App starts without errors
- [ ] No environment variable warnings
- [ ] API URL is correctly configured

**Quiz Flow:**
- [ ] Landing page loads
- [ ] "Start Assessment" button works
- [ ] Questions load from Railway backend
- [ ] Can navigate through all questions
- [ ] Progress bar updates correctly
- [ ] Can submit answers

**Results:**
- [ ] Results page displays after submission
- [ ] Personality scores show correctly
- [ ] Big Five traits render properly
- [ ] Charts/visualizations work
- [ ] No API errors in console

**Dashboard (if applicable):**
- [ ] Dashboard loads user data
- [ ] Previous assessments display
- [ ] Navigation works smoothly

---

### Task 4: Handle Common Issues

#### Issue 1: CORS Errors
**Symptom**: "Access to fetch blocked by CORS policy"

**Solution**: Check backend CORS settings in `backend/src/api/server.py`
- Ensure Railway domain is allowed
- May need to add Railway URL to allowed origins

#### Issue 2: Network Request Failed
**Symptom**: "Network request failed" or timeout errors

**Solution**: 
- Verify `.env.local` has correct Railway URL
- Check Railway backend is not sleeping (unlikely with Railway)
- Test backend URL directly in browser

#### Issue 3: 404 Errors on Endpoints
**Symptom**: Specific routes return 404

**Solution**:
- Check backend logs in Railway dashboard
- Verify endpoint paths match between mobile app and backend
- Ensure all routes are defined in FastAPI

---

### Task 5: Platform-Specific Testing

#### Android Emulator
```bash
# Start emulator first, then:
cd mobile
npm run android
```

**Note**: Railway URL works the same for emulator (unlike localhost)

#### Physical Device (via Expo Go)
```bash
cd mobile
npm start
# Scan QR code with Expo Go app
```

**Advantage**: Railway URL works on any device with internet!

#### iOS Simulator (if on Mac)
```bash
cd mobile
npm run ios
```

---

## 🔧 Quick Commands Reference

### Start Mobile Development Server
```bash
cd mobile
npm start
```

### Run on Android
```bash
cd mobile
npm run android
```

### Check Environment Variables
```bash
cd mobile
cat .env.local
```

### Clear Cache (if needed)
```bash
cd mobile
npx expo start -c
```

---

## 📝 Testing Notes Template

Use this to track your testing:

```
## Testing Session - [Date]

### Environment
- Device/Emulator: 
- Backend URL: https://lifesync-production.up.railway.app
- Mobile App Version: 

### Test Results
- [ ] Quiz Flow: ✅/❌
- [ ] Results Display: ✅/❌
- [ ] Dashboard: ✅/❌

### Issues Found
1. 
2. 
3. 

### Next Steps
- 
```

---

## 🎯 Success Criteria

You'll know it's working when:

1. ✅ Mobile app connects to Railway backend without errors
2. ✅ Full quiz flow works from start to finish
3. ✅ Results display correctly with personality analysis
4. ✅ No console errors or network failures
5. ✅ App works on both emulator and physical device

---

## 🚀 Optional Enhancements (If Time Permits)

### Enhancement 1: Offline Support
- Add AsyncStorage for saving quiz progress
- Cache results locally
- Handle network failures gracefully

### Enhancement 2: Better Error Messages
- User-friendly error screens
- Retry mechanism for failed requests
- Loading states for all API calls

### Enhancement 3: Performance
- Add request caching
- Optimize image loading
- Reduce bundle size

---

## 📚 Helpful Resources

**Project Docs:**
- `mobile/README.md` - Mobile app overview
- `mobile/API_URL_FIX.md` - API URL troubleshooting
- `mobile/TESTING_OPTIONS.md` - Testing guide
- `backend/src/api/server.py` - Backend API routes

**Railway Dashboard:**
- Deployments: https://railway.app (check logs if issues arise)
- Backend URL: `https://lifesync-production.up.railway.app`

**GitHub Actions:**
- Web deployment: https://github.com/Ashborn-047/Lifesync/actions
- Check if web app is successfully deployed

---

## 🔄 Rollback Plan (If Needed)

If Railway has issues, you can temporarily:

1. Switch back to Render: Update `.env.local` to `https://lifesync-hzx1.onrender.com`
2. Run backend locally: Update `.env.local` to `http://YOUR_LOCAL_IP:5174`
3. Use UptimeRobot to keep Render alive: https://uptimerobot.com

---

## ✅ Final Checklist

Before marking this as complete:

- [ ] `.env.local` created with Railway URL
- [ ] Mobile app tested on at least one platform
- [ ] Quiz flow works end-to-end
- [ ] No critical errors or bugs
- [ ] Performance is acceptable
- [ ] Document any known issues

---

## 📞 Need Help?

**Common Commands:**
```bash
# Check if backend is alive
curl https://lifesync-production.up.railway.app/health

# Test questions endpoint
curl https://lifesync-production.up.railway.app/v1/questions

# View Railway logs
# Go to Railway dashboard → Your service → Deployments tab
```

**Where to Look:**
- Backend issues → Railway dashboard logs
- Mobile issues → Expo console output
- API errors → Network tab in browser DevTools (for web comparison)

---

**Good luck tomorrow! 🚀**

**Expected time**: 1-2 hours  
**Difficulty**: Medium (mostly configuration and testing)

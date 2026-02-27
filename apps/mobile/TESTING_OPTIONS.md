# Testing Your App - Options & Troubleshooting

## ❌ Can't Test from Expo Dashboard

The Expo dashboard is **only for project management**:
- View builds
- See analytics
- Manage settings
- **Cannot run or test the app**

## ✅ Ways to Test Your App

### Option 1: Web Browser (Easiest for Debugging)

**Best for:** Quick testing and debugging

```bash
# In Expo terminal, press 'w'
# Or visit: http://localhost:8081
```

**Pros:**
- ✅ Fastest way to test
- ✅ Easy to debug (browser dev tools)
- ✅ No phone/emulator needed
- ✅ See console errors easily

**Cons:**
- ⚠️ Some mobile features won't work (haptics, etc.)
- ⚠️ UI might look different

### Option 2: Expo Go on Phone

**Best for:** Real device testing

**Steps:**
1. Make sure Expo server is running
2. Get tunnel URL from terminal
3. In Expo Go: Enter URL manually → Paste `exp://` URL
4. Connect

**Pros:**
- ✅ Real device testing
- ✅ Native features work
- ✅ Actual mobile experience

**Cons:**
- ⚠️ Can be tricky to connect
- ⚠️ Harder to debug

### Option 3: Android Emulator

**Best for:** Development without physical device

**Steps:**
1. Start Android Studio emulator
2. In Expo terminal, press `a`
3. App installs automatically

**Pros:**
- ✅ Full Android features
- ✅ Easy to debug
- ✅ No phone needed

**Cons:**
- ⚠️ Requires Android Studio setup
- ⚠️ Slower than web

## 🔧 Troubleshooting "App Not Working Properly"

### Step 1: Test in Web Browser First

This helps identify if it's a mobile-specific issue:

```bash
# Make sure Expo is running, then:
# Press 'w' in Expo terminal
# Or visit: http://localhost:8081
```

**Check for:**
- Does the app load?
- Any error messages?
- Console errors (F12 → Console tab)

### Step 2: Check Backend Connection

```bash
# Test backend
curl http://localhost:5174/health

# Should return: {"status":"healthy"}
```

**If backend is down:**
```bash
cd backend
python -m uvicorn src.api.server:app --reload --port 5174 --host 0.0.0.0
```

### Step 3: Check Expo Server

**Look for errors in Expo terminal:**
- Red error messages?
- Network errors?
- Build failures?

**Common issues:**
- Backend not running → Start backend
- Wrong API URL → Check `.env.local`
- Port conflicts → Stop other servers

### Step 4: Check Mobile-Specific Issues

**If web works but mobile doesn't:**

1. **API URL issue:**
   - Check `mobile/.env.local`
   - Should be: `EXPO_PUBLIC_API_URL=http://192.168.0.12:5174`
   - For emulator: `http://10.0.2.2:5174`

2. **Network issue:**
   - Phone and PC on same WiFi?
   - Firewall blocking?
   - Try tunnel mode instead of LAN

3. **Expo Go connection:**
   - QR code not working? → Use tunnel mode
   - URL not working? → Check exact URL format

## 🐛 Common Issues & Fixes

### Issue: "Network request failed"
**Fix:** 
- Check backend is running
- Verify API URL in `.env.local`
- Check phone can reach backend IP

### Issue: "Failed to load questions"
**Fix:**
- Backend not running → Start it
- Wrong API URL → Update `.env.local`
- Check backend logs for errors

### Issue: "App crashes on startup"
**Fix:**
- Check Expo terminal for errors
- Try web version first
- Clear Expo cache: `npx expo start --clear`

### Issue: "Can't connect to Expo Go"
**Fix:**
- Use tunnel mode: `npx expo start --tunnel`
- Wait 60 seconds for tunnel URL
- Enter URL manually in Expo Go

## 📋 Quick Debug Checklist

- [ ] Backend running? (`curl http://localhost:5174/health`)
- [ ] Expo running? (Check terminal)
- [ ] Test in web browser first (press `w`)
- [ ] Check `.env.local` has correct API URL
- [ ] Look for errors in Expo terminal
- [ ] Check browser console (F12) if using web
- [ ] Verify phone and PC on same network (for Expo Go)

## 🎯 Recommended Testing Flow

1. **Start with Web** → Fastest, easiest debugging
2. **Fix issues in web** → Get basic functionality working
3. **Test on mobile** → Verify mobile-specific features
4. **Use emulator** → For Android-specific testing

## 💡 Pro Tip

**Always test in web browser first!**
- Catches most issues quickly
- Easy to see errors
- Fast iteration
- Then move to mobile once web works

---

**Current Status:** Use web browser to debug issues first
**Command:** Press `w` in Expo terminal or visit `http://localhost:8081`


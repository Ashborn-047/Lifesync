# Why Expo Go QR/URL Doesn't Work - Common Causes

## The Real Problem

Even though the QR code is for Expo Go, **several things must work together** for the connection to succeed:

1. ✅ Expo server running
2. ✅ Tunnel established (if using tunnel mode)
3. ✅ Backend server running (for app functionality)
4. ✅ Correct URL format
5. ✅ Network connectivity

## Most Common Issues

### Issue 1: Backend Not Running ⚠️ **THIS WAS YOUR PROBLEM!**

**What happens:**
- Expo Go connects successfully
- App loads in Expo Go
- But app shows errors: "Network request failed"
- Can't load questions/data
- App appears "broken"

**Why:**
- Your app needs the backend API
- Backend provides questions, assessments, etc.
- Without backend, app can't function

**Fix:**
```bash
cd backend
python -m uvicorn src.api.server:app --reload --port 5174 --host 0.0.0.0
```

**Check:**
```powershell
curl http://localhost:5174/health
# Should return: {"status":"healthy"}
```

### Issue 2: Tunnel Not Established

**What happens:**
- QR code appears
- But connection fails
- "Connection timeout" error

**Why:**
- Tunnel takes 60-90 seconds to establish
- If you scan too early, it won't work
- Need to wait for "Tunnel ready" message

**Fix:**
- Wait 60-90 seconds after starting Expo
- Look for "Tunnel ready" in terminal
- Use the exact `exp://` URL shown

### Issue 3: Wrong URL Format

**What happens:**
- URL entered but doesn't work
- "Invalid URL" error

**Correct:**
```
exp://xxx-xxx.anonymous.exp.direct:80
```

**Wrong:**
```
❌ http://192.168.0.12:8081
❌ exp://192.168.0.12:8081
❌ exp://localhost:8081
```

**Fix:**
- Copy the EXACT URL from Expo terminal
- Must start with `exp://`
- Must include the full domain and port

### Issue 4: Expo Not Running

**What happens:**
- QR code doesn't appear
- URL doesn't work
- "Unable to connect"

**Check:**
```powershell
Get-Process | Where-Object {$_.ProcessName -eq "node"}
```

**Fix:**
```bash
cd mobile
npx expo start --tunnel
```

### Issue 5: Network Isolation

**What happens:**
- Works on web but not mobile
- Connection timeout
- "Unable to reach server"

**Why:**
- PC on Ethernet, phone on WiFi
- Router isolates them
- Firewall blocking

**Fix:**
- Use tunnel mode (bypasses network issues)
- Or connect PC to WiFi too

## Step-by-Step Fix

### Step 1: Start Backend (CRITICAL!)

```bash
cd backend
python -m uvicorn src.api.server:app --reload --port 5174 --host 0.0.0.0
```

**Verify:**
```powershell
curl http://localhost:5174/health
```

### Step 2: Start Expo

```bash
cd mobile
npx expo start --tunnel
```

**Wait for:**
- QR code to appear
- "Tunnel ready" message
- `exp://` URL to show

### Step 3: Get Exact URL

**From Expo terminal, copy:**
- The FULL `exp://` URL
- Should be something like: `exp://u.expo.dev/xxx-xxx@anonymous.exp.direct:80`

### Step 4: Connect in Expo Go

1. Open Expo Go app
2. Tap "Enter URL manually"
3. Paste the FULL `exp://` URL
4. Tap "Connect"
5. Wait for app to load

### Step 5: Verify Everything Works

**Check:**
- App loads in Expo Go ✅
- Can see questions/data ✅
- No "Network request failed" errors ✅
- Backend is accessible ✅

## Why It Seemed Like QR Code Issue

**The confusion:**
- QR code is correct (for Expo Go) ✅
- But app needs backend to work ✅
- Without backend, app appears broken ❌
- So it seems like connection issue ❌

**Reality:**
- Connection might work
- But app can't function without backend
- Need BOTH Expo AND Backend running

## Quick Checklist

Before connecting Expo Go:

- [ ] **Backend running?** (`curl http://localhost:5174/health`)
- [ ] **Expo running?** (Check terminal for QR code)
- [ ] **Tunnel ready?** (Wait 60+ seconds, see "Tunnel ready")
- [ ] **Got exact URL?** (Copy full `exp://` URL from terminal)
- [ ] **Using correct format?** (`exp://...` not `http://...`)

## Common Error Messages

### "Network request failed"
**Cause:** Backend not running
**Fix:** Start backend server

### "Unable to connect"
**Cause:** Expo not running or tunnel not ready
**Fix:** Start Expo, wait for tunnel

### "Invalid URL"
**Cause:** Wrong URL format
**Fix:** Use exact `exp://` URL from terminal

### "Connection timeout"
**Cause:** Tunnel not established
**Fix:** Wait longer (60-90 seconds)

## Summary

**The QR code IS for Expo Go** ✅

**But you need:**
1. ✅ Expo running (for connection)
2. ✅ Backend running (for app functionality) ⚠️ **This was missing!**
3. ✅ Tunnel established (for network)
4. ✅ Correct URL (for connection)

**Most common issue:** Backend not running - app connects but can't work!

---

**Status:** Backend restarted ✅
**Next:** Try connecting Expo Go again - should work now!


# Fixing Expo Go Connection Issues

## Why QR Code/URL Might Not Work

Even though the QR code is for Expo Go, there are several reasons why it might not connect:

### Issue 1: Expo Not Running Properly

**Symptoms:**
- QR code shows but nothing happens
- URL doesn't work
- "Unable to connect" error

**Check:**
```powershell
# Check if Expo is running
Get-Process | Where-Object {$_.ProcessName -eq "node"}
```

**Fix:**
```bash
# Restart Expo
npx expo start --tunnel
```

### Issue 2: Tunnel Not Established

**Symptoms:**
- QR code appears but connection fails
- "Connection timeout" error
- URL doesn't work

**Check:**
- Look in Expo terminal for "Tunnel ready" message
- Wait 60-90 seconds for tunnel to establish
- Check for tunnel URL (starts with `exp://`)

**Fix:**
- Wait longer (tunnel can take 1-2 minutes)
- Look for tunnel URL in terminal
- Use the exact URL shown (not the QR code)

### Issue 3: Wrong URL Format

**Symptoms:**
- URL entered but doesn't work
- "Invalid URL" error

**Correct Format:**
```
exp://xxx-xxx.anonymous.exp.direct:80
```

**Common Mistakes:**
- ❌ Using `http://` instead of `exp://`
- ❌ Missing port number
- ❌ Using LAN URL instead of tunnel URL
- ❌ Copying partial URL

**Fix:**
- Copy the ENTIRE URL from terminal
- Make sure it starts with `exp://`
- Include the port number

### Issue 4: Backend Not Running

**Symptoms:**
- App loads but shows errors
- "Network request failed"
- Can't load questions/data

**Check:**
```powershell
curl http://localhost:5174/health
```

**Fix:**
```bash
# Start backend
cd backend
python -m uvicorn src.api.server:app --reload --port 5174 --host 0.0.0.0
```

### Issue 5: Network/Firewall Issues

**Symptoms:**
- Connection timeout
- "Unable to reach server"
- Works on web but not mobile

**Fix:**
- Use tunnel mode (already doing this)
- Check Windows Firewall
- Try different network

### Issue 6: Expo Go App Issues

**Symptoms:**
- App opens but shows error
- "Unable to load project"
- Blank screen

**Fix:**
1. Update Expo Go to latest version
2. Clear Expo Go cache (shake device → Reload)
3. Close and reopen Expo Go
4. Try entering URL manually instead of scanning

## Step-by-Step Troubleshooting

### Step 1: Verify Expo is Running

**Check Expo terminal:**
- Should show QR code
- Should show `exp://` URL
- Should say "Metro waiting on..."
- No red error messages

**If not running:**
```bash
cd mobile
npx expo start --tunnel
```

### Step 2: Wait for Tunnel

**Look for:**
- "Tunnel ready" message
- URL like: `exp://xxx-xxx.anonymous.exp.direct:80`
- This can take 60-90 seconds

**If tunnel fails:**
- Check internet connection
- Try again (tunnel can be flaky)
- Use LAN mode if on same network

### Step 3: Get Exact URL

**From Expo terminal, copy:**
- The FULL `exp://` URL
- Should look like: `exp://u.expo.dev/xxx-xxx@anonymous.exp.direct:80`
- Include everything after `exp://`

**Don't use:**
- ❌ QR code (if scanning doesn't work)
- ❌ Partial URL
- ❌ LAN URL (`exp://192.168.x.x:8081`)

### Step 4: Enter in Expo Go

**In Expo Go app:**
1. Tap "Enter URL manually"
2. Paste the FULL `exp://` URL
3. Tap "Connect" or "Open"
4. Wait for app to load

### Step 5: Check for Errors

**In Expo Go:**
- Shake device → "Show Dev Menu"
- Check for error messages
- Try "Reload" option

**In Expo terminal:**
- Look for red error messages
- Check if requests are coming through
- Verify backend is accessible

## Common Error Messages

### "Unable to connect to server"
**Fix:** Check Expo is running, wait for tunnel

### "Network request failed"
**Fix:** Check backend is running, verify API URL

### "Invalid URL"
**Fix:** Use exact `exp://` URL from terminal

### "Connection timeout"
**Fix:** Wait longer for tunnel, or try LAN mode

### "Unable to load project"
**Fix:** Update Expo Go, clear cache, try again

## Quick Fix Checklist

- [ ] Expo is running? (Check terminal)
- [ ] Tunnel established? (Wait 60+ seconds)
- [ ] Got exact `exp://` URL? (Copy from terminal)
- [ ] Backend running? (`curl http://localhost:5174/health`)
- [ ] Using correct URL format? (`exp://...`)
- [ ] Expo Go updated? (Latest version)
- [ ] Tried manual URL entry? (Not just QR scan)

## Alternative: Use Web Version

**If Expo Go keeps failing:**

1. In Expo terminal, press `w`
2. Opens in web browser
3. Test functionality there
4. Once web works, mobile should work too

## Still Not Working?

**Share these details:**
1. What error message do you see in Expo Go?
2. What does Expo terminal show? (Any errors?)
3. Does the tunnel URL appear?
4. What happens when you enter the URL?

---

**Most Common Issue:** Tunnel not fully established - wait 60-90 seconds!


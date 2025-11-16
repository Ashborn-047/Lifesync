# Troubleshooting Expo Go Connection Issues

## Current Issue: QR Code/URL Not Working

If scanning QR code or entering URL manually doesn't work, try these solutions:

## Solution 1: Tunnel Mode (Currently Running)

**Status:** Expo is now running in tunnel mode.

**Steps:**
1. Wait 30-60 seconds for tunnel to establish
2. Look in Expo terminal for a URL like: `exp://xxx-xxx.anonymous.exp.direct:80`
3. In Expo Go app:
   - Tap "Enter URL manually"
   - Copy and paste the full `exp://` URL from terminal
   - Tap "Connect"

**Why it works:** Tunnel mode creates a public URL that works from anywhere, bypassing network/firewall issues.

## Solution 2: Check Expo Go App Version

**Problem:** Older Expo Go versions may not work with newer Expo SDK.

**Fix:**
1. Go to App Store (iOS) or Play Store (Android)
2. Update Expo Go to the latest version
3. Try connecting again

## Solution 3: Clear Expo Go Cache

**Steps:**
1. In Expo Go app, shake your device (or long-press)
2. Tap "Reload" or "Clear cache"
3. Try connecting again

## Solution 4: Check Network Connection

**Verify:**
1. Phone and PC are on the same WiFi network
2. WiFi name matches exactly on both devices
3. Try disconnecting and reconnecting WiFi on phone

**Test:**
- On phone's browser, try accessing: `http://192.168.0.12:5174/health`
- If this works, network is fine
- If this fails, there's a network/firewall issue

## Solution 5: Check Windows Firewall

**Windows might be blocking the connection:**

1. Open Windows Defender Firewall
2. Click "Allow an app through firewall"
3. Make sure Node.js and Python are allowed
4. Or temporarily disable firewall to test

**Quick test:**
```powershell
# Check if port 8081 is accessible
Test-NetConnection -ComputerName localhost -Port 8081
```

## Solution 6: Use Development Build Instead

If Expo Go continues to fail, consider using a development build:

1. Install `expo-dev-client` (already in package.json)
2. Build development client: `eas build --profile development --platform android`
3. Install the build on your phone
4. Connect to dev server

**Note:** This requires more setup but is more reliable.

## Solution 7: Check Expo Terminal for Errors

**Look for:**
- Error messages in Expo terminal
- "Tunnel connection failed" messages
- Network timeout errors
- Port already in use errors

**Common errors:**
- `Port 8081 already in use` → Stop other Expo processes
- `Tunnel connection failed` → Try LAN mode instead
- `Network request failed` → Check firewall/network

## Solution 8: Alternative - Use Web Version

**If mobile connection keeps failing:**

1. In Expo terminal, press `w` to open in web browser
2. Test the app in browser first
3. Once web works, mobile should work too

## Solution 9: Manual Network Configuration

**If tunnel doesn't work, try LAN with specific IP:**

1. Stop Expo (Ctrl+C)
2. Start with: `npx expo start --lan --host 192.168.0.12`
3. Get the exact URL from terminal
4. Enter in Expo Go manually

## Solution 10: Check Expo Go Logs

**In Expo Go app:**
1. Shake device (or long-press)
2. Tap "Show Dev Menu"
3. Tap "Debug Remote JS"
4. Check for error messages

## Current Setup

- **Backend:** `http://192.168.0.12:5174`
- **Expo Mode:** Tunnel (should show public URL)
- **Your PC IP:** `192.168.0.12`

## Next Steps

1. **Wait for tunnel URL** (check Expo terminal)
2. **Copy the full `exp://` URL** from terminal
3. **In Expo Go:** Tap "Enter URL manually" → Paste URL → Connect
4. **If still fails:** Try Solution 2-10 above

## Still Not Working?

**Check these:**
- [ ] Expo Go app is latest version
- [ ] Backend server is running (test: `curl http://localhost:5174/health`)
- [ ] Expo server is running (should show QR code/URL)
- [ ] No firewall blocking ports 8081, 5174
- [ ] Phone and PC on same network (for LAN mode)
- [ ] Tunnel URL is visible in terminal (for tunnel mode)

**Last resort:** Share the exact error message you see in Expo Go or Expo terminal.


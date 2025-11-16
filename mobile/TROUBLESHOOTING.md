# Mobile App Troubleshooting Guide

## Issue: QR Code Not Working / Expo Go Not Connecting

### Solution 1: Use Tunnel Mode (Most Reliable)
If LAN mode doesn't work, use tunnel mode:
1. In Expo terminal, press `s` to open settings
2. Press `t` to switch to tunnel mode
3. Wait for new QR code to appear
4. Scan the new QR code

### Solution 2: Check Network Connection
- **Phone and computer MUST be on the same WiFi network**
- Check WiFi name matches on both devices
- Try disconnecting and reconnecting WiFi on phone

### Solution 3: Manual Connection
If QR code still doesn't work:
1. In Expo Go app, tap "Enter URL manually"
2. Enter the URL shown in Expo terminal (should be like `exp://192.168.0.12:8081`)

## Issue: Quiz Not Loading / API Errors

### Check API Configuration
The mobile app needs to connect to your backend at `http://192.168.0.12:5174`

**Verify:**
1. Backend is running: `curl http://localhost:5174/health`
2. Backend is accessible from network: `curl http://192.168.0.12:5174/health`
3. `.env.local` file exists in `mobile/` directory with:
   ```
   EXPO_PUBLIC_API_URL=http://192.168.0.12:5174
   ```

### Common Errors

**"Network error occurred"**
- Backend not running → Start backend server
- Wrong IP address → Update `.env.local` with correct IP
- Firewall blocking → Allow port 5174 in Windows Firewall

**"Failed to load questions"**
- Check backend logs for errors
- Verify `/v1/questions` endpoint is working: `curl http://192.168.0.12:5174/v1/questions?limit=5`

**"Invalid response format"**
- Backend might be returning different format
- Check backend API response structure

## Issue: App Crashes on Launch

### Check Console Logs
1. Open Expo terminal
2. Look for red error messages
3. Check for missing environment variables

### Common Causes
- Missing `.env.local` file
- Wrong API URL format
- Network connectivity issues

## Quick Fixes

### Restart Everything
```powershell
# Stop all servers
Get-Process | Where-Object {$_.ProcessName -eq "node" -or $_.ProcessName -eq "python"} | Stop-Process -Force

# Start backend
cd backend
python -m uvicorn src.api.server:app --reload --port 5174 --host 0.0.0.0

# Start Expo (in new terminal)
cd mobile
npx expo start --lan
```

### Clear Expo Cache
```powershell
cd mobile
npx expo start --clear
```

### Check Your Local IP
```powershell
ipconfig | findstr /i "IPv4"
```
Update `.env.local` with the IP address shown.

## Still Having Issues?

1. **Check Expo terminal** for error messages
2. **Check backend terminal** for API errors
3. **Check phone console** in Expo Go app (shake device → "Show Dev Menu" → "Debug Remote JS")
4. **Verify network**: Try accessing `http://192.168.0.12:5174/health` from phone's browser


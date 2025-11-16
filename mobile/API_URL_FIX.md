# API URL Configuration Fix

## Problem

Using `localhost` in API URL doesn't work from mobile devices:
- `localhost` only refers to the device itself
- Phone can't reach `localhost` on your PC
- Need to use actual IP address instead

## Solution

Updated `.env.local` to use actual IP address:

**Before:**
```
EXPO_PUBLIC_API_URL=http://localhost:5174
```

**After:**
```
EXPO_PUBLIC_API_URL=http://192.168.0.12:5174
```

## Your Configuration

**Current IP Address:** `192.168.0.12`

**Updated Files:**
- ✅ `mobile/.env.local` - Now uses `http://192.168.0.12:5174`

## Backend Configuration

Make sure backend is started with `--host 0.0.0.0`:

```powershell
python -m uvicorn src.api.server:app --reload --port 5174 --host 0.0.0.0
```

**Why `0.0.0.0`?**
- Allows connections from any network interface
- Without it, backend only accepts localhost connections
- With it, phone can connect via network IP

## Verification

### Test Backend from Network IP:

```powershell
# Should work
curl http://192.168.0.12:5174/health

# Should return: {"status":"healthy"}
```

### Test from Phone Browser:

1. On phone, open browser
2. Go to: `http://192.168.0.12:5174/health`
3. Should see: `{"status":"healthy"}`

If this works, your phone can reach the backend!

## Important Notes

### 1. Restart Expo After Changing .env.local

Environment variables are loaded when Expo starts. After changing `.env.local`:

1. Stop Expo (Ctrl+C)
2. Restart: `npx expo start --tunnel`
3. Changes will take effect

### 2. IP Address Can Change

If your IP changes (e.g., router restart):

1. Check new IP: `ipconfig`
2. Update `.env.local` with new IP
3. Restart Expo

### 3. Network Requirements

- ✅ Phone and PC on same WiFi network
- ✅ Backend started with `--host 0.0.0.0`
- ✅ Firewall allows port 5174
- ✅ Router doesn't isolate devices

## Alternative: Use Tunnel Mode

If IP address keeps changing or network issues persist:

**Use tunnel mode for Expo:**
```powershell
npx expo start --tunnel
```

**But still need IP for backend API:**
- Backend can't use tunnel
- Must use IP address: `http://192.168.0.12:5174`
- Or use a service like ngrok for backend too

## Troubleshooting

### "Network request failed" in app

**Check:**
1. Backend running? `curl http://localhost:5174/health`
2. Backend accessible from network? `curl http://192.168.0.12:5174/health`
3. `.env.local` has correct IP? Check file contents
4. Restarted Expo after changing `.env.local`?

### "Connection refused"

**Check:**
1. Backend started with `--host 0.0.0.0`?
2. Firewall blocking port 5174?
3. Phone and PC on same network?

### IP Address Changed

**If IP changes:**
1. Find new IP: `ipconfig | findstr IPv4`
2. Update `.env.local`
3. Restart Expo

## Summary

✅ **Fixed:** Changed from `localhost` to actual IP (`192.168.0.12`)
✅ **Updated:** `mobile/.env.local` file
✅ **Backend:** Already configured with `--host 0.0.0.0`

**Next Steps:**
1. Restart Expo (to load new .env.local)
2. Test connection from phone
3. Should work now!

---

**Current Configuration:**
- API URL: `http://192.168.0.12:5174`
- Backend: `--host 0.0.0.0` (accepts network connections)
- File: `mobile/.env.local`


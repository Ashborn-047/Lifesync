# Commands to Start Servers Manually

## Quick Start Commands

### Step 1: Start Backend Server

Open a **new terminal/PowerShell window** and run:

```powershell
cd "E:\My Projects\lifesync\backend"
python -m uvicorn src.api.server:app --reload --port 5174 --host 0.0.0.0
```

**What this does:**
- Starts the backend API server
- Runs on port 5174
- Accessible from your phone (0.0.0.0 means all network interfaces)
- Auto-reloads on code changes

**Keep this terminal open!**

**Verify it's working:**
- You should see: `Uvicorn running on http://0.0.0.0:5174`
- Test: Open browser to `http://localhost:5174/health`
- Should return: `{"status":"healthy"}`

---

### Step 2: Start Expo Dev Server

Open a **second terminal/PowerShell window** and run:

```powershell
cd "E:\My Projects\lifesync\mobile"
npx expo start --tunnel
```

**What this does:**
- Starts Expo development server
- Uses tunnel mode (works with cable/WiFi setup)
- Shows QR code and URL for Expo Go
- Auto-reloads on code changes

**Keep this terminal open!**

**What to look for:**
- QR code will appear in terminal
- Wait 60-90 seconds for tunnel to establish
- Look for URL like: `exp://xxx-xxx.anonymous.exp.direct:80`
- Should see "Metro waiting on..." message

---

## Complete Setup

### Terminal 1 (Backend):
```powershell
cd "E:\My Projects\lifesync\backend"
python -m uvicorn src.api.server:app --reload --port 5174 --host 0.0.0.0
```

### Terminal 2 (Expo):
```powershell
cd "E:\My Projects\lifesync\mobile"
npx expo start --tunnel
```

---

## Connecting with Expo Go

### After both servers are running:

1. **Wait for tunnel URL** (60-90 seconds after starting Expo)
   - Look in Expo terminal for `exp://` URL
   - Should look like: `exp://xxx-xxx.anonymous.exp.direct:80`

2. **Open Expo Go app** on your phone

3. **Enter URL manually:**
   - Tap "Enter URL manually" in Expo Go
   - Copy the FULL `exp://` URL from Expo terminal
   - Paste it and tap "Connect"

4. **Wait for app to load**

---

## Troubleshooting

### Backend not starting?
- Check Python is installed: `python --version`
- Check you're in the right directory: `cd "E:\My Projects\lifesync\backend"`
- Check port 5174 is free: `netstat -ano | findstr :5174`

### Expo not starting?
- Check Node.js is installed: `node --version`
- Check you're in the right directory: `cd "E:\My Projects\lifesync\mobile"`
- Check port 8081 is free: `netstat -ano | findstr :8081`

### Tunnel not working?
- Wait longer (can take 90+ seconds)
- Check internet connection
- Try LAN mode instead: `npx expo start --lan`

### App connects but shows errors?
- Check backend is running: `curl http://localhost:5174/health`
- Check API URL in `.env.local`: `EXPO_PUBLIC_API_URL=http://192.168.0.12:5174`

---

## Quick Reference

**Backend:**
```powershell
cd "E:\My Projects\lifesync\backend"
python -m uvicorn src.api.server:app --reload --port 5174 --host 0.0.0.0
```

**Expo:**
```powershell
cd "E:\My Projects\lifesync\mobile"
npx expo start --tunnel
```

**Stop servers:**
- Press `Ctrl+C` in each terminal
- Or close the terminal windows

---

## Order of Operations

1. ✅ Start Backend first (Terminal 1)
2. ✅ Wait for "Uvicorn running" message
3. ✅ Start Expo second (Terminal 2)
4. ✅ Wait 60-90 seconds for tunnel
5. ✅ Copy `exp://` URL from Expo terminal
6. ✅ Enter in Expo Go app
7. ✅ Connect and test!

---

**That's it!** Run these two commands in separate terminals and you're good to go.


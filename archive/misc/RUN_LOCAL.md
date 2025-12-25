# LifeSync - Local Development Guide

## 1. Overview

The LifeSync project consists of two components that run locally:

- **Backend**: FastAPI server running on port 5174
- **Mobile**: Expo React Native app

**Important**: The mobile app (running on a physical device or emulator) must connect to the backend using your machine's **LAN IP address** — NOT `localhost` or `127.0.0.1`. This is because `localhost` on a mobile device refers to the device itself, not your development machine.

---

## 2. How to Start the Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Start the FastAPI server:
   ```bash
   python -m uvicorn src.api.server:app --reload --port 5174
   ```

   **Note:** Use `python -m uvicorn` instead of just `uvicorn` if the command is not found.

**Details:**
- The server starts on `http://127.0.0.1:5174` (localhost)
- The `--reload` flag enables auto-reload on code changes
- For mobile devices to connect, you'll need to use your **LAN IP address** instead of `localhost`

**Verify it's running:**
- Open `http://localhost:5174/health` in your browser
- You should see: `{"status": "healthy", "service": "LifeSync Personality Engine API"}`

---

## 3. How to Find Your Local IP Address

### Windows

1. Open Command Prompt or PowerShell
2. Run:
   ```bash
   ipconfig
   ```
3. Look for **IPv4 Address** under your active network adapter (usually "Wireless LAN adapter Wi-Fi" or "Ethernet adapter")
4. Example output:
   ```
   IPv4 Address. . . . . . . . . . . : 192.168.1.15
   ```
5. Use this IP address (e.g., `192.168.1.15`)

### Mac / Linux

1. Open Terminal
2. Run:
   ```bash
   ifconfig | grep inet
   ```
   Or for newer macOS:
   ```bash
   ipconfig getifaddr en0
   ```
3. Look for an IP address in the format:
   - `192.168.x.x` (most common)
   - `10.x.x.x`
   - `172.16.x.x` to `172.31.x.x`
4. Example: `192.168.1.15`

**Note**: Avoid using `127.0.0.1` or `localhost` — these won't work from a mobile device.

---

## 4. Updating the Mobile .env File

1. Navigate to the mobile directory:
   ```bash
   cd mobile
   ```

2. Create or edit `.env` file:
   ```bash
   # On Windows (PowerShell)
   notepad .env
   
   # On Mac/Linux
   nano .env
   ```

3. Add the following (replace `YOUR_LOCAL_IP` with the IP you found in step 3):
   ```env
   EXPO_PUBLIC_API_URL=http://YOUR_LOCAL_IP:5174
   EXPO_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
   EXPO_PUBLIC_SUPABASE_KEY=YOUR_SUPABASE_KEY
   ```

4. **Example** (if your IP is `192.168.1.15`):
   ```env
   EXPO_PUBLIC_API_URL=http://192.168.1.15:5174
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_KEY=your-anon-key-here
   ```

**Important Notes:**
- All environment variables for Expo must start with `EXPO_PUBLIC_`
- After changing `.env`, you **must restart Expo** (press `r` in the terminal or kill Metro bundler)
- The mobile app reads these variables via `mobile/app/lib/config.ts`

---

## 5. Start the Mobile App

1. Navigate to the mobile directory:
   ```bash
   cd mobile
   ```

2. Install dependencies (if not already done):
   ```bash
   npm install --legacy-peer-deps
   ```

3. Start Expo:
   ```bash
   npx expo start
   ```

   **Note:** If port 8081 is in use, use: `npx expo start --port 8083`

4. **On your mobile device:**
   - Install **Expo Go** app (iOS App Store or Google Play)
   - Scan the QR code displayed in the terminal
   - The app will load on your device

**Requirements:**
- Your mobile device and development machine must be on the **same WiFi network**
- If using an emulator/simulator, you can use `localhost` or `127.0.0.1` instead of LAN IP

**Expo Connection Modes:**
- **LAN** (default): Uses your local network IP — recommended for physical devices
- **Tunnel**: Uses Expo's servers — slower but works across networks
- **Local**: Only works on emulators/simulators

To switch modes, press:
- `s` to switch between connection modes
- `r` to reload the app
- `m` to toggle menu

---

## 6. Troubleshooting

### Backend Not Starting?

**Check Python version:**
```bash
python --version
# Should be Python 3.10 or higher
```

**Check uvicorn is installed:**
```bash
pip list | grep uvicorn
# If not found, install: pip install uvicorn
```

**Check port 5174 is not blocked:**
- Try a different port: `--port 8000`
- Check if another process is using port 5174:
  - Windows: `netstat -ano | findstr :5174`
  - Mac/Linux: `lsof -i :5174`

**Check backend dependencies:**
```bash
cd backend
pip install -r requirements.txt
```

---

### Expo Can't Connect to Backend?

**Use LAN IP, NOT localhost:**
- ❌ `http://localhost:5174` (won't work on physical device)
- ❌ `http://127.0.0.1:5174` (won't work on physical device)
- ✅ `http://192.168.1.15:5174` (use your actual LAN IP)

**Disable VPN / Firewall temporarily:**
- VPNs can interfere with local network connections
- Windows Firewall or macOS Firewall may block connections
- Try temporarily disabling to test

**Ensure both devices share same network:**
- Mobile device and laptop must be on the same WiFi network
- Check WiFi network name matches on both devices

**Try running Expo in "LAN" mode:**
- Press `s` in Expo terminal to switch connection modes
- Select "LAN" if not already selected
- Avoid "Tunnel" mode for local development (it's slower)

**Test backend connectivity from mobile:**
- Open a browser on your mobile device
- Navigate to: `http://YOUR_LOCAL_IP:5174/health`
- If you see the health check response, the backend is reachable

---

### CORS Errors?

**Confirm CORSMiddleware is configured in `backend/src/api/server.py`:**

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**If CORS errors persist:**
- Check browser console for specific error messages
- Verify the backend is actually running
- Try accessing the API endpoint directly from mobile browser

---

### Expo .env Not Loading?

**Restart Expo completely:**
- Press `r` in Expo terminal to reload
- Or kill Metro bundler and restart: `npx expo start --clear`

**Ensure variables start with `EXPO_PUBLIC_`:**
- ❌ `API_URL=http://...` (won't work)
- ✅ `EXPO_PUBLIC_API_URL=http://...` (correct)

**Ensure `mobile/app/lib/config.ts` reads using `process.env`:**
```typescript
export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:5174";
```

**Check .env file location:**
- Must be in `mobile/.env` (not `mobile/app/.env`)
- File should be in the same directory as `package.json`

**Verify .env file format:**
- No spaces around `=`
- No quotes needed (but quotes are okay)
- One variable per line

**Example correct format:**
```env
EXPO_PUBLIC_API_URL=http://192.168.1.15:5174
EXPO_PUBLIC_SUPABASE_URL=https://abc123.supabase.co
EXPO_PUBLIC_SUPABASE_KEY=eyJhbGc...
```

---

### Other Common Issues

**"Network request failed" in mobile app:**
- Check backend is running
- Verify LAN IP is correct in `.env`
- Test backend URL in mobile browser first

**"Module not found" errors:**
- Run `npm install --legacy-peer-deps` in `mobile/` directory
- Clear Expo cache: `npx expo start --clear`

**Backend returns 500 errors:**
- Check backend terminal for error logs
- Verify Supabase credentials in `backend/.env`
- Check database connection

**Questions not loading:**
- Verify `GET /v1/questions` endpoint works: `http://YOUR_IP:5174/v1/questions`
- Check Supabase `personality_questions` table has data
- Review backend logs for errors

---

### Device Not Connecting Over LAN

**Symptoms:**
- Mobile app shows "Network request failed"
- Can't reach backend from device
- Expo shows connection errors

**Solutions:**
1. **Verify same WiFi network:**
   - Mobile device and laptop must be on the same WiFi
   - Check WiFi network name matches on both

2. **Test backend from mobile browser:**
   - Open browser on mobile device
   - Navigate to: `http://YOUR_LAN_IP:5174/health`
   - Should see: `{"status": "healthy", ...}`
   - If not, backend is not reachable

3. **Check firewall:**
   - Windows Firewall may block port 5174
   - Temporarily disable firewall to test
   - Or add exception for port 5174

4. **Verify LAN IP:**
   - Run `ipconfig` on Windows
   - Use the IPv4 Address (e.g., 192.168.1.15)
   - Update `mobile/.env` with correct IP

5. **Try different connection mode:**
   - In Expo, press `s` to switch modes
   - Try "LAN" mode (not "Tunnel")
   - Tunnel mode is slower but works across networks

---

### Backend Not Reachable

**Symptoms:**
- "Connection refused" errors
- Backend health check fails from mobile
- Network timeout errors

**Solutions:**
1. **Verify backend is running:**
   - Check backend terminal shows "Uvicorn running..."
   - Test `http://localhost:5174/health` on laptop

2. **Check backend binding:**
   - Backend should bind to `0.0.0.0` or `127.0.0.1`
   - If binding to `localhost` only, mobile can't reach it

3. **Check port is open:**
   - Windows: `netstat -ano | findstr :5174`
   - Should show LISTENING state

4. **Test from mobile browser:**
   - Use mobile browser to test backend URL
   - If browser works but app doesn't, check CORS settings

---

## Quick Start Checklist

- [ ] Backend dependencies installed (`pip install -r requirements.txt`)
- [ ] Backend `.env` configured with Supabase credentials
- [ ] Backend running on port 5174
- [ ] Found your LAN IP address
- [ ] Mobile `.env` configured with `EXPO_PUBLIC_API_URL=http://YOUR_IP:5174`
- [ ] Mobile dependencies installed (`npm install`)
- [ ] Mobile device and laptop on same WiFi network
- [ ] Expo Go app installed on mobile device
- [ ] Expo started and QR code scanned

---

## Need Help?

- Check backend logs in the terminal running `uvicorn`
- Check Expo/Metro logs in the terminal running `npx expo start`
- Check mobile device console in Expo Go (shake device → "Show Dev Menu" → "Debug Remote JS")
- Verify network connectivity by testing backend URL in mobile browser


# Connecting Expo Go on Your Phone

## ✅ Setup Complete

Your servers are configured and ready:
- **Backend:** `http://192.168.0.12:5174`
- **Expo Dev Server:** Running in LAN mode
- **Your PC IP:** `192.168.0.12`

## 📱 How to Connect with Expo Go

### Method 1: Scan QR Code (Easiest)

1. **Open Expo Go app** on your phone
   - If you don't have it, download from App Store (iOS) or Play Store (Android)

2. **Make sure your phone and PC are on the SAME WiFi network**
   - Check WiFi name matches on both devices

3. **Look at the Expo terminal** (where you started `npx expo start`)
   - You should see a QR code displayed

4. **In Expo Go app:**
   - Tap "Scan QR code" button
   - Point your camera at the QR code in the terminal
   - The app should automatically connect

### Method 2: Enter URL Manually

1. **Open Expo Go app** on your phone

2. **Tap "Enter URL manually"** (usually at the bottom)

3. **Enter this URL:**
   ```
   exp://192.168.0.12:8081
   ```

4. **Tap "Connect"**

### Method 3: Tunnel Mode (If LAN doesn't work)

If the QR code or LAN connection doesn't work:

1. **In the Expo terminal**, press `s` (for settings)
2. **Press `t`** (for tunnel mode)
3. **Wait for new QR code** to appear
4. **Scan the new QR code** with Expo Go

## 🔧 Troubleshooting

### "Unable to connect" or "Connection timeout"

**Solution 1: Check WiFi**
- Make sure phone and PC are on the **exact same WiFi network**
- Try disconnecting and reconnecting WiFi on your phone

**Solution 2: Check Firewall**
- Windows Firewall might be blocking the connection
- Allow port 8081 and 5174 in Windows Firewall

**Solution 3: Use Tunnel Mode**
- Press `s` then `t` in Expo terminal
- Tunnel mode works even if LAN doesn't

**Solution 4: Check IP Address**
- Verify your PC's IP is still `192.168.0.12`
- Run: `ipconfig` in PowerShell and check IPv4 address
- Update `.env.local` if IP changed

### "Network request failed" when using the app

**Check API URL:**
- Make sure `mobile/.env.local` has: `EXPO_PUBLIC_API_URL=http://192.168.0.12:5174`
- Restart Expo after changing `.env.local`

### QR Code not showing

- Make sure Expo server is running
- Try pressing `r` to reload in Expo terminal
- Check if there are any error messages

## 📋 Quick Checklist

- [ ] Expo Go app installed on phone
- [ ] Phone and PC on same WiFi
- [ ] Backend server running (port 5174)
- [ ] Expo server running (port 8081)
- [ ] `.env.local` configured with correct IP
- [ ] QR code visible in Expo terminal

## 🎯 Once Connected

After connecting:
1. The app will load on your phone
2. You can use the app normally
3. Changes you make to code will hot-reload automatically
4. You'll see the LifeSync app with all features

## 💡 Pro Tips

- **Keep Expo terminal open** - you'll see logs and errors there
- **Shake your phone** - opens Expo dev menu (reload, debug, etc.)
- **Press `r` in Expo terminal** - reloads the app
- **Press `m` in Expo terminal** - opens dev menu

## 🆘 Still Having Issues?

1. Check Expo terminal for error messages
2. Check backend terminal for API errors
3. Verify both servers are running:
   - Backend: `curl http://192.168.0.12:5174/health`
   - Expo: Should show QR code in terminal
4. Try tunnel mode as last resort

---

**Your Setup:**
- PC IP: `192.168.0.12`
- Backend: `http://192.168.0.12:5174`
- Expo URL: `exp://192.168.0.12:8081`


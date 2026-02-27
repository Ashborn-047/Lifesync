# Quick Start Guide - Android Studio Integration

## ✅ Prerequisites Check

Your Android SDK is installed at: `C:\Users\PUSHAN\AppData\Local\Android\Sdk`

## 🚀 Quick Start (3 Steps)

### Step 1: Create Android Emulator in Android Studio

1. **Open Android Studio**
2. **Click "More Actions" → "Virtual Device Manager"** (or Tools → Device Manager)
3. **Click "Create Device"**
4. **Select a device:**
   - Choose **Pixel 6** or **Pixel 7** (recommended)
   - Click **Next**
5. **Select System Image:**
   - Choose **API 33 (Android 13)** or **API 34 (Android 14)**
   - If not installed, click **Download** (this may take a few minutes)
   - Click **Next**
6. **Configure AVD:**
   - Name: `LifeSync_Emulator` (or any name you prefer)
   - Click **Finish**

### Step 2: Start the Emulator

1. In **Device Manager**, find your created emulator
2. Click the **▶️ Play button** to start it
3. **Wait for it to fully boot** (home screen should appear - takes 1-2 minutes)

### Step 3: Start Expo

**Option A: Use the helper script (Recommended)**
```powershell
cd mobile
.\start-android.ps1
```

**Option B: Manual start**
```powershell
cd mobile
npx expo start --android
```

Expo will automatically:
- Detect your running emulator
- Build and install the app
- Launch LifeSync on the emulator

## 📱 Alternative: Use Expo Go (Faster, No Build Required)

If you want to test quickly without building:

```powershell
cd mobile
npx expo start
```

Then:
- Press `a` in the terminal to open on Android emulator
- Or scan the QR code with Expo Go app on your phone

## 🔧 Troubleshooting

### "No Android device found"
- Make sure the emulator is **fully booted** (home screen visible)
- Run: `adb devices` - you should see `emulator-5554   device`
- If empty, restart ADB: `adb kill-server && adb start-server`

### "ADB not recognized"
The helper script sets this automatically, but if you need to set it manually:
```powershell
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:PATH += ";$env:ANDROID_HOME\platform-tools"
```

### Network/API Connection Issues
- Ensure backend is running: `cd backend && python -m uvicorn src.api.server:app --reload --port 5174`
- For emulator, `.env.local` should have: `EXPO_PUBLIC_API_URL=http://10.0.2.2:5174`
- Test connection: `adb shell "curl http://10.0.2.2:5174/health"`

### Emulator is slow
- Enable **Hardware Acceleration** in BIOS
- In AVD settings, increase **RAM** to 2048MB or more
- Close other heavy applications

## 🎯 What Happens Next?

Once Expo starts:
1. It will build the JavaScript bundle
2. Install the app on your emulator
3. Launch LifeSync automatically
4. You'll see the onboarding screen

## 📝 Next Steps After App Launches

1. **Test the flow:**
   - Onboarding → Quiz Intro → Quiz → Results → Report
2. **Verify API connection:**
   - Questions should load from backend
   - Assessment submission should work
   - Explanation generation should work
3. **Check the console:**
   - Look for any errors in the Expo terminal
   - Check backend logs for API calls

## 💡 Pro Tips

- **Keep the emulator running** - Don't close it between tests
- **Use hot reload** - Changes to code will auto-reload in the app
- **Check logs** - Both Expo terminal and `adb logcat` show useful info
- **Restart if stuck** - Sometimes `npx expo start --android --clear` helps

## 🆘 Still Having Issues?

1. Check `mobile/ANDROID_SETUP.md` for detailed setup
2. Verify Android Studio SDK is fully installed
3. Make sure emulator is running before starting Expo
4. Check that backend server is running on port 5174


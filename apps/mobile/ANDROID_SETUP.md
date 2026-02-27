# Android Studio Setup Guide for LifeSync Mobile

## Step 1: Verify Android Studio Installation

1. Open Android Studio
2. Go to **File → Settings** (or **Android Studio → Preferences** on Mac)
3. Navigate to **Appearance & Behavior → System Settings → Android SDK**
4. Verify that the following are installed:
   - Android SDK Platform-Tools
   - Android SDK Build-Tools
   - Android Emulator
   - At least one Android SDK Platform (API 33 or 34 recommended)

## Step 2: Create Android Virtual Device (AVD)

1. In Android Studio, click **Tools → Device Manager** (or **AVD Manager**)
2. Click **Create Device**
3. Select a device (e.g., **Pixel 6** or **Pixel 7**)
4. Click **Next**
5. Select a system image:
   - Choose **API 33 (Android 13)** or **API 34 (Android 14)**
   - If not installed, click **Download** next to the system image
6. Click **Next**
7. Name your AVD (e.g., "Pixel_6_API_33")
8. Click **Finish**

## Step 3: Start the Emulator

1. In **Device Manager**, find your created AVD
2. Click the **Play** button (▶️) to start the emulator
3. Wait for the emulator to fully boot (may take 1-2 minutes)

## Step 4: Verify ADB Connection

Open a terminal and run:
```bash
adb devices
```

You should see your emulator listed, for example:
```
List of devices attached
emulator-5554   device
```

## Step 5: Start Expo with Android

Once the emulator is running:
```bash
cd mobile
npx expo start --android
```

Expo will automatically detect the running emulator and install the app.

## Alternative: Use Expo Go (Quick Test)

If you want to test quickly without building:
```bash
npx expo start
```

Then:
1. Press `a` to open on Android emulator
2. Or scan the QR code with Expo Go app on a physical device

## Troubleshooting

### ADB not found
Add Android SDK platform-tools to your PATH:
- Windows: Add `%LOCALAPPDATA%\Android\Sdk\platform-tools` to PATH
- Or set: `$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"`

### Emulator not starting
- Ensure **Hardware Acceleration** is enabled in BIOS
- Install **Intel HAXM** or **Hyper-V** (Windows)
- Check Android Studio → Tools → SDK Manager → SDK Tools → Intel x86 Emulator Accelerator

### Expo can't find device
- Make sure emulator is fully booted (home screen visible)
- Run `adb kill-server` then `adb start-server`
- Restart Expo: `npx expo start --android --clear`

### Network issues (API not connecting)
- For emulator, use: `EXPO_PUBLIC_API_URL=http://10.0.2.2:5174`
- Ensure backend is running on port 5174
- Test connection: `adb shell "curl http://10.0.2.2:5174/health"`

## Quick Commands

```bash
# Check connected devices
adb devices

# Restart ADB server
adb kill-server && adb start-server

# Install app directly (if needed)
adb install app.apk

# View logs
adb logcat | grep -i expo
```


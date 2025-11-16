# How to Start Android Emulator - Step by Step

## Yes, you need to manually start the emulator first!

The Android emulator must be running **before** Expo can connect to it. Here's exactly what to do:

## Step-by-Step Process

### 1. Open Android Studio
- Launch Android Studio from your Start menu or desktop

### 2. Open Device Manager
- Click **"More Actions"** button (top right) → **"Virtual Device Manager"**
- OR go to **Tools** → **Device Manager**

### 3. Start Your Emulator
- You should see your created emulator in the list
- Click the **▶️ Play button** (green triangle) next to your emulator
- Wait 1-2 minutes for it to fully boot (you'll see the Android home screen)

### 4. Verify Emulator is Running
- You should see the emulator window open
- The Android home screen should be visible
- The emulator is ready when you can see the home screen icons

### 5. Connect Expo to Emulator
- Go back to your terminal where Expo is running
- You should see a menu like:
  ```
  › Press a │ open Android
  › Press i │ open iOS simulator
  › Press w │ open web
  ```
- Press **`a`** to open on Android
- Expo will automatically install and launch the app on your emulator

## Alternative: Auto-Start (If Emulator Already Created)

If you've already created an emulator, you can start it from command line:

```powershell
# List available emulators
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:PATH += ";$env:ANDROID_HOME\emulator;$env:ANDROID_HOME\platform-tools"

# List emulators
emulator -list-avds

# Start specific emulator (replace with your emulator name)
emulator -avd Pixel_6_API_33
```

Then wait for it to boot, and press `a` in Expo terminal.

## Quick Checklist

- [ ] Android Studio is open
- [ ] Device Manager is open
- [ ] Emulator is created (if not, create one first)
- [ ] Emulator is started (Play button clicked)
- [ ] Emulator home screen is visible
- [ ] Expo is running in terminal
- [ ] Press `a` in Expo terminal

## Troubleshooting

**"No Android device found"**
- Make sure emulator is **fully booted** (home screen visible)
- Run `adb devices` - should show `emulator-5554   device`
- If empty, restart ADB: `adb kill-server && adb start-server`

**Emulator won't start**
- Check if virtualization is enabled in BIOS
- Make sure you have enough RAM (4GB+ recommended)
- Try creating a new emulator with lower specs

**Expo can't find emulator**
- Wait for emulator to fully boot (can take 1-2 minutes)
- Make sure only one emulator is running
- Restart Expo: `npx expo start --android --clear`

## Summary

**Yes, you need to manually start the emulator in Android Studio first.** Once it's running, Expo can automatically connect and install the app. Think of it like this:

1. **You start the emulator** (Android Studio) ← Manual step
2. **Expo connects** (automatic when you press `a`) ← Automatic step
3. **App installs and launches** (automatic) ← Automatic step


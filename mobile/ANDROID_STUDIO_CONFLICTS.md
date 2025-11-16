# Android Studio Conflicts with Expo

## Potential Issues

Android Studio and its components can interfere with Expo in several ways:

### 1. Port Conflicts

**Common Ports Used:**
- **Expo:** 8081 (Metro bundler)
- **Backend:** 5174 (API server)
- **Android Emulator:** 5554-5585 (ADB)
- **Android Studio:** Various ports for Gradle, etc.

**Problem:** If Android Studio/emulator uses port 8081, Expo can't start.

**Check:**
```powershell
Get-NetTCPConnection -LocalPort 8081
```

**Fix:**
- Close Android Studio
- Stop emulator
- Restart Expo

### 2. ADB Conflicts

**Problem:** Multiple ADB processes can conflict.

**Check:**
```powershell
Get-Process | Where-Object {$_.ProcessName -like "*adb*"}
```

**Fix:**
```powershell
# Kill all ADB processes
Get-Process | Where-Object {$_.ProcessName -like "*adb*"} | Stop-Process -Force

# Restart ADB server
adb kill-server
adb start-server
```

### 3. Resource Usage

**Problem:** Android Studio/emulator use a lot of RAM/CPU.

**Symptoms:**
- Expo runs slowly
- App crashes
- Connection timeouts

**Fix:**
- Close Android Studio when using Expo Go
- Don't run emulator and Expo Go simultaneously
- Free up system resources

### 4. Network Conflicts

**Problem:** Emulator uses special network (10.0.2.2 for host).

**If using emulator:**
- API URL should be: `http://10.0.2.2:5174`
- Expo connects via ADB

**If using Expo Go:**
- API URL should be: `http://192.168.0.12:5174` (or tunnel)
- No ADB needed

## Solutions

### Solution 1: Close Android Studio (Recommended for Expo Go)

**When using Expo Go:**
1. Close Android Studio completely
2. Stop any running emulators
3. Use Expo Go on your phone instead
4. No conflicts, simpler setup

**Pros:**
- ✅ No port conflicts
- ✅ No resource conflicts
- ✅ Real device testing
- ✅ Simpler setup

### Solution 2: Use One at a Time

**Don't run both simultaneously:**
- **Option A:** Use Expo Go (close Android Studio)
- **Option B:** Use Emulator (close Expo Go connection)

**Switch between them as needed.**

### Solution 3: Fix Port Conflicts

**If port 8081 is taken:**

```powershell
# Find what's using port 8081
Get-NetTCPConnection -LocalPort 8081 | Select-Object OwningProcess
$pid = (Get-NetTCPConnection -LocalPort 8081).OwningProcess
Get-Process -Id $pid

# Kill the process if needed
Stop-Process -Id $pid -Force
```

### Solution 4: Clean ADB State

**If ADB is causing issues:**

```powershell
# Kill ADB
adb kill-server

# Restart ADB
adb start-server

# Check devices
adb devices
```

## Quick Fix Checklist

- [ ] **Close Android Studio** (if using Expo Go)
- [ ] **Stop emulator** (if using Expo Go)
- [ ] **Check port 8081** is free
- [ ] **Check port 5174** is free (backend)
- [ ] **Kill ADB processes** if conflicting
- [ ] **Restart Expo** after closing Android Studio
- [ ] **Use tunnel mode** to avoid network issues

## Recommended Setup

### For Development with Expo Go:

1. **Close Android Studio** ✅
2. **Stop emulator** ✅
3. **Start backend:** `python -m uvicorn ...`
4. **Start Expo:** `npx expo start --tunnel`
5. **Connect with Expo Go** on phone

### For Development with Emulator:

1. **Close Expo Go connection** ✅
2. **Start Android Studio**
3. **Start emulator**
4. **Start backend:** `python -m uvicorn ...`
5. **Start Expo:** `npx expo start --android`
6. **App installs automatically**

## Common Error Messages

### "Port 8081 already in use"
**Fix:** Close Android Studio/emulator, or kill process using port 8081

### "ADB server didn't ACK"
**Fix:** 
```powershell
adb kill-server
adb start-server
```

### "Unable to connect to device"
**Fix:** Close Android Studio, use Expo Go instead

### "Metro bundler failed to start"
**Fix:** Check port conflicts, close Android Studio

## Summary

**For Expo Go (Current Setup):**
- ✅ Close Android Studio
- ✅ Don't need emulator
- ✅ Use tunnel mode
- ✅ Simpler, no conflicts

**Android Studio is NOT needed for Expo Go!**
- Expo Go runs on your phone
- No emulator needed
- No Android Studio needed
- Just Expo CLI and your phone

---

**Current Recommendation:** Close Android Studio when using Expo Go to avoid conflicts.


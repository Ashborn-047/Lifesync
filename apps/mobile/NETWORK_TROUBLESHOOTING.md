# Network Troubleshooting: Cable vs WiFi

## Your Setup

- **PC:** Connected via Ethernet (cable)
- **Phone:** Connected via WiFi
- **Same Router:** But might be isolated

## ⚠️ The Problem

Even though both are on the same router, **Ethernet and WiFi can be isolated**:

1. **Different Network Segments**
   - Ethernet might be on `192.168.1.x`
   - WiFi might be on `192.168.2.x` or different subnet

2. **AP Isolation**
   - Router setting that prevents WiFi devices from talking to Ethernet devices
   - Common in guest networks or some router configs

3. **Network Segmentation**
   - Some routers separate wired and wireless by default
   - Security feature that blocks cross-communication

## ✅ Solutions

### Solution 1: Use TUNNEL Mode (Easiest - Already Running!)

**Tunnel mode works regardless of network setup!**

```bash
npx expo start --tunnel
```

**Why it works:**
- Creates a public URL through Expo's servers
- Bypasses local network entirely
- Works even if devices are on different networks
- No router configuration needed

**Current Status:** ✅ You're already using tunnel mode!

### Solution 2: Connect PC to WiFi Too

**If your PC has WiFi:**

1. Connect PC to the same WiFi network as your phone
2. Get the WiFi IP address:
   ```powershell
   ipconfig
   # Look for "Wireless LAN adapter Wi-Fi"
   ```
3. Update `.env.local`:
   ```
   EXPO_PUBLIC_API_URL=http://YOUR_WIFI_IP:5174
   ```
4. Restart Expo

**Pros:**
- Both devices on same network segment
- Direct connection, faster

**Cons:**
- Requires PC to have WiFi
- Might need to disconnect cable

### Solution 3: Check Router Settings

**Disable AP Isolation:**

1. Log into router admin panel (usually `192.168.1.1` or `192.168.0.1`)
2. Look for "AP Isolation" or "Client Isolation"
3. Disable it
4. Save and restart router

**Check Network Segments:**

1. Check if Ethernet and WiFi are on same subnet
2. PC Ethernet IP: `192.168.1.10` (example)
3. Phone WiFi IP: `192.168.1.20` (should be similar)
4. If different (like `192.168.1.x` vs `192.168.2.x`), they're isolated

### Solution 4: Use USB Tethering (Alternative)

**If nothing else works:**

1. Connect phone to PC via USB
2. Enable USB tethering on phone
3. PC will use phone's internet
4. Both on same network (phone's hotspot)
5. Use `localhost` or `127.0.0.1` for API URL

## 🔍 How to Check Your Network

### Check PC IPs:

```powershell
ipconfig
```

Look for:
- **Ethernet adapter:** Your cable connection IP
- **Wireless LAN adapter:** Your WiFi IP (if connected)

### Check Phone IP:

1. On phone: Settings → WiFi → Tap your network
2. Look for "IP Address"
3. Compare with PC's IP

**Same subnet?**
- PC: `192.168.1.10`
- Phone: `192.168.1.25`
- ✅ Same subnet - should work!

**Different subnet?**
- PC: `192.168.1.10`
- Phone: `192.168.2.15`
- ❌ Different subnet - isolated!

## 🎯 Recommended Approach

### For Development (Current):

**✅ Use TUNNEL Mode** - You're already doing this!
- Works regardless of network setup
- No router configuration needed
- Works from anywhere
- Slightly slower, but reliable

### For Production/Local Testing:

**✅ Connect PC to WiFi too**
- Faster connection
- Direct local network
- Better for development

## 📋 Quick Fix Checklist

- [ ] **Tunnel mode running?** ✅ (You're using this)
- [ ] **Got tunnel URL?** Check Expo terminal
- [ ] **Entered URL in Expo Go?** Use the `exp://` URL
- [ ] **Still not working?** Try connecting PC to WiFi too

## 💡 Pro Tip

**Tunnel mode is your friend!**
- Works with any network setup
- No configuration needed
- Reliable connection
- Perfect for development

The only downside is it's slightly slower than direct LAN connection, but for development it's perfectly fine!

---

**Current Status:** Using tunnel mode ✅
**Action:** Make sure you're using the tunnel URL in Expo Go (not LAN URL)


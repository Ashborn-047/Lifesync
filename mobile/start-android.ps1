# LifeSync Mobile - Android Development Helper Script
# This script sets up the Android environment and starts Expo

Write-Host "🚀 LifeSync Mobile - Android Setup" -ForegroundColor Cyan
Write-Host ""

# Set Android SDK path
$androidSdkPath = "$env:LOCALAPPDATA\Android\Sdk"
if (Test-Path $androidSdkPath) {
    $env:ANDROID_HOME = $androidSdkPath
    $env:PATH = "$androidSdkPath\platform-tools;$env:PATH"
    Write-Host "✅ Android SDK found at: $androidSdkPath" -ForegroundColor Green
} else {
    Write-Host "❌ Android SDK not found at: $androidSdkPath" -ForegroundColor Red
    Write-Host "   Please install Android Studio and set up the SDK" -ForegroundColor Yellow
    exit 1
}

# Check for ADB
$adbPath = "$androidSdkPath\platform-tools\adb.exe"
if (Test-Path $adbPath) {
    Write-Host "✅ ADB found" -ForegroundColor Green
} else {
    Write-Host "❌ ADB not found. Please install Android SDK Platform-Tools" -ForegroundColor Red
    exit 1
}

# Check for connected devices/emulators
Write-Host ""
Write-Host "Checking for Android devices/emulators..." -ForegroundColor Cyan
$devices = & adb devices | Select-Object -Skip 1 | Where-Object { $_ -match "device" }

if ($devices.Count -eq 0) {
    Write-Host "⚠️  No Android devices or emulators found!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To create and start an emulator:" -ForegroundColor Cyan
    Write-Host "1. Open Android Studio" -ForegroundColor White
    Write-Host "2. Go to Tools → Device Manager" -ForegroundColor White
    Write-Host "3. Click 'Create Device' and follow the wizard" -ForegroundColor White
    Write-Host "4. Start the emulator (click Play button)" -ForegroundColor White
    Write-Host "5. Then run this script again" -ForegroundColor White
    Write-Host ""
    Write-Host "Or start Expo without Android flag:" -ForegroundColor Cyan
    Write-Host "   npx expo start" -ForegroundColor White
    Write-Host ""
    
    $continue = Read-Host "Do you want to start Expo anyway? (y/n)"
    if ($continue -ne "y") {
        exit 0
    }
} else {
    Write-Host "✅ Found $($devices.Count) device(s):" -ForegroundColor Green
    $devices | ForEach-Object { Write-Host "   $_" -ForegroundColor White }
    Write-Host ""
}

# Check if .env.local exists
if (Test-Path ".env.local") {
    Write-Host "✅ Environment file found" -ForegroundColor Green
} else {
    Write-Host "⚠️  .env.local not found. Creating from template..." -ForegroundColor Yellow
    Copy-Item ".env-example" ".env.local" -ErrorAction SilentlyContinue
    Write-Host "✅ Created .env.local (please update with your API URL)" -ForegroundColor Green
}

Write-Host ""
Write-Host "Starting Expo..." -ForegroundColor Cyan
Write-Host ""

# Start Expo with Android
npx expo start --android


@echo off
REM LifeSync Mobile - Android Development Helper Script (Windows Batch)
REM This script sets up the Android environment and starts Expo

echo 🚀 LifeSync Mobile - Android Setup
echo.

REM Set Android SDK path
set ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk
set PATH=%ANDROID_HOME%\platform-tools;%PATH%

REM Check for ADB
if exist "%ANDROID_HOME%\platform-tools\adb.exe" (
    echo ✅ ADB found
) else (
    echo ❌ ADB not found. Please install Android SDK Platform-Tools
    pause
    exit /b 1
)

REM Check for connected devices
echo.
echo Checking for Android devices/emulators...
adb devices

REM Check if .env.local exists
if exist ".env.local" (
    echo ✅ Environment file found
) else (
    echo ⚠️  .env.local not found. Creating from template...
    copy ".env-example" ".env.local" >nul 2>&1
    echo ✅ Created .env.local (please update with your API URL)
)

echo.
echo Starting Expo...
echo.

REM Start Expo with Android
npx expo start --android

pause


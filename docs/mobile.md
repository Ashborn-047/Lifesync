# LifeSync Mobile App Documentation

Expo React Native mobile application for the LifeSync Personality Engine.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI (optional, but recommended)
- iOS Simulator (for iOS) or Android Emulator (for Android)

### Installation

1. Navigate to mobile directory:
   ```bash
   cd mobile
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start Expo development server:
   ```bash
   npm start
   ```

4. Run on your platform:
   - **iOS**: Press `i` or scan QR code with Expo Go app
   - **Android**: Press `a` or scan QR code with Expo Go app
   - **Web**: Press `w`

## 📱 Development

### Project Structure

```
mobile/
├── app/              # App router (Expo Router)
├── components/        # React components (to be created)
├── screens/          # Screen components (to be created)
├── services/         # API services (to be created)
├── utils/            # Utilities (to be created)
├── assets/           # Images, fonts, etc.
├── package.json      # Dependencies
└── app.json          # Expo configuration
```

### Backend Connection

The mobile app connects to the backend API. Configure the API base URL:

```typescript
// services/api.ts (to be created)
const API_BASE_URL = 'http://localhost:8000'; // Development
// const API_BASE_URL = 'https://api.lifesync.com'; // Production
```

### API Integration

Example API calls:

```typescript
// Create assessment
const response = await fetch(`${API_BASE_URL}/v1/assessments`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    user_id: userId,
    responses: answers,
    quiz_type: 'full'
  })
});

// Generate explanation
const explanation = await fetch(
  `${API_BASE_URL}/v1/assessments/${assessmentId}/generate_explanation`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider: 'gemini' })
  }
);
```

## 🛠️ Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android emulator
- `npm run ios` - Run on iOS simulator (macOS only)
- `npm run web` - Run in web browser
- `npm run lint` - Run ESLint (if configured)

## 📦 Dependencies

Key dependencies:
- `expo` - Expo SDK
- `react-native` - React Native framework
- `expo-router` - File-based routing
- (Additional dependencies to be added as needed)

## 🔧 Configuration

### Expo Config (`app.json`)

```json
{
  "expo": {
    "name": "LifeSync",
    "slug": "lifesync",
    "version": "1.0.0",
    "platforms": ["ios", "android", "web"]
  }
}
```

### Environment Variables

Create `.env` file in `mobile/` directory:
```
API_BASE_URL=http://localhost:8000
```

## 🧪 Testing

(Testing setup to be configured)

## 📱 Building for Production

### iOS
```bash
eas build --platform ios
```

### Android
```bash
eas build --platform android
```

## 🐛 Troubleshooting

### Common Issues

1. **Metro bundler errors**
   - Clear cache: `npm start -- --clear`
   - Delete `node_modules` and reinstall

2. **Connection to backend fails**
   - Verify backend is running
   - Check API_BASE_URL configuration
   - For physical device, use your computer's IP address instead of localhost

3. **Expo Go app issues**
   - Update Expo Go app to latest version
   - Clear Expo Go cache

## 📝 Next Steps

- [ ] Set up state management (Redux/Zustand)
- [ ] Create API service layer
- [ ] Implement authentication
- [ ] Design UI components
- [ ] Add navigation
- [ ] Configure environment variables
- [ ] Set up error handling
- [ ] Add loading states

## 📝 License

(To be added)


import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
    ...config,
    name: 'LifeSync',
    slug: 'lifesync',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
        image: './assets/splash-icon.png',
        resizeMode: 'contain',
        backgroundColor: '#ffffff'
    },
    assetBundlePatterns: [
        '**/*'
    ],
    ios: {
        supportsTablet: true,
        bundleIdentifier: 'com.lifesync.app'
    },
    android: {
        adaptiveIcon: {
            foregroundImage: './assets/adaptive-icon.png',
            backgroundColor: '#ffffff'
        },
        package: 'com.lifesync.app'
    },
    web: {
        favicon: './assets/favicon.png'
    },
    extra: {
        eas: {
            projectId: 'your-project-id'
        }
    },
    // plugins: [
    //   "expo-router"
    // ]
});

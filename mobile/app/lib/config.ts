/**
 * LifeSync Mobile - Configuration
 * Reads environment variables from Expo
 */

// Validate required environment variables
const validateEnv = () => {
  const errors: string[] = [];

  if (!process.env.EXPO_PUBLIC_API_URL) {
    errors.push('EXPO_PUBLIC_API_URL is missing. Please set it in mobile/.env');
  }

  if (!process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL === 'https://YOUR-PROJECT.supabase.co') {
    errors.push('EXPO_PUBLIC_SUPABASE_URL is missing or not configured. Please set it in mobile/.env');
  }

  if (!process.env.EXPO_PUBLIC_SUPABASE_KEY || process.env.EXPO_PUBLIC_SUPABASE_KEY === 'YOUR-ANON-KEY') {
    errors.push('EXPO_PUBLIC_SUPABASE_KEY is missing or not configured. Please set it in mobile/.env');
  }

  if (errors.length > 0) {
    console.warn('⚠️  Environment Configuration Warnings:');
    errors.forEach((error) => console.warn(`  - ${error}`));
  }
};

// Run validation
validateEnv();

export const API_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error(
    "Missing EXPO_PUBLIC_API_URL in .env file. " +
    "Please set EXPO_PUBLIC_API_URL=http://YOUR_LOCAL_IP:5174 in mobile/.env"
  );
}

export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";

export const SUPABASE_KEY = process.env.EXPO_PUBLIC_SUPABASE_KEY ?? "";

export const config = {
  api: {
    baseUrl: API_URL,
  },
  
  supabase: {
    url: SUPABASE_URL,
    key: SUPABASE_KEY,
  },
} as const;

export default config;


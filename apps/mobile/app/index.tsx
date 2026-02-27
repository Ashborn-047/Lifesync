/**
 * LifeSync Mobile - Entry Point
 * Default route redirects to OnboardingScreen
 */

import { Redirect } from 'expo-router';

export default function Index() {
  // Use Redirect instead of useEffect + router.replace to avoid timing issues
  return <Redirect href="/screens/HomeScreen" />;
}


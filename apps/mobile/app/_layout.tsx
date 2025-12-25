/**
 * LifeSync Mobile - Root Layout
 * Expo Router root layout with navigation setup
 */

import { Stack } from 'expo-router/stack';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: '#6366F1',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen
            name="index"
            options={{
              title: 'LifeSync',
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="screens/OnboardingScreen"
            options={{
              title: 'Welcome',
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="screens/QuizIntroScreen"
            options={{
              title: 'Assessment Intro',
            }}
          />
          <Stack.Screen
            name="screens/QuizScreen"
            options={{
              title: 'Personality Quiz',
            }}
          />
          <Stack.Screen
            name="screens/QuizResultScreen"
            options={{
              title: 'Generating Report',
              headerBackVisible: false,
            }}
          />
          <Stack.Screen
            name="screens/PersonalityReportScreen"
            options={{
              title: 'Your Report',
              headerBackVisible: false,
            }}
          />
          <Stack.Screen
            name="screens/HomeScreen"
            options={{
              title: 'Home',
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="screens/CareerCompassScreen"
            options={{
              title: 'Career Compass',
            }}
          />
          <Stack.Screen
            name="screens/MindMeshScreen"
            options={{
              title: 'MindMesh',
            }}
          />
          <Stack.Screen
            name="screens/BudgetBuddyScreen"
            options={{
              title: 'Budget Buddy',
            }}
          />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}


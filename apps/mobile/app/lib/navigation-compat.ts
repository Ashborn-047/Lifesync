/**
 * Navigation Compatibility Layer
 * Wraps expo-router hooks to work with React Navigation
 */

import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';

/**
 * Mock useRouter hook that uses React Navigation under the hood
 */
export function useRouter() {
    const navigation = useNavigation();

    return {
        push: useCallback((route: string) => {
            // Convert expo-router paths to React Navigation screen names
            const screenName = route
                .replace(/^\//, '')  // Remove leading slash
                .replace(/\/(tabs|screens)\//, '')  // Remove /tabs/ or /screens/
                .replace(/Screen$/, ''); // Remove trailing "Screen"

            // Map specific routes
            const routeMap: Record<string, string> = {
                'QuizScreen': 'Quiz',
                'QuizIntroScreen': 'QuizIntro',
                'QuizResultScreen': 'QuizResult',
                'PersonalityReportScreen': 'PersonalityReport',
                'MindMeshScreen': 'MindMesh',
                'CareerCompassScreen': 'CareerCompass',
                'BudgetBuddyScreen': 'BudgetBuddy',
                'HomeScreen': 'Home',
                'OnboardingScreen': 'Onboarding',
            };

            const finalScreen = routeMap[screenName] || screenName || 'Home';
            navigation.navigate(finalScreen as never);
        }, [navigation]),

        replace: useCallback((route: string) => {
            const screenName = route.replace(/^\//, '').replace(/\/(tabs|screens)\//, '');
            (navigation as any).replace(screenName);
        }, [navigation]),

        back: useCallback(() => {
            navigation.goBack();
        }, [navigation]),

        canGoBack: useCallback(() => {
            return navigation.canGoBack();
        }, [navigation]),
    };
}

/**
 * Mock useLocalSearchParams hook
 */
export function useLocalSearchParams() {
    return {};
}

/**
 * Mock usePathname hook  
 */
export function usePathname() {
    const navigation = useNavigation();
    return (navigation as any).getCurrentRoute?.()?.name || '/';
}

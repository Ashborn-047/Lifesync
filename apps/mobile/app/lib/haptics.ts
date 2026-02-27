/**
 * LifeSync Mobile - Safe Haptics Utility
 * Wraps expo-haptics to safely handle web platform (where haptics aren't available)
 */

import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Safely trigger haptic feedback
 * Only works on native platforms (iOS/Android), silently fails on web
 */
export const safeHaptic = {
  impact: (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(style);
      } catch (error) {
        // Silently fail if haptics aren't available
        console.debug('Haptics not available:', error);
      }
    }
  },
  
  notification: (type: Haptics.NotificationFeedbackType = Haptics.NotificationFeedbackType.Success) => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.notificationAsync(type);
      } catch (error) {
        console.debug('Haptics not available:', error);
      }
    }
  },
  
  selection: () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.selectionAsync();
      } catch (error) {
        console.debug('Haptics not available:', error);
      }
    }
  },
};

// Re-export ImpactFeedbackStyle enum for convenience
export const ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle;


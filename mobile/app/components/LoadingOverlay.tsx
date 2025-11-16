/**
 * LifeSync Mobile - Loading Overlay Component
 * Full-screen loading spinner
 */

import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '../styles/colors';

interface LoadingOverlayProps {
  visible?: boolean;
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible = true,
  message,
}) => {
  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <ActivityIndicator size="large" color={colors.primary} />
      {message && <View style={styles.messageContainer} />}
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  messageContainer: {
    marginTop: 16,
  },
});

export default LoadingOverlay;


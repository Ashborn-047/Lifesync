/**
 * LifeSync Mobile - Quiz Result Screen
 * Shows loading while generating explanation, then navigates to report
 */
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAssessment, generateExplanation } from '@lifesync/api-sdk';
import { colors, typography } from '../styles';
import { spacing } from '../styles/spacing';
import LoadingOverlay from '../components/LoadingOverlay';

export const QuizResultScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  const assessmentId = params.assessmentId as string;
  const [status, setStatus] = useState<'generating' | 'success' | 'error'>('generating');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!assessmentId) {
      setStatus('error');
      setError('No assessment ID provided');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch assessment and explanation in parallel
        const [assessment, explanation] = await Promise.all([
          getAssessment(assessmentId),
          generateExplanation(assessmentId),
        ]);

        // Save assessment to AsyncStorage for HomeScreen
        try {
          await AsyncStorage.setItem('assessmentResult', JSON.stringify(assessment));
          await AsyncStorage.setItem('latestAssessmentId', assessment.assessment_id);
        } catch (storageError) {
          console.warn('Failed to save assessment to storage:', storageError);
        }

        // Navigate to report screen with all data
        router.push({
          pathname: '/screens/PersonalityReportScreen',
          params: {
            modelName: explanation.model_name || '',
          },
        });
        setStatus('success');
      } catch (err: any) {
        console.error('Data fetch error:', err);
        setStatus('error');
        setError(err?.message || 'Failed to generate explanation. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [assessmentId, router]);

  if (status === 'error') {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          {error || 'Failed to generate explanation. Please try again.'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LoadingOverlay visible={loading || status === 'generating'} />
      <View style={styles.content}>
        <Text style={styles.title}>Analyzing Your Results</Text>
        <Text style={styles.subtitle}>
          We&apos;re analyzing your personality and generating your personalized report...
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  content: {
    alignItems: 'center',
  },
  title: {
    ...typography.heading,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  errorText: {
    ...typography.body,
    color: colors.error,
    textAlign: 'center',
  },
});

export default QuizResultScreen;


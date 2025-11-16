/**
 * LifeSync Mobile - Quiz Screen
 * Displays questions one at a time with 5-point Likert scale
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import QuestionCard from '../components/QuestionCard';
import ChoiceButton from '../components/ChoiceButton';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { useQuestions } from '../hooks/useQuestions';
import { submitAssessment } from '../lib/api';
import { safeHaptic, ImpactFeedbackStyle } from '../lib/haptics';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { spacing } from '../styles/spacing';

export const QuizScreen: React.FC = () => {
  const router = useRouter();
  const { data: questions, loading, error } = useQuestions(30);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [selectedValue, setSelectedValue] = useState<number | null>(null);

  if (loading || submitting) return <LoadingOverlay visible={true} />;
  
  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }
  
  if (!questions || questions.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No questions found</Text>
      </View>
    );
  }

  const q = questions[index];

  async function onChoose(value: number) {
    // Add haptic feedback
    safeHaptic.impact(ImpactFeedbackStyle.Light);
    
    // Store answer
    const updatedAnswers = { ...answers, [q.id]: value };
    setAnswers(updatedAnswers);

    if (index + 1 < questions.length) {
      // Move to next question
      setIndex(index + 1);
      setSelectedValue(null);
    } else {
      // Last question - submit assessment
      setSubmitting(true);
      try {
        const result = await submitAssessment(updatedAnswers);
        
        // Navigate to result screen (which will trigger explanation generation)
        router.push({
          pathname: '/screens/QuizResultScreen',
          params: {
            assessmentId: result.assessment_id,
          },
        });
      } catch (e: any) {
        console.error("Submit failed:", e);
        setSubmitting(false);
        Alert.alert('Error', `Failed to submit assessment: ${e.message || 'Unknown error'}`);
      }
    }
  }

  const handleChoiceSelectWithSubmit = (value: number) => {
    setSelectedValue(value);
    onChoose(value);
  };

  const progress = ((index + 1) / questions.length) * 100;

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <QuestionCard questionText={q.text}>
          <View style={styles.choicesContainer}>
            <ChoiceButton label="Strongly Disagree" value={1} selected={selectedValue === 1} onPress={handleChoiceSelectWithSubmit} />
            <ChoiceButton label="Disagree" value={2} selected={selectedValue === 2} onPress={handleChoiceSelectWithSubmit} />
            <ChoiceButton label="Neutral" value={3} selected={selectedValue === 3} onPress={handleChoiceSelectWithSubmit} />
            <ChoiceButton label="Agree" value={4} selected={selectedValue === 4} onPress={handleChoiceSelectWithSubmit} />
            <ChoiceButton label="Strongly Agree" value={5} selected={selectedValue === 5} onPress={handleChoiceSelectWithSubmit} />
          </View>
        </QuestionCard>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: colors.borderLight,
    width: '100%',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: spacing.xl,
  },
  choicesContainer: {
    marginTop: spacing.md,
  },
  errorText: {
    ...typography.body,
    color: colors.error,
    textAlign: 'center',
    marginTop: spacing.xl,
    padding: spacing.lg,
  },
});

export default QuizScreen;

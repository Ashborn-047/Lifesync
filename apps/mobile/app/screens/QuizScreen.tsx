import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuestions, submitAssessment } from '@lifesync/api-sdk';
import { QuestionCard, ChoiceButton } from '@lifesync/ashborn/quiz';
import { colors, typography } from '../styles';
import { spacing } from '../styles/spacing';
import LoadingOverlay from '../components/LoadingOverlay';

export const QuizScreen: React.FC = () => {
  const router = useRouter();
  const { questions, loading, error } = useQuestions(30);
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

  const q = questions[index];

  const onChoose = async (value: number) => {
    const updatedAnswers = { ...answers, [q.id]: value };
    setAnswers(updatedAnswers);

    if (index < questions.length - 1) {
      setTimeout(() => {
        setIndex(index + 1);
        setSelectedValue(null);
      }, 200);
    } else {
      // Last question - submit assessment
      setSubmitting(true);
      try {
        const result = await submitAssessment(
          Object.entries(updatedAnswers).map(([k, v]) => ({ question_id: k, response: v })),
          crypto.randomUUID(),
          'quick'
        );

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
  };

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
        <QuestionCard
          question={q}
          questionNumber={index + 1}
          totalQuestions={questions.length}
        >
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

const styles = StyleSheet.Create({
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
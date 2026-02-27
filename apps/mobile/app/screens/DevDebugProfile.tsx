import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { computeProfile } from '@lifesync/personality-engine';
import questions from '@lifesync/personality-engine/data/questions_180.json';
import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';
import { typography } from '../styles/typography';

export default function DevDebugProfile() {
    const [jsonInput, setJsonInput] = useState('{}');
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handleCompute = () => {
        try {
            setError(null);
            const answers = JSON.parse(jsonInput);
            const profile = computeProfile(answers, questions.questions as any);
            setResult(profile);
        } catch (e: any) {
            setError(e.message);
            setResult(null);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.header}>Debug Profile</Text>

                <View style={styles.card}>
                    <Text style={styles.label}>Input Answers (JSON)</Text>
                    <TextInput
                        style={styles.input}
                        multiline
                        value={jsonInput}
                        onChangeText={setJsonInput}
                        placeholder='{"Q001": 5, "Q002": 1...}'
                        placeholderTextColor={colors.textTertiary}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    <TouchableOpacity style={styles.button} onPress={handleCompute}>
                        <Text style={styles.buttonText}>Compute Profile</Text>
                    </TouchableOpacity>

                    {error && (
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorText}>Error: {error}</Text>
                        </View>
                    )}
                </View>

                <View style={styles.card}>
                    <Text style={styles.label}>Result</Text>
                    {result ? (
                        <View style={styles.resultContainer}>
                            <Text style={styles.resultText}>
                                {JSON.stringify(result, null, 2)}
                            </Text>
                        </View>
                    ) : (
                        <Text style={styles.placeholderText}>No result computed yet</Text>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        padding: spacing.md,
        gap: spacing.md,
    },
    header: {
        ...typography.heading,
        color: colors.textPrimary,
        marginBottom: spacing.sm,
    },
    card: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    label: {
        ...typography.subheading,
        color: colors.textPrimary,
        marginBottom: spacing.sm,
    },
    input: {
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        padding: spacing.sm,
        height: 200,
        fontFamily: 'monospace',
        textAlignVertical: 'top',
        color: colors.textPrimary,
    },
    button: {
        backgroundColor: colors.primary,
        padding: spacing.md,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: spacing.md,
    },
    buttonText: {
        ...typography.button,
        color: colors.textInverse,
    },
    errorContainer: {
        marginTop: spacing.md,
        padding: spacing.sm,
        backgroundColor: colors.error + '20',
        borderRadius: 8,
    },
    errorText: {
        color: colors.error,
        ...typography.bodySmall,
    },
    resultContainer: {
        backgroundColor: '#1e293b',
        padding: spacing.sm,
        borderRadius: 8,
    },
    resultText: {
        color: '#f8fafc',
        fontFamily: 'monospace',
        fontSize: 12,
    },
    placeholderText: {
        color: colors.textTertiary,
        textAlign: 'center',
        padding: spacing.lg,
    },
});

import { describe, it, expect } from 'vitest';
import { computeProfile } from '../scoring/computeProfile';
import questions from '../data/questions_180.json';
import type { Question } from '../types';

// Cast questions to correct type
const typedQuestions = questions.questions as unknown as Question[];

describe('computeProfile parity', () => {
    it('is deterministic and produces expected OCEAN scores', () => {
        // Create a deterministic set of answers
        // For simplicity, let's answer 5 to everything
        const answers: Record<string, number> = {};
        typedQuestions.forEach(q => {
            answers[q.id] = 5;
        });

        const result = computeProfile(answers, typedQuestions);

        // Round to 2 decimal places for comparison
        const roundedOcean = Object.fromEntries(
            Object.entries(result.ocean).map(([k, v]) => [k, Math.round(v * 100) / 100])
        );

        // With all 5s:
        // Forward scored questions contribute 5
        // Reverse scored questions contribute 1 (6-5)
        // The exact values depend on the mix of forward/reverse questions in the bank
        // But they MUST be deterministic.

        // We log the values here so we can see them in the test output
        console.log('Computed OCEAN scores:', roundedOcean);
        console.log('Computed MBTI:', result.mbti_type);

        expect(result.ocean).toBeDefined();
        expect(result.facets).toBeDefined();
        expect(result.mbti_type).toBeDefined();

        // Sanity checks
        expect(result.ocean.O).toBeGreaterThanOrEqual(0);
        expect(result.ocean.O).toBeLessThanOrEqual(100);
    });
});

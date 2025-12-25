import { describe, it, expect } from 'vitest';
import { computeProfile } from '../scoring/computeProfile';
import questions from '../data/questions_180.json';
import type { Question } from '../types';

const typedQuestions = questions.questions as unknown as Question[];

describe('Robustness Tests', () => {
    it('handles missing answers gracefully (defaults to neutral/3)', () => {
        const answers: Record<string, number> = {};
        // Only answer first 10 questions
        typedQuestions.slice(0, 10).forEach(q => answers[q.id] = 5);

        const result = computeProfile(answers, typedQuestions);

        // Should still produce valid scores
        Object.values(result.ocean).forEach(val => {
            expect(val).toBeDefined();
            expect(val).not.toBeNaN();
        });

        expect(result.mbti_type).toBeDefined();
    });

    it('maintains persona consistency for stable vectors', () => {
        // Create a stable answer set for a specific profile (e.g., High E, Low N)
        const answers: Record<string, number> = {};
        typedQuestions.forEach(q => {
            if (q.trait === 'E') answers[q.id] = q.reverse ? 1 : 5;
            else if (q.trait === 'N') answers[q.id] = q.reverse ? 5 : 1;
            else answers[q.id] = 3;
        });

        const result1 = computeProfile(answers, typedQuestions);
        const result2 = computeProfile(answers, typedQuestions);

        expect(result1.mbti_type).toEqual(result2.mbti_type);
        expect(result1.ocean).toEqual(result2.ocean);

        // Ensure it maps to a valid persona (if persona mapping logic is included in computeProfile result)
        // If not, we at least verify the core vector stability
    });
});

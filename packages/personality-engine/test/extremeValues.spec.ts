import { describe, it, expect } from 'vitest';
import { computeProfile } from '../scoring/computeProfile';
import questions from '../data/questions_180.json';
import type { Question } from '../types';

const typedQuestions = questions.questions as unknown as Question[];

describe('Extreme Value Parity Tests', () => {
    it('handles ALL 1s (Minimum Scores)', () => {
        const answers: Record<string, number> = {};
        typedQuestions.forEach(q => answers[q.id] = 1);

        const result = computeProfile(answers, typedQuestions);

        // Expect low scores generally, but reverse-scored items will flip this
        // Just ensuring it runs deterministically and produces valid ranges
        Object.values(result.ocean).forEach(val => {
            expect(val).toBeGreaterThanOrEqual(0);
            expect(val).toBeLessThanOrEqual(100);
        });

        expect(result.mbti_type).toBeDefined();
    });

    it('handles ALL 5s (Maximum Scores)', () => {
        const answers: Record<string, number> = {};
        typedQuestions.forEach(q => answers[q.id] = 5);

        const result = computeProfile(answers, typedQuestions);

        Object.values(result.ocean).forEach(val => {
            expect(val).toBeGreaterThanOrEqual(0);
            expect(val).toBeLessThanOrEqual(100);
        });

        expect(result.mbti_type).toBeDefined();
    });

    it('handles Alternating 1s and 5s', () => {
        const answers: Record<string, number> = {};
        typedQuestions.forEach((q, i) => answers[q.id] = i % 2 === 0 ? 1 : 5);

        const result = computeProfile(answers, typedQuestions);

        Object.values(result.ocean).forEach(val => {
            expect(val).toBeGreaterThanOrEqual(0);
            expect(val).toBeLessThanOrEqual(100);
        });

        // Deterministic check (run again)
        const result2 = computeProfile(answers, typedQuestions);
        expect(result).toEqual(result2);
    });
});

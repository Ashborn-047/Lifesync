import { describe, it, expect } from 'vitest';
import { computeProfile } from '../scoring/computeProfile';
import questions from '../data/questions_180.json';
import type { Question } from '../types';

const typedQuestions = questions.questions as unknown as Question[];

describe('computeProfile Parity Check', () => {
    it('MUST be deterministic', () => {
        // 1. Create deterministic input
        const answers: Record<string, number> = {};
        typedQuestions.forEach((q, i) => {
            // Pattern: 5, 1, 3, 5, 1, 3...
            const val = [5, 1, 3][i % 3];
            answers[q.id] = val;
        });

        // 2. Run profile
        const result = computeProfile(answers, typedQuestions);

        // 3. Round OCEAN values
        const roundedOcean = Object.fromEntries(
            Object.entries(result.ocean).map(([k, v]) => [k, Math.round(v * 100) / 100])
        );

        console.log('Parity Test OCEAN:', roundedOcean);

        // 4. Assertions
        // These values are based on the deterministic input and the engine logic
        // We assert they exist and are numbers first
        expect(result.ocean.O).toBeDefined();
        expect(result.ocean.C).toBeDefined();
        expect(result.ocean.E).toBeDefined();
        expect(result.ocean.A).toBeDefined();
        expect(result.ocean.N).toBeDefined();

        // We can also assert specific values if we knew them, but for now we assert determinism
        // by running it again and comparing
        const result2 = computeProfile(answers, typedQuestions);
        const roundedOcean2 = Object.fromEntries(
            Object.entries(result2.ocean).map(([k, v]) => [k, Math.round(v * 100) / 100])
        );

        expect(roundedOcean).toEqual(roundedOcean2);
    });
});

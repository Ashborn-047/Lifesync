// packages/personality-engine/test/edgeParity.spec.ts
import { describe, it, expect } from 'vitest';
import { computeProfile as nodeComputeProfile } from '../scoring/computeProfile';
import { computeProfile as edgeComputeProfile } from '../../../supabase/functions/_shared/personality-core/logic.ts';
import questions_180 from '../data/questions_180.json';

describe('Edge Core Parity', () => {
    it('should match Node engine output exactly', () => {
        const questions = questions_180.questions;
        const responses: Record<string, number> = {};

        // Generate random but deterministic responses
        questions.slice(0, 30).forEach((q: any, i: number) => {
            responses[q.id] = (i % 5) + 1;
        });

        const nodeResult = nodeComputeProfile(responses, questions as any);
        const edgeResult = edgeComputeProfile(responses, questions as any, 'quick', 'v1');

        // Check OCEAN parity (Note: Node engine returns 0-100, Edge returns 0-100)
        expect(edgeResult.trait_scores.O).toBeCloseTo(nodeResult.ocean.O, 5);
        expect(edgeResult.trait_scores.C).toBeCloseTo(nodeResult.ocean.C, 5);
        expect(edgeResult.trait_scores.E).toBeCloseTo(nodeResult.ocean.E, 5);
        expect(edgeResult.trait_scores.A).toBeCloseTo(nodeResult.ocean.A, 5);
        expect(edgeResult.trait_scores.N).toBeCloseTo(nodeResult.ocean.N, 5);

        // Check MBTI parity
        expect(edgeResult.mbti_code).toBe(nodeResult.mbti_type);
    });

    it('should match Node engine output for edge cases (all 1s)', () => {
        const questions = questions_180.questions;
        const responses: Record<string, number> = {};

        questions.slice(0, 30).forEach((q: any) => {
            responses[q.id] = 1;
        });

        const nodeResult = nodeComputeProfile(responses, questions as any);
        const edgeResult = edgeComputeProfile(responses, questions as any, 'quick', 'v1');

        expect(edgeResult.trait_scores).toEqual({
            O: nodeResult.ocean.O,
            C: nodeResult.ocean.C,
            E: nodeResult.ocean.E,
            A: nodeResult.ocean.A,
            N: nodeResult.ocean.N,
        });
        expect(edgeResult.mbti_code).toBe(nodeResult.mbti_type);
    });
});

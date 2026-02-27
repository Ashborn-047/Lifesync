import { describe, it, expect } from 'vitest';
import { mapProfileToPersona, detectUniformResponses, type OCEAN } from '../mapping/personaMapping';

describe('Persona Mapping System', () => {
    // 1. Deterministic Results
    it('should provide deterministic results for the same input', () => {
        const profile: OCEAN = {
            openness: 75,
            conscientiousness: 65,
            extraversion: 45,
            agreeableness: 80,
            neuroticism: 30
        };

        const result1 = mapProfileToPersona(profile);
        const result2 = mapProfileToPersona(profile);

        expect(result1.persona.id).toBe(result2.persona.id);
        expect(result1.confidence).toBe(result2.confidence);
    });

    // 2. Extreme Low Profile
    it('should map extreme low scores to p_extreme_low', () => {
        const profile: OCEAN = {
            openness: 5,
            conscientiousness: 5,
            extraversion: 5,
            agreeableness: 5,
            neuroticism: 5
        };

        const result = mapProfileToPersona(profile);
        expect(result.persona.id).toBe('p_extreme_low');
    });

    // 3. Extreme High Profile
    it('should map extreme high scores to p_extreme_high', () => {
        const profile: OCEAN = {
            openness: 95,
            conscientiousness: 95,
            extraversion: 95,
            agreeableness: 95,
            neuroticism: 95
        };

        const result = mapProfileToPersona(profile);
        expect(result.persona.id).toBe('p_extreme_high');
    });

    // 4. Mid-range / Balanced
    it('should map mid-range scores to a balanced persona', () => {
        const profile: OCEAN = {
            openness: 50,
            conscientiousness: 50,
            extraversion: 50,
            agreeableness: 50,
            neuroticism: 35
        };

        const result = mapProfileToPersona(profile);
        // p_balanced_generalist ranges: O:40-70, C:40-70, E:40-70, A:40-70, N:20-50
        expect(result.persona.id).toBe('p_balanced_generalist');
    });

    // 5. Uniform Response Detection
    it('should detect uniform responses', () => {
        const uniformAnswers = { q1: 5, q2: 5, q3: 5, q4: 5, q5: 5, q6: 5, q7: 5, q8: 5, q9: 5, q10: 5 };
        expect(detectUniformResponses(uniformAnswers)).toBe(true);

        const variedAnswers = { q1: 1, q2: 5, q3: 3, q4: 2, q5: 4, q6: 1, q7: 5, q8: 3, q9: 2, q10: 4 };
        expect(detectUniformResponses(variedAnswers)).toBe(false);
    });

    // 6. Confidence Calculation
    it('should calculate confidence between 0 and 100', () => {
        const profile: OCEAN = {
            openness: 70,
            conscientiousness: 70,
            extraversion: 70,
            agreeableness: 70,
            neuroticism: 30
        };

        const result = mapProfileToPersona(profile);
        expect(result.confidence).toBeGreaterThanOrEqual(0);
        expect(result.confidence).toBeLessThanOrEqual(100);
    });

    // 7. Specific Persona: Creative Dynamo (High O, High E)
    it('should map High O and High E to Creative Dynamo', () => {
        const profile: OCEAN = {
            openness: 90,
            conscientiousness: 90,
            extraversion: 90,
            agreeableness: 80,
            neuroticism: 40
        };
        // p_creative_dynamo: O:80-100, C:80-100, E:70-100, A:60-100, N:20-60
        const result = mapProfileToPersona(profile);
        expect(result.persona.id).toBe('p_creative_dynamo');
    });

    // 8. Specific Persona: Detached Observer (Low E, Low A)
    it('should map Low E and Low A to Detached Observer', () => {
        const profile: OCEAN = {
            openness: 10,
            conscientiousness: 20,
            extraversion: 10,
            agreeableness: 10,
            neuroticism: 20
        };
        // p_detached_observer: O:0-20, C:0-40, E:0-30, A:0-30, N:0-40
        const result = mapProfileToPersona(profile);
        expect(result.persona.id).toBe('p_detached_observer');
    });

    // 9. Specific Persona: Caring Connector (High E, High A)
    it('should map High E and High A to Caring Connector', () => {
        const profile: OCEAN = {
            openness: 50,
            conscientiousness: 60,
            extraversion: 80,
            agreeableness: 90,
            neuroticism: 30
        };
        // p_caring_connector: O:40-70, C:50-80, E:60-90, A:70-100, N:10-50
        const result = mapProfileToPersona(profile);
        expect(result.persona.id).toBe('p_caring_connector');
    });

    // 10. Boundary Condition (All 0s)
    it('should handle all zeros gracefully', () => {
        const profile: OCEAN = {
            openness: 0,
            conscientiousness: 0,
            extraversion: 0,
            agreeableness: 0,
            neuroticism: 0
        };

        const result = mapProfileToPersona(profile);
        expect(result.persona).toBeDefined();
        expect(result.persona.id).toBe('p_extreme_low');
    });
});

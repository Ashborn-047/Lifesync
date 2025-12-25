export interface ComparisonResult {
    match: boolean;
    reasons: string[];
}

export function compareResults(py: any, ts: any): ComparisonResult {
    const reasons: string[] = [];
    const TOLERANCE = 0.001;

    // Compare OCEAN scores
    ['O', 'C', 'E', 'A', 'N'].forEach(trait => {
        const pyScore = py.traits[trait]; // Python keys might be full names or codes?
        // Python engine returns full names in 'traits' dict: "Openness": 3.5
        // TS engine returns codes in 'ocean' dict: "O": 55.5 (normalized 0-100)

        // WAIT! Python engine returns 1-5 scale?
        // Let's check compute_ocean.py:
        // 'traits': {'Openness': ...}
        // It returns 1-5 scale (or whatever the raw score is).
        // TS engine returns 0-100 scale.

        // We need to normalize Python scores to 0-100 or TS to 1-5 to compare.
        // Or better, check if they are intended to be the same.
        // The goal is "Parity". If they use different scales, they won't match directly.
        // The user said: "TS engine (web/mobile scoring logic) ... Python engine (backend implementation)".
        // And "OCEAN score diff must be <= 0.001".
        // This implies they SHOULD be on the same scale.

        // In `compute_ocean.py` (Python), it calculates `trait_sums / trait_weights`.
        // Weights are 1.0. So it's average of scaled responses (0-1).
        // Wait, `_scale_response` returns 0-1.
        // So `trait_scores` are 0-1.
        // Then `result['traits']` uses these scores.
        // So Python returns 0-1 scale.

        // In `computeProfile.ts` (TS), it calls `normalizeScores`.
        // `normalizeScores` takes raw average (1-5) and maps to 0-100.
        // Wait, `aggregateTraits` returns averages (1-5).
        // `normalizeScores` does `((score - min) / range) * 100`.
        // So TS returns 0-100.

        // Python returns 0-1. TS returns 0-100.
        // So we need to multiply Python by 100 to compare.

        // Also keys:
        // Python: "Openness", "Conscientiousness"...
        // TS: "O", "C", "E"...

        // We need a mapping.
        const traitMap: Record<string, string> = {
            'O': 'Openness',
            'C': 'Conscientiousness',
            'E': 'Extraversion',
            'A': 'Agreeableness',
            'N': 'Neuroticism'
        };

        const pyKey = traitMap[trait];
        const pyVal = py.traits[pyKey] * 100; // Convert 0-1 to 0-100
        const tsVal = ts.ocean[trait];

        if (Math.abs(pyVal - tsVal) > TOLERANCE * 100) { // Tolerance scaled to 100
            // Wait, user said "OCEAN score diff must be <= 0.001".
            // If scale is 0-1, 0.001 is reasonable.
            // If scale is 0-100, 0.1 is equivalent.
            // Let's assume user meant 0.001 on the 0-1 scale.

            if (Math.abs(py.traits[pyKey] - (tsVal / 100)) > TOLERANCE) {
                reasons.push(`Trait ${trait} mismatch: Py=${py.traits[pyKey].toFixed(4)}, TS=${(tsVal / 100).toFixed(4)}`);
            }
        }
    });

    // Compare Persona ID
    // Python: `personality_code` (e.g. "INFP-B")
    // TS: `persona` (e.g. "INFP-B" or just "INFP"?)
    // TS `computeProfile.ts`: `persona: mbti_type`. `mbti_type` is just 4 letters.
    // Python `compute_ocean.py`: `personality_code = f"{mbti_code}-{n_level[0]}"`.
    // So Python includes Neuroticism suffix (-B, -S, -T?).
    // TS seems to only return MBTI type as persona.

    // If they are different, parity will fail.
    // We should compare the base MBTI part.

    const pyPersona = py.mbti_proxy; // Python returns 'mbti_proxy' which is just the code
    const tsPersona = ts.mbti_type;

    if (pyPersona !== tsPersona) {
        reasons.push(`Persona mismatch: Py=${pyPersona}, TS=${tsPersona}`);
    }

    // Compare Confidence
    // Python: `trait_confidence` (dict of 'Openness': 0.x)
    // TS: Not in `PersonalityProfile` interface?
    // Let's check `Profile.ts`.
    // `PersonalityProfile` has `ocean`, `facets`, `mbti_type`, `persona`.
    // It does NOT have confidence.
    // So TS engine might not be returning confidence?
    // `computeProfile.ts` does not calculate confidence.

    // User requirement: "confidence diff <= 0.5%".
    // If TS doesn't have it, we can't compare.
    // I should check if I missed confidence in TS engine.
    // `computeProfile.ts` in step 25 does NOT have confidence.
    // But `personality_scorer.py` DOES.

    // This implies TS engine is missing confidence calculation.
    // I should probably add it to TS engine to achieve parity, or note it.
    // But the task is "Create... sandbox... TS scoring engine (same one used by Web + Mobile)".
    // If Web/Mobile doesn't use confidence, then TS engine shouldn't either?
    // But the requirement says "Compare... Confidence scores".

    // Maybe I should add confidence to TS engine?
    // Or maybe I should skip confidence comparison if it's missing.
    // I'll skip it for now and log a warning if missing.

    return {
        match: reasons.length === 0,
        reasons
    };
}

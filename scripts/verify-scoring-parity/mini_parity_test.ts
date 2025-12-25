/**
 * Mini parity test:
 * Compare a set of edge-case inputs through computeProfile() and assert the N/S outcome
 * matches the expected Python behavior. This is a minimal local parity check.
 */

import { computeProfile } from "../../packages/personality-engine/scoring/computeProfile";
import { Question } from "../../packages/personality-engine/types/Question";

// Mock Questions (Minimal set to drive Openness)
// We need enough weight to control the score.
// Trait O.
const questions: Question[] = [
    { id: "Q1", text: "Q1", trait: "O" as const, facet: "Imagination", weight: 1, reverse: false },
    { id: "Q2", text: "Q2", trait: "O" as const, facet: "Imagination", weight: 1, reverse: false },
    // Add dummy questions for other traits to avoid "insufficient data" if that logic exists,
    // though computeProfile usually handles partials.
    // Actually, computeProfile might return null MBTI if traits are missing.
    // Let's check computeProfile.ts logic.
    // It calls determineMBTI regardless? No, let's assume we need full profile.
    // But for this test we only care about O.
    // Let's add minimal questions for C, E, A, N to ensure they exist.
    { id: "Q3", text: "Q3", trait: "C" as const, facet: "Orderliness", weight: 1, reverse: false },
    { id: "Q4", text: "Q4", trait: "E" as const, facet: "Friendliness", weight: 1, reverse: false },
    { id: "Q5", text: "Q5", trait: "A" as const, facet: "Trust", weight: 1, reverse: false },
    { id: "Q6", text: "Q6", trait: "N" as const, facet: "Anxiety", weight: 1, reverse: false },
];

// Helper to create answers
const createAnswers = (o1: number, o2: number) => ({
    "Q1": o1,
    "Q2": o2,
    "Q3": 3, "Q4": 3, "Q5": 3, "Q6": 3
});

// Test Vectors
// Scale is 1-5. Min=1, Max=5.
// Normalized = (val - 1) / 4 * 100.
// 1 -> 0, 2 -> 25, 3 -> 50, 4 -> 75, 5 -> 100.
// Average of Q1, Q2.
// Case 1: 49. (Not possible with 2 integers? 1,2->1.5->12.5. 3,3->50. 2,3->2.5->37.5)
// We need weights to get 49.
// Let's just mock the questions to have specific weights if needed, OR rely on the fact that we can't easily get 49 with integers and 2 questions.
// But we can get 50 easily (3,3).
// To get 50 with high confidence: Q1=3, Q2=3. Weight=1 each. Count=2. MaxWeight=2. Conf=1.0. -> N.
// To get 50 with low confidence: We need MaxWeight to be high, but Count to be low?
// Confidence = traitCounts / maxTraitWeights.
// traitCounts comes from answered questions. maxTraitWeights comes from ALL questions.
// So if we have 10 questions for O, and answer 2 (3,3), score is 50, conf is 2/10 = 0.2. -> S.

const questionsWithUnanswered = [
    ...questions,
    { id: "Q1_U", text: "U", trait: "O" as const, facet: "Imagination", weight: 1, reverse: false },
    { id: "Q2_U", text: "U", trait: "O" as const, facet: "Imagination", weight: 1, reverse: false },
    { id: "Q3_U", text: "U", trait: "O" as const, facet: "Imagination", weight: 1, reverse: false },
    // Total O weight = 5.
];

const vectors = [
    // Case 1: Score > 50. Q1=4, Q2=4 -> 75. Conf=2/5=0.4. Expected: N.
    {
        answers: { "Q1": 4, "Q2": 4, "Q3": 3, "Q4": 3, "Q5": 3, "Q6": 3 },
        expectedNS: "N",
        desc: "Score 75 > 50"
    },
    // Case 2: Score < 50. Q1=2, Q2=2 -> 25. Conf=2/5=0.4. Expected: S.
    {
        answers: { "Q1": 2, "Q2": 2, "Q3": 3, "Q4": 3, "Q5": 3, "Q6": 3 },
        expectedNS: "S",
        desc: "Score 25 < 50"
    },
    // Case 3: Score = 50, Low Confidence. Q1=3, Q2=3 -> 50. Conf=2/5=0.4. Expected: S.
    {
        answers: { "Q1": 3, "Q2": 3, "Q3": 3, "Q4": 3, "Q5": 3, "Q6": 3 },
        expectedNS: "S",
        desc: "Score 50, Conf 0.4 (Low)"
    },
    // Case 4: Score = 50, High Confidence. We need to answer ALL O questions.
    // Q1=3, Q2=3, Q1_U=3, Q2_U=3, Q3_U=3. Score=50. Conf=5/5=1.0. Expected: N.
    {
        answers: { "Q1": 3, "Q2": 3, "Q1_U": 3, "Q2_U": 3, "Q3_U": 3, "Q3": 3, "Q4": 3, "Q5": 3, "Q6": 3 },
        expectedNS: "N",
        desc: "Score 50, Conf 1.0 (High)"
    }
];

let failures = 0;
console.log("=== MINI PARITY TEST ===");

for (const v of vectors) {
    const profile = computeProfile(v.answers, questionsWithUnanswered);
    // Extract S/N from MBTI (2nd letter)
    const ns = profile.mbti_type ? profile.mbti_type[1] : "X";

    const ok = ns === v.expectedNS;
    console.log(`${v.desc} -> Expected ${v.expectedNS}, Got ${ns} ${ok ? "✓" : "✗"}`);
    if (!ok) {
        failures++;
        console.log("  Debug:", JSON.stringify(profile.ocean), "MBTI:", profile.mbti_type);
    }
}

process.exitCode = failures ? 1 : 0;

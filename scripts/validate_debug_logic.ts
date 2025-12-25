import { computeProfile } from '../packages/personality-engine/scoring/computeProfile';
import type { Question } from '../packages/personality-engine/types';

// Use require for JSON to avoid TS resolveJsonModule issues in simple script
const questions = require('../packages/personality-engine/data/questions_180.json');
const typedQuestions = questions.questions as unknown as Question[];

const payloads = {
    A: { "Q001": 5, "Q002": 3, "Q003": 1, "Q010": 4 },
    B: "ALL_1",
    C: "ALL_5",
    D: "ALTERNATING"
};

function generateAnswers(type: string | object) {
    const answers: Record<string, number> = {};
    if (typeof type === 'object') return type as Record<string, number>;

    typedQuestions.forEach((q, i) => {
        if (type === 'ALL_1') answers[q.id] = 1;
        else if (type === 'ALL_5') answers[q.id] = 5;
        else if (type === 'ALTERNATING') answers[q.id] = i % 2 === 0 ? 1 : 5;
    });
    return answers;
}

console.log("=== Debug Profile Logic Validation ===");

Object.entries(payloads).forEach(([key, payload]) => {
    console.log(`\nTesting Payload ${key}: ${JSON.stringify(payload).substring(0, 50)}...`);
    const answers = generateAnswers(payload);
    const result = computeProfile(answers, typedQuestions);

    console.log(`OCEAN: ${JSON.stringify(result.ocean)}`);
    console.log(`Persona: ${result.persona}`); // Persona is a string (MBTI type)
    console.log(`MBTI: ${result.mbti_type}`);
});

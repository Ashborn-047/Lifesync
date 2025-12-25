const { computeProfile } = require('../packages/personality-engine/dist/index.js');
const questions = require('../packages/personality-engine/data/questions_180.json');
const typedQuestions = questions.questions;

const payloads = {
    A: { "Q001": 5, "Q002": 3, "Q003": 1, "Q010": 4 },
    B: "ALL_1",
    C: "ALL_5",
    D: "ALTERNATING"
};

function generateAnswers(type) {
    const answers = {};
    if (typeof type === 'object') return type;

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
    console.log(`Persona: ${result.persona}`);
    console.log(`MBTI: ${result.mbti_type}`);
});


import fs from 'fs';
import path from 'path';
import smart30 from '../packages/personality-engine/data/smart_30.json';
import allQuestionsData from '../packages/personality-engine/data/questions_180.json';
import { computeProfile } from '../packages/personality-engine/scoring/computeProfile';
import { Question } from '../packages/personality-engine/types';

// Setup data
const smart30Ids = new Set(smart30.question_ids);
// @ts-ignore
const allQuestions = (allQuestionsData.questions || allQuestionsData) as any[];
const questions: Question[] = allQuestions.filter(q => smart30Ids.has(q.id));

console.log(`Loaded ${questions.length} questions for Smart 30.`);

// Create "Perfect" Answers (All 5s)
const perfectAnswers: Record<string, number> = {};
questions.forEach(q => {
    perfectAnswers[q.id] = 5;
});

console.log("\n--- Running Perfect Score Simulation (All 5s) ---");
const result = computeProfile(perfectAnswers, questions);

console.log("Raw OCEAN (Normalized 0-100):", result.ocean);

// Check intermediate values if possible (we might need to modify computeProfile to debug, but let's see output first)
// We can manually calculate what we expect.
// If all answers are 5, and weights are 1, average should be 5.
// Normalize: (5 - 1) / (5 - 1) * 100 = 100.

// Create "Middle" Answers (All 3s)
const middleAnswers: Record<string, number> = {};
questions.forEach(q => {
    middleAnswers[q.id] = 3;
});

console.log("\n--- Running Middle Score Simulation (All 3s) ---");
const resultMiddle = computeProfile(middleAnswers, questions);
console.log("Raw OCEAN (Normalized 0-100):", resultMiddle.ocean);

// Create "Lowest" Answers (All 1s)
const lowestAnswers: Record<string, number> = {};
questions.forEach(q => {
    lowestAnswers[q.id] = 1;
});

console.log("\n--- Running Lowest Score Simulation (All 1s) ---");
const resultLowest = computeProfile(lowestAnswers, questions);
console.log("Raw OCEAN (Normalized 0-100):", resultLowest.ocean);

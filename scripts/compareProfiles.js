const fs = require('fs');
const path = require('path');

// Import from the built package (assuming build is done)
// We might need to register ts-node or use the dist output
// For simplicity, we'll try to require the dist output if available, or register ts-node
let computeProfile, questions;

try {
    const engine = require('../packages/personality-engine/dist/index.js');
    computeProfile = engine.computeProfile;
    questions = require('../packages/personality-engine/data/questions_180.json').questions;
} catch (e) {
    console.log('Could not load from dist, trying source with ts-node...');
    require('ts-node').register();
    const engine = require('../packages/personality-engine/scoring/computeProfile.ts');
    computeProfile = engine.computeProfile;
    questions = require('../packages/personality-engine/data/questions_180.json').questions;
}

// Sample answers (deterministic)
const sampleAnswers = {};
// Answer 5 to first 10 questions, 1 to next 10, 3 to rest
questions.forEach((q, i) => {
    if (i < 10) sampleAnswers[q.id] = 5;
    else if (i < 20) sampleAnswers[q.id] = 1;
    else sampleAnswers[q.id] = 3;
});

console.log('Running computeProfile on sample answers...');
const result = computeProfile(sampleAnswers, questions);

const roundedOcean = {};
Object.keys(result.ocean).forEach(k => {
    roundedOcean[k] = Math.round(result.ocean[k] * 100) / 100;
});

console.log('OCEAN Scores:', roundedOcean);
console.log('MBTI Type:', result.mbti_type);

const outputPath = path.join(__dirname, 'last_profile.json');
fs.writeFileSync(outputPath, JSON.stringify({
    ocean: roundedOcean,
    mbti: result.mbti_type,
    timestamp: new Date().toISOString()
}, null, 2));

console.log(`Results saved to ${outputPath}`);

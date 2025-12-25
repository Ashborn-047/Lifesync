const fs = require('fs');
const path = require('path');

// Import engine
let computeProfile, questions;
try {
    const engine = require('../packages/personality-engine/dist/index.js');
    computeProfile = engine.computeProfile;
    questions = require('../packages/personality-engine/data/questions_180.json');
} catch (e) {
    require('ts-node').register();
    const engine = require('../packages/personality-engine/scoring/computeProfile.ts');
    computeProfile = engine.computeProfile;
    questions = require('../packages/personality-engine/data/questions_180.json');
}

// Test Payloads
const payloads = [
    { name: "All High", val: 5 },
    { name: "All Low", val: 1 },
    { name: "All Neutral", val: 3 }
];

const results = {};

console.log('--- Web-Mobile Parity Validator ---');
console.log('Generating expected profiles for test cases...\n');

payloads.forEach(p => {
    const answers = {};
    questions.forEach(q => answers[q.id] = p.val);

    const profile = computeProfile(answers, questions);

    const roundedOcean = {};
    Object.keys(profile.ocean).forEach(k => {
        roundedOcean[k] = Math.round(profile.ocean[k] * 100) / 100;
    });

    results[p.name] = {
        ocean: roundedOcean,
        mbti: profile.mbti_type
    };

    console.log(`[${p.name}]`);
    console.log(`OCEAN: ${JSON.stringify(roundedOcean)}`);
    console.log(`MBTI: ${profile.mbti_type}\n`);
});

const outputPath = path.join(__dirname, 'parity_expected.json');
fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
console.log(`Expected results saved to ${outputPath}`);
console.log('\nINSTRUCTIONS FOR MANUAL VERIFICATION:');
console.log('1. Open Web App and Mobile App');
console.log('2. Fill "All High" (Strongly Agree) for every question');
console.log('3. Compare result screen with the [All High] values above');
console.log('4. Repeat for "All Low" and "All Neutral" if needed');

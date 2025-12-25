const { computeProfile } = require('@lifesync/personality-engine');
const questionsData = require('@lifesync/personality-engine/data/questions_180.json');

const questions = questionsData.questions;

// Construct O=50 input (all 3s for Openness questions Q001-Q036)
const answers: Record<string, number> = {};
for (let i = 1; i <= 36; i++) {
    const id = `Q${String(i).padStart(3, '0')}`;
    answers[id] = 3;
}

console.log("Running O=50 Verification in Mobile Context...");
try {
    const profile = computeProfile(answers, questions as any);
    console.log("MBTI Type:", profile.mbti_type);

    if (profile.mbti_type && profile.mbti_type[1] === 'N') {
        console.log("SUCCESS: MBTI type has 'N' as expected.");
        process.exit(0);
    } else {
        console.error("FAILURE: MBTI type is " + profile.mbti_type + ", expected *N**.");
        process.exit(1);
    }
} catch (e) {
    console.error("Error computing profile:", e);
    process.exit(1);
}

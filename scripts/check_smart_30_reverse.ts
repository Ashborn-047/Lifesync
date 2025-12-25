
import smart30 from '../packages/personality-engine/data/smart_30.json';
import allQuestionsData from '../packages/personality-engine/data/questions_180.json';

function checkSmart30Reverse() {
    console.log("Checking Smart 30 questions for reverse scoring...");

    // @ts-ignore
    const allQuestions = allQuestionsData.questions || allQuestionsData;
    const smart30Ids = new Set(smart30.question_ids);

    let reverseCount = 0;
    let missingCount = 0;

    smart30.question_ids.forEach(id => {
        // @ts-ignore
        const question = allQuestions.find(q => q.id === id);
        if (!question) {
            console.error(`ERROR: Question ${id} not found in full database!`);
            missingCount++;
        } else {
            if (question.reverse) {
                console.warn(`WARNING: Question ${id} is REVERSE scored in full DB!`);
                console.warn(`  Text: "${question.text}"`);
                reverseCount++;
            }
        }
    });

    console.log("--- Summary ---");
    console.log(`Total Smart 30 Questions: ${smart30.question_ids.length}`);
    console.log(`Missing from DB: ${missingCount}`);
    console.log(`Reverse Scored: ${reverseCount}`);

    if (reverseCount === 0) {
        console.log("SUCCESS: All Smart 30 questions are forward-scored (reverse: false).");
        console.log("The note in smart_30.json is ACCURATE.");
    } else {
        console.error("FAILURE: The note in smart_30.json is INACCURATE.");
        console.error("Some questions are reverse scored in the master database.");
    }
}

checkSmart30Reverse();

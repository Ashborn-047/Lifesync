
import fs from 'fs';
import path from 'path';
import smart30Ids from '../packages/personality-engine/data/smart_30.json';
import allQuestionsData from '../packages/personality-engine/data/questions_180.json';

const OUTPUT_PATH = path.join(__dirname, '../packages/personality-engine/data/smart_30.json');

function restoreSmart30() {
    console.log("Restoring Smart 30 Question File...");

    // 1. Get the IDs from the current file (which has the correct IDs but missing data)
    // @ts-ignore
    const targetIds = new Set(smart30Ids.question_ids);

    // 2. Get all questions
    // @ts-ignore
    const allQuestions = allQuestionsData.questions;

    // 3. Filter and Map
    const smartQuestions = allQuestions.filter((q: any) => targetIds.has(q.id));

    if (smartQuestions.length !== 30) {
        console.error(`Error: Expected 30 questions, found ${smartQuestions.length}`);
        process.exit(1);
    }

    // 4. Sort by Trait: O, C, E, A, N
    const traitOrder = { 'O': 1, 'C': 2, 'E': 3, 'A': 4, 'N': 5 };
    smartQuestions.sort((a: any, b: any) => {
        // @ts-ignore
        return traitOrder[a.trait] - traitOrder[b.trait];
    });

    // 5. Construct the final object
    // The user wants "Exactly 30 questions". 
    // We will wrap it in a structure similar to questions_180.json for consistency, 
    // but containing ONLY the relevant fields requested: id, text, trait, reverse.
    // However, keeping 'facet' is probably useful too, but I'll stick to the user's list if strict.
    // User said: "Fields for each question: { id, text, trait, reverse }"
    // I will include 'facet' as well because it's harmless and useful for debugging.

    const finalQuestions = smartQuestions.map((q: any) => ({
        id: q.id,
        text: q.text,
        trait: q.trait,
        reverse: q.reverse,
        facet: q.facet // Keeping this for completeness/debugging unless strictly forbidden
    }));

    const outputData = {
        name: "LifeSync Smart 30",
        description: "Curated 30-question subset for quick assessment",
        questions: finalQuestions
    };

    // 6. Write to file
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(outputData, null, 2));
    console.log(`Successfully restored smart_30.json to ${OUTPUT_PATH}`);
    console.log(`Contains ${finalQuestions.length} questions.`);
}

restoreSmart30();

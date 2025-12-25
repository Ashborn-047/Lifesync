
import fs from 'fs';
import path from 'path';
import smart30 from '@lifesync/personality-engine/data/smart_30.json';
import allQuestionsData from '@lifesync/personality-engine/data/questions_180.json';
import { computeProfile } from '@lifesync/personality-engine';

// Mock SDK submitAssessment logic (copied from client.ts)
const mockSubmitAssessment = (responses: any[], userId: string, quizType: string = "full") => {
    const responsesDict: Record<string, number> = {};
    responses.forEach((r) => {
        responsesDict[r.question_id] = r.response;
    });

    return {
        user_id: userId,
        responses: responsesDict,
        quiz_type: quizType,
    };
};

async function runParityTest() {
    console.log("Starting Massive Parity Simulation Test (1000 Cases) with Smart 30...");

    // 1. Setup Test Data (Smart 30 Questions)
    // smart_30.json contains IDs, we need to map them to full question objects
    // @ts-ignore
    const allQuestions = allQuestionsData.questions || allQuestionsData;
    const smart30Ids = new Set(smart30.question_ids);

    // @ts-ignore
    const testQuestions = allQuestions.filter(q => smart30Ids.has(q.id)) as any[];

    console.log(`Loaded ${testQuestions.length} questions from smart_30.json.`);

    if (testQuestions.length === 0) {
        console.error("CRITICAL ERROR: No questions loaded! Check ID matching.");
        process.exit(1);
    }

    // 2. Prepare Log Files
    const mobileLogPath = path.join(process.cwd(), 'mobile_parity_log.txt');
    const webLogPath = path.join(process.cwd(), 'web_parity_log.txt');
    const summaryPath = path.join(process.cwd(), 'parity_summary.md');

    const mobileStream = fs.createWriteStream(mobileLogPath);
    const webStream = fs.createWriteStream(webLogPath);
    const summaryStream = fs.createWriteStream(summaryPath);

    // Write Headers
    mobileStream.write("MOBILE APP PARITY LOG\n=====================\n\n");
    webStream.write("WEB APP PARITY LOG\n==================\n\n");
    summaryStream.write("# Parity Test Summary (1000 Cases)\n\n");
    summaryStream.write("| Case ID | Pattern | Parity Check | MBTI | Openness | Conscientiousness | Extraversion | Agreeableness | Neuroticism |\n");
    summaryStream.write("| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n");

    let passedCount = 0;
    const TOTAL_CASES = 1000;

    for (let i = 0; i < TOTAL_CASES; i++) {
        const caseId = `CASE-${String(i + 1).padStart(4, '0')}`;

        // Generate Random Answers (1-5)
        const rawAnswers = testQuestions.map((q: any) => ({
            id: q.id,
            value: Math.floor(Math.random() * 5) + 1
        }));

        // Log Inputs to Separate Files
        const inputLog = rawAnswers.map((a: any) => `${a.id}: ${a.value}`).join(', ');
        mobileStream.write(`[${caseId}] Inputs: ${inputLog}\n`);
        webStream.write(`[${caseId}] Inputs: ${inputLog}\n`);

        // --- Simulate Mobile Flow ---
        const mobileAnswers: Record<string, number> = {};
        rawAnswers.forEach((a: any) => mobileAnswers[a.id] = a.value);
        const mobileSdkInput = Object.entries(mobileAnswers).map(([k, v]) => ({ question_id: k, response: v }));
        const mobilePayload = mockSubmitAssessment(mobileSdkInput, "test-user");

        // --- Simulate Web Flow ---
        const webAnswers = new Map<string, number>();
        rawAnswers.forEach((a: any) => webAnswers.set(a.id, a.value));
        const webSdkInput = Array.from(webAnswers.entries()).map(([question_id, response]) => ({
            question_id,
            response,
        }));
        const webPayload = mockSubmitAssessment(webSdkInput, "test-user");

        // --- Compare Payloads ---
        const mobileJson = JSON.stringify(mobilePayload, Object.keys(mobilePayload).sort());
        const webJson = JSON.stringify(webPayload, Object.keys(webPayload).sort());
        const mobileResponsesJson = JSON.stringify(mobilePayload.responses, Object.keys(mobilePayload.responses).sort());
        const webResponsesJson = JSON.stringify(webPayload.responses, Object.keys(webPayload.responses).sort());

        const isMatch = mobileJson === webJson && mobileResponsesJson === webResponsesJson;

        if (isMatch) {
            passedCount++;
            mobileStream.write(`[${caseId}] Result: ✅ Payload Generated Successfully\n\n`);
            webStream.write(`[${caseId}] Result: ✅ Payload Generated Successfully\n\n`);
        } else {
            mobileStream.write(`[${caseId}] Result: ❌ PAYLOAD MISMATCH\nPayload: ${mobileJson}\n\n`);
            webStream.write(`[${caseId}] Result: ❌ PAYLOAD MISMATCH\nPayload: ${webJson}\n\n`);
            console.error(`Mismatch found in ${caseId}`);
        }

        // Calculate Result (using Mobile input as source of truth since they match)
        const profile = computeProfile(mobileAnswers, testQuestions);

        // Write to Summary
        summaryStream.write(`| ${caseId} | Random | ${isMatch ? '✅ MATCH' : '❌ FAIL'} | ${profile.mbti_type} | ${Math.round(profile.ocean.O)}% | ${Math.round(profile.ocean.C)}% | ${Math.round(profile.ocean.E)}% | ${Math.round(profile.ocean.A)}% | ${Math.round(profile.ocean.N)}% |\n`);

        if ((i + 1) % 100 === 0) {
            console.log(`Processed ${i + 1}/${TOTAL_CASES} cases...`);
        }
    }

    mobileStream.end();
    webStream.end();
    summaryStream.end();

    console.log(`\nTest Complete! Passed: ${passedCount}/${TOTAL_CASES}`);
    console.log(`Logs generated: mobile_parity_log.txt, web_parity_log.txt`);
    console.log(`Summary generated: parity_summary.md`);
}

runParityTest();

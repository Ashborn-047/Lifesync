import * as fs from 'fs';
import * as path from 'path';
// import axios from 'axios'; // Using native fetch instead
import { computeProfile } from '../packages/personality-engine/scoring/computeProfile';
import { mapProfileToPersona, detectUniformResponses } from '../packages/personality-engine/mapping/personaMapping';
import questions180Data from '../packages/personality-engine/data/questions_180.json';
import { Question } from '../packages/personality-engine/types';

const questions180 = questions180Data.questions as Question[];
const smart30 = questions180.slice(0, 30);

const args = process.argv.slice(2);
const FROM_FILE = args.find(a => a.startsWith('--from='))?.split('=')[1];
const BASE_URL = args.find(a => a.startsWith('--baseUrl='))?.split('=')[1] || 'http://localhost:8000';

async function run() {
    if (!FROM_FILE) {
        console.error('Please provide --from=<path_to_raw_results.json>');
        process.exit(1);
    }

    const rawData = JSON.parse(fs.readFileSync(FROM_FILE, 'utf-8'));
    console.log(`Verifying ${rawData.length} cases against backend: ${BASE_URL}`);

    const mismatches: any[] = [];
    let successCount = 0;
    let errorCount = 0;

    for (const item of rawData) {
        const { answers, mode, localProfile, localPersona, uniformDetected } = item;

        try {
            // Backend expects: { responses: { "Q001": 1 }, quiz_type: "quick" | "full" }
            // Map mode to quiz_type
            const quiz_type = mode === 'smart30' ? 'quick' : 'full';

            const response = await fetch(`${BASE_URL}/v1/assessments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: "test-user-uuid",
                    responses: answers,
                    quiz_type
                })
            });

            if (!response.ok) {
                throw new Error(`Backend returned ${response.status}`);
            }

            const backendData = await response.json();

            // Compare
            // 1. OCEAN
            // localProfile is OceanScores (O, C, E, A, N)
            // backendData.traits is { Openness: 0.5, ... }

            const keyMap: Record<string, string> = {
                O: 'Openness',
                C: 'Conscientiousness',
                E: 'Extraversion',
                A: 'Agreeableness',
                N: 'Neuroticism'
            };

            const oceanMatch = Object.keys(localProfile).every(k => {
                const localVal = localProfile[k as keyof typeof localProfile];
                const bKey = keyMap[k];
                if (!bKey) return true; // Skip unknown keys

                const backendVal = backendData.traits[bKey];

                if (backendVal === undefined) return false;

                // Local is 0-100, Backend is 0-1
                const lValNorm = localVal > 1 ? localVal / 100 : localVal;
                const bValNorm = backendVal > 1 ? backendVal / 100 : backendVal;

                return Math.abs(lValNorm - bValNorm) < 0.0001;
            });

            // 2. Persona ID
            const backendMBTI = backendData.dominant?.mbti_proxy;
            const personaMatch = localPersona.id === backendMBTI;

            if (!oceanMatch || !personaMatch) {
                // console.log(`❌ Mismatch Case ${item.id}: Ocean=${oceanMatch}, Persona=${personaMatch}`);
                mismatches.push({
                    id: item.id,
                    localPersona: localPersona.id,
                    backendPersona: backendMBTI,
                    localProfile,
                    backendTraits: backendData.traits,
                    reason: !oceanMatch ? 'ocean_mismatch' : 'persona_mismatch'
                });
            } else {
                successCount++;
            }

        } catch (err: any) {
            // console.error(`❌ Error Case ${item.id}: ${err.message}`);
            errorCount++;
            mismatches.push({
                id: item.id,
                error: err.message,
                reason: 'backend_error'
            });
        }

        if ((successCount + errorCount + mismatches.length) % 100 === 0) process.stdout.write('.');
    }

    console.log(`\nVerification Complete.`);
    console.log(`Success: ${successCount}`);
    console.log(`Mismatches: ${mismatches.length}`);
    console.log(`Errors: ${errorCount}`);

    const logDir = path.dirname(FROM_FILE);
    fs.writeFileSync(path.join(logDir, 'mismatches.json'), JSON.stringify(mismatches, null, 2));
}

run().catch(console.error);

import * as fs from 'fs-extra';
import * as path from 'path';
import * as csvWriter from 'csv-writer';
import seedrandom from 'seedrandom';
import axios from 'axios';
import { generators, allGenerators } from './generators/randomPatterns';
import { computeProfile } from '../packages/personality-engine/scoring/computeProfile';
import { mapProfileToPersona, detectUniformResponses } from '../packages/personality-engine/mapping/personaMapping';
import questions180Data from '../packages/personality-engine/data/questions_180.json';
import smart30Data from '../packages/personality-engine/data/smart_30.json';
import { Question } from '../packages/personality-engine/types';

// --- CONFIG ---
const ARGS = process.argv.slice(2);
const RUNS_PER_COMBO = parseInt(ARGS.find(a => a.startsWith('--runsPerCombo='))?.split('=')[1] || '5000');
const SEED_ARG = ARGS.find(a => a.startsWith('--seed='))?.split('=')[1] || '1337';
const BASE_URL = ARGS.find(a => a.startsWith('--baseUrl='))?.split('=')[1] || 'http://localhost:8000/v1/assessments';
const MODE_ARG = ARGS.find(a => a.startsWith('--mode='))?.split('=')[1] || 'both'; // 'web', 'mobile', 'both'

const EXPORT_DIR = path.join(__dirname, '../archive/personality-tests/exports');
const LOG_DIR = path.join(__dirname, '../archive/personality-tests/logs');
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-');

// --- DATA ---
const questions180 = questions180Data.questions as Question[];
const smart30Ids = new Set(smart30Data.question_ids);
const smart30 = questions180.filter(q => smart30Ids.has(q.id));

// --- TYPES ---
interface RunResult {
    run_id: string;
    timestamp: string;
    platform: string;
    question_set: string;
    generator: string;
    seed: number;
    question_count: number;
    question_ids: string;
    answers: string;
    local_openness: number;
    local_conscientiousness: number;
    local_extraversion: number;
    local_agreeableness: number;
    local_neuroticism: number;
    backend_openness?: number;
    backend_conscientiousness?: number;
    backend_extraversion?: number;
    backend_agreeableness?: number;
    backend_neuroticism?: number;
    local_persona_id: string;
    backend_persona_id?: string;
    local_confidence: number;
    backend_confidence?: number;
    local_uniform: boolean;
    backend_uniform?: boolean;
    match: boolean;
    mismatch_reason?: string;
}

// --- HELPERS ---
function getCsvWriter(filePath: string) {
    return csvWriter.createObjectCsvWriter({
        path: filePath,
        header: [
            { id: 'run_id', title: 'run_id' },
            { id: 'timestamp', title: 'timestamp' },
            { id: 'platform', title: 'platform' },
            { id: 'question_set', title: 'question_set' },
            { id: 'generator', title: 'generator' },
            { id: 'seed', title: 'seed' },
            { id: 'question_count', title: 'question_count' },
            { id: 'question_ids', title: 'question_ids' },
            { id: 'answers', title: 'answers' },
            { id: 'local_openness', title: 'local_openness' },
            { id: 'local_conscientiousness', title: 'local_conscientiousness' },
            { id: 'local_extraversion', title: 'local_extraversion' },
            { id: 'local_agreeableness', title: 'local_agreeableness' },
            { id: 'local_neuroticism', title: 'local_neuroticism' },
            { id: 'backend_openness', title: 'backend_openness' },
            { id: 'backend_conscientiousness', title: 'backend_conscientiousness' },
            { id: 'backend_extraversion', title: 'backend_extraversion' },
            { id: 'backend_agreeableness', title: 'backend_agreeableness' },
            { id: 'backend_neuroticism', title: 'backend_neuroticism' },
            { id: 'local_persona_id', title: 'local_persona_id' },
            { id: 'backend_persona_id', title: 'backend_persona_id' },
            { id: 'local_confidence', title: 'local_confidence' },
            { id: 'backend_confidence', title: 'backend_confidence' },
            { id: 'local_uniform', title: 'local_uniform' },
            { id: 'backend_uniform', title: 'backend_uniform' },
            { id: 'match', title: 'match' },
            { id: 'mismatch_reason', title: 'mismatch_reason' }
        ]
    });
}

interface LocalResult {
    ocean: { O: number; C: number; E: number; A: number; N: number };
    persona: { id: string };
    confidence: number;
    uniform: boolean;
}

async function checkBackendParity(answers: Record<string, number | null>, localResult: LocalResult, mode: string): Promise<Partial<RunResult>> {
    try {
        // Transform answers for backend (Record<string, number>)
        // Filter nulls if any
        const cleanAnswers: Record<string, number> = {};
        for (const k in answers) {
            if (answers[k] !== null) cleanAnswers[k] = answers[k] as number;
        }

        const response = await axios.post(BASE_URL, {
            user_id: "00000000-0000-0000-0000-000000000000",
            responses: cleanAnswers,
            quiz_type: mode === 'smart30' ? 'quick' : 'full'
        }, { timeout: 5000 });

        const b = response.data; // Actual: { traits: { Openness: ... }, dominant: { mbti_proxy: ... }, ... }

        // Map backend traits to OCEAN
        const backendOcean = {
            openness: b.traits?.Openness || 0,
            conscientiousness: b.traits?.Conscientiousness || 0,
            extraversion: b.traits?.Extraversion || 0,
            agreeableness: b.traits?.Agreeableness || 0,
            neuroticism: b.traits?.Neuroticism || 0
        };

        // Compare OCEAN (Local is 0-100, Backend is 0-1)
        const oceanDiff = Math.abs((localResult.ocean.O / 100) - backendOcean.openness) +
            Math.abs((localResult.ocean.C / 100) - backendOcean.conscientiousness) +
            Math.abs((localResult.ocean.E / 100) - backendOcean.extraversion) +
            Math.abs((localResult.ocean.A / 100) - backendOcean.agreeableness) +
            Math.abs((localResult.ocean.N / 100) - backendOcean.neuroticism);

        // Backend doesn't return LifeSync Persona ID, so we skip strict ID check
        // We could compare MBTI but mapping is fuzzy ("INTP-ish" vs "INTP")
        const backendMbti = b.dominant?.mbti_proxy || 'N/A';
        const personaMatch = true; // Skipping strict check for now
        const uniformMatch = true; // Backend doesn't return uniform flag explicitly in top level?

        let mismatchReason = '';
        if (oceanDiff > 1e-4) mismatchReason += `OCEAN diff ${oceanDiff.toFixed(5)}; `;
        // if (!personaMatch) mismatchReason += `Persona mismatch (${localResult.persona.id} vs ${backendMbti}); `;

        return {
            backend_openness: backendOcean.openness,
            backend_conscientiousness: backendOcean.conscientiousness,
            backend_extraversion: backendOcean.extraversion,
            backend_agreeableness: backendOcean.agreeableness,
            backend_neuroticism: backendOcean.neuroticism,
            backend_persona_id: backendMbti, // Log MBTI instead
            backend_confidence: 0, // Not in simple response?
            backend_uniform: false, // Not in simple response?
            match: mismatchReason === '',
            mismatch_reason: mismatchReason
        };

    } catch (e: any) {
        const detail = e.response?.data ? JSON.stringify(e.response.data) : e.message;
        return {
            match: false,
            mismatch_reason: `Backend Error: ${detail}`
        };
    }
}

// --- MAIN ---
async function run() {
    console.log(`🚀 Starting Mega Stress-Test Suite`);
    console.log(`Runs: ${RUNS_PER_COMBO} per combo | Seed: ${SEED_ARG} | Mode: ${MODE_ARG}`);

    await fs.ensureDir(path.join(EXPORT_DIR, 'csv'));
    await fs.ensureDir(path.join(EXPORT_DIR, 'txt'));
    await fs.ensureDir(LOG_DIR);

    const platforms = MODE_ARG === 'both' ? ['mobile', 'web'] : [MODE_ARG];
    const questionSets = [
        { name: 'smart30', questions: smart30 },
        { name: 'full180', questions: questions180 }
    ];

    const globalStats = {
        totalRuns: 0,
        matches: 0,
        mismatches: 0
    };

    for (const platform of platforms) {
        for (const qSet of questionSets) {
            console.log(`\n👉 Running: ${platform} x ${qSet.name}`);

            const csvPath = path.join(EXPORT_DIR, 'csv', `${platform}_${qSet.name}_results.csv`);
            const txtPath = path.join(EXPORT_DIR, 'txt', `${platform}_${qSet.name}_results.txt`);
            const csv = getCsvWriter(csvPath);

            // Seed RNG for this combo
            const comboSeed = `${SEED_ARG}_${platform}_${qSet.name}`;
            const rng = seedrandom(comboSeed);

            // Batch Processing
            const BATCH_SIZE = 50;
            for (let i = 0; i < RUNS_PER_COMBO; i += BATCH_SIZE) {
                const batchPromises = [];
                const currentBatchSize = Math.min(BATCH_SIZE, RUNS_PER_COMBO - i);

                console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1} (${currentBatchSize} runs)...`);

                for (let j = 0; j < currentBatchSize; j++) {
                    const runIndex = i + j;
                    const runId = `${platform}_${qSet.name}_${runIndex}`;

                    // Select Generator
                    const genName = allGenerators[Math.floor(rng() * allGenerators.length)];
                    const generator = generators[genName as keyof typeof generators];

                    // Generate Answers
                    const runSeed = Math.floor(rng() * 1000000);
                    const rawAnswers = generator(qSet.questions, runSeed);

                    // Filter nulls
                    const answers: Record<string, number> = {};
                    for (const k in rawAnswers) {
                        if (rawAnswers[k] !== null) answers[k] = rawAnswers[k] as number;
                    }

                    // Local Compute
                    const profile = computeProfile(answers, qSet.questions);
                    const oceanLong = {
                        openness: profile.ocean.O,
                        conscientiousness: profile.ocean.C,
                        extraversion: profile.ocean.E,
                        agreeableness: profile.ocean.A,
                        neuroticism: profile.ocean.N
                    };
                    const personaRes = mapProfileToPersona(oceanLong);
                    const isUniform = detectUniformResponses(answers);

                    const localResult = {
                        ocean: profile.ocean,
                        persona: personaRes.persona,
                        confidence: personaRes.confidence,
                        uniform: isUniform
                    };

                    // Push promise to batch
                    batchPromises.push((async () => {
                        const parityResult = await checkBackendParity(answers, localResult, qSet.name);

                        const row: RunResult = {
                            run_id: runId,
                            timestamp: new Date().toISOString(),
                            platform: platform,
                            question_set: qSet.name,
                            generator: genName,
                            seed: runSeed,
                            question_count: Object.keys(answers).length,
                            question_ids: Object.keys(answers).join(';'),
                            answers: Object.values(answers).join(';'),
                            local_openness: localResult.ocean.O,
                            local_conscientiousness: localResult.ocean.C,
                            local_extraversion: localResult.ocean.E,
                            local_agreeableness: localResult.ocean.A,
                            local_neuroticism: localResult.ocean.N,
                            ...parityResult,
                            local_persona_id: localResult.persona.id,
                            local_confidence: localResult.confidence,
                            local_uniform: localResult.uniform
                        };

                        // Update Stats
                        globalStats.totalRuns++;
                        if (row.match) globalStats.matches++;
                        else globalStats.mismatches++;

                        return row;
                    })());
                }

                // Await Batch
                const batchResults = await Promise.all(batchPromises);
                await csv.writeRecords(batchResults);

                // Stream Summary to TXT
                const summaryLines = batchResults.map(r =>
                    `[${r.timestamp}] ${r.run_id} | Match: ${r.match} | Reason: ${r.mismatch_reason || 'N/A'}`
                ).join('\n') + '\n';
                await fs.appendFile(txtPath, summaryLines);
            }
            console.log(`\n✅ Completed ${platform} x ${qSet.name}`);
        }

        console.log('\n==========================================');
        console.log('🎉 Mega Suite Completed');
        console.log(`Total Runs: ${globalStats.totalRuns}`);
        console.log(`Matches: ${globalStats.matches}`);
        console.log(`Mismatches: ${globalStats.mismatches}`);
        console.log(`Exports: ${EXPORT_DIR}`);
    }
}

run().catch(console.error);

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { generatePattern, PatternType } from '../generators/generatePatterns';
const patternCatalog = require('../generators/patternCatalog.json');
import { createObjectCsvWriter } from 'csv-writer';

// Configuration
const CONFIG = {
    batchSize: 100,
    concurrency: 8,
    sleepBetweenBatchesMs: 400,
    requestTimeoutMs: 15000,
    maxRetries: 3,
    retryBackoff: [300, 700, 1500],
    engines: {
        python: 'http://python-engine:8000/compute',
        ts: 'http://ts-engine:7000/compute'
    },
    paths: {
        questions: path.join(__dirname, '../../engines/ts-engine/questions.json'),
        archive: path.join(__dirname, '../../archive')
    }
};

// Types
interface TestResult {
    run_id: number;
    pattern_type: string;
    seed: number;
    question_set: 'smart30' | 'full180';
    answers: any;
    ocean_ts: any;
    ocean_py: any;
    persona_ts: string;
    persona_py: string;
    confidence_ts: any;
    confidence_py: any;
    match: boolean;
    error?: string;
}

// Helper: Sleep
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper: Retry Wrapper
async function fetchWithRetry(url: string, data: any, retries = CONFIG.maxRetries): Promise<any> {
    for (let i = 0; i <= retries; i++) {
        try {
            const response = await axios.post(url, data, { timeout: CONFIG.requestTimeoutMs });
            return response.data;
        } catch (error) {
            if (i === retries) throw error;
            await sleep(CONFIG.retryBackoff[i]);
        }
    }
}

// Smart30 Mapping Logic
function getSmart30Questions(allQuestions: any[]): any[] {
    // Select 1 question per facet (30 total)
    // This is a simplified logic; in production, use specific IDs if defined
    const facets = new Set(allQuestions.map(q => q.facet));
    const smart30: any[] = [];
    facets.forEach(facet => {
        const q = allQuestions.find(q => q.facet === facet);
        if (q) smart30.push(q);
    });
    return smart30;
}

// Scenario Runner
async function runScenario(scenarioName: string, mode: 'smart30' | 'full180', totalRuns: number, seed: number) {
    console.log(`\nStarting Scenario: ${scenarioName} (${mode}) - ${totalRuns} runs`);

    // Setup Paths
    const runDir = path.join(CONFIG.paths.archive, 'runs', scenarioName);
    const csvPath = path.join(CONFIG.paths.archive, 'csv', `${scenarioName}.csv`);
    const jsonlPath = path.join(runDir, 'raw.jsonl');

    fs.mkdirSync(runDir, { recursive: true });
    fs.mkdirSync(path.dirname(csvPath), { recursive: true });

    // Load Questions
    const questionsData = JSON.parse(fs.readFileSync(CONFIG.paths.questions, 'utf-8'));
    const allQuestions = questionsData.questions;
    const activeQuestions = mode === 'smart30' ? getSmart30Questions(allQuestions) : allQuestions;

    // CSV Writer
    const csvWriter = createObjectCsvWriter({
        path: csvPath,
        header: [
            { id: 'run_id', title: 'run_id' },
            { id: 'pattern_type', title: 'pattern_type' },
            { id: 'seed', title: 'seed' },
            { id: 'question_set', title: 'question_set' },
            { id: 'persona_ts', title: 'persona_ts' },
            { id: 'persona_py', title: 'persona_py' },
            { id: 'match', title: 'match' },
            { id: 'error', title: 'error' },
            // Flattened OCEAN
            { id: 'ocean_ts_O', title: 'ocean_ts_O' },
            { id: 'ocean_ts_C', title: 'ocean_ts_C' },
            { id: 'ocean_ts_E', title: 'ocean_ts_E' },
            { id: 'ocean_ts_A', title: 'ocean_ts_A' },
            { id: 'ocean_ts_N', title: 'ocean_ts_N' },
            { id: 'ocean_py_O', title: 'ocean_py_O' },
            { id: 'ocean_py_C', title: 'ocean_py_C' },
            { id: 'ocean_py_E', title: 'ocean_py_E' },
            { id: 'ocean_py_A', title: 'ocean_py_A' },
            { id: 'ocean_py_N', title: 'ocean_py_N' }
        ]
    });

    // Execution Loop
    let completed = 0;
    const results: TestResult[] = [];

    for (let i = 0; i < totalRuns; i += CONFIG.batchSize) {
        const batchSize = Math.min(CONFIG.batchSize, totalRuns - i);
        const batchPromises = [];

        for (let j = 0; j < batchSize; j++) {
            const runId = i + j + 1;
            const pattern = patternCatalog[Math.floor(Math.random() * patternCatalog.length)] as PatternType;

            batchPromises.push((async () => {
                const answers = generatePattern(pattern, activeQuestions);
                const result: any = { // Use any for flattened structure
                    run_id: runId,
                    pattern_type: pattern,
                    seed,
                    question_set: mode,
                    answers,
                    ocean_ts: {},
                    ocean_py: {},
                    persona_ts: '',
                    persona_py: '',
                    match: false
                };

                try {
                    const [pyRes, tsRes] = await Promise.all([
                        fetchWithRetry(CONFIG.engines.python, { answers }),
                        fetchWithRetry(CONFIG.engines.ts, { answers })
                    ]);

                    // Map Python keys (Full names) to Short codes
                    const pyOcean = {
                        O: pyRes.traits.Openness,
                        C: pyRes.traits.Conscientiousness,
                        E: pyRes.traits.Extraversion,
                        A: pyRes.traits.Agreeableness,
                        N: pyRes.traits.Neuroticism
                    };

                    // TS Engine returns 'ocean' with short codes
                    const tsOcean = tsRes.ocean;

                    result.ocean_ts = tsOcean;
                    result.ocean_py = pyOcean;
                    result.persona_ts = tsRes.persona || tsRes.mbti_type; // Handle potential naming diff
                    result.persona_py = pyRes.personality_code || pyRes.mbti_proxy;
                    result.confidence_ts = tsRes.trait_confidence || {};
                    result.confidence_py = pyRes.trait_confidence;

                    // Flatten for CSV
                    if (tsOcean) {
                        result.ocean_ts_O = tsOcean.O;
                        result.ocean_ts_C = tsOcean.C;
                        result.ocean_ts_E = tsOcean.E;
                        result.ocean_ts_A = tsOcean.A;
                        result.ocean_ts_N = tsOcean.N;
                    }

                    if (pyOcean) {
                        result.ocean_py_O = pyOcean.O;
                        result.ocean_py_C = pyOcean.C;
                        result.ocean_py_E = pyOcean.E;
                        result.ocean_py_A = pyOcean.A;
                        result.ocean_py_N = pyOcean.N;
                    }

                    // Comparison Logic
                    const tsPersona = result.persona_ts;
                    const pyPersona = result.persona_py ? result.persona_py.split('-')[0] : '';

                    const personaMatch = tsPersona === pyPersona;

                    // Check OCEAN match (allow for 0-100 vs 0-1 scale difference if any, but both should be normalized now?)
                    // Python returns 0-1 (e.g. 0.75), TS returns 0-100 (e.g. 75).
                    // Wait, normalizeScores.ts says * 100.
                    // compute_ocean.py says 0-1.
                    // I need to normalize Python scores to 0-100 for comparison.

                    const oceanMatch = ['O', 'C', 'E', 'A', 'N'].every(k => {
                        const tsVal = tsOcean ? tsOcean[k] : 0;
                        const pyVal = pyOcean ? (pyOcean[k] * 100) : 0; // Scale Python to 100
                        return Math.abs(tsVal - pyVal) <= 0.1; // Tolerance 0.1 (on 100 scale)
                    });

                    result.match = personaMatch && oceanMatch;

                } catch (e: any) {
                    result.error = e.message;
                    console.error(`Run ${runId} failed: ${e.message}`);
                }

                return result;
            })());
        }

        // Execute Batch
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);

        // Write to CSV/JSONL
        await csvWriter.writeRecords(batchResults);
        fs.appendFileSync(jsonlPath, batchResults.map(r => JSON.stringify(r)).join('\n') + '\n');

        completed += batchSize;
        console.log(`Completed ${completed}/${totalRuns} runs...`);

        await sleep(CONFIG.sleepBetweenBatchesMs);
    }

    // Generate Report
    generateReport(scenarioName, results);
}

function generateReport(scenarioName: string, results: TestResult[]) {
    const total = results.length;
    const matches = results.filter(r => r.match).length;
    const errors = results.filter(r => r.error).length;
    const matchRate = (matches / total) * 100;

    const report = `
# Scenario Report: ${scenarioName}

- **Total Runs**: ${total}
- **Matches**: ${matches}
- **Errors**: ${errors}
- **Match Rate**: ${matchRate.toFixed(2)}%

## Mismatches
${results.filter(r => !r.match && !r.error).slice(0, 10).map(r =>
        `- Run ${r.run_id}: TS=${r.persona_ts} vs PY=${r.persona_py}`
    ).join('\n')}
    `;

    fs.writeFileSync(path.join(CONFIG.paths.archive, 'reports', `${scenarioName}.md`), report);
}

// Main Execution
async function main() {
    const args = process.argv.slice(2);
    const runs = parseInt(args.find(a => a.startsWith('--runs'))?.split('=')[1] || '1000');
    const seed = parseInt(args.find(a => a.startsWith('--seed'))?.split('=')[1] || '1337');

    await runScenario('web_smart30', 'smart30', runs, seed);
    await runScenario('web_full180', 'full180', runs, seed);
    await runScenario('mobile_smart30', 'smart30', runs, seed);
    await runScenario('mobile_full180', 'full180', runs, seed);

    console.log("\nAll scenarios completed.");
}

main();

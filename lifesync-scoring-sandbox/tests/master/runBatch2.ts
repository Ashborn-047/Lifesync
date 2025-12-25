import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { generatePattern, PatternType } from '../generators/generatePatterns';
const patternCatalog = require('../generators/patternCatalog.json');
import { createObjectCsvWriter } from 'csv-writer';

// Configuration for Batch 2 (Production Grade)
const CONFIG = {
    batchSize: 200,
    concurrency: 8,
    sleepBetweenBatchesMs: 300,
    requestTimeoutMs: 15000,
    maxRetries: 3,
    retryBackoff: [300, 700, 1500],
    failFast: {
        maxMismatchesInitial: 25, // Abort if >25 mismatches in first 500 runs
        initialRunCount: 500,
        maxEngineErrors: 3
    },
    engines: {
        python: 'http://python-engine:8000/compute',
        ts: 'http://ts-engine:7000/compute'
    },
    paths: {
        questions: path.join(__dirname, '../../engines/ts-engine/questions.json'),
        base: path.join(__dirname, '../../archive/batch2'),
        logs: path.join(__dirname, '../../archive/batch2/logs')
    }
};

// Ensure directories exist
['csv', 'raw', 'txt', 'charts', 'reports', 'logs'].forEach(dir => {
    fs.mkdirSync(path.join(CONFIG.paths.base, dir), { recursive: true });
});

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

// Helper: Logger
const logPath = path.join(CONFIG.paths.logs, `execution_${Date.now()}.log`);
const logStream = fs.createWriteStream(logPath, { flags: 'a' });
const log = (msg: string) => {
    const entry = `[${new Date().toISOString()}] ${msg}`;
    console.log(msg);
    logStream.write(entry + '\n');
};

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

// Helper: Memory Monitor
function checkMemory() {
    const usage = process.memoryUsage();
    log(`Memory: RSS=${Math.round(usage.rss / 1024 / 1024)}MB, Heap=${Math.round(usage.heapUsed / 1024 / 1024)}MB`);
    if (global.gc) {
        global.gc();
        log('Garbage collection triggered.');
    }
}

// Smart30 Mapping Logic
function getSmart30Questions(allQuestions: any[]): any[] {
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
    log(`\nStarting Scenario: ${scenarioName} (${mode}) - ${totalRuns} runs`);

    // Setup Paths
    const runDir = path.join(CONFIG.paths.base, 'raw', scenarioName);
    const csvPath = path.join(CONFIG.paths.base, 'csv', `${scenarioName}_results_batch2.csv`);
    const mismatchCsvPath = path.join(CONFIG.paths.base, 'csv', `${scenarioName}_mismatches_batch2.csv`);
    const jsonlPath = path.join(CONFIG.paths.base, 'raw', `${scenarioName}_raw_batch2.jsonl`);

    fs.mkdirSync(runDir, { recursive: true });

    // Load Questions
    const questionsData = JSON.parse(fs.readFileSync(CONFIG.paths.questions, 'utf-8'));
    const allQuestions = questionsData.questions;
    const activeQuestions = mode === 'smart30' ? getSmart30Questions(allQuestions) : allQuestions;

    // CSV Writers
    const headers = [
        { id: 'run_id', title: 'run_id' },
        { id: 'pattern_type', title: 'pattern_type' },
        { id: 'seed', title: 'seed' },
        { id: 'question_set', title: 'question_set' },
        { id: 'persona_ts', title: 'persona_ts' },
        { id: 'persona_py', title: 'persona_py' },
        { id: 'match', title: 'match' },
        { id: 'error', title: 'error' },
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
    ];

    const csvWriter = createObjectCsvWriter({ path: csvPath, header: headers });
    const mismatchWriter = createObjectCsvWriter({ path: mismatchCsvPath, header: headers });

    // Execution Loop
    let completed = 0;
    let engineErrors = 0;
    let mismatchCount = 0;
    const results: TestResult[] = [];

    for (let i = 0; i < totalRuns; i += CONFIG.batchSize) {
        // Memory Check & GC
        if (i > 0 && i % 500 === 0) checkMemory();

        const batchSize = Math.min(CONFIG.batchSize, totalRuns - i);
        const batchPromises = [];

        for (let j = 0; j < batchSize; j++) {
            const runId = i + j + 1;
            const pattern = patternCatalog[Math.floor(Math.random() * patternCatalog.length)] as PatternType;

            batchPromises.push((async () => {
                const answers = generatePattern(pattern, activeQuestions);
                const result: any = {
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

                    // Map Python keys
                    const pyOcean = {
                        O: pyRes.traits.Openness,
                        C: pyRes.traits.Conscientiousness,
                        E: pyRes.traits.Extraversion,
                        A: pyRes.traits.Agreeableness,
                        N: pyRes.traits.Neuroticism
                    };
                    const tsOcean = tsRes.ocean;

                    result.ocean_ts = tsOcean;
                    result.ocean_py = pyOcean;
                    result.persona_ts = tsRes.persona || tsRes.mbti_type;
                    result.persona_py = pyRes.personality_code || pyRes.mbti_proxy;
                    result.confidence_ts = tsRes.trait_confidence || {};
                    result.confidence_py = pyRes.trait_confidence;

                    // Flatten
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

                    // Comparison
                    const tsPersona = result.persona_ts;
                    const pyPersona = result.persona_py ? result.persona_py.split('-')[0] : '';
                    const personaMatch = tsPersona === pyPersona;

                    // Epsilon-safe comparison (0.1 on 100 scale = 0.001 on 1 scale)
                    const epsilon = Number.EPSILON * 10;
                    const oceanMatch = ['O', 'C', 'E', 'A', 'N'].every(k => {
                        const tsVal = tsOcean ? tsOcean[k] : 0;
                        const pyVal = pyOcean ? (pyOcean[k] * 100) : 0;
                        return Math.abs(tsVal - pyVal) <= (0.1 + epsilon);
                    });

                    result.match = personaMatch && oceanMatch;

                } catch (e: any) {
                    result.error = e.message;
                    engineErrors++;
                    log(`Run ${runId} failed: ${e.message}`);
                }

                return result;
            })());
        }

        // Execute Batch
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);

        // Write Records
        await csvWriter.writeRecords(batchResults);

        const mismatches = batchResults.filter(r => !r.match);
        if (mismatches.length > 0) {
            mismatchCount += mismatches.length;
            await mismatchWriter.writeRecords(mismatches);
        }

        fs.appendFileSync(jsonlPath, batchResults.map(r => JSON.stringify(r)).join('\n') + '\n');

        completed += batchSize;
        log(`Completed ${completed}/${totalRuns} runs...`);

        // Fail-Fast Checks
        if (completed <= CONFIG.failFast.initialRunCount && mismatchCount > CONFIG.failFast.maxMismatchesInitial) {
            log(`🛑 ABORTING: Too many mismatches (${mismatchCount}) in first ${completed} runs.`);
            process.exit(1);
        }
        if (engineErrors > CONFIG.failFast.maxEngineErrors) {
            log(`🛑 ABORTING: Too many engine errors (${engineErrors}).`);
            process.exit(1);
        }

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
# Scenario Report: ${scenarioName} (Batch 2)

- **Total Runs**: ${total}
- **Matches**: ${matches}
- **Errors**: ${errors}
- **Match Rate**: ${matchRate.toFixed(2)}%

## Mismatches
${results.filter(r => !r.match && !r.error).slice(0, 10).map(r =>
        `- Run ${r.run_id}: TS=${r.persona_ts} vs PY=${r.persona_py}`
    ).join('\n')}
    `;

    fs.writeFileSync(path.join(CONFIG.paths.base, 'reports', `${scenarioName}_batch2.md`), report);
}

// Generate Metadata
function generateMetadata() {
    const metadata = {
        timestamp: new Date().toISOString(),
        seed: 1337,
        runsPerScenario: 5000,
        engineVersions: {
            python: '3.10.14-slim',
            node: '20.10.0'
        },
        config: CONFIG
    };
    fs.writeFileSync(path.join(CONFIG.paths.base, 'metadata.json'), JSON.stringify(metadata, null, 4));
}

// Main Execution
async function main() {
    generateMetadata();
    const runs = 5000;
    const seed = 1337;

    try {
        await runScenario('mobile_smart30', 'smart30', runs, seed);
        await runScenario('mobile_full180', 'full180', runs, seed);
        await runScenario('web_smart30', 'smart30', runs, seed);
        await runScenario('web_full180', 'full180', runs, seed);
        log("\nBatch 2 completed successfully.");
    } catch (e) {
        log(`\nBatch 2 failed: ${e}`);
        process.exit(1);
    } finally {
        logStream.end();
    }
}

main();

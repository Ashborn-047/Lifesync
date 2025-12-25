import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { generatePattern, PatternType } from '../generators/generatePatterns';
const patternCatalog = require('../generators/patternCatalog.json');
import { exportToCsv } from './exportCsv';
import { exportToTxt } from './exportTxt';

const PYTHON_URL = 'http://python-engine:8000/compute';
const TS_URL = 'http://ts-engine:7000/compute';
const QUESTIONS_PATH = path.join(__dirname, '../../engines/ts-engine/questions.json');

async function runStressTests() {
    const args = process.argv.slice(2);
    const runsArg = args.find(arg => arg.startsWith('--runs'));
    const totalRuns = runsArg ? parseInt(runsArg.split(' ')[1] || args[args.indexOf('--runs') + 1]) : 100;

    console.log(`Starting Stress Tests (${totalRuns} runs)...`);

    let questions: any[];
    try {
        const data = JSON.parse(fs.readFileSync(QUESTIONS_PATH, 'utf-8'));
        questions = data.questions;
    } catch (e) {
        console.error("Failed to load questions.json:", e);
        process.exit(1);
    }

    const results: any[] = [];

    for (let i = 0; i < totalRuns; i++) {
        const pattern = patternCatalog[Math.floor(Math.random() * patternCatalog.length)] as PatternType;
        const answers = generatePattern(pattern, questions);

        try {
            const [pyRes, tsRes] = await Promise.all([
                axios.post(PYTHON_URL, { answers }),
                axios.post(TS_URL, { answers })
            ]);

            results.push({
                run_id: i + 1,
                pattern,
                answers,
                py: pyRes.data,
                ts: tsRes.data
            });

            if ((i + 1) % 100 === 0) {
                console.log(`Completed ${i + 1}/${totalRuns} runs...`);
            }

        } catch (error) {
            console.error(`Error in run ${i + 1}:`, error);
        }
    }

    console.log("Exporting results...");
    const timestamp = Date.now();
    await exportToCsv(results, path.join(__dirname, '../../archive/csv', `stress_test_${timestamp}.csv`));
    await exportToTxt(results, path.join(__dirname, '../../archive/txt', `stress_test_${timestamp}.txt`));

    console.log("Stress Tests Complete.");
}

runStressTests();

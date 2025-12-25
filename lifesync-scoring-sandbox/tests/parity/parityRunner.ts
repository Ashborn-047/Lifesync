import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { generatePattern } from '../generators/generatePatterns';
import { compareResults } from './compareEngines';
const patternCatalog = require('../generators/patternCatalog.json');
// Import types from TS engine (assuming we can access them, or redefine)
// Since we are in a separate container/context, we might not have direct access to TS engine types if not built together.
// But we copied them to engines/ts-engine/types. 
// For simplicity, we'll define minimal types here or rely on 'any' for the runner.

const PYTHON_URL = process.env.PYTHON_URL || 'http://python-engine:8000/compute';
const TS_URL = process.env.TS_URL || 'http://ts-engine:7000/compute';

// We need questions to generate patterns. 
// We can fetch them from one of the engines or load from file if available.
// Let's assume we can load from ../../engines/ts-engine/questions.json if mounted, 
// or fetch from an endpoint if we added one. 
// For now, let's try to load from the mounted volume.
const QUESTIONS_PATH = path.join(__dirname, '../../engines/ts-engine/questions.json');

async function runParityTests() {
    console.log("Starting Parity Tests...");

    let questions: any[];
    try {
        const data = JSON.parse(fs.readFileSync(QUESTIONS_PATH, 'utf-8'));
        questions = data.questions;
    } catch (e) {
        console.error("Failed to load questions.json:", e);
        process.exit(1);
    }

    const mismatches: any[] = [];
    let passed = 0;
    let failed = 0;

    for (const pattern of patternCatalog) {
        console.log(`Testing pattern: ${pattern}`);
        const answers = generatePattern(pattern as any, questions);

        try {
            const [pyRes, tsRes] = await Promise.all([
                axios.post(PYTHON_URL, { answers }),
                axios.post(TS_URL, { answers })
            ]);

            const comparison = compareResults(pyRes.data, tsRes.data);

            if (comparison.match) {
                passed++;
                // console.log(`✅ ${pattern} matched`);
            } else {
                failed++;
                console.error(`❌ ${pattern} MISMATCH`);
                mismatches.push({
                    pattern,
                    reasons: comparison.reasons,
                    py: pyRes.data,
                    ts: tsRes.data
                });
            }

        } catch (error) {
            console.error(`Error running pattern ${pattern}:`, error);
            failed++;
        }
    }

    console.log(`\nParity Test Complete.`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);

    if (mismatches.length > 0) {
        const reportPath = path.join(__dirname, '../../archive/reports', `mismatches_${Date.now()}.txt`);
        fs.writeFileSync(reportPath, JSON.stringify(mismatches, null, 2));
        console.log(`Mismatches written to ${reportPath}`);
        process.exit(1);
    } else {
        console.log("All patterns matched! 🚀");
    }
}

runParityTests();

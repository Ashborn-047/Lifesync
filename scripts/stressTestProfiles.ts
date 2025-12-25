import * as fs from 'fs';
import * as path from 'path';
import { computeProfile } from '../packages/personality-engine/scoring/computeProfile';
import { mapProfileToPersona, detectUniformResponses } from '../packages/personality-engine/mapping/personaMapping';
import { generators, allGenerators } from './generators/randomPatterns';
import questions180Data from '../packages/personality-engine/data/questions_180.json';
// import smart30Data from '../packages/personality-engine/data/smart_30.json'; // Assuming this exists, if not we filter 180

// Types
import { Question } from '../packages/personality-engine/types';

const questions180 = questions180Data.questions as Question[];
// Mock Smart30 if file doesn't exist or just filter first 30 for now if strict ID match needed
// For stress test, we can just take first 30 of 180 as "Smart30" set if they are compatible
const smart30 = questions180.slice(0, 30);

const LOG_DIR = path.join(__dirname, '../archive/personality-tests/logs');

// CLI Args
const args = process.argv.slice(2);
const COUNT = parseInt(args.find(a => a.startsWith('--count='))?.split('=')[1] || '1000');
const SEED = parseInt(args.find(a => a.startsWith('--seed='))?.split('=')[1] || Date.now().toString());

// Determinism Check
function checkDeterminism() {
    console.log('Running Determinism Check...');
    const baseSeed = 12345;
    const gen = generators.entropyChaos;
    const answers = gen(questions180, baseSeed);

    const firstRun = computeProfile(answers, questions180);
    const firstOcean = {
        openness: firstRun.ocean.O,
        conscientiousness: firstRun.ocean.C,
        extraversion: firstRun.ocean.E,
        agreeableness: firstRun.ocean.A,
        neuroticism: firstRun.ocean.N
    };
    const firstPersona = mapProfileToPersona(firstOcean);

    for (let i = 0; i < 20; i++) {
        const run = computeProfile(answers, questions180);
        const runOcean = {
            openness: run.ocean.O,
            conscientiousness: run.ocean.C,
            extraversion: run.ocean.E,
            agreeableness: run.ocean.A,
            neuroticism: run.ocean.N
        };
        const persona = mapProfileToPersona(runOcean);

        if (JSON.stringify(run) !== JSON.stringify(firstRun)) {
            console.error('❌ Non-deterministic computeProfile detected!');
            return false;
        }
        if (JSON.stringify(persona) !== JSON.stringify(firstPersona)) {
            console.error('❌ Non-deterministic mapProfileToPersona detected!');
            return false;
        }
    }
    console.log('✅ Determinism Check Passed (20 iterations)');
    return true;
}

async function run() {
    if (!checkDeterminism()) process.exit(1);

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const runDir = path.join(LOG_DIR, timestamp);
    fs.mkdirSync(runDir, { recursive: true });

    // Use 5000 if not specified
    const FINAL_COUNT = args.find(a => a.startsWith('--count=')) ? COUNT : 5000;
    console.log(`Starting Stress Test: ${FINAL_COUNT} runs, Seed: ${SEED}`);

    const results: any[] = [];
    const personaCounts: Record<string, number> = {};

    // CSV Headers
    // ID, Generator, Persona, O, C, E, A, N, Uniform, [Questions...]
    const smart30Headers = ['RunID', 'Generator', 'Persona', 'Confidence', 'O', 'C', 'E', 'A', 'N', 'Uniform', ...smart30.map(q => q.id)].join(',');
    const full180Headers = ['RunID', 'Generator', 'Persona', 'Confidence', 'O', 'C', 'E', 'A', 'N', 'Uniform', ...questions180.map(q => q.id)].join(',');

    const smart30Rows: string[] = [smart30Headers];
    const full180Rows: string[] = [full180Headers];

    for (let i = 0; i < FINAL_COUNT; i++) {
        const seed = SEED + i;
        const genName = allGenerators[i % allGenerators.length];
        const generator = generators[genName as keyof typeof generators];

        // Mode: Alternate Smart30 and Full180
        const mode = i % 2 === 0 ? 'smart30' : 'full180';
        const questions = mode === 'smart30' ? smart30 : questions180;

        const answers = generator(questions, seed);

        // Local Compute
        const profile = computeProfile(answers, questions);

        // Convert OceanScores (O,C,E,A,N) to OCEAN (openness, etc.)
        const oceanLongKeys = {
            openness: profile.ocean.O,
            conscientiousness: profile.ocean.C,
            extraversion: profile.ocean.E,
            agreeableness: profile.ocean.A,
            neuroticism: profile.ocean.N
        };

        const personaResult = mapProfileToPersona(oceanLongKeys);
        const isUniform = detectUniformResponses(answers);

        // Track Stats
        const pid = personaResult.persona.id;
        personaCounts[pid] = (personaCounts[pid] || 0) + 1;

        // Prepare CSV Row
        const answerValues = questions.map(q => answers[q.id] ?? '').join(',');
        const row = [
            `run-${i}`,
            genName,
            personaResult.persona.id,
            personaResult.confidence,
            profile.ocean.O.toFixed(2),
            profile.ocean.C.toFixed(2),
            profile.ocean.E.toFixed(2),
            profile.ocean.A.toFixed(2),
            profile.ocean.N.toFixed(2),
            isUniform,
            answerValues
        ].join(',');

        if (mode === 'smart30') {
            smart30Rows.push(row);
        } else {
            full180Rows.push(row);
        }

        results.push({
            id: `run-${i}`,
            seed,
            generator: genName,
            mode,
            // answers, // Omit from JSON to save space, present in CSV
            localProfile: profile.ocean,
            localPersona: {
                id: personaResult.persona.id,
                title: personaResult.persona.title,
                confidence: personaResult.confidence
            },
            uniformDetected: isUniform
        });

        if (i % 100 === 0) process.stdout.write('.');
    }
    console.log('\nTest Complete.');

    // Write Logs
    fs.writeFileSync(path.join(runDir, 'raw_results.json'), JSON.stringify(results, null, 2));
    fs.writeFileSync(path.join(runDir, 'persona_distribution.json'), JSON.stringify(personaCounts, null, 2));

    // Write CSVs
    fs.writeFileSync(path.join(runDir, 'mobile_smart30.csv'), smart30Rows.join('\n'));
    fs.writeFileSync(path.join(runDir, 'web_full180.csv'), full180Rows.join('\n'));

    const summary = {
        totalRuns: FINAL_COUNT,
        seed: SEED,
        personaDistribution: personaCounts,
        timestamp
    };
    fs.writeFileSync(path.join(runDir, 'summary.json'), JSON.stringify(summary, null, 2));

    console.log(`Logs written to: ${runDir}`);
    console.log(`CSVs generated: mobile_smart30.csv, web_full180.csv`);
}

run().catch(console.error);

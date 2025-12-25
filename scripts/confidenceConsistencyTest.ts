import * as fs from 'fs';
import * as path from 'path';
import { computeProfile } from '../packages/personality-engine/scoring/computeProfile';
import { mapProfileToPersona } from '../packages/personality-engine/mapping/personaMapping';
import { generators } from './generators/randomPatterns';
import questions180Data from '../packages/personality-engine/data/questions_180.json';
import { Question } from '../packages/personality-engine/types';

const questions180 = questions180Data.questions as Question[];
const smart30 = questions180.slice(0, 30);

const LOG_DIR = path.join(__dirname, '../archive/personality-tests/logs');

async function run() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const runDir = path.join(LOG_DIR, timestamp + '-confidence');
    fs.mkdirSync(runDir, { recursive: true });

    const results: any[] = [];
    const baseSeed = 555;

    // Base run
    const answers = generators.entropyChaos(smart30, baseSeed);
    const baseProfile = computeProfile(answers, smart30);

    const baseOcean = {
        openness: baseProfile.ocean.O,
        conscientiousness: baseProfile.ocean.C,
        extraversion: baseProfile.ocean.E,
        agreeableness: baseProfile.ocean.A,
        neuroticism: baseProfile.ocean.N
    };

    const basePersona = mapProfileToPersona(baseOcean);

    // Perturbations
    for (let i = 0; i < 50; i++) {
        const perturbedAnswers = { ...answers };
        // Flip 3 random answers by +/- 1
        for (let j = 0; j < 3; j++) {
            const keys = Object.keys(perturbedAnswers);
            const k = keys[Math.floor(Math.random() * keys.length)];
            let val = perturbedAnswers[k] + (Math.random() > 0.5 ? 1 : -1);
            if (val < 1) val = 1;
            if (val > 5) val = 5;
            perturbedAnswers[k] = val;
        }

        const pProfile = computeProfile(perturbedAnswers, smart30);

        const pOcean = {
            openness: pProfile.ocean.O,
            conscientiousness: pProfile.ocean.C,
            extraversion: pProfile.ocean.E,
            agreeableness: pProfile.ocean.A,
            neuroticism: pProfile.ocean.N
        };

        const pPersona = mapProfileToPersona(pOcean);

        results.push({
            iteration: i,
            baseConfidence: basePersona.confidence,
            newConfidence: pPersona.confidence,
            delta: Math.abs(basePersona.confidence - pPersona.confidence),
            personaChanged: basePersona.persona.id !== pPersona.persona.id
        });
    }

    fs.writeFileSync(path.join(runDir, 'confidence_stability.json'), JSON.stringify(results, null, 2));
    console.log(`Confidence stability test logged to: ${runDir}`);
}

run().catch(console.error);

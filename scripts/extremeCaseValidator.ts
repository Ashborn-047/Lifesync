import * as fs from 'fs';
import * as path from 'path';
import { computeProfile } from '../packages/personality-engine/scoring/computeProfile';
import { mapProfileToPersona, detectUniformResponses } from '../packages/personality-engine/mapping/personaMapping';
import { generators } from './generators/randomPatterns';
import questions180Data from '../packages/personality-engine/data/questions_180.json';
import { Question } from '../packages/personality-engine/types';

const questions180 = questions180Data.questions as Question[];
const smart30 = questions180.slice(0, 30);

const LOG_DIR = path.join(__dirname, '../archive/personality-tests/logs');

async function run() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const runDir = path.join(LOG_DIR, timestamp + '-extreme');
    fs.mkdirSync(runDir, { recursive: true });

    const results: any[] = [];
    const seed = 123;

    const cases = [
        { name: 'all1s', gen: generators.uniformLow, expectUniform: true },
        { name: 'all5s', gen: generators.uniformHigh, expectUniform: true },
        { name: 'alternating', gen: generators.alternating, expectUniform: false },
        { name: 'blockExtremes', gen: generators.blockExtremes, expectUniform: false },
    ];

    for (const c of cases) {
        // Test Smart30
        const ans30 = c.gen(smart30, seed);
        const prof30 = computeProfile(ans30, smart30);

        const ocean30 = {
            openness: prof30.ocean.O,
            conscientiousness: prof30.ocean.C,
            extraversion: prof30.ocean.E,
            agreeableness: prof30.ocean.A,
            neuroticism: prof30.ocean.N
        };

        const per30 = mapProfileToPersona(ocean30);
        const uni30 = detectUniformResponses(ans30);

        results.push({
            case: c.name,
            mode: 'smart30',
            persona: per30.persona.id,
            uniformDetected: uni30,
            passUniform: !uni30
        });

        // Test Full180
        const ans180 = c.gen(questions180, seed);
        const prof180 = computeProfile(ans180, questions180);

        const ocean180 = {
            openness: prof180.ocean.O,
            conscientiousness: prof180.ocean.C,
            extraversion: prof180.ocean.E,
            agreeableness: prof180.ocean.A,
            neuroticism: prof180.ocean.N
        };

        const per180 = mapProfileToPersona(ocean180);
        const uni180 = detectUniformResponses(ans180);

        results.push({
            case: c.name,
            mode: 'full180',
            persona: per180.persona.id,
            uniformDetected: uni180,
            passUniform: c.expectUniform ? uni180 : !uni180
        });
    }

    fs.writeFileSync(path.join(runDir, 'extreme_case_results.json'), JSON.stringify(results, null, 2));
    console.log(`Extreme cases logged to: ${runDir}`);
}

run().catch(console.error);

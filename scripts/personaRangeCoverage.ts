import * as fs from 'fs';
import * as path from 'path';
import { mapProfileToPersona } from '../packages/personality-engine/mapping/personaMapping';

const LOG_DIR = path.join(__dirname, '../archive/personality-tests/logs');

async function run() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const runDir = path.join(LOG_DIR, timestamp + '-coverage');
    fs.mkdirSync(runDir, { recursive: true });

    const counts: Record<string, number> = {};
    const total = 500;

    for (let i = 0; i < total; i++) {
        // Generate random OCEAN profile (0-100)
        const ocean = {
            openness: Math.random() * 100,
            conscientiousness: Math.random() * 100,
            extraversion: Math.random() * 100,
            agreeableness: Math.random() * 100,
            neuroticism: Math.random() * 100
        };

        const result = mapProfileToPersona(ocean);
        const pid = result.persona.id;
        counts[pid] = (counts[pid] || 0) + 1;
    }

    const covered = Object.keys(counts).length;
    console.log(`Coverage: ${covered}/16 personas hit in ${total} random samples.`);

    fs.writeFileSync(path.join(runDir, 'coverage_report.json'), JSON.stringify(counts, null, 2));
}

run().catch(console.error);

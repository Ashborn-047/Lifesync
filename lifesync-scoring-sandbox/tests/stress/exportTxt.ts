import fs from 'fs';

export async function exportToTxt(results: any[], filePath: string) {
    const stream = fs.createWriteStream(filePath);

    results.forEach(r => {
        stream.write(`Run ID: ${r.run_id}\n`);
        stream.write(`Pattern: ${r.pattern}\n`);
        stream.write(`Python Persona: ${r.py.mbti_proxy}\n`);
        stream.write(`TS Persona: ${r.ts.mbti_type}\n`);
        stream.write(`Python OCEAN: O=${r.py.traits.Openness}, C=${r.py.traits.Conscientiousness}, E=${r.py.traits.Extraversion}, A=${r.py.traits.Agreeableness}, N=${r.py.traits.Neuroticism}\n`);
        stream.write(`TS OCEAN: O=${r.ts.ocean.O}, C=${r.ts.ocean.C}, E=${r.ts.ocean.E}, A=${r.ts.ocean.A}, N=${r.ts.ocean.N}\n`);
        stream.write('--------------------------------------------------\n');
    });

    stream.end();
    console.log(`TXT written to ${filePath}`);
}

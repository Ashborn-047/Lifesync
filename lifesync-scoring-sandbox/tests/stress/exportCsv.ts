import { createObjectCsvWriter } from 'csv-writer';

export async function exportToCsv(results: any[], filePath: string) {
    const csvWriter = createObjectCsvWriter({
        path: filePath,
        header: [
            { id: 'run_id', title: 'RUN_ID' },
            { id: 'pattern', title: 'PATTERN' },
            { id: 'persona_py', title: 'PERSONA_PY' },
            { id: 'persona_ts', title: 'PERSONA_TS' },
            { id: 'ocean_py_o', title: 'OCEAN_PY_O' },
            { id: 'ocean_py_c', title: 'OCEAN_PY_C' },
            { id: 'ocean_py_e', title: 'OCEAN_PY_E' },
            { id: 'ocean_py_a', title: 'OCEAN_PY_A' },
            { id: 'ocean_py_n', title: 'OCEAN_PY_N' },
            { id: 'ocean_ts_o', title: 'OCEAN_TS_O' },
            { id: 'ocean_ts_c', title: 'OCEAN_TS_C' },
            { id: 'ocean_ts_e', title: 'OCEAN_TS_E' },
            { id: 'ocean_ts_a', title: 'OCEAN_TS_A' },
            { id: 'ocean_ts_n', title: 'OCEAN_TS_N' },
        ]
    });

    const records = results.map(r => ({
        run_id: r.run_id,
        pattern: r.pattern,
        persona_py: r.py.mbti_proxy,
        persona_ts: r.ts.mbti_type,
        ocean_py_o: r.py.traits.Openness,
        ocean_py_c: r.py.traits.Conscientiousness,
        ocean_py_e: r.py.traits.Extraversion,
        ocean_py_a: r.py.traits.Agreeableness,
        ocean_py_n: r.py.traits.Neuroticism,
        ocean_ts_o: r.ts.ocean.O,
        ocean_ts_c: r.ts.ocean.C,
        ocean_ts_e: r.ts.ocean.E,
        ocean_ts_a: r.ts.ocean.A,
        ocean_ts_n: r.ts.ocean.N,
    }));

    await csvWriter.writeRecords(records);
    console.log(`CSV written to ${filePath}`);
}

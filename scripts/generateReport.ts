import * as fs from 'fs-extra';
import * as path from 'path';

const EXPORT_DIR = path.join(__dirname, '../archive/personality-tests/exports/csv');
const REPORT_PATH = path.join(__dirname, '../archive/personality-tests/reports/verification_report.md');

console.log("Starting report generation...");

async function readCsv(filePath: string): Promise<any[]> {
    try {
        const content = await fs.readFile(filePath, 'utf-8');
        const lines = content.split('\n').filter(l => l.trim());
        if (lines.length === 0) return [];

        const headers = lines[0].split(',');
        const results = [];

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',');
            const row: any = {};
            headers.forEach((h, index) => {
                row[h.trim()] = values[index]?.trim();
            });
            results.push(row);
        }
        return results;
    } catch (e) {
        console.error(`Error reading CSV ${filePath}:`, e);
        return [];
    }
}

async function run() {
    await fs.ensureDir(path.dirname(REPORT_PATH));

    const files = await fs.readdir(EXPORT_DIR);
    const csvFiles = files.filter(f => f.endsWith('.csv'));

    let report = `# Mega Stress-Test Verification Report
Generated: ${new Date().toISOString()}

## Executive Summary
This report summarizes the results of the stress test runs across Mobile and Web platforms.

## Test Configuration
- **Runs per Combo**: 1000 (Target)
- **Generators**: 25+ variants (Uniform, Noise, Gaussian, Adversarial, etc.)
- **Parity Check**: Local Engine vs Backend API

## Results by Combination

`;

    let totalRuns = 0;
    let totalMatches = 0;

    for (const file of csvFiles) {
        const data = await readCsv(path.join(EXPORT_DIR, file));
        const count = data.length;
        const matches = data.filter(r => r.match === 'true' || r.match === true).length;
        const matchRate = count > 0 ? ((matches / count) * 100).toFixed(2) : '0.00';

        totalRuns += count;
        totalMatches += matches;

        const baseName = file.replace('.csv', '');

        // Top Mismatch Reasons
        const mismatchReasons: Record<string, number> = {};
        data.filter(r => r.match !== 'true' && r.match !== true).forEach(r => {
            const reason = r.mismatch_reason || 'Unknown';
            mismatchReasons[reason] = (mismatchReasons[reason] || 0) + 1;
        });
        const topReasons = Object.entries(mismatchReasons)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([r, c]) => `- **${c}** cases: ${r}`)
            .join('\n');

        report += `### ${baseName}
- **Total Runs**: ${count}
- **Match Rate**: ${matchRate}% (${matches}/${count})
- **Top Mismatch Reasons**:
${topReasons || '- None (Perfect Match)'}

![Persona Distribution](../charts/persona_distribution_${baseName}.png)
![Confidence Histogram](../charts/confidence_histogram_${baseName}.png)

`;
    }

    const globalMatchRate = totalRuns > 0 ? ((totalMatches / totalRuns) * 100).toFixed(2) : '0.00';

    // --- Pattern Alignment Matrix ---
    const MATRIX_PATH = path.join(__dirname, '../archive/personality-tests/reports/pattern_alignment_matrix.csv');
    const generatorStats: Record<string, { total: number; matches: number }> = {};

    for (const file of csvFiles) {
        const data = await readCsv(path.join(EXPORT_DIR, file));
        data.forEach(r => {
            const gen = r.generator || 'Unknown';
            if (!generatorStats[gen]) generatorStats[gen] = { total: 0, matches: 0 };
            generatorStats[gen].total++;
            if (r.match === 'true' || r.match === true) generatorStats[gen].matches++;
        });
    }

    const matrixHeader = 'Generator,Total Runs,Matches,Match Rate (%)\n';
    const matrixRows = Object.entries(generatorStats)
        .map(([gen, stats]) => {
            const rate = ((stats.matches / stats.total) * 100).toFixed(2);
            return `${gen},${stats.total},${stats.matches},${rate}`;
        })
        .join('\n');

    await fs.writeFile(MATRIX_PATH, matrixHeader + matrixRows);
    console.log(`Matrix generated: ${MATRIX_PATH}`);

    report += `## Pattern Alignment Matrix
See [pattern_alignment_matrix.csv](./pattern_alignment_matrix.csv) for full details.

| Generator | Match Rate |
|-----------|------------|
${Object.entries(generatorStats)
            .sort((a, b) => (b[1].matches / b[1].total) - (a[1].matches / a[1].total))
            .slice(0, 10)
            .map(([gen, stats]) => `| ${gen} | ${((stats.matches / stats.total) * 100).toFixed(2)}% |`)
            .join('\n')}
    
`;

    report += `## Global Statistics
- **Total Runs Executed**: ${totalRuns}
- **Global Match Rate**: ${globalMatchRate}%

## Conclusion
${parseFloat(globalMatchRate) > 99 ? '✅ System is stable and consistent.' : '⚠️ Issues detected. Review mismatch reasons.'}
`;

    await fs.writeFile(REPORT_PATH, report);
    console.log(`Report generated: ${REPORT_PATH}`);
}

run().catch(console.error);

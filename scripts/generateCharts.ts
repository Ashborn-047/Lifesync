import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as csv from 'csv-parser';

const WIDTH = 800;
const HEIGHT = 600;
const chartCallback = (ChartJS: any) => {
    ChartJS.defaults.font.family = 'Arial';
};

const chartJSNodeCanvas = new ChartJSNodeCanvas({ width: WIDTH, height: HEIGHT, chartCallback });

const EXPORT_DIR = path.join(__dirname, '../archive/personality-tests/exports/csv');
const CHART_DIR = path.join(__dirname, '../archive/personality-tests/charts');

async function readCsv(filePath: string): Promise<any[]> {
    const results: any[] = [];
    return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => resolve(results))
            .on('error', (err) => reject(err));
    });
}

async function generatePersonaDistribution(data: any[], title: string, filename: string) {
    const counts: Record<string, number> = {};
    data.forEach(row => {
        const pid = row.local_persona_id;
        counts[pid] = (counts[pid] || 0) + 1;
    });

    const labels = Object.keys(counts).sort();
    const values = labels.map(l => counts[l]);

    const configuration: any = {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Persona Count',
                data: values,
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            plugins: {
                title: { display: true, text: title }
            }
        }
    };

    const buffer = await chartJSNodeCanvas.renderToBuffer(configuration);
    await fs.writeFile(path.join(CHART_DIR, filename), buffer);
    console.log(`Generated ${filename}`);
}

async function generateConfidenceHistogram(data: any[], title: string, filename: string) {
    // Bin confidence 0-100 into 10 bins
    const bins = new Array(10).fill(0);
    data.forEach(row => {
        const conf = parseInt(row.local_confidence || '0');
        const binIndex = Math.min(9, Math.floor(conf / 10));
        bins[binIndex]++;
    });

    const labels = ['0-10', '11-20', '21-30', '31-40', '41-50', '51-60', '61-70', '71-80', '81-90', '91-100'];

    const configuration: any = {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Confidence Distribution',
                data: bins,
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            plugins: {
                title: { display: true, text: title }
            }
        }
    };

    const buffer = await chartJSNodeCanvas.renderToBuffer(configuration);
    await fs.writeFile(path.join(CHART_DIR, filename), buffer);
    console.log(`Generated ${filename}`);
}

async function run() {
    await fs.ensureDir(CHART_DIR);
    const files = await fs.readdir(EXPORT_DIR);
    const csvFiles = files.filter(f => f.endsWith('.csv'));

    for (const file of csvFiles) {
        console.log(`Processing ${file}...`);
        const data = await readCsv(path.join(EXPORT_DIR, file));
        const baseName = file.replace('.csv', '');

        await generatePersonaDistribution(data, `Persona Distribution - ${baseName}`, `persona_distribution_${baseName}.png`);
        await generateConfidenceHistogram(data, `Confidence Histogram - ${baseName}`, `confidence_histogram_${baseName}.png`);
    }
}

run().catch(console.error);

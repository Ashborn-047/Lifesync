import axios from 'axios';

const ENGINES = [
    { name: 'ts-engine', url: 'http://ts-engine:7000/health' },
    { name: 'python-engine', url: 'http://python-engine:8000/health' }
];

const MAX_RETRIES = 12; // 60 seconds (5s interval)
const RETRY_INTERVAL = 5000;

async function checkEngine(name: string, url: string): Promise<boolean> {
    for (let i = 0; i < MAX_RETRIES; i++) {
        try {
            const response = await axios.get(url, { timeout: 2000 });
            if (response.status === 200 && response.data.status === 'ok') {
                console.log(`✅ ${name} is healthy.`);
                return true;
            }
        } catch (error) {
            // Ignore error and retry
        }
        console.log(`⏳ Waiting for ${name}... (${i + 1}/${MAX_RETRIES})`);
        await new Promise(resolve => setTimeout(resolve, RETRY_INTERVAL));
    }
    console.error(`❌ ${name} failed to become healthy.`);
    return false;
}

async function main() {
    console.log('Starting engine health checks...');
    const results = await Promise.all(ENGINES.map(e => checkEngine(e.name, e.url)));

    if (results.every(r => r)) {
        console.log('🚀 All engines are healthy! Starting tests...');
        process.exit(0);
    } else {
        console.error('🛑 One or more engines failed health check. Aborting.');
        process.exit(1);
    }
}

main();

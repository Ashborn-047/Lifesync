import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const CHECKSUM_FILE = path.join(__dirname, 'engine_checksums.json');
const ROOT_DIR = path.join(__dirname, '../');

function calculateChecksum(filePath: string): string {
    const content = fs.readFileSync(filePath, 'utf-8');
    return crypto.createHash('sha256').update(content).digest('hex');
}

function main() {
    console.log('🔍 Verifying Engine Integrity...');

    if (!fs.existsSync(CHECKSUM_FILE)) {
        console.error('❌ Checksum file not found!');
        process.exit(1);
    }

    const config = JSON.parse(fs.readFileSync(CHECKSUM_FILE, 'utf-8'));
    let hasError = false;
    const updates: any = { files: {} };

    for (const [relPath, expectedHash] of Object.entries(config.files)) {
        const fullPath = path.join(ROOT_DIR, relPath);

        if (!fs.existsSync(fullPath)) {
            console.error(`❌ File not found: ${relPath}`);
            hasError = true;
            continue;
        }

        const currentHash = calculateChecksum(fullPath);
        updates.files[relPath] = currentHash;

        if (expectedHash === "") {
            console.log(`⚠️  New file detected (auto-updating hash): ${relPath}`);
            continue;
        }

        if (currentHash !== expectedHash) {
            console.error(`❌ Checksum mismatch for ${relPath}`);
            console.error(`   Expected: ${expectedHash}`);
            console.error(`   Actual:   ${currentHash}`);
            hasError = true;
        } else {
            console.log(`✅ Verified: ${relPath}`);
        }
    }

    if (process.argv.includes('--update')) {
        fs.writeFileSync(CHECKSUM_FILE, JSON.stringify(updates, null, 4));
        console.log('💾 Checksums updated.');
        process.exit(0);
    }

    if (hasError) {
        console.error('🛑 Integrity check failed. Run with --update to accept changes if intentional.');
        process.exit(1);
    }

    console.log('✨ All engine files verified.');
}

main();

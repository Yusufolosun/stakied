import fs from 'fs';
import path from 'path';

const contractsDir = 'contracts';

function fixFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const fixed = content.replace(/\r\n/g, '\n');
        fs.writeFileSync(filePath, fixed, 'utf8');
        console.log(`Fixed ${filePath}`);
    } catch (err) {
        console.error(`Error fixing ${filePath}:`, err);
    }
}

function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath);
        } else if (file.endsWith('.clar')) {
            fixFile(fullPath);
        }
    }
}

if (fs.existsSync(contractsDir)) {
    walk(contractsDir);
}
if (fs.existsSync('Clarinet.toml')) {
    fixFile('Clarinet.toml');
}

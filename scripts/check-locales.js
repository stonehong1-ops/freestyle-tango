const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '..', 'src', 'locales');
const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.ts') && f !== 'index.ts');

const masterFile = 'ko.ts';
const masterPath = path.join(localesDir, masterFile);

function getObject(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    // Simple extraction of the object after 'export default'
    const objMatch = content.match(/export\s+default\s+([\s\S]*?);?\s*$/);
    if (!objMatch) throw new Error(`Could not find export default in ${filePath}`);
    
    try {
        // We use Function instead of eval for a bit more isolation
        // We need to handle potential trailing commas or other JS specifics
        // but since these are mostly static, it should work.
        // We wrap it in parentheses to make it an expression.
        return new Function(`return ${objMatch[1]}`)();
    } catch (e) {
        console.error(`Error parsing ${filePath}:`, e.message);
        // Find where it might have failed (e.g. unescaped quotes)
        throw e;
    }
}

function getAllKeys(obj, prefix = '') {
    let keys = [];
    for (const key in obj) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (typeof obj[key] === 'object' && obj[key] !== null) {
            keys = keys.concat(getAllKeys(obj[key], fullKey));
        } else {
            keys.push(fullKey);
        }
    }
    return keys;
}

const masterObj = getObject(masterPath);
const masterKeys = getAllKeys(masterObj);
let totalErrors = 0;

console.log(`Checking locales against ${masterFile} (${masterKeys.length} keys)...\n`);

for (const file of files) {
    if (file === masterFile) continue;
    
    try {
        const obj = getObject(path.join(localesDir, file));
        const keys = getAllKeys(obj);
        
        const missing = masterKeys.filter(k => !keys.includes(k));
        const extra = keys.filter(k => !masterKeys.includes(k));
        
        if (missing.length > 0 || extra.length > 0) {
            console.log(`❌ ${file}:`);
            if (missing.length > 0) {
                totalErrors += missing.length;
                console.log(`   - Missing (${missing.length}): ${missing.join(', ')}`);
            }
            if (extra.length > 0) {
                totalErrors += extra.length;
                console.log(`   + Extra (${extra.length}): ${extra.join(', ')}`);
            }
        } else {
            console.log(`✅ ${file}: OK`);
        }
    } catch (e) {
        totalErrors++;
        console.log(`💥 ${file}: Syntax Error or Parsing Failed`);
    }
}

if (totalErrors > 0) {
    console.log(`\nFound ${totalErrors} issues in locale files.`);
    process.exit(1);
} else {
    console.log(`\nAll locales synchronized perfectly! ✨`);
    process.exit(0);
}

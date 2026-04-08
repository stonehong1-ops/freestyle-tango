const fs = require('fs');
const path = require('path');

/**
 * Usage: node scripts/add-locale-key.js "home.history.newKey" "한국어 값"
 * This will add the key to ko.ts and placeholders to all other files.
 */

const keyPath = process.argv[2];
const defaultValue = process.argv[3];

if (!keyPath || !defaultValue) {
    console.log('Usage: node scripts/add-locale-key.js "path.to.key" "Value"');
    process.exit(1);
}

const localesDir = path.join(__dirname, '..', 'src', 'locales');
const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.ts') && f !== 'index.ts');

function updateObject(obj, pathArr, value) {
    const key = pathArr[0];
    if (pathArr.length === 1) {
        obj[key] = value;
    } else {
        if (!obj[key]) obj[key] = {};
        updateObject(obj[key], pathArr.slice(1), value);
    }
}

function getObject(content) {
    const objMatch = content.match(/export\s+default\s+([\s\S]*?);?\s*$/);
    if (!objMatch) return null;
    return new Function(`return (${objMatch[1]})`)();
}

function stringify(obj, indent = 2) {
    return JSON.stringify(obj, null, indent)
        .replace(/"([^"]+)":/g, '$1:') // remove quotes from keys
        .replace(/"/g, "'"); // convert to single quotes
}

for (const file of files) {
    const filePath = path.join(localesDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const obj = getObject(content);
    
    if (!obj) {
        console.error(`Could not parse ${file}`);
        continue;
    }

    const pathArr = keyPath.split('.');
    const isMaster = file === 'ko.ts';
    // Use the actual value for master, or a placeholder for others
    const value = isMaster ? defaultValue : `[TODO] ${defaultValue}`;
    
    updateObject(obj, pathArr, value);

    // Write back as a TS export
    // We use a cleaner stringify but keep it simple
    let newContent = `export default ${stringify(obj, 2)};\n`;
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`✅ Updated ${file}`);
}

console.log(`\nKey "${keyPath}" added to all locales!`);

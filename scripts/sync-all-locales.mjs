import fs from 'fs';
import path from 'path';

const localesDir = './src/locales';
const masterFile = 'ko.ts';
const fallbackFile = 'en.ts';
const masterPath = path.join(localesDir, masterFile);
const fallbackPath = path.join(localesDir, fallbackFile);

function getObject(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/\/\/.*|\/\*[\s\S]*?\*\//g, '');
    const objMatch = content.match(/export\s+default\s+([\s\S]*?);?\s*$/);
    if (!objMatch) throw new Error(`Could not find export default in ${filePath}`);
    let body = objMatch[1].trim();
    if (body.endsWith(';')) body = body.slice(0, -1);
    try {
        return new Function(`return (${body})`)();
    } catch (e) {
        throw new Error(`Syntax error in ${filePath}: ${e.message}`);
    }
}

function setDeepValue(obj, path, value) {
    const keys = path.split('.');
    let current = obj;
    for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
}

function getDeepValue(obj, path) {
    const keys = path.split('.');
    let current = obj;
    for (const key of keys) {
        if (!current || typeof current !== 'object') return undefined;
        current = current[key];
    }
    return current;
}

function getAllKeys(obj, prefix = '') {
    let keys = [];
    if (!obj || typeof obj !== 'object') return keys;
    for (const key in obj) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
            keys = keys.concat(getAllKeys(obj[key], fullKey));
        } else {
            keys.push(fullKey);
        }
    }
    return keys;
}

const masterObj = getObject(masterPath);
const masterKeys = getAllKeys(masterObj);
const fallbackObj = getObject(fallbackPath);

const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.ts') && f !== 'index.ts' && f !== masterFile);

for (const file of files) {
    const filePath = path.join(localesDir, file);
    try {
        const obj = getObject(filePath);
        const keys = getAllKeys(obj);
        const missing = masterKeys.filter(k => !keys.includes(k));
        
        if (missing.length > 0) {
            console.log(`Syncing ${missing.length} keys to ${file}...`);
            for (const key of missing) {
                const value = getDeepValue(fallbackObj, key) || getDeepValue(masterObj, key);
                setDeepValue(obj, key, value);
            }
            
            // Generate simple formatted TS output
            const newContent = `export default ${JSON.stringify(obj, null, 2)};\n`;
            fs.writeFileSync(filePath, newContent, 'utf8');
            console.log(`✅ ${file} updated.`);
        }
    } catch (e) {
        console.error(`Error processing ${file}: ${e.message}`);
    }
}

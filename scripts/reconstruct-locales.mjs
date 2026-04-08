import fs from 'fs';
import path from 'path';

// This script reconstructs the corrupted/partial locale files by using en.ts as a structural template.
// It preserves existing translations from the partial files and fills in the gaps with English.

const localesDir = './src/locales';
const templatePath = path.join(localesDir, 'en.ts');

// Function to deep extract keys and values from the exported object
async function getLocaleObject(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    // Simple but effective: extract the object string between export default { and };
    const match = content.match(/export default (\{[\s\S]*\});/);
    if (!match) return null;
    
    // Using eval is generally risky, but here we're in a controlled local script environment
    // and we just need to get the object structure.
    try {
        // We'll clean it up to be valid JS if it's not strictly JSON
        let objStr = match[1];
        // Note: This won't handle complex expressions, but these files are simple objects.
        return eval(`(${objStr})`);
    } catch (e) {
        console.error(`Error parsing ${filePath}:`, e);
        return null;
    }
}

function deepMerge(target, source) {
    for (const key in target) {
        if (source[key] !== undefined) {
            if (typeof target[key] === 'object' && !Array.isArray(target[key]) && target[key] !== null) {
                if (typeof source[key] === 'object' && !Array.isArray(source[key]) && source[key] !== null) {
                    deepMerge(target[key], source[key]);
                }
            } else {
                target[key] = source[key];
            }
        }
    }
    return target;
}

const targetFiles = fs.readdirSync(localesDir).filter(f => f.endsWith('.ts') && f !== 'index.ts' && f !== 'ko.ts' && f !== 'en.ts');

const templateObj = await getLocaleObject(templatePath);

if (!templateObj) {
    console.error('Failed to load template (en.ts)');
    process.exit(1);
}

targetFiles.forEach(async (file) => {
    const filePath = path.join(localesDir, file);
    const partialObj = await getLocaleObject(filePath);
    
    if (!partialObj) {
        console.log(`Skipping ${file} - could not parse.`);
        return;
    }
    
    // Start with template (English)
    const finalObj = JSON.parse(JSON.stringify(templateObj));
    
    // Overlay the partial translations
    deepMerge(finalObj, partialObj);
    
    // Force Navigation to be at the root level and in English (as per user request)
    finalObj.nav = templateObj.nav;

    // Convert back to source code string
    const stringified = JSON.stringify(finalObj, null, 2);
    // Convert JSON to JS object format (remove quotes from keys where possible, or just keep them)
    const content = `export default ${stringified};`;
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ ${file} reconstructed and synced.`);
});

console.log('🎉 Reconstruction complete!');

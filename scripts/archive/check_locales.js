const fs = require('fs');
const path = require('path');

const localesDir = 'c:\\Users\\stone\\FreestyleTango\\src\\locales';
const baseFile = 'ko.ts';

function getKeys(obj, prefix = '') {
  let keys = [];
  for (const key in obj) {
    const newPrefix = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
      keys = keys.concat(getKeys(obj[key], newPrefix));
    } else {
      keys.push(newPrefix);
    }
  }
  return keys;
}

// Simple parser for the export default { ... } structure
function parseLocale(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  // Remove 'export default' and trailing ';'
  const jsonContent = content
    .replace(/export default/g, '')
    .trim()
    .replace(/;$/, '');
  
  // This is a hacky way since it's JS, not JSON. 
  // Let's use eval in a controlled way or just use a regex if possible.
  // Actually, we can just run it in node if we transform it to commonjs.
  const commonjsContent = content.replace('export default', 'module.exports =');
  const tempFile = path.join(__dirname, `temp_${path.basename(filePath)}.js`);
  fs.writeFileSync(tempFile, commonjsContent);
  const data = require(tempFile);
  fs.unlinkSync(tempFile);
  return data;
}

const baseData = parseLocale(path.join(localesDir, baseFile));
const baseKeys = getKeys(baseData);

const otherFiles = fs.readdirSync(localesDir).filter(f => f.endsWith('.ts') && f !== baseFile && f !== 'index.ts');

otherFiles.forEach(file => {
  try {
    const data = parseLocale(path.join(localesDir, file));
    const keys = getKeys(data);
    const missing = baseKeys.filter(k => !keys.includes(k));
    if (missing.length > 0) {
      console.log(`File: ${file} is missing keys:`, missing);
    } else {
      console.log(`File: ${file} is up to date.`);
    }
  } catch (e) {
    console.error(`Error parsing ${file}:`, e.message);
  }
});

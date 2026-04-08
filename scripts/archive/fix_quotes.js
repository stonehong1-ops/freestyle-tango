const fs = require('fs');
const path = require('path');

const localesDir = 'c:/Users/stone/FreestyleTango/src/locales';
const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.ts') && f !== 'index.ts');

files.forEach(file => {
  const filePath = path.join(localesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix keys that often have single quotes: reserve, complete, etc.
  // We look for patterns like : '...n'est...' and replace with n\'est
  // A simple regex approach: look for a quote not preceded by a backslash and not at the start/end of the value
  
  // Actually, since it's a small set of files, I'll do a more targeted fix for the keys I just added
  content = content.replace(/(directBookingWarning: ')(.*)(')/g, (match, p1, p2, p3) => {
    const fixedP2 = p2.replace(/(?<!\\)'/g, "\\'");
    return p1 + fixedP2 + p3;
  });

  // Also fix other common keys that might have been broken by manual edits or previous scripts
  content = content.replace(/(submitBtn: ')(.*)(')/g, (match, p1, p2, p3) => {
    const fixedP2 = p2.replace(/(?<!\\)'/g, "\\'");
    return p1 + fixedP2 + p3;
  });

  fs.writeFileSync(filePath, content);
  console.log(`Fixed quotes in ${file}`);
});

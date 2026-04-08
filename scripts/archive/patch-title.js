const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'src', 'locales');
const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.ts') && f !== 'index.ts');

for (const file of files) {
  const filePath = path.join(localesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (content.includes(' (수업신청자만 가능)')) {
    content = content.replace(' (수업신청자만 가능)', '');
  }
  if (content.includes(' (Only for registrants)')) {
    content = content.replace(' (Only for registrants)', '');
  }
  if (content.match(/ \([^)]*registrants[^)]*\)/i)) {
    content = content.replace(/ \([^)]*registrants[^)]*\)/gi, '');
  }
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Cleaned', file);
}

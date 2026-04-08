const fs = require('fs');
const path = require('path');
const localesDir = path.join(__dirname, '..', 'c:\\Users\\stone\\FreestyleTango\\src\\locales'); // adjust path if run in project root

function updateLocales() {
  const dir = 'c:\\Users\\stone\\FreestyleTango\\src\\locales';
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.ts') && f !== 'ko.ts' && f !== 'index.ts');

  files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Find nav object end
    const navEndMatch = content.match(/nav: \{([\s\S]*?)(\s*)\},/);
    if (navEndMatch) {
      if (!content.includes('classGuide:')) {
        let newNavContent = navEndMatch[1];
        
        let cg = 'Class Guide';
        let fsSchedule = 'Full Schedule';
        
        if (file === 'ja.ts') { cg = 'クラス案内'; fsSchedule = '全体スケジュール'; }
        if (file === 'zh-CN.ts') { cg = '课程指南'; fsSchedule = '完整日程'; }
        if (file === 'zh-TW.ts') { cg = '課程指南'; fsSchedule = '完整日程'; }
        if (file === 'es.ts') { cg = 'Guía de Clases'; fsSchedule = 'Horario Completo'; }
        
        newNavContent += `,
    classGuide: '${cg}',
    fullSchedule: '${fsSchedule}'`;
        
        const newContent = content.replace(navEndMatch[0], `nav: {${newNavContent}${navEndMatch[2]}},`);
        fs.writeFileSync(filePath, newContent, 'utf-8');
        console.log('Updated ' + file);
      }
    }
  });
}
updateLocales();

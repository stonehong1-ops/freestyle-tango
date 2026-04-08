const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'src', 'locales');
const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.ts') && f !== 'index.ts');

const words = {
    ko: '이미 등록된 내역이 있습니다. 수정 기능을 이용해주세요.',
    en: 'Registration exists. Please edit it.',
    es: 'Ya existe una inscripción. Por favor, edítala.',
    fr: 'Une inscription existe déjà. Veuillez la modifier.',
    it: "Esiste già un'iscrizione. Si prega di modificarla.",
    ja: '登録済み입니다. 수정 기능입니다 이용해주세요.',
    tr: 'Kayıt zaten var. Lütfen düzenleyin.',
    vi: 'Đã có đăng ký. Vui lòng chỉnh sửa.',
    'zh-CN': '已有关联注册。请进行编辑。',
    'zh-TW': '已有關聯註冊。請進行編輯。'
};

for (const file of files) {
    const lang = file.split('.')[0];
    const msg = words[lang] || words['en'];
    const filePath = path.join(localesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Remove the broken/old alreadyRegistered if it exists
    // It might have single quotes inside which broke it
    content = content.replace(/,\s*alreadyRegistered:\s*['"](.*?)['"](?=[,}])/, '');
    
    // 2. Clear out any previous broken attempt in it.ts if any
    if (lang === 'it') {
        content = content.replace("alreadyRegistered: 'Esiste già un'iscrizione. Si prega di modificarla.'", "");
    }

    // 3. Add it properly using double quotes for values to avoid single quote issues
    if (!content.includes('alreadyRegistered:')) {
        if (content.includes('deleteSuccess:')) {
            content = content.replace(/(deleteSuccess:\s*['"][^'"]*['"])/, `$1, alreadyRegistered: "${msg}"`);
            fs.writeFileSync(filePath, content, 'utf8');
            console.log('Patched', file);
        } else if (content.includes('history: {')) {
            content = content.replace(/(history:\s*\{)/, `$1 alreadyRegistered: "${msg}",`);
            fs.writeFileSync(filePath, content, 'utf8');
            console.log('Patched (fallback)', file);
        }
    }
}

const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'src', 'locales');
const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.ts') && f !== 'index.ts');

const words = {
    ko: '이미 등록된 내역이 있습니다. 수정 기능을 이용해주세요.',
    en: 'Registration exists. Please edit it.',
    es: 'Ya existe una inscripción. Por favor, edítala.',
    fr: 'Une inscription existe già. Veuillez la modifier.',
    it: "Esiste già un'iscrizione. Si prega di modificarla.",
    ja: '登録済みです。修正機能を利用してください.',
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

    // Remove any previous attempts to avoid duplicates or broken syntax
    content = content.replace(/,\s*alreadyRegistered:\s*".*?"/g, '');
    content = content.replace(/,\s*alreadyRegistered:\s*'.*?'/g, '');

    // Now find the history: { ... } block and add it there
    // We look for the history object specifically.
    const historyRegex = /(history:\s*\{[\s\S]*?deleteConfirm:.*?\n)/;
    if (historyRegex.test(content)) {
        content = content.replace(historyRegex, `$1      alreadyRegistered: "${msg}",\n`);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Patched history in', file);
    } else {
        console.log('Could not find history block in', file);
    }
}

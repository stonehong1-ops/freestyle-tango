const fs = require('fs');

const data = {
  'ja.ts': [
    "      typeSelectorTitle: '登録タイプを選択',",
    "      typeIndividual: '個別受講 / 1ヶ月メンバーシップ',",
    "      typeMembership6: '6ヶ月メンバーシップ',"
  ],
  'zh-CN.ts': [
    "      typeSelectorTitle: '选择注册类型',",
    "      typeIndividual: '单独课程 / 1个月会员',",
    "      typeMembership6: '6个月会员',"
  ],
  'zh-TW.ts': [
    "      typeSelectorTitle: '選擇註冊類型',",
    "      typeIndividual: '單獨課程 / 1個月會員',",
    "      typeMembership6: '6個月會員',"
  ],
  'es.ts': [
    "      typeSelectorTitle: 'Seleccione el tipo de registro',",
    "      typeIndividual: 'Clase individual / Membresía de 1 mes',",
    "      typeMembership6: 'Membresía de 6 meses',"
  ],
  'fr.ts': [
    "      typeSelectorTitle: 'Sélectionnez le type d\\'inscription',",
    "      typeIndividual: 'Cours individuel / Abonnement d\\'un mois',",
    "      typeMembership6: 'Abonnement de 6 mois',"
  ],
  'it.ts': [
    "      typeSelectorTitle: 'Seleziona il tipo di registrazione',",
    "      typeIndividual: 'Lezione singola / Abbonamento di 1 mese',",
    "      typeMembership6: 'Abbonamento di 6 mesi',"
  ],
  'vi.ts': [
    "      typeSelectorTitle: 'Chọn loại đăng ký',",
    "      typeIndividual: 'Lớp học lẻ / Thành viên 1 tháng',",
    "      typeMembership6: 'Thành viên 6 tháng',"
  ],
  'tr.ts': [
    "      typeSelectorTitle: 'Kayıt Türünü Seçin',",
    "      typeIndividual: 'Bireysel Ders / 1 Aylık Üyelik',",
    "      typeMembership6: '6 Aylık Üyelik',"
  ]
};

for (const [filename, lines] of Object.entries(data)) {
  const filepath = 'src/locales/' + filename;
  let text = fs.readFileSync(filepath, 'utf8');
  let newText = text.replace(/(selectPrompt:\s*'.*?',)/, `$1\n${lines.join('\n')}`);
  fs.writeFileSync(filepath, newText, 'utf8');
  console.log('updated', filename);
}

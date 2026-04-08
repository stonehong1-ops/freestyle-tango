import fs from 'fs';
import path from 'path';

const LOCALES_DIR = './src/locales';
const FILES = ['en.ts', 'ja.ts', 'zh-CN.ts', 'zh-TW.ts', 'es.ts', 'fr.ts', 'it.ts', 'vi.ts', 'tr.ts'];

const NEW_KEYS = {
  'en.ts': {
    fullStatusTitle: "{month}th Registration Status",
    viewMonthlyStatus: "View Monthly Status",
    monthlyStatusTitle: "Monthly Reservation Status"
  },
  'ja.ts': {
    fullStatusTitle: "{month}月 全体申込現況",
    viewMonthlyStatus: "月別全体現況表示",
    monthlyStatusTitle: "月別全体予約現況"
  },
  'zh-CN.ts': {
    fullStatusTitle: "{month}月 全月申请情况",
    viewMonthlyStatus: "查看月度整体情况",
    monthlyStatusTitle: "月度整体预约情况"
  },
  'zh-TW.ts': {
    fullStatusTitle: "{month}月 全月申請情況",
    viewMonthlyStatus: "查看月度整體情況",
    monthlyStatusTitle: "月度整體預約情況"
  },
  'es.ts': {
    fullStatusTitle: "Estado de registro de {month}",
    viewMonthlyStatus: "Ver estado mensual",
    monthlyStatusTitle: "Estado de reserva mensual"
  },
  'fr.ts': {
    fullStatusTitle: "État d'inscription de {month}",
    viewMonthlyStatus: "Voir l'état mensuel",
    monthlyStatusTitle: "État de réservation mensuel"
  },
  'it.ts': {
    fullStatusTitle: "Stato iscrizione di {month}",
    viewMonthlyStatus: "Vedi stato mensile",
    monthlyStatusTitle: "Stato prenotazione mensile"
  },
  'vi.ts': {
    fullStatusTitle: "Tình trạng đăng ký tháng {month}",
    viewMonthlyStatus: "Xem tình trạng hàng tháng",
    monthlyStatusTitle: "Tình trạng đặt phòng hàng tháng"
  },
  'tr.ts': {
    fullStatusTitle: "{month} Kayıt Durumu",
    viewMonthlyStatus: "Aylık Durumu Görüntüle",
    monthlyStatusTitle: "Aylık Rezervasyon Durumu"
  }
};

FILES.forEach(file => {
  const filePath = path.join(LOCALES_DIR, file);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf-8');
  const keys = NEW_KEYS[file];

  // 1. Add fullStatusTitle after viewFullStatus
  if (content.includes('viewFullStatus:') && !content.includes('fullStatusTitle:')) {
    content = content.replace(
      /(viewFullStatus:\s*'.*?',)/,
      `$1\n      fullStatusTitle: '${keys.fullStatusTitle}',`
    );
  }

  // 2. Add stays keys if stays object exists but doesn't have them
  if (content.includes('stays: {')) {
    if (!content.includes('viewMonthlyStatus:')) {
      content = content.replace(
        /(stays:\s*{)/,
        `$1\n    viewMonthlyStatus: '${keys.viewMonthlyStatus}',\n    monthlyStatusTitle: '${keys.monthlyStatusTitle}',`
      );
    }
  }

  fs.writeFileSync(filePath, content);
  console.log(`✅ ${file} updated.`);
});

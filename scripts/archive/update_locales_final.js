const fs = require('fs');
const path = require('path');

const localesDir = 'c:/Users/stone/FreestyleTango/src/locales';
const files = ['en.ts', 'ja.ts', 'zh-CN.ts', 'zh-TW.ts', 'es.ts', 'fr.ts', 'it.ts', 'vi.ts', 'tr.ts'];

const updates = {
  'en.ts': { btn: 'Complete Reservation', warning: 'Clicking the button below completes the reservation.\\nYour booking will be cancelled if payment is not received within 1 hour.' },
  'ja.ts': { btn: '予約完了', warning: '下のボタンをクリックすると予約が完了します。\\n1時間以内に入金がない場合、ホ스트が予約をキャンセルします。' },
  'zh-CN.ts': { btn: '完成预订', warning: '点击下方按钮即可完成预订。\\n如果1小时内未收到付款，房东将取消预订。' },
  'zh-TW.ts': { btn: '完成預訂', warning: '點擊下方按鈕即可完成預訂。\\n如果1小時內未收到付款，房東將取消預訂。' },
  'es.ts': { btn: 'Completar reserva', warning: 'Al hacer clic en el botón inferior se completa la reserva.\\nSe cancelará si no se recibe el pago en 1 hora.' },
  'fr.ts': { btn: 'Terminer la réservation', warning: 'Cliquer sur le bouton ci-dessous finalise la réservation.\\nElle sera annulée si le paiement n\'est pas reçu sous 1 heure.' },
  'it.ts': { btn: 'Completa prenotazione', warning: 'Cliccando sul pulsante in basso si completa la prenotazione.\\nVerrà annullata se il pagamento non perviene entro 1 ora.' },
  'vi.ts': { btn: 'Hoàn tất đặt phòng', warning: 'Nhấp vào nút bên dưới để hoàn tất đặt phòng.\\nYêu cầu sẽ bị hủy nếu không nhận được thanh toán trong vòng 1 giờ.' },
  'tr.ts': { btn: 'Rezervasyonu Tamamla', warning: 'Aşağıdaki butona tıklayarak rezervasyonu tamamlayabilirsiniz.\\n1 saat içinde ödeme yapılmazsa rezervasyon iptal edilecektir.' }
};

files.forEach(file => {
  const filePath = path.join(localesDir, file);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  const { btn, warning } = updates[file];
  
  // Update submitBtn
  content = content.replace(/submitBtn: '.*',/, `submitBtn: '${btn}',`);
  
  // Add directBookingWarning after submitBtn
  if (!content.includes('directBookingWarning:')) {
    content = content.replace(`submitBtn: '${btn}',`, `submitBtn: '${btn}',\n    directBookingWarning: '${warning}',`);
  }
  
  fs.writeFileSync(filePath, content);
  console.log(`Updated locales in ${file}`);
});

const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'src', 'locales');
const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.ts') && f !== 'index.ts');

const translations = {
  ko: `    history: { title: '내 신청내역', confirmPayBtn: '입금 확인 요청', paidMsg: '입금 확인 완료 ({type} / {amount}원)', paidDate: '입금일: {date}', edit: '수정', delete: '삭제', confirmSuccess: '수정되었습니다.', error: '오류가 발생했습니다.', alreadyRegistered: '이미 등록된 내역이 있습니다. 수정 기능을 이용해주세요.' },
    registrationStatus: { editTitle: '신청 수정', newTitle: '{month}월 클래스 신청', cancelEdit: '수정 취소', desc: '원하시는 수업을 선택해주세요 (다중 선택 가능)', selectPrompt: '수업을 1개 이상 선택해주세요', editSubmit: '수정완료', newSubmit: '신청하기' },
    payment: { title: '입금 확인 요청', desc: '입금하신 금액을 선택해주세요.', placeholder: '선택하세요', submit: '요청하기', cancel: '취소', optionPrompt: '옵션을 선택해주세요.', options: ['개별수강: 120,000원', '1개월멤버쉽: 180,000원', '6개월멤버쉽 1차분 (860,000원)', '6개월멤버쉽 2~6차분 (0원)'] },`,
  en: `    history: { title: 'Registration History', confirmPayBtn: 'Request Payment Conf', paidMsg: 'Payment Confirmed ({type} / {amount} KRW)', paidDate: 'Paid on: {date}', edit: 'Edit', delete: 'Delete', confirmSuccess: 'Updated successfully.', error: 'An error occurred.', alreadyRegistered: 'Registration exists. Please edit it.' },
    registrationStatus: { editTitle: 'Edit Registration', newTitle: '{month} Registration', cancelEdit: 'Cancel Edit', desc: 'Select classes you want to attend (Multiple choices)', selectPrompt: 'Please select at least 1 class', editSubmit: 'Complete Edit', newSubmit: 'Submit' },
    payment: { title: 'Payment Confirmation', desc: 'Please select the amount you paid.', placeholder: 'Select Option', submit: 'Submit', cancel: 'Cancel', optionPrompt: 'Please select an option.', options: ['Single Classes: 120,000 KRW', '1-Month Membership: 180,000 KRW', '6-Month Membership (1st trans): 860,000 KRW', '6-Month Membership (others): 0 KRW'] },`
};

for (const file of files) {
  const lang = file.split('.')[0];
  const block = translations[lang] || translations['en'];
  
  const filePath = path.join(localesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (!content.includes('registrationStatus: {')) {
    content = content.replace(/(\s+)registration:\s*\{/, '$1' + block.trimStart() + '\n$1registration: {');
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Patched', file);
  }
}

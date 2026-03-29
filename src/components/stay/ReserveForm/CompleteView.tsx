'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import styles from './ReserveForm.module.css';

interface CompleteViewProps {
  data: {
    stayId: string;
    name: string;
    phone: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    totalAmount: number;
    message?: string;
  };
  onHome: () => void;
}

export default function CompleteView({ data, onHome }: CompleteViewProps) {
  const { t } = useLanguage();
  const [isIOS, setIsIOS] = useState(false);

  // @ts-ignore
  const stayName = t.stays[data.stayId]?.name || '탱고스테이';

  useEffect(() => {
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent));
  }, []);

  const fullBody = `[${stayName} 예약확인]
예약자: ${data.name}님
날짜: ${data.checkIn} ~ ${data.checkOut}
인원: ${data.guests}명
금액: ${data.totalAmount.toLocaleString()}원

[입실 안내]
시간: 오후 4시
비밀번호: 9999

감사합니다!`;
  
  const separator = isIOS ? '&' : '?';
  const smsUrl = `sms:${data.phone}${separator}body=${encodeURIComponent(fullBody)}`;

  return (
    <div className={styles.completeCard}>
      <div className={styles.completeIcon}>✅</div>
      <h1 className={styles.completeTitle}>{t.complete.title}</h1>
      <p className={styles.completeDesc}>
        {t.complete.desc}
      </p>

      <div className={styles.smsSection}>
        <a href={smsUrl} className={styles.smsBtn}>
           📱 {t.complete.guestSmsBtn}
        </a>
      </div>
      
      <div className={styles.actions}>
        <button onClick={onHome} className={styles.homeBtn}>
          {t.complete.homeBtn}
        </button>
      </div>
    </div>
  );
}

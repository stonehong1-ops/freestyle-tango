'use client';

import { STAYS } from '@/constants/stays';
import { useLanguage } from '@/contexts/LanguageContext';
import styles from './StaySelector.module.css';

interface StaySelectorProps {
  selectedStayId: string;
  onSelect: (id: string) => void;
  language?: string;
  onLanguageChange?: (lang: any) => void;
}

export default function StaySelector({ selectedStayId, onSelect, language, onLanguageChange }: StaySelectorProps) {
  const { t } = useLanguage();

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.stayList}>
          {STAYS.map((stay) => {
            // @ts-ignore - t.stays dynamic indexing
            const stayName = t.stays[stay.id]?.name || stay.id;
            const preparingText = t.calendar.checkin === 'Check-in' ? '(Preparing)' : '(준비중)';
            const displayName = stay.isPreparing ? `${stayName} ${preparingText}` : stayName;

            return (
              <button
                key={stay.id}
                className={`${styles.stayBtn} ${selectedStayId === stay.id ? styles.active : ''}`}
                onClick={() => onSelect(stay.id)}
                disabled={stay.isPreparing}
              >
                {displayName}
              </button>
            )
          })}
        </div>
        
        {language && onLanguageChange && (
          <div className={styles.langFilter}>
            <select 
              value={language} 
              onChange={(e) => onLanguageChange(e.target.value)}
              className={styles.langSelect}
            >
              <option value="ko">KO</option>
              <option value="en">EN</option>
              <option value="ja">JA</option>
              <option value="zh-CN">CN</option>
              <option value="zh-TW">TW</option>
              <option value="es">ES</option>
              <option value="vi">VI</option>
              <option value="it">IT</option>
              <option value="fr">FR</option>
              <option value="tr">TR</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
}

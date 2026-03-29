'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { STAYS } from '@/constants/stays';
import styles from './LocationSection.module.css';

export default function LocationSection({ stayId = 'hapjeong' }: { stayId?: string }) {
  const { t } = useLanguage();
  const stayInfo = STAYS.find(s => s.id === stayId) || STAYS[0];
  // @ts-ignore
  const stayLoc = t.stays[stayId]?.location || t.stays.hapjeong.location;

  return (
    <section className={styles.container} id="location">
      <h2 className={styles.title}>{stayLoc.title}</h2>
      <p className={styles.address}>
        <strong>{stayLoc.addressLabel}</strong> {stayLoc.address}<br/>
        <strong>{stayLoc.bldgLabel}</strong> {stayLoc.bldg}
      </p>

      <div className={styles.mapWrapper}>
        <iframe
          src={stayInfo.googleMapUrl}
          width="100%"
          height="350"
          style={{ border: 0, borderRadius: '12px' }}
          allowFullScreen={false}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={`TangoStay Google Maps - ${stayInfo.id}`}
        />
      </div>

      <div className={styles.buttonGroup}>
        <a 
          href={stayInfo.naverMapUrl} 
          rel="noopener noreferrer"
          className={`${styles.mapBtn} ${styles.naver}`}
        >
          {t.location.naver}
        </a>
        <a 
          href={stayInfo.kakaoMapUrl} 
          rel="noopener noreferrer"
          className={`${styles.mapBtn} ${styles.kakao}`}
        >
          {t.location.kakao}
        </a>
      </div>
    </section>
  );
}

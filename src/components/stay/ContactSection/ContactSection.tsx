'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import styles from './ContactSection.module.css';

export default function ContactSection() {
  const { t } = useLanguage();

  return (
    <div className={styles.container} id="contact">
      <header className={styles.header}>
        <h2 className={styles.title}>{t.common.contact.title}</h2>
      </header>

      <div className={styles.contactGrid}>
        <a href="tel:010-7209-2468" target="_blank" rel="noopener noreferrer" className={styles.contactCard}>
          <div className={styles.icon}>📞</div>
          <h3>{t.common.contact.call}</h3>
          <p>{t.common.contact.callDesc}</p>
        </a>

        <a href="sms:010-7209-2468" target="_blank" rel="noopener noreferrer" className={styles.contactCard}>
          <div className={styles.icon}>💬</div>
          <h3>{t.common.contact.sms}</h3>
          <p>{t.common.contact.smsDesc}</p>
        </a>

        <a href="https://open.kakao.com/o/sNq0Irmi" target="_blank" rel="noopener noreferrer" className={`${styles.contactCard} ${styles.kakao}`}>
          <div className={styles.icon}>💛</div>
          <h3>{t.common.contact.kakao}</h3>
          <p>{t.common.contact.kakaoDesc}</p>
        </a>

        <a href="https://wa.me/821072092468" target="_blank" rel="noopener noreferrer" className={`${styles.contactCard} ${styles.whatsapp}`}>
          <div className={styles.icon}>🟩</div>
          <h3>{t.common.contact.whatsapp}</h3>
          <p>{t.common.contact.whatsappDesc}</p>
        </a>

        <a href="https://m.me/StoneHong1" target="_blank" rel="noopener noreferrer" className={`${styles.contactCard} ${styles.messenger}`}>
          <div className={styles.icon}>📘</div>
          <h3>{t.common.contact.fb}</h3>
          <p>{t.common.contact.fbDesc}</p>
        </a>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';
import styles from './Footer.module.css';

export default function Footer() {
  const [modalType, setModalType] = useState<'term' | 'privacy' | null>(null);
  const { t } = useLanguage();

  const f = t.common.footer;
  const story = t.common.story;
  const contact = t.common.contact;

  return (
    <>
      <footer className={styles.footer}>
        <div className={styles.container}>
          {/* Host Profile Section (Simplified) */}
          <section className={styles.hostSection}>
            <div className={styles.hostAvatar}>
              <Image 
                src="/images/stonehong.jpg" 
                alt="Host Stone" 
                width={60} 
                height={60} 
                className={styles.avatarImage}
              />
            </div>
            <div className={styles.hostInfo}>
              <h3 className={styles.hostName}>{story.hostName}</h3>
              <p className={styles.hostBio}>{story.hostBio.split('\n')[0]}</p>
            </div>
          </section>

          {/* Contact Grid Section */}
          <section className={styles.contactGrid}>
            <a href="tel:010-7209-2468" target="_blank" rel="noopener noreferrer" className={styles.contactCard}>
              <span className={styles.icon}>📞</span>
              <span className={styles.label}>{contact.call}</span>
            </a>
            <a href="sms:010-7209-2468" target="_blank" rel="noopener noreferrer" className={styles.contactCard}>
              <span className={styles.icon}>💬</span>
              <span className={styles.label}>{contact.sms}</span>
            </a>
            <a href="https://open.kakao.com/o/sNq0Irmi" target="_blank" rel="noopener noreferrer" className={styles.contactCard}>
              <span className={styles.icon}>💛</span>
              <span className={styles.label}>{contact.kakao}</span>
            </a>
            <a href="https://wa.me/821072092468" target="_blank" rel="noopener noreferrer" className={styles.contactCard}>
              <span className={styles.icon}>🟩</span>
              <span className={styles.label}>{contact.whatsapp}</span>
            </a>
            <a href="https://m.me/StoneHong1" target="_blank" rel="noopener noreferrer" className={styles.contactCard}>
              <span className={styles.icon}>📘</span>
              <span className={styles.label}>{contact.fb}</span>
            </a>
          </section>

          <hr className={styles.footerDivider} />

          <div className={styles.legalInfo}>
            <div className={styles.links}>
              <button onClick={() => setModalType('term')} className={styles.linkBtn}>{f.term}</button>
              <span className={styles.dot}>·</span>
              <button onClick={() => setModalType('privacy')} className={styles.linkBtn}>{f.privacy}</button>
            </div>
            <p 
              className={styles.copyright} 
              onClick={() => window.location.href = '/admin'}
              style={{ cursor: 'pointer' }}
            >
              © {new Date().getFullYear()} TangoStay. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {modalType && (
        <div className={styles.modalOverlay} onClick={() => setModalType(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setModalType(null)}>&times;</button>
            <h3 className={styles.modalTitle}>{modalType === 'term' ? f.termTitle : f.privacyTitle}</h3>
            <pre className={styles.modalText}>{modalType === 'term' ? f.termText : f.privacyText}</pre>
          </div>
        </div>
      )}
    </>
  );
}

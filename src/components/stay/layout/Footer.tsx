'use client';

import { useState } from 'react';
import Image from 'next/image';
import CompactHostProfile from '@/components/common/CompactHostProfile';
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
          <div className={styles.hostProfileWrapper}>
            <CompactHostProfile showBio={false} />
          </div>

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

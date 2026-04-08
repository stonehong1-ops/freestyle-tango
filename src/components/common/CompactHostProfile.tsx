'use client';

import React from 'react';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';
import styles from './CompactHostProfile.module.css';

interface CompactHostProfileProps {
  className?: string;
  showBio?: boolean;
}

export default function CompactHostProfile({ className = '', showBio = false }: CompactHostProfileProps) {
  const { language, t } = useLanguage();
  
  // Contact values (Standardized)
  const phone = '010-7209-2468';
  const kakaoUrl = 'https://open.kakao.com/me/StoneHong';
  const whatsappUrl = 'https://wa.me/821072092468';
  
  const contactLabels = t.common.contact;

  return (
    <div className={`${styles.profileCard} ${className}`}>
      <div className={styles.avatarWrapper}>
        <Image 
          src="/images/stone.jpg" 
          alt="Host Stone" 
          width={60} 
          height={60} 
          className={styles.avatar}
        />
      </div>
      
      <div className={styles.infoWrapper}>
        <div className={styles.headerRow}>
          <h4 className={styles.name}>Stone</h4>
          {!showBio && <span className={styles.role}>{t.common.story.hostBio}</span>}
        </div>
        
        {showBio && (
          <p className={styles.bio}>
            {t.common.story.hostBio}
          </p>
        )}

        <div className={styles.contactActions}>
          <a href={`tel:${phone}`} title={contactLabels.call} className={styles.actionBtn}>
            <span className={styles.icon}>📞</span>
          </a>
          <a href={`sms:${phone}`} title={contactLabels.sms} className={styles.actionBtn}>
            <span className={styles.icon}>💬</span>
          </a>
          <a href={kakaoUrl} target="_blank" rel="noopener noreferrer" title={contactLabels.kakao} className={`${styles.actionBtn} ${styles.kakao}`}>
            <span className={styles.icon}>Talk</span>
          </a>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" title={contactLabels.whatsapp} className={`${styles.actionBtn} ${styles.whatsapp}`}>
            <span className={styles.icon}>WA</span>
          </a>
        </div>
      </div>
    </div>
  );
}

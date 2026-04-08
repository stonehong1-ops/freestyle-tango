'use client';

import React from 'react';
import styles from './ClassCard.module.css';
import { useLanguage } from '@/contexts/LanguageContext';

interface ClassCardProps {
  id: string;
  level: string;
  title: string;
  time: string;
  teacher: string;
  imageUrl?: string;
  price: string;
  leaderCount: number;
  followerCount: number;
  maxCount: number;
  curriculum?: string;
  isApplied?: boolean;
  isRegistered?: boolean;
  onClick: (id: string) => void;
}

export default function ClassCard({
  id,
  level,
  title,
  time,
  curriculum,
  teacher,
  imageUrl,
  price,
  leaderCount,
  followerCount,
  maxCount,
  isApplied,
  isRegistered,
  onClick
}: ClassCardProps) {
  const { t, language } = useLanguage();
  const leadPercent = (leaderCount / maxCount) * 100;
  const followPercent = (followerCount / maxCount) * 100;

  return (
    <div className={styles.card} onClick={() => onClick(id)}>
      {isApplied && (
        <div className={styles.appliedBadge}>
          {t.home.registration.selected}
        </div>
      )}
      <div className={styles.leftColumn}>
        <div className={styles.imageArea}>
          {imageUrl ? (
            <img src={imageUrl} alt={teacher} crossOrigin="anonymous" />
          ) : (
            <div style={{ backgroundColor: '#eef3f6', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b95a1' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>TANGO</span>
            </div>
          )}
        </div>
        <div className={styles.teacherName}>
          {teacher}
        </div>
      </div>
      
      <div className={styles.contentArea}>
        <div className={styles.level}>{level}</div>
        <h3 className={styles.title}>{title}</h3>
        {curriculum && <div className={styles.curriculum}>{curriculum}</div>}
        <div className={styles.time}>{time}</div>
        
        <div className={styles.footerArea}>
          <div className={styles.price}>{price}</div>
          <div className={styles.roleBalance}>
            <div className={styles.balanceStatus}>
              <span className={styles.roleLabel}>{t.home.registration.leader}</span>
              <div className={styles.balanceBar}>
                <div className={styles.leaderPart} style={{ width: `${leadPercent}%` }} />
              </div>
              <span className={styles.countLabel}>{leaderCount}</span>
            </div>
            <div className={styles.balanceStatus}>
              <span className={styles.roleLabel}>{t.home.registration.follower}</span>
              <div className={styles.balanceBar}>
                <div className={styles.followerPart} style={{ width: `${followPercent}%` }} />
              </div>
              <span className={styles.countLabel}>{followerCount}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

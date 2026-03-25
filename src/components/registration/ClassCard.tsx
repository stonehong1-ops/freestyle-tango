'use client';

import React from 'react';
import styles from './ClassCard.module.css';

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
  isApplied?: boolean;
  onClick: (id: string) => void;
}

export default function ClassCard({
  id,
  level,
  title,
  time,
  teacher,
  imageUrl,
  price,
  leaderCount,
  followerCount,
  maxCount,
  isApplied,
  onClick
}: ClassCardProps) {
  const leadPercent = (leaderCount / maxCount) * 100;
  const followPercent = (followerCount / maxCount) * 100;

  return (
    <div className={styles.card} onClick={() => onClick(id)}>
      {isApplied && (
        <div className={styles.appliedBadge}>
          ✅ 선택됨
        </div>
      )}
      <div className={styles.leftColumn}>
        <div className={styles.imageArea}>
          {imageUrl ? (
            <img src={imageUrl} alt={teacher} />
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
        <div className={styles.time}>{time}</div>
        
        <div className={styles.footerArea}>
          <div className={styles.price}>{price}</div>
          <div className={styles.roleBalance}>
            <div className={styles.balanceStatus}>
              <span className={styles.roleLabel}>리더</span>
              <div className={styles.balanceBar}>
                <div className={styles.leaderPart} style={{ width: `${leadPercent}%` }} />
              </div>
              <span className={styles.countLabel}>{leaderCount}</span>
            </div>
            <div className={styles.balanceStatus}>
              <span className={styles.roleLabel}>팔로워</span>
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

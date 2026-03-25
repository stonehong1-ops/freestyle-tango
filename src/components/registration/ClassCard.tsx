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
  maleCount: number;
  femaleCount: number;
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
  maleCount,
  femaleCount,
  maxCount,
  isApplied,
  onClick
}: ClassCardProps) {
  const malePercent = (maleCount / maxCount) * 100;
  const femalePercent = (femaleCount / maxCount) * 100;

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
          <div className={styles.genderBalance}>
            <div className={styles.balanceStatus}>
              <span className={styles.roleLabel}>리더</span>
              <div className={styles.balanceBar}>
                <div className={styles.malePart} style={{ width: `${malePercent}%` }} />
              </div>
              <span className={styles.countLabel}>{maleCount}</span>
            </div>
            <div className={styles.balanceStatus}>
              <span className={styles.roleLabel}>팔로워</span>
              <div className={styles.balanceBar}>
                <div className={styles.femalePart} style={{ width: `${femalePercent}%` }} />
              </div>
              <span className={styles.countLabel}>{femaleCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

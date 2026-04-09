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
  isAdmin?: boolean;
  onEdit?: (id: string, e: React.MouseEvent) => void;
  onDelete?: (id: string, e: React.MouseEvent) => void;
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
  isAdmin,
  onEdit,
  onDelete,
  onClick
}: ClassCardProps) {
  const { t, language } = useLanguage();
  const [showMenu, setShowMenu] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);
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
        <div className={styles.headerRow}>
          <div className={styles.level}>{level}</div>
          {isAdmin && (
            <div className={styles.adminMenuWrapper} ref={menuRef}>
              <button 
                className={styles.menuBtn} 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
              >
                ⋮
              </button>
              {showMenu && (
                <div className={styles.dropdownMenu}>
                  <div className={styles.menuItem} onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                    onEdit?.(id, e);
                  }}>
                    {t.home.registration.edit || '수정'}
                  </div>
                  <div className={`${styles.menuItem} ${styles.deleteItem}`} onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                    onDelete?.(id, e);
                  }}>
                    {t.home.registration.delete || '삭제'}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
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

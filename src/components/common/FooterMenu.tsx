'use client';

import React from 'react';
import styles from './FooterMenu.module.css';
import { useLanguage } from '@/contexts/LanguageContext';

const MENU_ITEMS = [
  { 
    id: 'lucy', 
    label: 'Milonga', 
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#3182f6" : "#8b95a1"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    )
  },
  { 
    id: 'home', 
    label: 'Class', 
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#3182f6" : "#8b95a1"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-7 10 7-10 7-10-7z"/><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/>
      </svg>
    )
  },
  { 
    id: 'stay', 
    label: 'Stay', 
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#3182f6" : "#8b95a1"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>
      </svg>
    )
  },
  { 
    id: 'chat', 
    label: 'Chatting', 
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#3182f6" : "#8b95a1"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
      </svg>
    )
  },
  { 
    id: 'info', 
    label: 'Info', 
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#3182f6" : "#8b95a1"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><path d="M12 16v-4m0-4h.01"/>
      </svg>
    )
  },
  { 
    id: 'mypage', 
    label: 'MyPage', 
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#3182f6" : "#8b95a1"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    )
  },

];

interface FooterMenuProps {
  onAction?: (actionId: string) => void;
  activeId?: string;
  unreadCounts?: Record<string, number>;
}

export default function FooterMenu({ onAction, activeId: propActiveId, unreadCounts = {} }: FooterMenuProps) {
  const [activeId, setActiveId] = React.useState(propActiveId || 'lucy');
  const { t, language } = useLanguage();

  React.useEffect(() => {
    if (propActiveId) {
      setActiveId(propActiveId);
    }
  }, [propActiveId]);

  const handleAction = (id: string) => {
    setActiveId(id);
    if (onAction) onAction(id);
  };

  return (
    <nav className={styles.footer}>
      {MENU_ITEMS.map((item) => (
        <button
          key={item.id}
          className={`${styles.menuItem} ${activeId === item.id ? styles.active : ''}`}
          onClick={() => handleAction(item.id)}
        >
          {activeId === item.id && <div className={styles.activeIndicator} />}
          {unreadCounts[item.id] > 0 && <span className={styles.badge}>{unreadCounts[item.id]}</span>}
          <span className={styles.icon}>{item.icon(activeId === item.id)}</span>
          <span className={styles.label}>
            {t.nav[item.id as keyof typeof t.nav] || item.label}
          </span>
        </button>
      ))}
    </nav>
  );
}

'use client';

import React from 'react';
import styles from './FooterMenu.module.css';
import { useLanguage } from '@/contexts/LanguageContext';

const MENU_ITEMS = [
  { 
    id: 'lucy', 
    label: '밀롱가', 
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#3182f6" : "#8b95a1"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 9V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.69.9H20a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-1" />
        <path d="M2 9h20" />
        <path d="M2 13h20" />
      </svg>
    )
  },
  { 
    id: 'stay', 
    label: '탱고스테이', 
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#3182f6" : "#8b95a1"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    )
  },
  { 
    id: 'home', 
    label: '클래스', 
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#3182f6" : "#8b95a1"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    )
  },
  { 
    id: 'membership', 
    label: '안내.문의', 
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#3182f6" : "#8b95a1"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        <line x1="9" y1="9" x2="15" y2="9"/>
        <line x1="9" y1="13" x2="13" y2="13"/>
      </svg>
    )
  },
  { 
    id: 'chat', 
    label: '채팅', 
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#3182f6" : "#8b95a1"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    )
  },
  { 
    id: 'status', 
    label: '마이페이지', 
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#3182f6" : "#8b95a1"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    )
  },
];

interface FooterMenuProps {
  onAction?: (actionId: string) => void;
  activeId?: string;
}

export default function FooterMenu({ onAction, activeId: propActiveId }: FooterMenuProps) {
  const [activeId, setActiveId] = React.useState(propActiveId || 'lucy');
  const { t } = useLanguage();

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
          <span className={styles.icon}>{item.icon(activeId === item.id)}</span>
          <span className={styles.label}>
            {t.nav[item.id as keyof typeof t.nav] || item.label}
          </span>
        </button>
      ))}
    </nav>
  );
}

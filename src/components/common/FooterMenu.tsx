'use client';

import React from 'react';
import styles from './FooterMenu.module.css';

const MENU_ITEMS = [
  { 
    id: 'lucy', 
    label: '밀롱가Lucy', 
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? "#3182f6" : "#8b95a1"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    )
  },
  { 
    id: 'membership', 
    label: '클럽안내', 
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? "#3182f6" : "#8b95a1"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <line x1="3" y1="9" x2="21" y2="9"/>
        <line x1="9" y1="21" x2="9" y2="9"/>
      </svg>
    )
  },
  { 
    id: 'home', 
    label: '수업정보', 
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? "#3182f6" : "#8b95a1"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    )
  },
  { 
    id: 'admin_status', 
    label: '신청현황', 
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? "#3182f6" : "#8b95a1"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    )
  },
  { 
    id: 'status', 
    label: '마이페이지', 
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? "#3182f6" : "#8b95a1"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    )
  },
];

interface FooterMenuProps {
  onAction?: (actionId: string) => void;
}

export default function FooterMenu({ onAction }: FooterMenuProps) {
  const [activeId, setActiveId] = React.useState('home');

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
          <span className={styles.label}>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}

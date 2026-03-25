'use client';

import React from 'react';
import styles from './FooterMenu.module.css';

const MENU_ITEMS = [
  { id: 'lucy', label: '밀롱가Lucy', icon: '💃' },
  { id: 'membership', label: '멤버쉽안내', icon: '💎' },
  { id: 'home', label: '수업안내', icon: '🏠' },
  { id: 'admin_status', label: '신청현황', icon: '📋' },
  { id: 'status', label: '마이페이지', icon: '👤' },
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
          <span className={styles.icon}>{item.icon}</span>
          <span className={styles.label}>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}

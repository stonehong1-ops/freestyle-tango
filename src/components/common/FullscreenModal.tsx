'use client';

import React from 'react';
import styles from './FullscreenModal.module.css';

interface FullscreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  isBottomSheet?: boolean;
  heightMode?: 'full' | 'half';
  hideHeader?: boolean;
  headerRight?: React.ReactNode;
  noPadding?: boolean;
}

export default function FullscreenModal({
  isOpen,
  onClose,
  title,
  children,
  isBottomSheet = false,
  heightMode = 'full',
  hideHeader = false,
  headerRight,
  noPadding = false
}: FullscreenModalProps) {
  if (!isOpen) return null;

  const showHeader = !hideHeader && (title || !isBottomSheet);

  return (
    <div 
      className={isBottomSheet ? styles.bottomSheetOverlay : styles.overlay}
      onClick={(e) => {
        if (isBottomSheet && e.target === e.currentTarget) onClose();
      }}
    >
      <div className={`${isBottomSheet ? styles.sheet : styles.fullContent} ${isBottomSheet && heightMode === 'half' ? styles.half : ''}`}>
        {isBottomSheet && <div className={styles.handle} />}
        {showHeader && (
          <header className={isBottomSheet ? styles.sheetHeader : styles.header}>
            <button className={styles.closeBtn} onClick={onClose}>✕</button>
            {title && <h2 className={styles.title}>{title}</h2>}
            <div className={styles.headerRightArea}>
              {headerRight}
              {!headerRight && <div style={{ width: '40px' }} />} 
            </div>
          </header>
        )}
        <div className={`${styles.content} ${noPadding ? styles.noPadding : ''}`}>
          {children}
        </div>
      </div>
    </div>
  );
}

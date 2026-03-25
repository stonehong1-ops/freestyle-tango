'use client';

import React from 'react';
import styles from './FullscreenModal.module.css';

interface FullscreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  isBottomSheet?: boolean;
}

export default function FullscreenModal({
  isOpen,
  onClose,
  title,
  children,
  isBottomSheet = false
}: FullscreenModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className={isBottomSheet ? styles.bottomSheetOverlay : styles.overlay}
      onClick={(e) => {
        if (isBottomSheet && e.target === e.currentTarget) onClose();
      }}
    >
      <div className={isBottomSheet ? styles.sheet : styles.fullContent}>
        <header className={styles.header}>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
          <h2 className={styles.title}>{title}</h2>
          <div style={{ width: '40px' }} /> {/* Spacer to center title */}
        </header>
        <div className={styles.content}>
          {children}
        </div>
      </div>
    </div>
  );
}

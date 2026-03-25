'use client';

import React from 'react';
import styles from './FullscreenModal.module.css';

interface FullscreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function FullscreenModal({
  isOpen,
  onClose,
  title,
  children
}: FullscreenModalProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <header className={styles.header}>
        <button className={styles.closeBtn} onClick={onClose}>✕</button>
        <h2 className={styles.title}>{title}</h2>
        <div style={{ width: '40px' }} /> {/* Spacer to center title */}
      </header>
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
}

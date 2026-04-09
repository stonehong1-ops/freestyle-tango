'use client';

import React, { useState, useEffect } from 'react';
import styles from './ImageViewer.module.css';

interface ImageViewerProps {
  src: string | null;
  onClose: () => void;
}

export default function ImageViewer({ src, onClose }: ImageViewerProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (src) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
    } else {
      setIsVisible(false);
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [src]);

  if (!src) return null;

  return (
    <div 
      className={`${styles.overlay} ${isVisible ? styles.visible : ''}`}
      onClick={onClose}
    >
      <div className={styles.container} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>✕</button>
        <img 
          src={src} 
          alt="Full size preview" 
          className={styles.image} 
          onClick={onClose}
        />
      </div>
    </div>
  );
}

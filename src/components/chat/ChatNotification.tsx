'use client';

import React, { useState, useEffect } from 'react';
import styles from './ChatNotification.module.css';

interface NotificationData {
  senderName: string;
  text: string;
  roomId: string;
  timestamp: string;
}

export default function ChatNotification() {
  const [notification, setNotification] = useState<NotificationData | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleNotification = (event: CustomEvent<NotificationData>) => {
      // Don't show notification if already in that chat room
      // (This logic can be refined if we have access to the current roomId)
      setNotification(event.detail);
      setIsVisible(true);

      // Auto hide after 5 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 5000);

      return () => clearTimeout(timer);
    };

    window.addEventListener('CHAT_NOTIFICATION' as any, handleNotification as any);
    return () => window.removeEventListener('CHAT_NOTIFICATION' as any, handleNotification as any);
  }, []);

  if (!notification) return null;

  const handleToastClick = () => {
    setIsVisible(false);
    // Move back to chat room 
    // In this app, chat is usually managed by a state in MyPage or similar.
    // We can dispatch another event to open the chat room.
    window.dispatchEvent(new CustomEvent('OPEN_CHAT_ROOM', { detail: { roomId: notification.roomId } }));
  };

  return (
    <div className={styles.container}>
      {isVisible && (
        <div 
          className={`${styles.toast} ${!isVisible ? styles.toastOut : ''}`}
          onClick={handleToastClick}
        >
          <div className={styles.icon}>💬</div>
          <div className={styles.content}>
            <div className={styles.header}>
              <span className={styles.sender}>{notification.senderName}</span>
              <span className={styles.time}>방금 전</span>
            </div>
            <div className={styles.message}>{notification.text}</div>
          </div>
        </div>
      )}
    </div>
  );
}

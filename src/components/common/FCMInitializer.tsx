'use client';

import { useEffect } from 'react';
import { requestNotificationPermission, registerFCMToken, onMessageListener } from '@/lib/messaging';
import { useAuth } from '@/contexts/AuthContext';

export default function FCMInitializer() {
  const { currentUser: user } = useAuth();

  useEffect(() => {
    // 1. Request permission and register token on mount (if user is logged in)
    const initFCM = async () => {
      try {
        // Notification API support check
        if (typeof window !== 'undefined' && 'Notification' in window) {
          // If permission is already granted or not denied, try registering
          if (Notification.permission !== 'denied') {
            const granted = await requestNotificationPermission();
            if (granted) {
              const stored = typeof window !== 'undefined' ? localStorage.getItem('ft_user') : null;
              let phone = '';
              if (stored) {
                try {
                  const identity = JSON.parse(stored);
                  phone = identity.phone;
                } catch (e) {}
              }
              await registerFCMToken(phone || user?.phoneNumber || undefined);
            }
          }
        }
      } catch (e) {
        console.error("FCM Initializer error:", e);
      }
    };

    if (user) {
      initFCM();
    }

    // 2. Set up foreground message listener
    const unsubscribe = onMessageListener((payload) => {
      console.log('Foreground Message in FCMInitializer:', payload);
      
      // Dispatch chat notification event for UI toast
      if (payload.data?.type === 'chat' || payload.data?.roomId) {
        window.dispatchEvent(new CustomEvent('CHAT_NOTIFICATION', {
          detail: {
            senderName: payload.notification?.title || payload.data?.senderName || '알림',
            text: payload.notification?.body || payload.data?.text || '',
            roomId: payload.data?.roomId || '',
            timestamp: new Date().toISOString()
          }
        }));
      }
    });

    return () => unsubscribe && unsubscribe();
  }, [user]);

  return null; // This component doesn't render anything
}

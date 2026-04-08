'use client';

import { useEffect } from 'react';
import { requestNotificationPermission, registerFCMToken, onMessageListener } from '@/lib/messaging';
import { useAuth } from '@/contexts/AuthContext';

export default function FCMInitializer() {
  const { user } = useAuth();

  useEffect(() => {
    // 1. Request permission and register token on mount (if user is logged in)
    const initFCM = async () => {
      try {
        // Notification API support check
        if (typeof window !== 'undefined' && 'Notification' in window) {
          // If permission is already granted or not denied, try registering
          if (Notification.permission !== 'denied') {
            const granted = await requestNotificationPermission();
            if (granted && user?.phone) {
              await registerFCMToken(user.phone);
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
    const unsubscribe = onMessageListener();
    
    return () => unsubscribe && unsubscribe();
  }, [user]);

  return null; // This component doesn't render anything
}

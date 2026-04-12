'use client';

import { useEffect } from 'react';
import { requestNotificationPermission, registerFCMToken, onMessageListener } from '@/lib/messaging';
import { useAuth } from '@/contexts/AuthContext';

import PushPermissionPrompt from '@/components/common/PushPermissionPrompt';

export default function FCMInitializer() {
  const { currentUser: user } = useAuth();

  useEffect(() => {
    const initFCM = async () => {
      try {
        if (typeof window !== 'undefined' && 'Notification' in window) {
          // If permission is default, ask for it immediately (as requested)
          if (Notification.permission === 'default') {
            const granted = await requestNotificationPermission();
            if (!granted) return;
          }

          if (Notification.permission === 'granted') {
            // Get user identification from localStorage or context
            const stored = localStorage.getItem('ft_user');
            let phone = '';
            if (stored) {
              try {
                const identity = JSON.parse(stored);
                phone = identity.phone;
              } catch (e) {}
            }
            
            const targetPhone = phone || user?.phoneNumber || undefined;
            if (targetPhone) {
              console.log("[FCM] Auto-syncing token for:", targetPhone);
              await registerFCMToken(targetPhone);
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

    // [Fix] Listen for local login/identity changes
    const handleIdentityChange = () => {
      console.log("[FCM] Identity changed, re-syncing token...");
      initFCM();
    };
    window.addEventListener('ft_user_updated', handleIdentityChange);

    // 2. 포그라운드 메시지 리스너 설정
    const unsubscribe = onMessageListener((payload) => {
      console.log('Foreground Message in FCMInitializer:', payload);
      
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

    return () => {
      unsubscribe && unsubscribe();
      window.removeEventListener('ft_user_updated', handleIdentityChange);
    };
  }, [user]);

  return null;
}

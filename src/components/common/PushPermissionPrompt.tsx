'use client';

import React, { useState, useEffect } from 'react';
import { requestNotificationPermission, registerFCMToken } from '@/lib/messaging';
import { useAuth } from '@/contexts/AuthContext';

const SUPPRESS_KEY = 'push_prompt_suppressed_until';
const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;

export default function PushPermissionPrompt() {
  const { currentUser: user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 1. 노출 조건 체크
    const checkEligibility = () => {
      if (typeof window === 'undefined') return false;

      // 브라우저가 알림을 지원하지 않거나 이미 권한이 결정된 경우 제외
      if (!('Notification' in window) || Notification.permission !== 'default') {
        return false;
      }

      // 1주일 숨김 체크
      const suppressedUntil = localStorage.getItem(SUPPRESS_KEY);
      if (suppressedUntil && Date.now() < parseInt(suppressedUntil)) {
        return false;
      }

      return true;
    };

    if (user && checkEligibility()) {
      // 약간의 지연 후 부드럽게 노출
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const handleEnable = async () => {
    setIsVisible(false);
    const granted = await requestNotificationPermission();
    if (granted) {
      // 권한 허용 시 즉시 토큰 등록
      await registerFCMToken(user?.phoneNumber || undefined);
    }
  };

  const handleSuppress = () => {
    setIsVisible(false);
    localStorage.setItem(SUPPRESS_KEY, (Date.now() + ONE_WEEK).toString());
  };

  if (!isVisible) return null;

  return (
    <div className="push-prompt-container">
      <div className="push-prompt-card glass-effect animate-slide-up">
        <div className="push-prompt-content">
          <div className="push-prompt-icon">🔔</div>
          <div className="push-prompt-text">
            <h3>프리스타일 소식 받기</h3>
            <p>오늘의 일정과 채팅 알림을 실시간으로 확인하세요.</p>
          </div>
        </div>
        <div className="push-prompt-actions">
          <button className="push-btn-secondary" onClick={handleSuppress}>
            1주일간 보지 않기
          </button>
          <button className="push-btn-primary" onClick={handleEnable}>
            알림 켜기
          </button>
        </div>
      </div>

      <style jsx>{`
        .push-prompt-container {
          position: fixed;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          width: 90%;
          max-width: 400px;
          z-index: 10000;
        }

        .push-prompt-card {
          padding: 20px;
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-lg);
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .push-prompt-content {
          display: flex;
          gap: 16px;
          align-items: center;
        }

        .push-prompt-icon {
          font-size: 24px;
          background: var(--accent-light);
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
        }

        .push-prompt-text h3 {
          font-size: 1rem;
          margin-bottom: 4px;
        }

        .push-prompt-text p {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .push-prompt-actions {
          display: flex;
          gap: 8px;
          width: 100%;
        }

        .push-prompt-actions button {
          flex: 1;
          padding: 10px;
          border-radius: var(--radius-md);
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .push-btn-primary {
          background: var(--accent);
          color: white;
        }

        .push-btn-primary:hover {
          background: #2563eb;
        }

        .push-btn-secondary {
          background: var(--bg-secondary);
          color: var(--text-secondary);
        }

        .push-btn-secondary:hover {
          background: var(--border-medium);
        }

        .animate-slide-up {
          animation: slide-up-premium 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @media (min-width: 1024px) {
          .push-prompt-container {
            left: auto;
            right: 24px;
            transform: none;
          }
        }
      `}</style>
    </div>
  );
}

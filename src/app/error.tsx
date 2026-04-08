'use client';

import { useEffect, useState } from 'react';
import styles from './error.module.css';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [isKakao, setIsKakao] = useState(false);

  useEffect(() => {
    // Check if user is in KakaoTalk in-app browser
    const ua = navigator.userAgent.toLowerCase();
    const isKKT = ua.includes('kakaotalk');
    setIsKakao(isKKT);

    console.error('[GlobalError] Caught error:', error);

    if (isKKT) {
      // Auto-redirect to external browser if possible
      // This is a common hack for KKT in-app browser to force open in default browser
      const currentUrl = window.location.href;
      if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) {
         // iOS KKT force open logic
         window.location.href = `kakaotalk://web/openExternal?url=${encodeURIComponent(currentUrl)}`;
      } else if (ua.includes('android')) {
         // Android KKT force open logic
         window.location.href = `intent://${currentUrl.replace(/^https?:\/\//, '')}#Intent;scheme=https;package=com.android.chrome;end`;
      }
    }
  }, [error]);

  return (
    <div className={styles.errorContainer}>
      <div className={styles.errorContent}>
        <div className={styles.iconWrapper}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#FF5252" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>
        
        <h1 className={styles.title}>
          {isKakao ? '브라우저 호환성 안내' : '페이지를 로드할 수 없습니다'}
        </h1>
        
        <p className={styles.description}>
          {isKakao 
            ? '카카오톡 인앱 브라우저에서 로딩 문제가 발생했습니다.\n자동으로 외부 브라우저(사파리/크롬)로 이동합니다.'
            : '앱 로딩 중 일시적인 오류가 발생했습니다.\n아래 버튼을 눌러 다시 시도해 주세요.'}
        </p>

        <div className={styles.actionGroup}>
          <button className={styles.retryBtn} onClick={() => reset()}>
            다시 시도하기
          </button>
          
          {isKakao && (
            <button 
              className={styles.externalBtn}
              onClick={() => {
                const url = window.location.href;
                window.location.href = `kakaotalk://web/openExternal?url=${encodeURIComponent(url)}`;
              }}
            >
              직접 외부 브라우저로 열기
            </button>
          )}
        </div>
        
        <div className={styles.footer}>
          <p>문제가 지속되면 사파리나 크롬 브라우저에서<br/><strong>freestyle-tango.kr</strong>을 직접 입력해 주세요.</p>
        </div>
      </div>
    </div>
  );
}

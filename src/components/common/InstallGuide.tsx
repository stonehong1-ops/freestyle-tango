'use client';

import { useState, useEffect } from 'react';
import styles from './InstallGuide.module.css';

export default function InstallGuide() {
  const [show, setShow] = useState(false);
  const [mode, setMode] = useState<'ios' | 'kakao' | 'other'>('other');

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    const isKakao = ua.includes('kakaotalk');
    const isIOS = /ipad|iphone|ipod/.test(ua) && !(window as any).MSStream;
    const isStandalone = (window.navigator as any).standalone || window.matchMedia('(display-mode: standalone)').matches;

    // Register Service Worker for PWA
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(registration => {
          console.log('SW registered: ', registration);
        }).catch(registrationError => {
          console.log('SW registration failed: ', registrationError);
        });
      });
    }

    if (isKakao) {
      setMode('kakao');
      setShow(true);
      return;
    }

    if (isIOS && !isStandalone) {
      setMode('ios');
      const hasDismissed = localStorage.getItem('ft_install_dismissed');
      const lastDismissedTime = hasDismissed ? parseInt(hasDismissed) : 0;
      if (Date.now() - lastDismissedTime > 7 * 24 * 60 * 60 * 1000) {
        setShow(true);
      }
    }
  }, []);

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem('ft_install_dismissed', Date.now().toString());
  };

  if (!show) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h3>{mode === 'kakao' ? '더 편하게 사용하기' : '홈 화면에 추가하기'}</h3>
          <button onClick={handleDismiss} aria-label="닫기">✕</button>
        </div>
        
        {mode === 'kakao' ? (
          <>
            <p>카카오톡 안에서 보고 계시네요!<br/>홈 화면에 추가하시려면 외부 브라우저로 열어주세요.</p>
            <div className={styles.steps}>
              <div className={styles.step}>
                <span className={styles.icon}>↗️</span>
                <span>오른쪽 위 <b>[...]</b> 또는 <b>[⋮]</b> 버튼 클릭</span>
              </div>
              <div className={styles.step}>
                <span className={styles.icon}>🌐</span>
                <span><b>[다른 브라우저로 열기]</b> 또는 <b>[Safari/Chrome]</b> 클릭</span>
              </div>
            </div>
          </>
        ) : (
          <>
            <p>앱처럼 쉽고 빠르게 접속하세요!<br/>아래 순서대로 따라해 주세요.</p>
            <div className={styles.steps}>
              <div className={styles.step}>
                <span className={styles.icon}>📤</span>
                <span>하단 <b>[공유]</b> 또는 <b>[...]</b> 버튼 클릭</span>
              </div>
              <div className={styles.step}>
                <span className={styles.icon}>➕</span>
                <span>메뉴에서 <b>[홈 화면에 추가]</b> 클릭</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

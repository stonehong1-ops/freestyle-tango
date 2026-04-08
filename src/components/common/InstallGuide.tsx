'use client';

import { useState, useEffect } from 'react';
import styles from './InstallGuide.module.css';

export default function InstallGuide() {
  const [show, setShow] = useState(false);
  const [mode, setMode] = useState<'ios' | 'kakao' | 'samsung' | 'other'>('other');

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    const isKakao = ua.includes('kakaotalk');
    const isSamsung = ua.includes('samsungbrowser');
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

    // 모드 결정
    if (isKakao) setMode('kakao');
    else if (isSamsung) setMode('samsung');
    else if (isIOS) setMode('ios');
    else setMode('other');

    if (!isStandalone) {
      const hasDismissed = localStorage.getItem('ft_install_dismissed');
      const lastDismissedTime = hasDismissed ? parseInt(hasDismissed) : 0;
      // 7일마다 다시 보여줌
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
    <div className={styles.overlay} onClick={handleDismiss}>
      <div className={styles.container} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>{mode === 'kakao' ? '더 편하게 사용하기' : (mode === 'samsung' ? '삼성 인터넷 전용 가이드' : '홈 화면에 추가하기')}</h3>
          <button className={styles.closeBtn} onClick={handleDismiss}>✕</button>
        </div>
        
        <div className={styles.content}>
          {mode === 'kakao' ? (
            <div className={styles.kakaoGuide}>
              <p className={styles.desc}>카카오톡 안에서 보고 계시네요!<br/>홈 화면에 추가하시려면 외부 브라우저로 열어주세요.</p>
              <div className={styles.steps}>
                <div className={styles.step}>
                  <div className={styles.stepNum}>1</div>
                  <span>오른쪽 위 <b>[...]</b> 버튼 클릭</span>
                </div>
                <div className={styles.step}>
                  <div className={styles.stepNum}>2</div>
                  <span><b>[Safari/Chrome 열기]</b> 클릭</span>
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.imageGuideWrapper}>
              <p className={styles.desc}>프리스타일 탱고를 앱처럼 설치해서<br/>더욱 쉽고 빠르게 접속해 보세요.</p>
              <div className={styles.imageBox}>
                <img 
                  src={mode === 'samsung' ? '/images/guide/samsung_a2hs_guide.png' : '/images/guide/a2hs_guide.png'} 
                  alt="Installation Guide"
                  className={styles.guideImage}
                />
              </div>
              <button className={styles.confirmBtn} onClick={handleDismiss}>확인했습니다</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';

// This is the fallback for when everything (including layout) fails
export default function GlobalErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [userAgent, setUserAgent] = useState('');
  const [hint, setHint] = useState<string | null>(null);

  useEffect(() => {
    console.error('[GlobalErrorPage] Root error:', error);
    setUserAgent(navigator.userAgent.toLowerCase());
    
    // Auto-redirect if in KakaoTalk
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('kakaotalk')) {
      const currentUrl = window.location.href;
      if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) {
         window.location.href = `kakaotalk://web/openExternal?url=${encodeURIComponent(currentUrl)}`;
      } else if (ua.includes('android')) {
         window.location.href = `intent://${currentUrl.replace(/^https?:\/\//, '')}#Intent;scheme=https;package=com.android.chrome;end`;
      }
    }
  }, [error]);

  const handleExternalOpen = async () => {
    const currentUrl = window.location.href;
    const ua = navigator.userAgent.toLowerCase();

    // 1. Give visual feedback
    setHint('복사 중...');

    // 2. Handle known app schemes
    if (ua.includes('kakaotalk')) {
      if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) {
        window.location.href = `kakaotalk://web/openExternal?url=${encodeURIComponent(currentUrl)}`;
      } else {
        window.location.href = `intent://${currentUrl.replace(/^https?:\/\//, '')}#Intent;scheme=https;package=com.android.chrome;end`;
      }
      return;
    }

    // 3. General handling
    try {
      if (ua.includes('android')) {
        window.location.href = `intent://${currentUrl.replace(/^https?:\/\//, '')}#Intent;scheme=https;package=com.android.chrome;end`;
      } else if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) {
        // Copy to clipboard explicitly
        await navigator.clipboard.writeText(currentUrl);
        setHint('주소가 복사되었습니다! 사파리에 붙여넣어 주세요.');
        setTimeout(() => setHint(null), 5000);
      } else {
        window.open(currentUrl, '_blank');
      }
    } catch (err) {
      console.warn("Clipboard access denied or fail:", err);
      setHint('주소를 직접 복사하여 외부 브라우저를 열어주세요.');
    }
  };

  const isIOS = /iphone|ipad|ipod/.test(userAgent);
  const isInApp = /kakaotalk|messenger|instagram|fbav|line|naver/.test(userAgent);

  return (
    <html lang="ko">
      <head>
        <title>Initialization Error | Freestyle Tango</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"/>
      </head>
      <body style={{ margin: 0, padding: 0, backgroundColor: '#000', color: '#fff' }}>
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          minHeight: '100vh', padding: '24px', textAlign: 'center',
          background: 'linear-gradient(180deg, #0f172a 0%, #000 100%)',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
          
          {/* Main Card */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(30px)',
            borderRadius: '32px',
            padding: '40px 24px',
            maxWidth: '420px', width: '100%',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 30px 60px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{ color: '#f43f5e', marginBottom: '24px', fontSize: '48px' }}>⚠️</div>
            
            <h2 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '12px', letterSpacing: '-0.02em' }}>시스템 초기화 오류</h2>
            <p style={{ color: '#94a3b8', fontSize: '15px', lineHeight: 1.6, marginBottom: '32px' }}>
              앱 시작 중 문제가 발생했습니다.{"\n"}전용 브라우저(사파리/크롬) 사용을 권장합니다.
            </p>

            {/* Hint Notification */}
            {hint && (
              <div style={{
                backgroundColor: '#3182f6', color: 'white', padding: '12px', borderRadius: '12px',
                fontSize: '13px', fontWeight: 700, marginBottom: '20px',
                animation: 'fadeIn 0.3s'
              }}>
                {hint}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={handleExternalOpen}
                style={{
                  padding: '18px 24px', backgroundColor: '#fff', color: '#000',
                  border: 'none', borderRadius: '20px', cursor: 'pointer',
                  fontWeight: 900, fontSize: '16px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                  transition: 'transform 0.1s',
                  boxShadow: '0 4px 12px rgba(255,255,255,0.1)'
                }}
                onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.96)'}
                onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                onTouchStart={(e) => e.currentTarget.style.transform = 'scale(0.96)'}
                onTouchEnd={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <span style={{ fontSize: '18px' }}>↗️</span>
                {isIOS ? '사파리에서 열기' : '외부 브라우저에서 열기'}
              </button>

              <button
                onClick={() => reset()}
                style={{
                  padding: '18px 24px', backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff',
                  border: 'none', borderRadius: '20px', cursor: 'pointer',
                  fontWeight: 600, fontSize: '16px'
                }}
              >
                새로고침
              </button>
            </div>

            {/* iOS Guide Area */}
            {isIOS && isInApp && (
              <div style={{ 
                marginTop: '32px', padding: '20px', borderRadius: '20px', 
                backgroundColor: 'rgba(255,255,255,0.05)', textAlign: 'left' 
              }}>
                <h4 style={{ margin: '0 0 10px', fontSize: '14px', color: '#fff' }}>💡 사파리 이동 팁</h4>
                <ol style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: '#94a3b8', lineHeight: 1.8 }}>
                  <li>하단 메뉴의 <strong>[공유]</strong> 또는 <strong>[...]</strong> 버튼 클릭</li>
                  <li><strong>[Safari로 열기]</strong> 메뉴 선택</li>
                  <li>또는 위 버튼을 눌러 복사한 주소를 사파리에 붙여넣기</li>
                </ol>
              </div>
            )}

            <p style={{ marginTop: '32px', fontSize: '12px', color: '#475569' }}>
               계속 시도해도 안된다면 주소창에 직접{"\n"}
               <strong>freestyle-tango.kr</strong>을 입력해 주세요.
            </p>
          </div>
        </div>
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
        `}} />
      </body>
    </html>
  );
}

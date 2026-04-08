'use client';

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Gallery from './Gallery/Gallery';
import CalendarSection from './CalendarSection/CalendarSection';
import LocationSection from './LocationSection/LocationSection';
import GuideSection from './GuideSection/GuideSection';
import IntroSection from './IntroSection/IntroSection';
import StaySelector from './layout/StaySelector';
import ReserveForm from './ReserveForm/ReserveForm';
import CompleteView from './ReserveForm/CompleteView';
import FullscreenModal from '../common/FullscreenModal';
import { useLanguage } from '@/contexts/LanguageContext';
import { Language } from '@/locales';
import styles from './TangoStay.module.css';
import { useModalHistory } from '@/hooks/useModalHistory';

export default function TangoStay() {
  const { language, setLanguage, t } = useLanguage();
  const [selectedStayId, setSelectedStayId] = useState('hapjeong');
  
  // View State: 'overview' | 'reserve' | 'complete'
  const [view, setView] = useState<'overview' | 'reserve' | 'complete'>('overview');
  const [reserveData, setReserveData] = useState<any>(null);
  const [showMonthlyStatus, setShowMonthlyStatus] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'intro' | 'reserve' | 'info'>('intro');

  useModalHistory(showMonthlyStatus, () => setShowMonthlyStatus(false), 'stayMonthly');
  useModalHistory(view === 'reserve', () => { setView('overview'); setReserveData(null); }, 'stayReserve');
  useModalHistory(view === 'complete', () => { setView('overview'); setReserveData(null); }, 'stayComplete');

  // @ts-ignore
  const currentStay = (t.stays && (t.stays[selectedStayId] || t.stays.hapjeong)) || {
    name: 'TangoStay',
    hero: { subtitle: 'Artistic Stay' }
  };

  const handleReserveInit = (data: any) => {
    setReserveData(data);
    setView('reserve');
    window.scrollTo(0, 0);
  };

  const handleReserveComplete = (data: any) => {
    setReserveData(data);
    setView('complete');
    window.scrollTo(0, 0);
  };

  const handleGoHome = () => {
    setView('overview');
    setReserveData(null);
    window.scrollTo(0, 0);
  };

  if (view === 'reserve' && reserveData) {
    return (
      <ReserveForm 
        stayId={selectedStayId}
        checkIn={reserveData.checkIn}
        checkOut={reserveData.checkOut}
        guests={reserveData.guests}
        totalAmount={reserveData.pricing.total}
        onBack={() => setView('overview')}
        onComplete={handleReserveComplete}
      />
    );
  }

  if (view === 'complete' && reserveData) {
    return (
      <CompleteView 
        data={reserveData}
        onHome={handleGoHome}
      />
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.subTabs}>
        <button 
          className={`${styles.subTabBtn} ${selectedStayId === 'hapjeong' ? styles.active : ''}`}
          onClick={() => setSelectedStayId('hapjeong')}
        >
          {language === 'ko' ? '합정' : 'Hapjeong'}
        </button>
        <button 
          className={`${styles.subTabBtn} ${selectedStayId === 'deokeun' ? styles.active : ''}`}
          onClick={() => setSelectedStayId('deokeun')}
        >
          {language === 'ko' ? '덕은(상암)' : 'Deogeun(Sangam)'}
        </button>
        <button 
          className={`${styles.subTabBtn} ${selectedStayId === 'hongdae' ? styles.active : ''}`}
          onClick={() => setSelectedStayId('hongdae')}
        >
          {language === 'ko' ? '홍대(준비중)' : 'Hongdae(Soon)'}
        </button>
      </div>

      <div className={styles.content}>
        {selectedStayId === 'hongdae' ? (
          <div className={styles.comingSoon}>
            <div className={styles.comingSoonBadge}>COMING SOON</div>
            <h2 className={styles.comingSoonTitle}>Tango Stay Hongdae</h2>
            <div className={styles.comingSoonDesc}>
              {language === 'ko' ? (
                <>
                  젊음과 문화의 중심 홍대에서<br />
                  새로운 감각의 스테이를 준비 중입니다.<br />
                  세심한 배려와 감각적인 인테리어로<br />
                  곧 여러분을 찾아뵙겠습니다.
                </>
              ) : (
                <>
                  Preparing a new sense of stay<br />
                  in the center of youth and culture, Hongdae.<br />
                  We look forward to seeing you soon<br />
                  with meticulous care and stylish interior.
                </>
              )}
            </div>
            <div style={{ marginTop: '2.5rem', opacity: 0.6 }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#3182f6" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20"></path>
                <path d="m5 15 7 7 7-7"></path>
              </svg>
            </div>
          </div>
        ) : (
          <>
            <header className={styles.stayHeader}>
              <h1 className={styles.stayTitle}>
                {selectedStayId === 'hapjeong' 
                  ? (language === 'ko' ? 'Tango Stay 합정' : 'Tango Stay Hapjeong')
                  : (language === 'ko' ? 'Tango Stay 덕은(상암)' : 'Tango Stay Deogeun(Sangam)')}
                {selectedStayId === 'hapjeong' && <span className={styles.priceBadge}>{language === 'ko' ? '1박 8만원' : '80k KRW / night'}</span>}
                {selectedStayId === 'deokeun' && <span className={styles.priceBadge}>{language === 'ko' ? '1박 6만원' : '60k KRW / night'}</span>}
              </h1>
              <p className={styles.staySubtitle}>
                {selectedStayId === 'hapjeong' 
                  ? (language === 'ko' ? '합정역 도보 1분, 초역세권 프리미엄 스테이' : '1 minute from Hapjeong Station')
                  : (language === 'ko' ? '최신 시설과 평온한 휴식의 조화' : 'Premium Relax in Deogeun')}
              </p>
            </header>

            <section className={styles.heroSection}>
              <Gallery stayId={selectedStayId} />
            </section>
            
            <section className={styles.section}>
              <div className={styles.sectionHeaderCombined}>
                <div className={styles.sectionHeaderSpecs}>
                  <h3 className={styles.sectionTitleInline}>
                    {language === 'ko' ? '실시간 예약 현황' : 'Real-time Status'}
                  </h3>
                  <button 
                    className={styles.monthlyStatusBtnSmall}
                    onClick={() => setShowMonthlyStatus(true)}
                  >
                    🗓️ {language === 'ko' ? '월별 전체현황 보기' : 'View Monthly Status'}
                  </button>
                </div>
              </div>

              <p className={styles.calendarHint}>
                {language === 'ko' 
                  ? '입실일과 퇴실일을 선택해서 예약하세요!' 
                  : 'Select check-in and check-out dates to book!'}
              </p>

              <CalendarSection 
                stayId={selectedStayId} 
                onReserve={handleReserveInit} 
                showInlineGrid={false}
                hideHeader={true}
              />
            </section>

            <section className={styles.section}>
              <LocationSection stayId={selectedStayId} />
            </section>
            
            <section className={styles.section}>
              <GuideSection stayId={selectedStayId} />
            </section>

            <section className={styles.section}>
              <IntroSection showContact={false} />
            </section>

            <section className={styles.section} style={{ paddingBottom: '2rem' }}>
              <IntroSection showStory={false} />
            </section>
          </>
        )}
      </div>

      <FullscreenModal
        isOpen={showMonthlyStatus}
        onClose={() => setShowMonthlyStatus(false)}
        title={t.stays.monthlyStatusTitle || (language === 'ko' ? '월별 전체 예약 현황' : 'Monthly Reservation Status')}
      >
        <div className={styles.modalScrollContent}>
          <CalendarSection 
            stayId={selectedStayId} 
            hideCalendar={true} 
            forceListView={true}
          />
        </div>
      </FullscreenModal>
    </div>
  );
}

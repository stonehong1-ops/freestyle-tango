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

export default function TangoStay() {
  const { language, setLanguage, t } = useLanguage();
  const [selectedStayId, setSelectedStayId] = useState('hapjeong');
  
  // View State: 'overview' | 'reserve' | 'complete'
  const [view, setView] = useState<'overview' | 'reserve' | 'complete'>('overview');
  const [reserveData, setReserveData] = useState<any>(null);
  const [showMonthlyStatus, setShowMonthlyStatus] = useState(false);

  useEffect(() => {
    const handlePopState = () => {
      if (showMonthlyStatus) {
        setShowMonthlyStatus(false);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [showMonthlyStatus]);

  // @ts-ignore
  const currentStay = t.stays[selectedStayId] || t.stays.hapjeong;

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
      <StaySelector 
        selectedStayId={selectedStayId} 
        onSelect={setSelectedStayId} 
      />
      <div className={styles.content}>

        {/* 1. Main Photo Gallery (Hero) */}
        <section className={styles.heroSection}>
          <h1 className={styles.heroTitle}>
            {currentStay.name}
          </h1>
          <p className={styles.heroSubtitle}>
            {currentStay.hero.subtitle}
          </p>
          <Gallery stayId={selectedStayId} />
        </section>

        {/* 2. Calendar & Booking Entry (Moved up) */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <button 
              className={styles.monthlyStatusBtn}
              onClick={() => { setShowMonthlyStatus(true); window.history.pushState({ modal: 'stayMonthly' }, '', ''); }}
            >
              🗓️ {language === 'ko' ? '월별 전체 현황 보기' : 'View Monthly Status'}
            </button>
          </div>
          <CalendarSection 
            stayId={selectedStayId} 
            onReserve={handleReserveInit} 
            showInlineGrid={false}
          />
        </section>

        {/* Monthly Status Popup */}
        <FullscreenModal
          isOpen={showMonthlyStatus}
          onClose={() => setShowMonthlyStatus(false)}
          title={language === 'ko' ? '월별 전체 예약 현황' : 'Monthly Reservation Status'}
        >
          <div className={styles.modalScrollContent}>
            <CalendarSection 
              stayId={selectedStayId} 
              onReserve={handleReserveInit} 
              showInlineGrid={true}
              hideCalendar={true}
            />
          </div>
        </FullscreenModal>

        {/* 3. Location Map */}
        <section className={styles.section}>
          <LocationSection stayId={selectedStayId} />
        </section>

        {/* 4. Usage Guide (Accordion) */}
        <section className={styles.section}>
          <GuideSection stayId={selectedStayId} />
        </section>

        {/* 5. Intro Section (Moved to bottom) */}
        <section className={styles.section}>
          <IntroSection />
        </section>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import styles from './FullSchedule.module.css';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  getClassesByMonth, 
  getAllMilongas, 
  getExtraSchedules, 
  TangoClass, 
  MilongaInfo, 
  ExtraSchedule,
  deleteExtraSchedule
} from '@/lib/db';
import FullscreenModal from '@/components/common/FullscreenModal';
import ExtraScheduleEditor from '@/components/admin/ExtraScheduleEditor';
import { useModalHistory } from '@/hooks/useModalHistory';

interface FullScheduleProps {
  isAdmin?: boolean;
  requireIdentity?: (action: () => void) => void;
}

export default function FullSchedule({ isAdmin, requireIdentity }: FullScheduleProps) {
  const { t, language } = useLanguage();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [classes, setClasses] = useState<TangoClass[]>([]);
  const [milongas, setMilongas] = useState<MilongaInfo[]>([]);
  const [extras, setExtras] = useState<ExtraSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showExtraEditor, setShowExtraEditor] = useState(false);
  const [editingExtra, setEditingExtra] = useState<ExtraSchedule | null>(null);

  useModalHistory(showExtraEditor, () => setShowExtraEditor(false), 'extraEditor');

  const fetchData = async (date: Date) => {
    setIsLoading(true);
    const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    try {
      const [clsData, milData, extData] = await Promise.all([
        getClassesByMonth(monthStr),
        getAllMilongas(monthStr),
        getExtraSchedules(monthStr)
      ]);
      setClasses(clsData);
      setMilongas(milData);
      setExtras(extData);
    } catch (err) {
      console.error('Error fetching schedule data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData(currentDate);
    const handleUpdate = () => fetchData(currentDate);
    window.addEventListener('ft_extra_updated', handleUpdate);
    return () => window.removeEventListener('ft_extra_updated', handleUpdate);
  }, [currentDate.getFullYear(), currentDate.getMonth()]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Monday start logic: (getDay() + 6) % 7 maps Sun(0)->6, Mon(1)->0, ..., Sat(6)->5
  const firstDayOfMonth = (new Date(year, month, 1).getDay() + 6) % 7;

  const daysGrid = [];
  // Padding for first day (Monday start)
  for (let i = 0; i < firstDayOfMonth; i++) {
    daysGrid.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    daysGrid.push(new Date(year, month, i));
  }

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const formatDate = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const isKoreanHoliday = (date: Date) => {
    const dateStr = formatDate(date);
    const holidays2026 = [
      '2026-01-01', // 신정
      '2026-02-16', '2026-02-17', '2026-02-18', // 설날
      '2026-03-01', // 삼일절
      '2026-03-02', // 삼일절 대체공휴일
      '2026-05-05', // 어린이날
      '2026-05-24', // 부처님오신날
      '2026-05-25', // 부처님오신날 대체공휴일
      '2026-06-06', // 현충일
      '2026-08-15', // 광복절
      '2026-08-17', // 광복절 대체공휴일
      '2026-09-24', '2026-09-25', '2026-09-26', // 추석
      '2026-09-28', // 추석 대체공휴일
      '2026-10-03', // 개천절
      '2026-10-05', // 개천절 대체공휴일
      '2026-10-09', // 한글날
      '2026-12-25', // 크리스마스
    ];
    // 고정 공휴일 (월-일 무관 매년 동일한 날짜들 중 일부)
    const fixedHolidays = ['01-01', '03-01', '05-05', '06-06', '08-15', '10-03', '10-09', '12-25'];
    const mmdd = dateStr.substring(5);
    
    return holidays2026.includes(dateStr) || fixedHolidays.includes(mmdd);
  };

  const selectedDateStr = formatDate(selectedDate);
  const todayStr = formatDate(new Date());

  const getEventsForDate = (dateStr: string) => {
    const dayClasses = classes.filter(c => c.dates?.includes(dateStr));
    const dayMilongas = milongas.filter(m => m.activeDate === dateStr);
    const dayExtras = extras.filter(e => e.date === dateStr);
    return { dayClasses, dayMilongas, dayExtras };
  };

  const selectedDayEvents = getEventsForDate(selectedDateStr);

  const handleDeleteExtra = async (id: string) => {
    if (window.confirm(language === 'ko' ? '정말 삭제하시겠습니까?' : 'Are you sure you want to delete?')) {
      await deleteExtraSchedule(id);
      fetchData(currentDate);
    }
  };

  const extractTime = (timeStr: string) => {
    // Regex to match HH:mm or H:mm patterns, including AM/PM
    const timeMatch = timeStr.match(/(\d{1,2}:\d{2})(\s?[AaPp][Mm])?/);
    return timeMatch ? timeMatch[0] : timeStr;
  };

  return (
    <div className={styles.container}>
      <div className={styles.calendarCard}>
        <header className={styles.calHeader}>
          <button className="nav-btn-standard" onClick={prevMonth}>
            <span className="nav-btn-icon">←</span>
            <span style={{ marginLeft: '4px' }}>{language === 'ko' ? '이전' : 'Prev'}</span>
          </button>
          <h2 className={styles.monthTitle}>
            {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
          </h2>
          <button className="nav-btn-standard" onClick={nextMonth}>
            <span style={{ marginRight: '4px' }}>{language === 'ko' ? '다음' : 'Next'}</span>
            <span className="nav-btn-icon">→</span>
          </button>
        </header>

        <div className={styles.weekdays}>
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => {
            const label = t.calendar[d as keyof typeof t.calendar];
            const isWeekend = d === 'Sat' || d === 'Sun';
            return (
              <div key={d} className={isWeekend ? styles.weekendHeader : ''}>
                {label}
              </div>
            );
          })}
        </div>

        <div className={styles.daysGrid}>
          {daysGrid.map((date, idx) => {
            if (!date) return <div key={`pad-${idx}`} className={styles.dayCell} style={{ cursor: 'default' }} />;
            
            const dateStr = formatDate(date);
            const isSelected = dateStr === selectedDateStr;
            const isToday = dateStr === todayStr;
            const isPast = dateStr < todayStr;
            const dayOfWeek = date.getDay(); // 0 is Sunday, 6 is Saturday
            const isHoliday = isKoreanHoliday(date);
            
            const { dayClasses, dayMilongas, dayExtras } = getEventsForDate(dateStr);
            const hasClass = dayClasses.length > 0;
            const hasMilonga = dayMilongas.length > 0;
            const hasExtra = dayExtras.length > 0;

            let dayTypeClass = '';
            if (isHoliday || dayOfWeek === 0) dayTypeClass = styles.sunday;
            else if (dayOfWeek === 6) dayTypeClass = styles.saturday;

            return (
              <div 
                key={dateStr} 
                className={`${styles.dayCell} ${isSelected ? styles.selected : ''} ${isToday ? styles.today : ''} ${isPast ? styles.past : ''} ${dayTypeClass}`}
                onClick={() => setSelectedDate(date)}
              >
                <div className={styles.dayNum}>{date.getDate()}</div>
                <div className={styles.markers}>
                  {hasClass && <div className={`${styles.marker} ${styles.markerClass}`} />}
                  {hasMilonga && <div className={`${styles.marker} ${styles.markerMilonga}`} />}
                  {hasExtra && <div className={`${styles.marker} ${styles.markerExtra}`} />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.detailsArea}>
        <div className={styles.selectedDateHeader}>
          <span>{selectedDate.toLocaleDateString(language === 'ko' ? 'ko-KR' : 'en-US', { month: 'long', day: 'numeric', weekday: 'short' })}</span>
        </div>

        {selectedDayEvents.dayClasses.length === 0 && 
         selectedDayEvents.dayMilongas.length === 0 && 
         selectedDayEvents.dayExtras.length === 0 ? (
          <div className={styles.emptyState}>
            {language === 'ko' ? '일정이 없습니다.' : 'No schedules for this day.'}
          </div>
        ) : (
          <>
            {selectedDayEvents.dayClasses.map(cls => (
              <div key={`cls-${cls.id}`} className={styles.eventItem}>
                <div className={styles.eventRow1}>
                  <span className={styles.eventTime}>Class | {extractTime(cls.time)}</span>
                  <span className={styles.eventSubtitle}>{cls.teacher1}{cls.teacher2 ? ` & ${cls.teacher2}` : ''}</span>
                </div>
                <span className={styles.eventTitle}>{cls.title}</span>
              </div>
            ))}
            {selectedDayEvents.dayMilongas.map(mil => (
              <div key={`mil-${mil.id}`} className={styles.eventItem}>
                <div className={styles.eventRow1}>
                  <span className={styles.eventTime} style={{ color: '#ff4d4f' }}>Milonga | {extractTime(mil.timeInfo || '20:00')}</span>
                  <span className={styles.eventSubtitle}>DJ: {mil.djName || 'TBA'}</span>
                </div>
                <span className={styles.eventTitle}>{mil.message || 'Milonga Lucy'}</span>
              </div>
            ))}
            {selectedDayEvents.dayExtras.map(ext => (
              <div key={`ext-${ext.id}`} className={styles.eventItem}>
                <div className={styles.eventRow1}>
                  <span className={styles.eventTime} style={{ color: '#52c41a' }}>Event | {ext.time}</span>
                </div>

                <span className={styles.eventTitle}>{ext.title}</span>
                {ext.memo && <p className={styles.eventMemo}>{ext.memo}</p>}
                {isAdmin && (
                  <div className={styles.eventActions}>
                    <button className={styles.editActionBtn} onClick={() => {
                        setEditingExtra(ext);
                        setShowExtraEditor(true);
                      }}>수정</button>
                    <button className={styles.deleteActionBtn} onClick={() => handleDeleteExtra(ext.id)}>삭제</button>
                  </div>
                )}
              </div>
            ))}
          </>
        )}

      </div>

      <FullscreenModal
        isOpen={showExtraEditor}
        onClose={() => setShowExtraEditor(false)}
        title={language === 'ko' ? '기타 일정 관리' : 'Manage Extra Schedule'}
      >
        <ExtraScheduleEditor 
          initialData={editingExtra} 
          defaultDate={selectedDateStr}
          onClose={() => setShowExtraEditor(false)}
          onSave={() => {
            setShowExtraEditor(false);
            fetchData(currentDate);
          }}
        />
      </FullscreenModal>
    </div>
  );
}

'use client';

import React, { useState, useRef, useEffect } from 'react';

import { toPng } from 'html-to-image';
import ClassCard from '@/components/registration/ClassCard';
import FullSchedule from '@/components/dashboard/FullSchedule';
import MediaTab from '@/components/dashboard/MediaTab';
import { useLanguage } from '@/contexts/LanguageContext';
import { useProjectData } from '@/hooks/useProjectData';
import { useModalHistory } from '@/hooks/useModalHistory';
import Skeleton from '@/components/common/Skeleton';
import styles from '@/app/[[...slug]]/page.module.css';
import { getMedia, MediaItem } from '@/lib/db';

interface HomeTabProps {
  isAdminLogged: boolean;
  currentUser: any;
  requireIdentity: (action: () => void) => void;
  setShowFullList: (show: boolean) => void;
  setShowRegistrationModal: (show: boolean) => void;
  handleCardClick: (id: string, view?: 'detail' | 'edit') => void;
  onSubTabChange?: (tab: 'guide' | 'schedule' | 'media') => void;
  activeSubTab?: 'guide' | 'schedule' | 'media';
}

export default function HomeTab({
  isAdminLogged,
  currentUser,
  requireIdentity,
  setShowFullList,
  setShowRegistrationModal,
  handleCardClick,
  onSubTabChange,
  activeSubTab
}: HomeTabProps) {
  const { t, language } = useLanguage();
  const { 
    classes, 
    registrations, 
    selectedMonth, 
    setSelectedMonth, 
    isLoading, 
    monthlyNotice, 
    setMonthlyNotice,
    appliedClassIds 
  } = useProjectData();

  const [homeSubTab, setHomeSubTab] = useState<'guide' | 'schedule' | 'media'>(activeSubTab || 'guide');

  useEffect(() => {
    if (activeSubTab) {
      setHomeSubTab(activeSubTab);
    }
  }, [activeSubTab]);

  useEffect(() => {
    onSubTabChange?.(homeSubTab);
  }, [homeSubTab, onSubTabChange]);

  const [isEditingNotice, setIsEditingNotice] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const captureRef = useRef<HTMLDivElement>(null);
  const [recentMediaCount, setRecentMediaCount] = useState(0);
  const [todayScheduleCount, setTodayScheduleCount] = useState(0);

  useEffect(() => {
    const fetchDataCounts = async () => {
      try {
        const data = await getMedia();
        // Last 3 days for media
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
        const mCount = data.filter(m => 
          !m.relatedMilongaDate && 
          new Date(m.createdAt) > threeDaysAgo
        ).length;
        setRecentMediaCount(mCount);

        // Today's extra schedules
        const { getExtraSchedules, getClasses } = await import('@/lib/db');
        const now = new Date();
        
        // Use KST (Asia/Seoul) explicitly for both month and today string
        const kstFormatter = new Intl.DateTimeFormat('en-CA', {
          timeZone: 'Asia/Seoul',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });
        const parts = kstFormatter.formatToParts(now);
        const year = parts.find(p => p.type === 'year')?.value;
        const month = parts.find(p => p.type === 'month')?.value;
        const day = parts.find(p => p.type === 'day')?.value;
        const todayStr = `${year}-${month}-${day}`;
        const monthStr = `${year}-${month}`;
        
        const [schedules, classes] = await Promise.all([
          getExtraSchedules(monthStr),
          getClasses()
        ]);
        
        const sCount = schedules.filter(s => s.date === todayStr).length;
        const cCount = classes.filter(c => c.dates?.includes(todayStr)).length;
        
        setTodayScheduleCount(sCount + cCount);
      } catch (err) {
        console.error("Failed to fetch data counts", err);
      }
    };
    fetchDataCounts();
  }, []);

  const handleExportImage = async () => {
    if (!captureRef.current) return;
    setIsExporting(true);
    await new Promise(resolve => setTimeout(resolve, 100));
    try {
      const dataUrl = await toPng(captureRef.current, {
        cacheBust: true,
        fontEmbedCSS: `@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');`,
        style: {
          fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif',
          padding: '20px 20px 20px 9px',
          margin: '0',
          width: '480px',
        }
      });
      const link = document.createElement('a');
      link.download = `freestyle-tango-classes-${selectedMonth}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Export failed:', err);
      alert(t.home.export.error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleNoticeSave = async () => {
    // This logic should ideally be in a service or useProjectData, 
    // but for now keeping it simple as we move code.
    const { updateMonthlyNotice } = await import('@/lib/db');
    const res = await updateMonthlyNotice(selectedMonth, monthlyNotice);
    if (res.success) {
      setIsEditingNotice(false);
      alert(t.home.admin.saveSuccess);
    } else {
      alert(t.home.admin.saveFail);
    }
  };

  const availableMonths = Array.from(new Set([
    '2026-04', // Fallback or CURRENT_REGISTRATION_MONTH
    ...classes.map(c => c.targetMonth).filter(Boolean) as string[]
  ])).sort().reverse();

  const filteredClasses = classes.filter(cls => !cls.targetMonth || cls.targetMonth === selectedMonth);

  const groupedClasses = filteredClasses.reduce((acc, cls) => {
    const dayName = cls.time.match(/([월화수목금토일]요일)/)?.[1] || '기타';
    if (!acc[dayName]) acc[dayName] = [];
    acc[dayName].push(cls);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div ref={captureRef} style={{ backgroundColor: '#ffffff', position: 'relative' }}>
      {isExporting && (
        <div style={{ textAlign: 'center', fontSize: '26px', fontWeight: '800', padding: '30px 20px 10px', color: '#111', fontFamily: 'Pretendard, -apple-system, sans-serif' }}>
          프리스타일 탱고 수업신청
        </div>
      )}

      <div className={styles.subTabs} style={{ marginBottom: '1.5rem' }}>
        {(['guide', 'schedule', 'media'] as const).map((tab) => (
          <button 
            key={tab}
            className={`${styles.subTabBtn} ${homeSubTab === tab ? styles.active : ''}`}
            onClick={() => setHomeSubTab(tab)}
          >
            {tab === 'guide' ? (language === 'ko' ? '수업안내' : (t.nav.classGuide || 'Class Guide')) :
             tab === 'schedule' ? (language === 'ko' ? '캘린더' : (t.nav.fullSchedule || 'Full Schedule')) :
             (language === 'ko' ? '시연.영상' : (t.media?.title || 'Media'))}
            {tab === 'schedule' && todayScheduleCount > 0 && <span className={styles.badge}>{todayScheduleCount}</span>}
            {tab === 'media' && recentMediaCount > 0 && <span className={styles.badge}>{recentMediaCount}</span>}
          </button>
        ))}
      </div>

      {homeSubTab === 'guide' ? (
        <>
          <div className={styles.monthNoticeContainer}>
            {isEditingNotice ? (
              <div className={styles.noticeEditArea}>
                <textarea 
                  className={styles.noticeTextarea}
                  value={monthlyNotice}
                  onChange={(e) => setMonthlyNotice(e.target.value)}
                  placeholder={t.home.admin.noticePlaceholder}
                />
                <div className={styles.noticeEditBtns}>
                  <button onClick={handleNoticeSave} className={styles.noticeSaveBtn}>{t.reserve.save}</button>
                  <button onClick={() => setIsEditingNotice(false)} className={styles.noticeCancelBtn}>{t.reserve.cancel}</button>
                </div>
              </div>
            ) : (
              <div className={styles.noticeDisplayArea}>
                {monthlyNotice ? (
                  <div className={styles.noticeContent}>{monthlyNotice}</div>
                ) : isAdminLogged ? (
                  <div className={styles.noticeAddPlaceholder} onClick={() => setIsEditingNotice(true)}>{t.home.admin.noticeEmpty}</div>
                ) : null}
                {isAdminLogged && monthlyNotice && !isExporting && (
                  <button className={styles.noticeEditBtn} onClick={() => setIsEditingNotice(true)}>
                    ✏️ {t.home.admin.editNotice}
                  </button>
                )}
              </div>
            )}
          </div>

          <div className={styles.fullStatusButtonContainer}>
            <button 
              className={styles.fullStatusBtn}
              onClick={() => {
                const isRegisteredInMonth = registrations.some(r => r.month === selectedMonth && (currentUser?.phone || '').replace(/[^0-9]/g, '') === r.phone);
                if (isAdminLogged || isRegisteredInMonth) {
                  setShowFullList(true);
                } else {
                  alert(t.home.registration.noPermissionMessage);
                }
              }}
            >
              <div className={styles.fullStatusBtnContent}>
                <span className={styles.fullStatusBtnLabel}>
                  {t.home.registration.viewFullStatus || 'Registration Status'}
                  <span className={styles.fullStatusBtnHint}>{t.home.registration.viewFullStatusHint}</span>
                </span>
                <span className={styles.fullStatusBtnCounts}>
                  {(t.home.registration.fullStatusSummary || 'L: {leader} / F: {follower}')
                    .replace('{leader}', (registrations.filter(r => r.month === selectedMonth && (r.role || '').replace(/"/g, '') === 'leader').length).toString())
                    .replace('{follower}', (registrations.filter(r => r.month === selectedMonth && (r.role || '').replace(/"/g, '') === 'follower').length).toString())
                  }
                </span>
              </div>
              <span className={styles.fullStatusBtnArrow}>〉</span>
            </button>

            {(() => {
              const userPhone = (currentUser?.phone || '').replace(/[^0-9]/g, '');
              const isRegistered = registrations.some(r => r.month === selectedMonth && r.phone === userPhone);
              const monthDisplay = selectedMonth.split('-')[1];
              
              return (
                <button 
                  className={`${styles.registrationMainBtn} ${isRegistered ? styles.registered : ''}`}
                  onClick={() => requireIdentity(() => setShowRegistrationModal(true))}
                >
                  <div className={styles.registerBtnIcon}>{isRegistered ? '✅' : '✍️'}</div>
                  <div className={styles.registerBtnText}>
                    <div className={styles.registerBtnTitle}>
                      {isRegistered ? (language === 'ko' ? `${monthDisplay}월 수업신청 완료` : `${monthDisplay} Month Reg. Completed`)
                                   : (language === 'ko' ? `${monthDisplay}월 수업신청` : `${monthDisplay} Month Registration`)}
                    </div>
                    <div className={styles.registerBtnSubtitle}>
                      {isRegistered ? (language === 'ko' ? '신청내역 확인 및 수정' : 'View or edit registration')
                                   : (language === 'ko' ? '지금 바로 신청하세요' : 'Apply now for this month')}
                    </div>
                  </div>
                </button>
              );
            })()}
          </div>

          <div className={styles.selectorRow}>
            <button 
              className="nav-btn-standard" 
              onClick={() => {
                const idx = availableMonths.indexOf(selectedMonth);
                if (idx > 0) setSelectedMonth(availableMonths[idx - 1]);
              }}
              disabled={availableMonths.indexOf(selectedMonth) === 0}
            >
              <span className="nav-btn-icon">←</span>
              <span style={{ marginLeft: '4px' }}>{language === 'ko' ? '이전' : 'Prev'}</span>
            </button>
            <div className={styles.monthTitle}>
              {selectedMonth?.split('-')?.[0] || ''}년 {parseInt(selectedMonth?.split('-')?.[1] || '0')}월
            </div>
            <button 
              className="nav-btn-standard" 
              onClick={() => {
                const idx = availableMonths.indexOf(selectedMonth);
                if (idx < availableMonths.length - 1) setSelectedMonth(availableMonths[idx + 1]);
              }}
              disabled={availableMonths.indexOf(selectedMonth) === availableMonths.length - 1}
            >
              <span style={{ marginRight: '4px' }}>{language === 'ko' ? '다음' : 'Next'}</span>
              <span className="nav-btn-icon">→</span>
            </button>
          </div>

          <main className={styles.mainContent}>
            {isLoading ? (
              <div className={styles.skeletonList}>
                <Skeleton height={200} borderRadius={16} count={3} />
              </div>
            ) : filteredClasses.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#8b95a1' }}>{t.home.registration.noClasses.replace('{month}', selectedMonth.split('-')[1])}</div>
            ) : (
              ['월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일', '기타']
                .filter(day => groupedClasses[day] && groupedClasses[day].length > 0)
                .map(day => {
                  const koDays = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '기타'];
                  const dayIndex = koDays.indexOf(day);
                  const localizedDay = dayIndex !== -1 ? t.home.registration.daysFull[dayIndex] : day;
                  
                  return (
                    <section key={day} className={styles.daySection}>
                      <h3 className={styles.dayTitle}>{localizedDay}</h3>
                      <div className={styles.cardList}>
                        {groupedClasses[day].map((cls) => (
                          <ClassCard 
                            key={cls.id}
                            {...cls}
                            teacher={`${cls.teacher1}${cls.teacher2 ? ` & ${cls.teacher2}` : ''}`}
                            leaderCount={registrations.filter(r => r.classIds.includes(cls.id) && (r.role || '').replace(/"/g, '') === 'leader').length}
                            followerCount={registrations.filter(r => r.classIds.includes(cls.id) && (r.role || '').replace(/"/g, '') === 'follower').length}
                            isApplied={appliedClassIds.has(cls.id)}
                            isRegistered={registrations.some(r => r.month === selectedMonth && r.phone === (currentUser?.phone || '').replace(/[^0-9]/g, '') && r.classIds.includes(cls.id))}
                            isAdmin={isAdminLogged}
                            onEdit={(id, e) => {
                              e.stopPropagation();
                              handleCardClick(id, 'edit');
                            }}
                            onDelete={async (id, e) => {
                              e.stopPropagation();
                              if (confirm(t.home?.registration?.deleteConfirm || '정말 삭제하시겠습니까?')) {
                                const { deleteClass } = await import('@/lib/db');
                                await deleteClass(id);
                                alert(t.home?.admin?.saveSuccess || '삭제되었습니다.');
                                window.location.reload(); // Refresh to update list
                              }
                            }}
                            onClick={(id) => handleCardClick(id, 'detail')}
                          />
                        ))}
                      </div>
                    </section>
                  );
                })
            )}
          </main>
        </>
      ) : homeSubTab === 'schedule' ? (
        <FullSchedule isAdmin={isAdminLogged} requireIdentity={requireIdentity} />
      ) : (
        <MediaTab t={t} isAdmin={isAdminLogged} user={currentUser} requireIdentity={requireIdentity} />
      )}

      {!isExporting && homeSubTab === 'guide' && filteredClasses.length > 0 && (
        <div style={{ padding: '20px', display: 'flex', justifyContent: 'center' }}>
          <button className={styles.exportBtn} onClick={handleExportImage}>
            🖼️ {language === 'ko' ? '수업시간표 이미지로 저장' : 'Save Schedule as Image'}
          </button>
        </div>
      )}

      {isExporting && (
        <div style={{ textAlign: 'center', fontSize: '18px', padding: '20px 20px 30px', color: '#555', marginTop: '10px', borderTop: '1px solid #eee', fontWeight: '600', fontFamily: 'Pretendard, -apple-system, sans-serif' }}>
          <div>문의 : 스톤 01072092468</div>
          <div style={{ fontSize: '14px', marginTop: '8px', color: '#888', fontWeight: '500' }}>
            freestyle-tango.kr 클릭하셔서 앱으로 수업신청하시면 됩니다
          </div>
        </div>
      )}
    </div>
  );
}

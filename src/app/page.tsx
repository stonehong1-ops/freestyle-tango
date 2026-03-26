'use client'; // Production deployment trigger v1.0.2

import React, { useState, useEffect } from 'react';
import ClassCard from '@/components/registration/ClassCard';
import FullscreenModal from '@/components/common/FullscreenModal';
import ClassDetail from '@/components/registration/ClassDetail';
import IdentityForm from '@/components/registration/IdentityForm';
import ClassEditor from '@/components/admin/ClassEditor';
import FooterMenu from '@/components/common/FooterMenu';
import MembershipGuide from '@/components/dashboard/MembershipGuide';
import RegistrationStatus from '@/components/dashboard/RegistrationStatus';
import RegistrationAdmin from '@/components/admin/RegistrationAdmin';
import MilongaLucy from '@/components/dashboard/MilongaLucy';
import StatisticsView from '@/components/admin/StatisticsView';
import MilongaEditor from '@/components/admin/MilongaEditor';
import { getClasses, addClass, updateClass, deleteClass, getRegistrations, TangoClass, Registration, CURRENT_REGISTRATION_MONTH } from '@/lib/db';
import styles from './page.module.css';

export default function Home() {
  const [classes, setClasses] = useState<TangoClass[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [modalView, setModalView] = useState<'detail' | 'edit'>('detail');
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<{ nickname: string, phone: string, role?: 'leader' | 'follower' } | null>(null);
  const [appliedClassIds, setAppliedClassIds] = useState<Set<string>>(new Set());
  const [selectedMonth, setSelectedMonth] = useState(CURRENT_REGISTRATION_MONTH); 

  // Navigation state
  const [activeTab, setActiveTab] = useState<string>('home');
  const [isAdminLogged, setIsAdminLogged] = useState(false);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  const [showEditorModal, setShowEditorModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showMilongaEditorModal, setShowMilongaEditorModal] = useState(false);
  
  // Lucy Date Logic
  const upcomingSundays = Array.from({ length: 4 }).map((_, i) => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() + (day === 0 ? 0 : 7 - day) + (i * 7);
    const sun = new Date(new Date().setDate(diff));
    return sun.toISOString().split('T')[0];
  });
  const [selectedLucyDate, setSelectedLucyDate] = useState(upcomingSundays[0]);
  const [activeLucyDates, setActiveLucyDates] = useState<string[]>(upcomingSundays);
  
  const fetchMilongaDates = async () => {
    const { getMilongaInfo } = await import('@/lib/db');
    const info = await getMilongaInfo();
    if (info && info.activeDate) {
      setActiveLucyDates([info.activeDate]);
      setSelectedLucyDate(info.activeDate);
    } else {
      setActiveLucyDates([]);
      setSelectedLucyDate('');
    }
  };
  
  const checkAdminStatus = (user: { phone: string } | null) => {
    if (user && user.phone.replace(/[^0-9]/g, '') === '01072092468') {
      setIsAdminLogged(true);
    } else {
      setIsAdminLogged(false);
    }
  };

  // Identity Interceptor
  const [showIdentityForm, setShowIdentityForm] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const requireIdentity = (action: () => void) => {
    const savedUser = localStorage.getItem('ft_user');
    if (savedUser) {
      action();
    } else {
      setPendingAction(() => action);
      setShowIdentityForm(true);
    }
  };

  const handleIdentityComplete = () => {
    setShowIdentityForm(false);
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  useEffect(() => {
    fetchClasses();
    const loadUser = () => {
      const savedUser = localStorage.getItem('ft_user');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        checkAdminStatus(user);
      }
      
      const savedClasses = localStorage.getItem('my_tango_classes');
      if (savedClasses) setAppliedClassIds(new Set(JSON.parse(savedClasses)));
    };
    loadUser();
    
    window.addEventListener('ft_user_updated', loadUser);
    window.addEventListener('ft_classes_updated', fetchClasses);
    window.addEventListener('ft_registrations_updated', fetchClasses);
    window.addEventListener('ft_milonga_updated', fetchMilongaDates);
    fetchMilongaDates();

    return () => {
      window.removeEventListener('ft_user_updated', loadUser);
      window.removeEventListener('ft_classes_updated', fetchClasses);
      window.removeEventListener('ft_registrations_updated', fetchClasses);
      window.removeEventListener('ft_milonga_updated', fetchMilongaDates);
    };
  }, []);

  const fetchClasses = async () => {
    setIsLoading(true);
    try {
      const [classData, regData] = await Promise.all([getClasses(), getRegistrations()]);
      setClasses(classData);
      setRegistrations(regData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardClick = (id: string) => {
    setModalView('detail');
    setSelectedClassId(id);
  };

  const handleRegisterClick = (id: string) => {
    requireIdentity(() => {
      const saved = localStorage.getItem('my_tango_classes');
      const setIds = saved ? new Set(JSON.parse(saved) as string[]) : new Set<string>();
      setIds.add(id);
      localStorage.setItem('my_tango_classes', JSON.stringify(Array.from(setIds)));
      setAppliedClassIds(new Set(setIds));
      window.dispatchEvent(new Event('ft_user_updated'));
      alert('수업이 장바구니에 담겼습니다! 하단 [마이페이지] 메뉴에서 최종 신청을 진행해주세요.');
      handleCloseModal();
    });
  };

  const handleEdit = () => {
    setModalView('edit');
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('정말로 이 수업을 삭제하시겠습니까?')) {
      try {
        await deleteClass(id);
        alert('삭제되었습니다.');
        handleCloseModal();
        fetchClasses();
      } catch (error: unknown) {
        console.error("Delete Error: ", error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        alert('삭제 실패: ' + errorMessage);
      }
    }
  };

  const handleSave = async (data: Omit<TangoClass, 'id'> | Partial<TangoClass>) => {
    try {
      if (modalView === 'edit' && selectedClassId) {
        await updateClass(selectedClassId, data);
        alert('수정되었습니다.');
        setModalView('detail');
      } else {
        await addClass(data as Omit<TangoClass, 'id'>);
        alert('등록되었습니다.');
        setActiveTab('home'); 
      }
      fetchClasses();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      alert('저장 실패: ' + errorMessage);
    }
  };

  const handleCloseModal = () => {
    setSelectedClassId(null);
    setModalView('detail');
  };

  const availableMonths = Array.from(new Set([
    '2026-04', 
    ...classes.map(c => c.targetMonth).filter(Boolean) as string[]
  ])).sort();

  const filteredClasses = classes.filter(cls => {
    const month = cls.targetMonth || '2026-04';
    return month === selectedMonth;
  });

  const groupedClasses = filteredClasses.reduce((acc, cls) => {
    const dayName = cls.time.match(/([월화수목금토일]요일)/)?.[1] || '기타';
    if (!acc[dayName]) acc[dayName] = [];
    acc[dayName].push(cls);
    return acc;
  }, {} as Record<string, TangoClass[]>);

  const selectedClass = classes.find(c => c.id === selectedClassId);
  const currentMonthStr = new Date().toISOString().substring(0, 7);
  const isPastMonth = selectedMonth < currentMonthStr;

  return (
    <div className={styles.container}>
      
      {/* Global Fixed Header */}
      <header className={styles.globalHeader}>
        <div className={styles.headerLeft}>
          <img src="/images/logo.png" alt="Logo" className={styles.logoImage} />
          <span className={styles.studioName}>프리스타일탱고스튜디오</span>
        </div>
        
        <div className={styles.headerRight}>
          <div className={styles.adminGroup}>
            {isAdminLogged && (
              <div style={{ position: 'relative' }}>
                <button 
                  className={styles.headerAdminBtn}
                  onClick={() => setIsAdminMenuOpen(!isAdminMenuOpen)}
                >
                  ⚙️
                </button>
                {isAdminMenuOpen && (
                  <div className={styles.adminDropdown}>
                    <button onClick={() => { setShowEditorModal(true); setIsAdminMenuOpen(false); }}>수업 등록</button>
                    <button onClick={() => { setShowMilongaEditorModal(true); setIsAdminMenuOpen(false); }}>밀롱가 등록</button>
                    <button onClick={() => { setShowStatsModal(true); setIsAdminMenuOpen(false); }}>통계 보기</button>
                    <button onClick={() => { setActiveTab('admin_status'); setIsAdminMenuOpen(false); }}>신청 현황</button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div 
            className={styles.profileArea}
            onClick={() => requireIdentity(() => {})}
          >
            {currentUser ? (
              <>
                <div className={styles.profileText}>
                  <span className={styles.nickname}>{currentUser.nickname}</span>
                </div>
                <div className={`${styles.profilePhoto} ${currentUser.role === 'leader' ? styles.male : styles.female}`} />
              </>
            ) : (
              <>
                <div className={styles.helpIcon} style={{ marginRight: '8px', color: '#8b95a1' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>
                </div>
                <div className={styles.profilePhotoPlaceholder} />
              </>
            )}
          </div>
        </div>
      </header>

      <div className={styles.scrollContent}>
        <div className={styles.pageHeader}>
          <h2 className={styles.pageTitle}>
            {
              activeTab === 'home' ? '수업정보' : 
              activeTab === 'membership' ? '클럽안내' :
              activeTab === 'status' ? '마이페이지' :
              activeTab === 'lucy' ? '밀롱가Lucy' :
              '신청현황'
            }
          </h2>
          {activeTab === 'home' && (
            <select 
              className={styles.monthSelect}
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              {availableMonths.map(m => (
                <option key={m} value={m}>{m.split('-')[1]}월</option>
              ))}
            </select>
          )}
          {activeTab === 'lucy' && ( activeLucyDates.length > 0 ? (
            <select 
              className={styles.monthSelect}
              value={selectedLucyDate}
              onChange={(e) => setSelectedLucyDate(e.target.value)}
            >
              {activeLucyDates.map(date => {
                const [y, m, d] = date.split('-');
                return (
                  <option key={date} value={date}>{parseInt(m)}/{parseInt(d)} 일요일</option>
                );
              })}
            </select>
          ) : (
            <div className={styles.noDateBadge}>일정 준비중</div>
          ))}
        </div>

        {activeTab === 'home' && (
          <main className={styles.mainContent}>
            {isLoading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#8b95a1' }}>로딩 중...</div>
            ) : filteredClasses.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#8b95a1' }}>{selectedMonth.split('-')[1]}월에 등록된 수업이 없습니다.</div>
            ) : (
              ['월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일', '기타']
                .filter(day => groupedClasses[day] && groupedClasses[day].length > 0)
                .map(day => (
                  <section key={day} className={styles.daySection}>
                    <h3 className={styles.dayTitle}>{day}</h3>
                    <div className={styles.cardList}>
                      {groupedClasses[day].map((cls) => {
                        const leaderCount = registrations.filter(r => 
                          r.classIds.includes(cls.id) && (r.role || '').replace(/"/g, '') === 'leader'
                        ).length;
                        const followerCount = registrations.filter(r => 
                          r.classIds.includes(cls.id) && (r.role || '').replace(/"/g, '') === 'follower'
                        ).length;

                        return (
                          <ClassCard 
                            key={cls.id}
                            id={cls.id}
                            level={cls.level}
                            title={cls.title}
                            time={cls.time}
                            teacher={`${cls.teacher1}${cls.teacher2 ? ` & ${cls.teacher2}` : ''}`}
                            imageUrl={cls.imageUrl}
                            price={cls.price ? `${cls.price.toLocaleString()}원` : '0원'}
                            leaderCount={leaderCount}
                            followerCount={followerCount}
                            maxCount={cls.maxCount || 20}
                            isApplied={appliedClassIds.has(cls.id)}
                            onClick={handleCardClick}
                          />
                        );
                      })}
                    </div>
                  </section>
                ))
            )}
          </main>
        )}

        {activeTab === 'membership' && (
          <main className={styles.mainContent}>
            <MembershipGuide />
          </main>
        )}

        {activeTab === 'status' && (
          <main className={styles.mainContent}>
            <RegistrationStatus 
              classes={classes} 
              selectedMonth={selectedMonth}
              onClose={() => setActiveTab('home')} 
              requireIdentity={requireIdentity}
            />
          </main>
        )}

        {activeTab === 'lucy' && (
          <main className={styles.mainContent}>
            <MilongaLucy 
              selectedDate={selectedLucyDate} 
              onHome={() => setActiveTab('home')} 
              isAdmin={isAdminLogged}
              onEdit={() => setShowMilongaEditorModal(true)}
            />
          </main>
        )}

        {activeTab === 'admin_status' && (
          <main className={styles.mainContent}>
            <RegistrationAdmin />
          </main>
        )}
      </div>

      <FullscreenModal
        isOpen={!!selectedClassId}
        onClose={handleCloseModal}
        title={modalView === 'detail' ? '클래스 상세' : '수업 정보 수정'}
      >
        {selectedClass && (
          modalView === 'detail' ? (
            <ClassDetail 
              {...selectedClass}
              curriculum={selectedClass.curriculum}
              price={selectedClass.price}
              imageUrl={selectedClass.imageUrl}
              teacherProfile={selectedClass.teacherProfile}
              videoUrl={selectedClass.videoUrl}
              registrations={registrations.filter(r => r.classIds.includes(selectedClass.id))}
              onRegister={isPastMonth ? () => alert('지나간 달의 수업은 신청할 수 없습니다.') : handleRegisterClick}
              onEdit={isAdminLogged ? handleEdit : undefined}
              onDelete={isAdminLogged ? handleDelete : undefined}
            />
          ) : (
            <ClassEditor 
              initialData={selectedClass} 
              onSave={handleSave} 
            />
          )
        )}
      </FullscreenModal>

      <FullscreenModal
        isOpen={showIdentityForm}
        onClose={() => setShowIdentityForm(false)}
        title="본인 인증"
        isBottomSheet={true}
      >
        <IdentityForm 
          onClose={() => setShowIdentityForm(false)}
          onComplete={handleIdentityComplete}
        />
      </FullscreenModal>

      <FullscreenModal
        isOpen={showEditorModal}
        onClose={() => setShowEditorModal(false)}
        title="신규 수업 등록"
      >
        <ClassEditor 
          onSave={async (data) => {
            await handleSave(data);
            setShowEditorModal(false);
          }} 
        />
      </FullscreenModal>

      <FullscreenModal
        isOpen={showStatsModal}
        onClose={() => setShowStatsModal(false)}
        title="전체 통계 대시보드"
      >
        <StatisticsView classes={classes} registrations={registrations} />
      </FullscreenModal>

      <FullscreenModal
        isOpen={showMilongaEditorModal}
        onClose={() => setShowMilongaEditorModal(false)}
        title="밀롱가 정보 수정"
      >
        <MilongaEditor onClose={() => setShowMilongaEditorModal(false)} />
      </FullscreenModal>

      <FooterMenu onAction={(id) => setActiveTab(id)} />
    </div>
  );
}

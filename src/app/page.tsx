'use client'; // Production deployment trigger v1.0.1

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
  const [adminInputPw, setAdminInputPw] = useState('');
  const [adminSubTab, setAdminSubTab] = useState<'classes' | 'registrations'>('registrations');
  const [showAdminStatus, setShowAdminStatus] = useState(false);
  const [showEditorModal, setShowEditorModal] = useState(false);

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
      if (savedUser) setCurrentUser(JSON.parse(savedUser));
      
      const savedClasses = localStorage.getItem('my_tango_classes');
      if (savedClasses) setAppliedClassIds(new Set(JSON.parse(savedClasses)));
    };
    loadUser();
    
    window.addEventListener('ft_user_updated', loadUser);
    window.addEventListener('ft_classes_updated', fetchClasses);
    window.addEventListener('ft_registrations_updated', fetchClasses);
    return () => {
      window.removeEventListener('ft_user_updated', loadUser);
      window.removeEventListener('ft_classes_updated', fetchClasses);
      window.removeEventListener('ft_registrations_updated', fetchClasses);
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
      alert('수업이 장바구니에 담겼습니다! 하단 [내신청현황] 메뉴에서 한꺼번에 최종 신청을 진행해주세요.');
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
        setActiveTab('home'); // Go back home after adding
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

  // Calculate available months from classes
  const availableMonths = Array.from(new Set([
    '2026-04', // Default minimum for transition
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
          <span className={styles.logoIcon}>💃</span>
          <span className={styles.studioName}>프리스타일탱고스튜디오</span>
        </div>
        
        <div className={styles.headerRight}>
          <div className={styles.adminGroup}>
            {isAdminLogged ? (
              <>
                <button 
                  className={styles.headerAdminBtn}
                  onClick={() => setShowEditorModal(true)}
                  title="수업 등록"
                >
                  ➕
                </button>
                <button 
                  className={styles.headerAdminBtn}
                  onClick={() => setShowAdminStatus(true)}
                  title="신청 현황"
                >
                  ⚙️
                </button>
              </>
            ) : (
              <button 
                className={styles.headerAdminBtn}
                onClick={() => setShowAdminStatus(true)} 
                title="관리자 로그인"
              >
                ⚙️
              </button>
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
              <div className={styles.profilePhotoPlaceholder} />
            )}
          </div>
        </div>
      </header>

      <div className={styles.scrollContent}>
        {activeTab === 'home' && (
          <>
            <div className={styles.titleCard}>
              <div className={styles.titleLine1}>프리스타일탱고</div>
              <div className={styles.titleLine2}>
                <span className={styles.highlight}>{selectedMonth.split('-')[1]}월</span> 수업정보
              </div>
            </div>

            {/* Month Selector Tabs */}
            <div className={styles.monthTabs}>
              {availableMonths.map(m => (
                <button 
                  key={m} 
                  className={`${styles.monthTab} ${selectedMonth === m ? styles.activeMonth : ''}`}
                  onClick={() => setSelectedMonth(m)}
                >
                  {m.split('-')[1]}월
                </button>
              ))}
            </div>

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
                        // Calculate counts in real-time from registrations array
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
            <div className={styles.pageTitle}>클럽안내</div>
            <MembershipGuide />
          </main>
        )}

        {activeTab === 'status' && (
          <main className={styles.mainContent}>
            <div className={styles.pageTitle}>마이페이지</div>
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
            <div className={styles.pageTitle}>밀롱가Lucy</div>
            <MilongaLucy />
          </main>
        )}

        {activeTab === 'admin_status' && (
          <main className={styles.mainContent}>
            <div className={styles.pageTitle}>{selectedMonth.split('-')[1]}월 신청현황</div>
            <RegistrationAdmin />
          </main>
        )}
      </div>


      {/* 수업 상세 / 수정 전체 화면 팝업 (오직 홈 탭의 목록에서 클릭했을 때만) */}
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

      {/* Admin Dashboard Modal */}
      <FullscreenModal
        isOpen={showAdminStatus}
        onClose={() => setShowAdminStatus(false)}
        title={isAdminLogged ? "수업 신청 현황" : "관리자 로그인"}
      >
        {!isAdminLogged ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <h3 style={{ marginBottom: '1.5rem', color: '#191f28' }}>비밀번호를 입력하세요</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
              <input 
                type="password" 
                placeholder="비밀번호" 
                value={adminInputPw}
                onChange={(e) => setAdminInputPw(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && adminInputPw === 'tangolucy' && setIsAdminLogged(true)}
                style={{ padding: '1rem', borderRadius: '14px', border: '1px solid #ddd', width: '200px', textAlign: 'center', fontSize: '1.2rem' }}
              />
              <button 
                onClick={() => {
                  if (adminInputPw === 'tangolucy') setIsAdminLogged(true);
                  else alert('비밀번호가 틀렸습니다.');
                }}
                style={{ padding: '1rem 3rem', background: '#3182f6', color: '#fff', borderRadius: '14px', border: 'none', fontWeight: 800, fontSize: '1.1rem', cursor: 'pointer' }}
              >
                로그인
              </button>
            </div>
          </div>
        ) : (
          <RegistrationAdmin />
        )}
      </FullscreenModal>

      {/* Class Creator Modal */}
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

      <FooterMenu onAction={(id) => setActiveTab(id)} />
    </div>
  );
}

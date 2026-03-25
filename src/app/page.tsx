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
import { getClasses, addClass, updateClass, deleteClass, TangoClass } from '@/lib/db';
import styles from './page.module.css';

export default function Home() {
  const [classes, setClasses] = useState<TangoClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [modalView, setModalView] = useState<'detail' | 'edit'>('detail');
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<{ nickname: string, phone: string } | null>(null);
  const [appliedClassIds, setAppliedClassIds] = useState<Set<string>>(new Set());

  // Navigation state
  const [activeTab, setActiveTab] = useState<string>('home');
  const [isAdminLogged, setIsAdminLogged] = useState(false);
  const [adminInputPw, setAdminInputPw] = useState('');
  const [adminSubTab, setAdminSubTab] = useState<'classes' | 'registrations'>('registrations');

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
    return () => {
      window.removeEventListener('ft_user_updated', loadUser);
      window.removeEventListener('ft_classes_updated', fetchClasses);
    };
  }, []);

  const fetchClasses = async () => {
    setIsLoading(true);
    try {
      const data = await getClasses();
      setClasses(data);
    } catch (error) {
      console.error('Error fetching classes:', error);
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

  const handleEdit = (id: string) => {
    setModalView('edit');
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('정말로 이 수업을 삭제하시겠습니까?')) {
      try {
        await deleteClass(id);
        alert('삭제되었습니다.');
        handleCloseModal();
        fetchClasses();
      } catch (error: any) {
        console.error("Delete Error: ", error);
        alert('삭제 실패: ' + (error.message || error));
      }
    }
  };

  const handleSave = async (data: any) => {
    try {
      if (modalView === 'edit' && selectedClassId) {
        await updateClass(selectedClassId, data);
        alert('수정되었습니다.');
        setModalView('detail');
      } else {
        await addClass(data);
        alert('등록되었습니다.');
        setActiveTab('home'); // Go back home after adding
      }
      fetchClasses();
    } catch (error) {
      alert('저장 실패: ' + error);
    }
  };

  const handleCloseModal = () => {
    setSelectedClassId(null);
    setModalView('detail');
  };

  const groupedClasses = classes.reduce((acc, cls) => {
    const dayName = cls.time.match(/([월화수목금토일]요일)/)?.[1] || '기타';
    if (!acc[dayName]) acc[dayName] = [];
    acc[dayName].push(cls);
    return acc;
  }, {} as Record<string, TangoClass[]>);

  const selectedClass = classes.find(c => c.id === selectedClassId);

  return (
    <div className={styles.container}>
      
      {activeTab === 'home' && (
        <>
          <header className={styles.header}>
            <div className={styles.titleCard}>
              <div className={styles.titleLine1}>프리스타일탱고</div>
              <div className={styles.titleLine2}>
                <span className={styles.highlight}>4월</span> 수업신청
              </div>
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
                  <div className={`${styles.profilePhoto} ${currentUser.gender === 'male' ? styles.male : styles.female}`} />
                </>
              ) : (
                <>
                  <div className={styles.profileText}>
                    <span className={styles.loginRequired}>로그인필요</span>
                  </div>
                  <div className={styles.profilePhotoPlaceholder} />
                </>
              )}
            </div>
          </header>

          <main className={styles.mainContent}>
            {isLoading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#8b95a1' }}>로딩 중...</div>
            ) : classes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#8b95a1' }}>등록된 수업이 없습니다.</div>
            ) : (
              ['월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일', '기타']
                .filter(day => groupedClasses[day] && groupedClasses[day].length > 0)
                .map(day => (
                  <section key={day} className={styles.daySection}>
                    <h3 className={styles.dayTitle}>{day}</h3>
                    <div className={styles.cardList}>
                      {groupedClasses[day].map((cls) => (
                        <ClassCard 
                          key={cls.id}
                          {...cls}
                          isApplied={appliedClassIds.has(cls.id)}
                          teacher={`${cls.teacher1}${cls.teacher2 ? ` & ${cls.teacher2}` : ''}`}
                          onClick={handleCardClick}
                        />
                      ))}
                    </div>
                  </section>
                ))
            )}
          </main>
        </>
      )}

      {activeTab === 'membership' && (
        <main className={styles.mainContent} style={{ paddingTop: '2rem' }}>
          <MembershipGuide />
        </main>
      )}

      {activeTab === 'status' && (
        <main className={styles.mainContent} style={{ paddingTop: '0', paddingLeft: 0, paddingRight: 0 }}>
          <RegistrationStatus 
            classes={classes} 
            onClose={() => setActiveTab('home')} 
            requireIdentity={requireIdentity}
          />
        </main>
      )}

      {(activeTab === 'admin' || activeTab === 'add') && (
        <main className={styles.mainContent} style={{ paddingTop: '2rem' }}>
          {!isAdminLogged ? (
             <div style={{ textAlign: 'center', marginTop: '4rem' }}>
               <h2 style={{ marginBottom: '2rem', color: '#191f28' }}>관리자 전용</h2>
               <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                 <input 
                   type="password" 
                   placeholder="비밀번호 4자리 입력"
                   value={adminInputPw}
                   onChange={(e) => setAdminInputPw(e.target.value)}
                   style={{ padding: '1rem', borderRadius: '12px', border: '1px solid #ddd', width: '200px', fontSize: '1rem' }}
                 />
                 <button 
                   onClick={() => {
                     if (adminInputPw === '9999') setIsAdminLogged(true);
                     else alert('비밀번호가 일치하지 않습니다.');
                   }}
                   style={{ padding: '1rem 1.5rem', background: '#3182f6', color: '#fff', borderRadius: '12px', border: 'none', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' }}
                 >
                   접속
                 </button>
               </div>
             </div>
          ) : (
              <div>
                <h2 style={{ marginBottom: '2rem', color: '#191f28', textAlign: 'center' }}>
                  {activeTab === 'add' ? '새 수업 등록' : '관리자 대시보드'}
                </h2>
                {activeTab === 'add' ? (
                  <ClassEditor onSave={handleSave} />
                ) : (
                  <div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', justifyContent: 'center' }}>
                      <button 
                        onClick={() => setAdminSubTab('registrations')}
                        style={{ 
                          padding: '0.6rem 1.2rem', 
                          borderRadius: '100px', 
                          border: 'none',
                          background: adminSubTab === 'registrations' ? '#3182f6' : '#f2f4f6',
                          color: adminSubTab === 'registrations' ? '#fff' : '#4e5968',
                          fontWeight: 700,
                          fontSize: '0.9rem',
                          cursor: 'pointer'
                        }}
                      >
                        신청현황
                      </button>
                      <button 
                        onClick={() => setAdminSubTab('classes')}
                        style={{ 
                          padding: '0.6rem 1.2rem', 
                          borderRadius: '100px', 
                          border: 'none',
                          background: adminSubTab === 'classes' ? '#3182f6' : '#f2f4f6',
                          color: adminSubTab === 'classes' ? '#fff' : '#4e5968',
                          fontWeight: 700,
                          fontSize: '0.9rem',
                          cursor: 'pointer'
                        }}
                      >
                        클래스관리
                      </button>
                    </div>

                    {adminSubTab === 'registrations' ? (
                      <RegistrationAdmin />
                    ) : (
                      <div style={{ padding: '4rem 2rem', background: '#f2f4f6', borderRadius: '16px', textAlign: 'center' }}>
                        <p style={{ color: '#8b95a1', marginBottom: '1rem' }}>클래스 관리 모드</p>
                        <p style={{ color: '#4e5968', fontSize: '0.85rem' }}>홈 화면에서 클래스 카드를 클릭하면<br/>수정 및 삭제가 가능합니다.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
          )}
        </main>
      )}

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
              onRegister={handleRegisterClick}
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

      {/* Identity Bottom Sheet Popup */}
      <FullscreenModal
        isOpen={showIdentityForm}
        onClose={() => setShowIdentityForm(false)}
        title="정보 입력"
        isBottomSheet={true}
      >
        <IdentityForm 
          onClose={() => setShowIdentityForm(false)} 
          onComplete={handleIdentityComplete} 
        />
      </FullscreenModal>

      <FooterMenu onAction={(id) => setActiveTab(id)} />
    </div>
  );
}

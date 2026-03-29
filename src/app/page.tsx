'use client'; // Production deployment trigger// v1.0.4 - Full System Audit & Design Optimization

import React, { useState, useEffect, useRef } from 'react';
import { toPng } from 'html-to-image';
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
import MilongaEditor from '@/components/admin/MilongaEditor';
import TangoStay from '@/components/stay/TangoStay';
import ChatList from '@/components/chat/ChatList';
import ChatRoom from '@/components/chat/ChatRoom';
import InstallGuide from '@/components/common/InstallGuide';
import { getClasses, addClass, updateClass, deleteClass, getRegistrations, TangoClass, Registration, CURRENT_REGISTRATION_MONTH, getMonthlyNotice, updateMonthlyNotice } from '@/lib/db';
import styles from './page.module.css';
import { useLanguage } from '@/contexts/LanguageContext';
import { Language } from '@/locales';

export default function Home() {
  const [classes, setClasses] = useState<TangoClass[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [modalView, setModalView] = useState<'detail' | 'edit'>('detail');
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<{ nickname: string, phone: string, role?: 'leader' | 'follower' } | null>(null);
  const [monthlyNotice, setMonthlyNotice] = useState<string>('');
  const [isEditingNotice, setIsEditingNotice] = useState(false);
  const captureRef = useRef<HTMLDivElement>(null);
  const [appliedClassIds, setAppliedClassIds] = useState<Set<string>>(new Set());
  const [selectedMonth, setSelectedMonth] = useState(CURRENT_REGISTRATION_MONTH); 
  const { t, language, setLanguage } = useLanguage();

  // Navigation state
  const [activeTab, setActiveTab] = useState<string>('lucy');
  const [isAdminLogged, setIsAdminLogged] = useState(false);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  const [showEditorModal, setShowEditorModal] = useState(false);
  const [showMilongaEditorModal, setShowMilongaEditorModal] = useState(false);
  const [milongaEditorMode, setMilongaEditorMode] = useState<'new' | 'edit'>('edit');
  const [selectedChatRoomId, setSelectedChatRoomId] = useState<string | null>(null);
  const [selectedChatRoomName, setSelectedChatRoomName] = useState<string>('');
  
  // Back button exit guard
  const [showExitToast, setShowExitToast] = useState(false);
  const [lastBackPress, setLastBackPress] = useState(0);

  // Identity Interceptor
  const [showIdentityForm, setShowIdentityForm] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const requireIdentity = (action: () => void) => {
    const savedUser = localStorage.getItem('ft_user');
    if (savedUser) {
      action();
    } else {
      setPendingAction(() => action);
      window.history.pushState({ modal: 'identity' }, '', '');
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

  // Back button and Modal Navigation management
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      // 1. If this was a modal pop, check if we handled it or need to close local modals
      const isModalPop = event.state?.modal;

      // Close Local Modals first
      if (selectedClassId) {
        setSelectedClassId(null);
        return;
      }
      if (showEditorModal) {
        setShowEditorModal(false);
        return;
      }
      if (showMilongaEditorModal) {
        setShowMilongaEditorModal(false);
        return;
      }
      if (showIdentityForm) {
        setShowIdentityForm(false);
        return;
      }
      if (selectedChatRoomId) {
        setSelectedChatRoomId(null);
        return;
      }

      // If it's a modal pop that wasn't handled locally, we just stop here
      // (It might have been handled by a child component like MilongaLucy)
      if (isModalPop) return;

      // 2. Handle Tab Navigation if state exists
      if (event.state && event.state.tab) {
        setActiveTab(event.state.tab);
      } 
      // 3. Fallback: Guard against exiting the app from the root tab
      else if (activeTab === 'lucy') {
        const now = Date.now();
        if (now - lastBackPress < 2000) return;
        setLastBackPress(now);
        setShowExitToast(true);
        setTimeout(() => setShowExitToast(false), 2000);
        window.history.pushState({ tab: 'lucy' }, '', '');
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    // Initial history state if missing
    if (typeof window !== 'undefined' && !window.history.state) {
      window.history.replaceState({ tab: 'lucy' }, '', '');
    }

    return () => window.removeEventListener('popstate', handlePopState);
  }, [activeTab, lastBackPress, selectedClassId, showEditorModal, showMilongaEditorModal, showIdentityForm, selectedChatRoomId]);

  const handleTabChange = (id: string) => {
    if (activeTab === id) return;
    
    if (id === 'chat') {
      requireIdentity(() => {
        window.history.pushState({ tab: id }, '', '');
        setActiveTab(id);
      });
    } else {
      window.history.pushState({ tab: id }, '', '');
      setActiveTab(id);
    }
  };
  
  // Lucy Date Logic
  const upcomingSundays = Array.from({ length: 4 }).map((_, i) => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() + (day === 0 ? 0 : 7 - day) + (i * 7);
    const sun = new Date(new Date().setDate(diff));
    return sun.toISOString().split('T')[0];
  });
  const [selectedLucyDate, setSelectedLucyDate] = useState("");
  const [activeLucyDates, setActiveLucyDates] = useState<string[]>(upcomingSundays);
  
  const fetchMilongaDates = async () => {
    const { getMilongaInfo } = await import('@/lib/db');
    const info = await getMilongaInfo();
    if (info && info.activeDates && info.activeDates.length > 0) {
      setActiveLucyDates(info.activeDates);
      // Select the first one or maintain current if valid
      setSelectedLucyDate(prev => info.activeDates!.includes(prev) ? prev : info.activeDates![0]);
    } else if (info && info.activeDate) {
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

      // Sync appliedClassIds with DB for current user
      const savedUser = localStorage.getItem('ft_user');
      if (savedUser) {
        try {
          const { phone } = JSON.parse(savedUser);
          const normalizedPhone = phone.replace(/[^0-9]/g, '');
          const userRegs = regData.filter(r => r.phone === normalizedPhone);
          const dbClassIds = userRegs.flatMap(r => r.classIds || []);
          
          // Combine local drafts with DB registrations
          const localSaved = localStorage.getItem('my_tango_classes');
          const localIds = localSaved ? JSON.parse(localSaved) as string[] : [];
          setAppliedClassIds(new Set([...dbClassIds, ...localIds]));
        } catch (e) {
          console.error('Error syncing appliedClassIds:', e);
        }
      }

      // Set default month to the most relevant month with classes
      if (classData.length > 0) {
        const currentMonth = new Date().toISOString().substring(0, 7);
        const monthsWithClasses = Array.from(new Set(classData.map(c => c.targetMonth).filter(Boolean) as string[])).sort();
        
        // Only override if currently selected month has no classes
        const hasClassesInSelectedMonth = classData.some(c => c.targetMonth === selectedMonth);
        if (!hasClassesInSelectedMonth) {
          const futureMonths = monthsWithClasses.filter(m => m >= currentMonth);
          if (futureMonths.length > 0) {
            setSelectedMonth(futureMonths[0]);
          } else if (monthsWithClasses.length > 0) {
            // If no future classes, pick the latest past month with classes
            setSelectedMonth(monthsWithClasses[monthsWithClasses.length - 1]);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchNotice = async () => {
      const notice = await getMonthlyNotice(selectedMonth);
      setMonthlyNotice(notice);
    };
    fetchNotice();
  }, [selectedMonth]);

  const handleNoticeSave = async () => {
    const res = await updateMonthlyNotice(selectedMonth, monthlyNotice);
    if (res.success) {
      setIsEditingNotice(false);
      alert('공지가 저장되었습니다.');
    } else {
      alert('저장 실패');
    }
  };

  const handleCardClick = (id: string) => {
    window.history.pushState({ modal: 'detail' }, '', '');
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

  const handleCreateChatRoom = async () => {
    const { createChatRoom } = await import('@/lib/chat');
    const name = window.prompt('채팅방 이름을 입력하세요:');
    if (!name) return;
    
    const type = window.prompt('채팅방 유형을 입력하세요 (public, notice, private, support):', 'public') as any;
    if (!['public', 'notice', 'private', 'support'].includes(type)) return;

    await createChatRoom({
      name,
      type,
      createdBy: currentUser?.phone || 'unknown',
      participants: type === 'public' ? [] : [currentUser?.phone.replace(/[^0-9]/g, '') || '']
    });
  };

  const handleCloseModal = () => {
    setSelectedClassId(null);
    setModalView('detail');
    // We don't necessarily call back() here because handleCloseModal 
    // is called BY handlePopState too.
  };

  const handleExportImage = async () => {
    if (!captureRef.current) return;
    
    try {
      // Show loading or something if needed
      const dataUrl = await toPng(captureRef.current, {
        backgroundColor: '#ffffff',
        cacheBust: true,
        style: {
          padding: '20px',
          margin: '0',
          width: '480px', // Standard width for social media cards
        }
      });
      
      const link = document.createElement('a');
      link.download = `freestyle-tango-classes-${selectedMonth}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('oops, something went wrong!', err);
      alert('이미지 생성 중 오류가 발생했습니다.');
    }
  };

  const availableMonths = Array.from(new Set([
    CURRENT_REGISTRATION_MONTH, 
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
      <InstallGuide />
      
      {/* Global Fixed Header */}
      <header className={styles.globalHeader}>
        <div className={styles.headerLeft}>
          <img src="/images/logo.png" alt="Logo" className={styles.logoImage} />
          <span className={styles.studioName}>프리스타일탱고</span>
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
                    <button onClick={() => { setShowEditorModal(true); setIsAdminMenuOpen(false); window.history.pushState({ modal: 'editor' }, '', ''); }}>수업 등록</button>
                    <button onClick={() => { setMilongaEditorMode('new'); setShowMilongaEditorModal(true); setIsAdminMenuOpen(false); window.history.pushState({ modal: 'milongaEditor' }, '', ''); }}>밀롱가 등록</button>
                  </div>
                )}
              </div>
            )}
          </div>

          <button 
            className={styles.profileArea}
            onClick={() => { setShowIdentityForm(true); window.history.pushState({ modal: 'identity' }, '', ''); }}
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
          </button>
        </div>
      </header>

      <div className={styles.scrollContent}>
        {activeTab === 'home' ? (
          <div ref={captureRef} style={{ backgroundColor: '#ffffff' }}>
            <div className={styles.pageHeader}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <h2 className={styles.pageTitle}>{t.nav.class}</h2>
              </div>
              <select 
                className={styles.monthSelect}
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                {availableMonths.map(m => (
                  <option key={m} value={m}>{m.split('-')[1]}월</option>
                ))}
              </select>
            </div>
            
            <div className={styles.monthNoticeContainer}>
              {isEditingNotice ? (
                <div className={styles.noticeEditArea}>
                  <textarea 
                    className={styles.noticeTextarea}
                    value={monthlyNotice}
                    onChange={(e) => setMonthlyNotice(e.target.value)}
                    placeholder="공지 내용을 입력하세요 (2~3줄)"
                  />
                  <div className={styles.noticeEditBtns}>
                    <button onClick={handleNoticeSave} className={styles.noticeSaveBtn}>저장</button>
                    <button onClick={() => setIsEditingNotice(false)} className={styles.noticeCancelBtn}>취소</button>
                  </div>
                </div>
              ) : (
                <div className={styles.noticeDisplayArea}>
                  {monthlyNotice ? (
                    <div className={styles.noticeContent}>{monthlyNotice}</div>
                  ) : isAdminLogged ? (
                    <div className={styles.noticeAddPlaceholder} onClick={() => setIsEditingNotice(true)}>등록된 월간 공지가 없습니다. 클릭하여 공지를 등록해보세요.</div>
                  ) : null}
                  {isAdminLogged && monthlyNotice && (
                    <button 
                      className={styles.noticeEditBtn}
                      onClick={() => setIsEditingNotice(true)}
                    >
                      ✏️ 공지 수정
                    </button>
                  )}
                </div>
              )}
            </div>

            <main className={styles.mainContent}>
              {isLoading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#8b95a1' }}>{t.milonga.title ? 'Loading...' : '로딩 중...'}</div>
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
                              curriculum={cls.curriculum}
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
          </div>
        ) : (
          <div className={styles.pageHeader}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <h2 className={styles.pageTitle}>
                {
                  activeTab === 'membership' ? t.nav.info :
                  activeTab === 'status' ? t.nav.mypage :
                  activeTab === 'lucy' ? t.nav.milonga :
                  activeTab === 'stay' ? t.nav.stay :
                  activeTab === 'chat' ? (selectedChatRoomId ? selectedChatRoomName : '채팅') :
                  t.milonga.status
                }
              </h2>
              {activeTab === 'chat' && selectedChatRoomId && (
                <div /> 
              )}
              {activeTab === 'stay' && (
                <div style={{ display: 'flex', marginLeft: '0.75rem', gap: '2px', alignItems: 'center' }}>
                  <select 
                    value={language} 
                    onChange={(e) => setLanguage(e.target.value as Language)}
                    style={{
                      padding: '2px 6px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      color: '#4e5968',
                      border: '1px solid #e5e8eb',
                      borderRadius: '4px',
                      background: '#f9fafb',
                      cursor: 'pointer',
                      outline: 'none'
                    }}
                  >
                    <option value="ko">한국어</option>
                    <option value="en">English</option>
                    <option value="ja">日本語</option>
                    <option value="zh-CN">简体中文</option>
                    <option value="zh-TW">繁體中文</option>
                    <option value="es">Español</option>
                    <option value="vi">Tiếng Việt</option>
                    <option value="it">Italiano</option>
                    <option value="fr">Français</option>
                    <option value="tr">Türkçe</option>
                  </select>
                </div>
              )}
            </div>
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
            {activeTab === 'chat' && isAdminLogged && !selectedChatRoomId && (
              <button className={styles.adminActionBtn} onClick={handleCreateChatRoom}>
                + 새 채팅방
              </button>
            )}
          </div>
        )}

        {activeTab === 'home' && filteredClasses.length > 0 && (
          <div className={styles.exportBtnContainer}>
            <button className={styles.exportBtn} onClick={handleExportImage}>
              📸 홍보용 이미지 저장 (PNG)
            </button>
          </div>
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
              onEdit={() => { 
                setMilongaEditorMode('edit'); 
                setShowMilongaEditorModal(true); 
                window.history.pushState({ modal: 'milongaEditor' }, '', '');
              }}
            />
          </main>
        )}

        {activeTab === 'admin_status' && (
          <main className={styles.mainContent}>
            <RegistrationAdmin />
          </main>
        )}

        {activeTab === 'stay' && (
          <main className={styles.mainContent}>
            <TangoStay />
          </main>
        )}

        {activeTab === 'chat' && currentUser && (
          <main className={styles.mainContent}>
            <ChatList 
              userPhone={currentUser.phone} 
              isAdmin={isAdminLogged} 
              onSelectRoom={(id) => {
                setSelectedChatRoomId(id);
                // The name will be set inside of room list items via data attributes or we can find it
                const roomElement = document.querySelector(`[data-room-id="${id}"]`) as HTMLElement;
                const roomName = roomElement?.dataset.roomName || '채팅방';
                setSelectedChatRoomName(roomName);
                
                // Add modal to history to handle back button
                window.history.pushState({ modal: 'chat_room', roomId: id }, '', '');
              }} 
            />
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
              registrations={registrations}
              isApplied={appliedClassIds.has(selectedClass.id)}
              onRegister={isPastMonth ? () => alert('지나간 달의 수업은 신청할 수 없습니다.') : handleRegisterClick}
              onEdit={isAdminLogged ? handleEdit : undefined}
              onDelete={isAdminLogged ? handleDelete : undefined}
              isAdmin={isAdminLogged}
            />
          ) : (
            <ClassEditor 
              initialData={selectedClass || undefined} 
              onSave={handleSave} 
            />
          )
        )}
      </FullscreenModal>

      <FullscreenModal
        isOpen={showIdentityForm}
        onClose={() => setShowIdentityForm(false)}
        title="내정보 입력"
        isBottomSheet={true}
        heightMode="half"
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
        isOpen={showMilongaEditorModal}
        onClose={() => setShowMilongaEditorModal(false)}
        title="밀롱가 등록"
      >
        <MilongaEditor 
          onClose={() => setShowMilongaEditorModal(false)} 
          isNew={milongaEditorMode === 'new'} 
        />
      </FullscreenModal>

      <FullscreenModal
        isOpen={!!selectedChatRoomId}
        onClose={() => setSelectedChatRoomId(null)}
        title={selectedChatRoomName}
      >
        {selectedChatRoomId && currentUser && (
          <ChatRoom 
            roomId={selectedChatRoomId} 
            roomName={selectedChatRoomName}
            user={currentUser} 
            onBack={() => setSelectedChatRoomId(null)} 
          />
        )}
      </FullscreenModal>

      <FooterMenu 
        activeId={activeTab}
        onAction={handleTabChange}
      />

      {showExitToast && (
        <div className={styles.exitToast}>
          뒤로가기를 한 번 더 누르시면 페이지가 닫힙니다
        </div>
      )}
    </div>
  );
}

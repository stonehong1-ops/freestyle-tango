'use client';

import React, { useState, useEffect, use } from 'react';
import FullscreenModal from '@/components/common/FullscreenModal';
import { useModalHistory } from '@/hooks/useModalHistory';
import ClassDetail from '@/components/registration/ClassDetail';
import IdentityForm from '@/components/registration/IdentityForm';
import ClassEditor from '@/components/admin/ClassEditor';
import FooterMenu from '@/components/common/FooterMenu';
import UserMyPage from '@/components/dashboard/UserMyPage';
import RegistrationAdmin from '@/components/admin/RegistrationAdmin';
import MilongaEditor from '@/components/admin/MilongaEditor';
import ExtraScheduleEditor from '@/components/admin/ExtraScheduleEditor';
import TangoStay from '@/components/stay/TangoStay';
import ChatList from '@/components/chat/ChatList';
import ChatRoom from '@/components/chat/ChatRoom';
import RegistrationFullList from '@/components/registration/RegistrationFullList';
import InfoCenter from '@/components/dashboard/InfoCenter';
import { useLanguage } from '@/contexts/LanguageContext';
import { useProjectData } from '@/hooks/useProjectData';
import styles from './page.module.css';
import ImageViewer from '@/components/common/ImageViewer';
import { subscribeRooms, getChatRoom } from '@/lib/chat';
import { registerFCMToken } from '@/lib/messaging';
import RegistrationStatus from '@/components/dashboard/RegistrationStatus';
import HomeTab from '@/components/dashboard/HomeTab';
import MilongaTab from '@/components/dashboard/MilongaTab';
import MediaEditor from '@/components/admin/MediaEditor';
import MilongaMediaEditor from '@/components/dashboard/MilongaMediaEditor';
import CouponEditor from '@/components/admin/CouponEditor';
import InstallGuide from '@/components/common/InstallGuide';
import { SafeStorage } from '@/lib/storage';

const getDeviceType = () => {
  if (typeof window === 'undefined') return 'unknown';
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) return 'ios';
  if (ua.includes('android')) return 'android';
  if (ua.includes('windows') || ua.includes('macintosh')) return 'pc';
  return 'unknown';
};

export default function Home({ 
  params: paramsPromise,
  searchParams: searchParamsPromise 
}: { 
  params: Promise<{ slug?: string[] }>,
  searchParams: Promise<{ roomId?: string }>
}) {
  const params = use(paramsPromise);
  const searchParams = use(searchParamsPromise);
  const roomIdFromUrl = searchParams.roomId;
  const slugArray = params.slug || [];
  const slug = slugArray[0];
  
  // Define initial states based on slug
  let initialTab = 'lucy';
  let initialHomeSubTab: 'guide' | 'schedule' | 'media' = 'guide';
  let initialMilongaSubTab: 'poster' | 'reserve' | 'live' = 'poster';

  if (slug === 'stay') {
    initialTab = 'stay';
  } else if (slug === 'class' || slug === 'home') {
    initialTab = 'home';
    initialHomeSubTab = 'guide';
  } else if (slug === 'calendar' || slug === 'schedule') {
    initialTab = 'home';
    initialHomeSubTab = 'schedule';
  } else if (slug === 'media') {
    initialTab = 'home';
    initialHomeSubTab = 'media';
  } else if (slug === 'chatting' || slug === 'chat') {
    initialTab = 'chat';
  } else if (slug === 'mypage' || slug === 'profile') {
    initialTab = 'mypage';
  } else if (slug === 'lucy') {
    initialTab = 'lucy';
  }


  const { t, language, setLanguage } = useLanguage();
  const projectData = useProjectData();
  const { 
    currentUser, 
    isAdminLogged, 
    selectedMonth, 
    setSelectedMonth,
    fetchClasses, 
    classes, 
    registrations,
    reservations,
    appliedClassIds,
    setCurrentUser,
    setIsAdminLogged,
    setAppliedClassIds
  } = projectData;

  const userPhone = currentUser?.phone.replace(/[^0-9]/g, '');
  const userRegistrations = registrations.filter(r => r.phone === userPhone);

  // UI States
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  // Sync activeTab with initialTab when navigation occurs via URL
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);
  const [homeSubTab, setHomeSubTab] = useState<'guide' | 'schedule' | 'media'>(initialHomeSubTab);
  const [milongaSubTab, setMilongaSubTab] = useState<'poster' | 'reserve' | 'live'>(initialMilongaSubTab);
  const [selectedMilongaDate, setSelectedMilongaDate] = useState<string>('');
  const [showMediaEditor, setShowMediaEditor] = useState(false);
const [showLucyEditor, setShowLucyEditor] = useState(false);
  const [showCouponEditor, setShowCouponEditor] = useState(false);

  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [modalView, setModalView] = useState<'detail' | 'edit'>('detail');
  const [showEditorModal, setShowEditorModal] = useState(false);
  const [showMilongaEditorModal, setShowMilongaEditorModal] = useState(false);
  const [milongaEditorMode, setMilongaEditorMode] = useState<'new' | 'edit'>('edit');
  const [selectedChatRoomId, setSelectedChatRoomId] = useState<string | null>(null);
  const [selectedChatRoomName, setSelectedChatRoomName] = useState<string>('');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [showFullList, setShowFullList] = useState(false);
  const [showExtraEditorModal, setShowExtraEditorModal] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const [showExitToast, setShowExitToast] = useState(false);
  const [lastBackPress, setLastBackPress] = useState(0);
  const [showIdentityForm, setShowIdentityForm] = useState(false);
  const [viewerImage, setViewerImage] = useState<string | null>(null);

  // Available months for UserMyPage
  const availableMonths = Array.from(new Set(classes.map(c => c.targetMonth).filter(Boolean) as string[])).sort();

  // Identity logic
  const requireIdentity = (action: () => void) => {
    if (SafeStorage.get('ft_user')) {
      action();
    } else {
      setPendingAction(() => action);
      setShowIdentityForm(true);
    }
  };

  const handleIdentityComplete = () => {
    setShowIdentityForm(false);
    const user = SafeStorage.getJson<any>('ft_user');
    if (user) {
      setCurrentUser(user);
      if (user.staffRole === 'admin') {
        setIsAdminLogged(true);
      }
      
      // Track visit
      import('@/lib/db').then(({ trackUserVisit }) => {
        trackUserVisit(user.phone, user.nickname, user.photoURL, user.role, getDeviceType(), user.staffRole);
      });
    }
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  // Nav history management
  useModalHistory(!!selectedClassId, () => setSelectedClassId(null), 'detail');
  useModalHistory(showEditorModal, () => setShowEditorModal(false), 'editor');
  useModalHistory(showMilongaEditorModal, () => setShowMilongaEditorModal(false), 'milongaEditor');
  useModalHistory(showExtraEditorModal, () => setShowExtraEditorModal(false), 'extraEditor');
  useModalHistory(showIdentityForm, () => setShowIdentityForm(false), 'identity');
  useModalHistory(!!selectedChatRoomId, () => setSelectedChatRoomId(null), 'chat_room');
  useModalHistory(showFullList, () => setShowFullList(false), 'fullList');
  useModalHistory(showRegistrationModal, () => setShowRegistrationModal(false), 'registration');
  useModalHistory(showMediaEditor, () => setShowMediaEditor(false), 'mediaEditor');
  useModalHistory(showLucyEditor, () => setShowLucyEditor(false), 'lucyEditor');
  useModalHistory(showCouponEditor, () => setShowCouponEditor(false), 'couponEditor');

  useEffect(() => {
    // 1. Initial State Push for Baseline
    if (!window.history.state) {
      const currentPath = activeTab === 'lucy' ? '/' : `/${activeTab === 'home' ? 'class' : activeTab}`;
      window.history.replaceState({ tab: activeTab }, '', currentPath);
    }


    const handlePopState = (event: PopStateEvent) => {
      // If the state contains a tab and we are moving to a state with NO modal,
      // update the active tab.
      if (event.state?.tab && !event.state?.modal) {
        setActiveTab(event.state.tab);
      } else if (!event.state?.tab && !event.state?.modal && activeTab === 'lucy') {
        const now = Date.now();
        if (now - lastBackPress < 2000) return;
        setLastBackPress(now);
        setShowExitToast(true);
        setTimeout(() => setShowExitToast(false), 2000);
        window.history.pushState({ tab: 'lucy' }, '', '/');

      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [lastBackPress, activeTab]);

  useEffect(() => {
    const user = SafeStorage.getJson<any>('ft_user');
    const cleanPhone = user ? user.phone?.replace(/[^0-9]/g, '') : null;

    const unsubscribe = cleanPhone ? subscribeRooms(cleanPhone, isAdminLogged, user?.settings?.pinnedRooms || [], (rooms) => {
      const totalMessages = rooms.reduce((acc, room) => acc + (room.unreadCounts?.[cleanPhone] || 0), 0);
      setTotalUnreadCount(totalMessages);
    }) : () => {};

    // Try to register for push notifications
    const initNotifications = async () => {
      if (typeof window !== 'undefined') {
        const { requestNotificationPermission } = await import('@/lib/messaging');
        await requestNotificationPermission();
        if (cleanPhone) {
          const { registerFCMToken } = await import('@/lib/messaging');
          await registerFCMToken(cleanPhone);

          // Track visit on mount
          const { trackUserVisit } = await import('@/lib/db');
          const user = SafeStorage.getJson<any>('ft_user');
          if (user) {
            await trackUserVisit(user.phone, user.nickname, user.photoURL, user.role, getDeviceType());
          }
        }
      }
    };
    
    initNotifications();

    return () => unsubscribe();
  }, [isAdminLogged, currentUser]);

  // Handle foreground chat notifications
  useEffect(() => {
    const handleChatNotification = (e: any) => {
      const { roomId, senderName, text } = e.detail;
      if (!roomId) return;

      // Optional: If user is not in the chat room, show a small toast or ask to join
      // For now, let's just log it or we could automatically navigate if user prefers
      console.log(`[FOREGROUND CHAT] From: ${senderName}, Msg: ${text}, Room: ${roomId}`);
    };

    window.addEventListener('CHAT_NOTIFICATION', handleChatNotification);
    return () => window.removeEventListener('CHAT_NOTIFICATION', handleChatNotification);
  }, []);

  // Heartbeat for dwell time tracking
  useEffect(() => {
    if (!currentUser) return;
    
    const interval = setInterval(async () => {
      if (document.visibilityState === 'visible') {
        try {
          const { updateUserPulse } = await import('@/lib/db');
          await updateUserPulse(currentUser.phone);
        } catch (e) {
          console.error("Pulse error:", e);
        }
      }
    }, 60000); // 1 minute
    
    return () => clearInterval(interval);
  }, [currentUser]);

  // Handle deep-linking to a specific chat room if roomId is present in URL
  useEffect(() => {
    if (!roomIdFromUrl) return;

    const openDeepLinkedRoom = async () => {
      // 1. Ensure user is identified first
      if (!SafeStorage.get('ft_user')) {
        setPendingAction(() => openDeepLinkedRoom);
        setShowIdentityForm(true);
        return;
      }

      try {
        const room = await getChatRoom(roomIdFromUrl);
        if (room) {
          // 2. Set active tab to chat
          setActiveTab('chat');
          
          // 3. Open the room modal
          setSelectedChatRoomId(room.id);
          setSelectedChatRoomName(room.name || (language === 'ko' ? '채팅방' : 'Chat Room'));
          setSelectedParticipants(room.participants || []);
          
          // 4. Update history if needed (optional, depends on if we want to keep the URL clean)
          // window.history.replaceState({ tab: 'chat', modal: 'chat_room' }, '', `/chatting?roomId=${room.id}`);
        }
      } catch (error) {
        console.error('[DEEP LINK ERROR]', error);
      }
    };

    openDeepLinkedRoom();
  }, [roomIdFromUrl, language]);

  const handleTabChange = (id: string) => {
    if (activeTab === id) return;
    
    const updateNavigation = (newId: string) => {
      const newPath = newId === 'lucy' ? '/' : `/${newId === 'home' ? 'class' : newId}`;
      window.history.pushState({ tab: newId }, '', newPath);
      setActiveTab(newId);
    };

    if (id === 'chat' || id === 'mypage') {
      requireIdentity(() => updateNavigation(id));
    } else {
      updateNavigation(id);
    }
  };


  const handleHeaderProfileClick = () => {
    if (currentUser) {
      if (window.confirm(language === 'ko' ? '로그아웃 하시겠습니까?' : 'Would you like to logout?')) {
        SafeStorage.remove('ft_user');
        setCurrentUser(null);
        setIsAdminLogged(false);
        setActiveTab('lucy');
        window.dispatchEvent(new Event('ft_user_updated'));
      }
    } else {
      setShowIdentityForm(true);
    }
  };

  return (
    <div className={styles.container}>
      <InstallGuide />
      
      <header className={styles.globalHeader}>
        <div className={styles.headerLeft} onClick={() => handleTabChange('lucy')}>
          <img src="/images/logo.png" alt="Logo" className={styles.logoImage} />
          <span className={styles.studioName}>{t.home.studioName}</span>
        </div>
        
        <div className={styles.headerRight}>
          <select value={language} onChange={(e) => setLanguage(e.target.value as any)} className={styles.headerLangSelect}>
            <option value="ko">KO</option>
            <option value="en">EN</option>
            <option value="ja">JP</option>
            <option value="zh-CN">ZH</option>
            <option value="zh-TW">TW</option>
            <option value="es">ES</option>
            <option value="vi">VI</option>
            <option value="it">IT</option>
            <option value="fr">FR</option>
            <option value="tr">TR</option>
          </select>

          <button className={styles.profileArea} onClick={handleHeaderProfileClick}>
            {currentUser ? (
              <>
                <div className={styles.profileText}><span className={styles.nickname}>{currentUser.nickname}</span></div>
                {currentUser.photoURL ? (
                  <div className={styles.profilePhoto} style={{ backgroundImage: `url(${currentUser.photoURL})`, backgroundSize: 'cover' }} />
                ) : (
                  <div className={`${styles.profilePhoto} ${currentUser.role === 'leader' ? styles.male : styles.female}`} />
                )}
              </>
            ) : (
              <>
                <span className={styles.loginLabel}>{t.header.login || (language === 'ko' ? '등록' : 'Register')}</span>
                <div className={styles.helpIcon}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg></div>
              </>
            )}
          </button>
        </div>
      </header>

      <div className={styles.scrollContent}>
        {activeTab === 'lucy' && (
          <MilongaTab 
            isAdminLogged={isAdminLogged} 
            currentUser={currentUser}
            requireIdentity={requireIdentity}
            onHome={() => handleTabChange('home')}
            onEdit={() => { setMilongaEditorMode('edit'); setShowMilongaEditorModal(true); }}
            onSubTabChange={setMilongaSubTab}
            onDateChange={setSelectedMilongaDate}
          />
        )}
        {activeTab === 'home' && (
          <HomeTab 
            isAdminLogged={isAdminLogged}
            currentUser={currentUser}
            requireIdentity={requireIdentity}
            setShowFullList={setShowFullList}
            setShowRegistrationModal={setShowRegistrationModal}
            handleCardClick={(id, view = 'detail') => { 
              setModalView(view); 
              setSelectedClassId(id); 
            }}
            onSubTabChange={setHomeSubTab}
            activeSubTab={homeSubTab}
          />
        )}
        {activeTab === 'info' && <InfoCenter />}
        {activeTab === 'stay' && <TangoStay />}
        {activeTab === 'chat' && (
          <ChatList 
            userPhone={currentUser?.phone || ''}
            onSelectRoom={(id, name, p) => { 
              setSelectedChatRoomId(id); 
              setSelectedChatRoomName(name); 
              setSelectedParticipants(p || []);
            }} 
            isAdmin={isAdminLogged}
          />
        )}
        {activeTab === 'mypage' && (
          <UserMyPage 
            classes={classes} 
            registrations={registrations} 
            reservations={reservations} 
            selectedMonth={selectedMonth} 
            availableMonths={availableMonths}
            isAdmin={isAdminLogged}
            onMonthChange={setSelectedMonth}
            onOpenCouponEditor={() => setShowCouponEditor(true)}
            onHome={() => handleTabChange('lucy')}
            requireIdentity={requireIdentity}
          />
        )}
      </div>

      <FooterMenu 
        activeId={activeTab} 
        onAction={handleTabChange} 
        unreadCounts={{ chat: totalUnreadCount }} 
      />

      {/* Unified Floating Action Button */}
      {(() => {
        let isVisible = false;
        let action = () => {};

        if (activeTab === 'home') {
          if (homeSubTab === 'guide' && isAdminLogged) {
            isVisible = true;
            action = () => setShowEditorModal(true);
          } else if (homeSubTab === 'schedule') {
            isVisible = true;
            action = () => requireIdentity(() => setShowExtraEditorModal(true));
          } else if (homeSubTab === 'media') {
            isVisible = true;
            action = () => requireIdentity(() => setShowMediaEditor(true));
          }
        } else if (activeTab === 'lucy') {
          if (milongaSubTab === 'poster') {
            isVisible = true;
            action = () => requireIdentity(() => {
              setMilongaEditorMode('new');
              setShowMilongaEditorModal(true);
            });
          } else if (milongaSubTab === 'live') {
            isVisible = true;
            action = () => requireIdentity(() => setShowLucyEditor(true));
          }
        }

        if (!isVisible) return null;

        return (
          <button 
            className={styles.fab} 
            onClick={action}
            aria-label="Add"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
        );
      })()}

      {/* Shared Modals */}
      <FullscreenModal isOpen={!!selectedClassId} onClose={() => setSelectedClassId(null)} title={t.home.registration.classDetail}>
        {selectedClassId && (
          modalView === 'detail' ? (
            (() => {
              const classData = classes.find(c => c.id === selectedClassId);
              if (!classData) return <div>{t.common?.loading || 'Loading...'}</div>;
              return (
                <ClassDetail 
                  {...classData}
                  registrations={registrations}
                  isApplied={appliedClassIds.has(selectedClassId)}
                  isRegistered={userRegistrations.some(r => r.classIds && r.classIds.includes(selectedClassId) && r.status === 'paid')}
                  isAdmin={isAdminLogged}
                  onRegister={(id) => { 
                    setAppliedClassIds(prev => new Set(prev).add(id)); 
                    setSelectedClassId(null); 
                    alert(t.home.registration.cartAdded);
                  }}
                  onEdit={() => setModalView('edit')}
                  onDelete={async (id) => { 
                    if(confirm(t.home.registration.deleteConfirm)) { 
                      await (await import('@/lib/db')).deleteClass(id); 
                      fetchClasses(); 
                      setSelectedClassId(null); 
                    } 
                  }}
                />
              );
            })()
          ) : (
            <ClassEditor 
              initialData={classes.find(c => c.id === selectedClassId)} 
              onSave={async (data) => { 
                await (await import('@/lib/db')).updateClass(selectedClassId!, data); 
                fetchClasses(); 
                setModalView('detail'); 
              }}
            />
          )
        )}
      </FullscreenModal>

      <FullscreenModal isOpen={showEditorModal} onClose={() => setShowEditorModal(false)} title={t.home.registration.addClass}>
        <ClassEditor 
          onSave={async (data) => { 
            await (await import('@/lib/db')).addClass(data as any); 
            fetchClasses(); 
            setShowEditorModal(false); 
            alert(t.home.registration.saveSuccess);
          }}
        />
      </FullscreenModal>

      <FullscreenModal isOpen={showMilongaEditorModal} onClose={() => setShowMilongaEditorModal(false)} title="밀롱가 루씨 관리">
        <MilongaEditor 
          isNew={milongaEditorMode === 'new'}
          initialDate={''}
          onClose={() => { 
            setShowMilongaEditorModal(false); 
          }}
        />
      </FullscreenModal>

      <FullscreenModal isOpen={showCouponEditor} onClose={() => setShowCouponEditor(false)} title="쿠폰 발행 및 관리">
        <CouponEditor onClose={() => setShowCouponEditor(false)} />
      </FullscreenModal>

      <FullscreenModal isOpen={showExtraEditorModal} onClose={() => setShowExtraEditorModal(false)} title="기타 일정 관리">
        <ExtraScheduleEditor 
          onSave={() => { setShowExtraEditorModal(false); window.dispatchEvent(new Event('ft_schedule_updated')); }} 
          onClose={() => setShowExtraEditorModal(false)}
        />
      </FullscreenModal>

      <FullscreenModal 
        isOpen={showIdentityForm} 
        onClose={() => setShowIdentityForm(false)} 
        title={language === 'ko' ? '사용자등록' : 'User Registration'}
        isBottomSheet={true}
      >
        <IdentityForm onComplete={handleIdentityComplete} onClose={() => setShowIdentityForm(false)} />
      </FullscreenModal>

      <FullscreenModal 
        isOpen={!!selectedChatRoomId} 
        onClose={() => setSelectedChatRoomId(null)} 
        hideHeader={true}
        noPadding={true}
      >
        {selectedChatRoomId && (
          <ChatRoom 
            roomId={selectedChatRoomId} 
            roomName={selectedChatRoomName} 
            user={currentUser!} 
            onBack={() => setSelectedChatRoomId(null)} 
            participants={selectedParticipants}
            isAdmin={isAdminLogged}
          />
        )}
      </FullscreenModal>

      <FullscreenModal isOpen={showFullList} onClose={() => setShowFullList(false)} title={t.home.registration.fullListTitle} isBottomSheet={true}>
        <RegistrationFullList 
          classes={classes}
          registrations={registrations}
          selectedMonth={selectedMonth}
          availableMonths={availableMonths}
          onMonthChange={setSelectedMonth}
          isAdmin={isAdminLogged} 
          onClose={() => setShowFullList(false)}
        />
      </FullscreenModal>

      <FullscreenModal isOpen={showRegistrationModal} onClose={() => setShowRegistrationModal(false)} title={t.home.registration.title}>
        <RegistrationStatus 
          classes={classes} 
          selectedMonth={selectedMonth} 
          onClose={() => setShowRegistrationModal(false)} 
          requireIdentity={requireIdentity}
          hideHistory={true} 
        />
      </FullscreenModal>

      {showMediaEditor && (
        <MediaEditor 
          onClose={() => setShowMediaEditor(false)} 
          onSave={() => {
            setShowMediaEditor(false);
            window.dispatchEvent(new Event('ft_media_updated'));
          }}
          t={t}
          classes={classes}
          user={currentUser || undefined}
        />
      )}

      {showLucyEditor && (
        <MilongaMediaEditor 
          onClose={() => setShowLucyEditor(false)} 
          onSave={() => {
            setShowLucyEditor(false);
            window.dispatchEvent(new Event('ft_milonga_media_updated'));
          }}
          milongaDate={selectedMilongaDate}
          t={t}
          user={currentUser || undefined}
        />
      )}

      {showExitToast && <div className={styles.exitToast}>{language === 'ko' ? '한번 더 누르면 종료됩니다' : 'Press again to exit'}</div>}
      
      {/* Global Image Viewer */}
      <ImageViewer src={viewerImage} onClose={() => setViewerImage(null)} />
    </div>
  );
}

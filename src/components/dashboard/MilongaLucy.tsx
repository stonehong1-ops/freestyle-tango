'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './MilongaLucy.module.css';
import { toJpeg } from 'html-to-image';
import { 
  addMilongaReservation, 
  getMilongaReservations, 
  MilongaReservation, 
  MilongaInfo, 
  getMilongaInfo, 
  updateMilongaReservation, 
  deleteMilongaReservation, 
  deleteMilongaInfo,
  MediaItem,
  getMedia,
  getClasses,
  TangoClass,
  deleteMedia
} from '@/lib/db';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useModalHistory } from '@/hooks/useModalHistory';
import FullscreenModal from '../common/FullscreenModal';
import Skeleton from '../common/Skeleton';
import MediaList from './MediaList';
import MediaDetail from './MediaDetail';

export default function MilongaLucy({ 
  selectedDate, 
  activeDates = [],
  onSelectDate,
  onHome,
  isAdmin,
  onEdit,
  currentUser,
  requireIdentity,
  onSubTabChange
}: { 
  selectedDate: string;
  activeDates?: string[];
  onSelectDate?: (date: string) => void;
  onHome?: () => void;
  isAdmin?: boolean;
  onEdit?: () => void;
  currentUser?: any;
  requireIdentity?: (action: () => void) => void;
  onSubTabChange?: (tab: 'poster' | 'reserve' | 'live') => void;
}) {
  const { t, language } = useLanguage();
  // currentUser is now provided via props from page.tsx to ensure consistency
  const [reservations, setReservations] = useState<MilongaReservation[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [nickname, setNickname] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedOption, setSelectedOption] = useState<'테이블 예약' | '2+1 이벤트' | '3+1 이벤트'>('테이블 예약');
  const [requests, setRequests] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [milongaInfo, setMilongaInfo] = useState<MilongaInfo | null>(null);
  const [myPhone, setMyPhone] = useState('');
  const [showPosterFullscreen, setShowPosterFullscreen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [unmaskedId, setUnmaskedId] = useState<string | null>(null);
  const [lastTap, setLastTap] = useState({ id: '', time: 0 });
  const posterCardRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTabState] = useState<'poster' | 'reserve' | 'live'>('poster');
  
  const setActiveTab = (tab: 'poster' | 'reserve' | 'live') => {
    setActiveTabState(tab);
    if (onSubTabChange) onSubTabChange(tab);
  };
  const [milongaMedia, setMilongaMedia] = useState<MediaItem[]>([]);
  const [lucyCountLast7Days, setLucyCountLast7Days] = useState(0);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [editingMedia, setEditingMedia] = useState<MediaItem | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [classes, setClasses] = useState<TangoClass[]>([]);

  useEffect(() => {
    const savedPhone = localStorage.getItem('ft_milonga_phone');
    if (savedPhone) setMyPhone(savedPhone);
    
    // Auto-fill from currentUser if available
    if (currentUser) {
      setNickname(currentUser.nickname || '');
      setPhone(currentUser.phone || '');
    }
  }, [currentUser]);

  useEffect(() => {
    if (selectedDate) {
      fetchReservations();
      fetchMedia();
    } else {
      setReservations([]);
      setMilongaMedia([]);
    }
    fetchMilongaInfo();
    fetchLucyLiveCount();

    const handleUpdate = () => fetchMilongaInfo();
    window.addEventListener('ft_milonga_updated', handleUpdate);
    
    const handleMediaUpdated = () => {
      fetchMedia();
      fetchLucyLiveCount();
    };
    window.addEventListener('ft_milonga_media_updated', handleMediaUpdated);
    
    return () => {
      window.removeEventListener('ft_milonga_updated', handleUpdate);
      window.removeEventListener('ft_milonga_media_updated', handleMediaUpdated);
    };
  }, [selectedDate, activeTab]);

  const handleCloseForm = React.useCallback(() => setShowForm(false), []);
  const handleClosePoster = React.useCallback(() => setShowPosterFullscreen(false), []);
  const handleCloseMedia = React.useCallback(() => setSelectedMedia(null), []);
  const handleCloseEditor = React.useCallback(() => setShowEditor(false), []);

  useModalHistory(showForm, handleCloseForm, 'milongaForm');
  useModalHistory(showPosterFullscreen, handleClosePoster, 'posterFullscreen');
  useModalHistory(!!selectedMedia, handleCloseMedia, 'lucyMediaDetail');
  useModalHistory(showEditor, handleCloseEditor, 'lucyMediaEditor');

  const fetchMilongaInfo = async () => {
    if (!selectedDate) return;
    const info = await getMilongaInfo(selectedDate);
    setMilongaInfo(info);
  };

  const fetchReservations = async () => {
    const data = await getMilongaReservations(selectedDate);
    setReservations(data);
  };

  const fetchMedia = async () => {
    setMediaLoading(true);
    let data: MediaItem[] = [];
    
    if (activeTab === 'live') {
      // Fetch all media and filter for Lucy Live (those with relatedMilongaDate)
      const allMedia = await getMedia();
      data = allMedia.filter(m => !!m.relatedMilongaDate);
    } else {
      if (!selectedDate) {
        setMilongaMedia([]);
        setMediaLoading(false);
        return;
      }
      data = await getMedia(undefined, undefined, selectedDate);
    }
    setMilongaMedia(data);
    setMediaLoading(false);
  };

  const fetchLucyLiveCount = async () => {
    const allMedia = await getMedia();
    const lucyMedia = allMedia.filter(m => !!m.relatedMilongaDate);
    
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const recentCount = lucyMedia.filter(m => new Date(m.createdAt) > oneWeekAgo).length;
    setLucyCountLast7Days(recentCount);
  };

  const fetchClasses = async () => {
    const data = await getClasses();
    setClasses(data);
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleMediaEdit = (item: MediaItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingMedia(item);
    setShowEditor(true);
  };

  const handleMediaDelete = async (item: MediaItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!item.id) return;
    if (confirm(t.home?.registration?.deleteConfirm || '정말 삭제하시겠습니까?')) {
      await deleteMedia(item.id);
      fetchMedia();
      fetchLucyLiveCount();
    }
  };

  const formatDateLabel = (dateStr: string) => {
    if (!dateStr) return t.home.milonga.datePending;
    const [y, m, d] = dateStr.split('-');
    const date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    const dayNames = t.home.registration.dayNames;
    return `${parseInt(m)}/${parseInt(d)} (${dayNames[date.getDay()]})`;
  };

  const handleBooking = async () => {
    if (!nickname) {
      alert('닉네임을 입력해주세요.');
      return;
    }
    if (!phone || phone.length < 10) {
      alert('올바른 핸드폰 번호를 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      const reservationData = {
        milongaDate: selectedDate,
        nickname,
        phone: cleanPhone,
        option: selectedOption,
        requests,
        timestamp: new Date().toISOString()
      };

      if (editingId) {
        await updateMilongaReservation(editingId, reservationData);
        alert('예약이 수정되었습니다!');
      } else {
        await addMilongaReservation(reservationData);
        alert('예약이 완료되었습니다!');
      }

      localStorage.setItem('ft_milonga_phone', cleanPhone);
      setMyPhone(cleanPhone);
      resetForm();
      setShowForm(false);
      fetchReservations();
    } catch (e) {
      alert('처리 실패: ' + e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    if (currentUser) {
      setNickname(currentUser.nickname || '');
      setPhone(currentUser.phone || '');
    } else {
      setNickname('');
      const savedPhone = localStorage.getItem('ft_milonga_phone') || '';
      setPhone(savedPhone);
    }
    setRequests('');
    setSelectedOption('테이블 예약');
    setEditingId(null);
  };

  const handleEdit = (res: MilongaReservation) => {
    setNickname(res.nickname);
    setPhone(res.phone);
    setSelectedOption(res.option as any);
    setRequests(res.requests || '');
    setEditingId(res.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      await deleteMilongaReservation(id);
      alert('삭제되었습니다.');
      fetchReservations();
    } catch (e) {
      alert('삭제 실패: ' + e);
    }
  };

  const handleNameClick = (id: string) => {
    const now = Date.now();
    if (lastTap.id === id && now - lastTap.time < 300) {
      setUnmaskedId(id);
      setTimeout(() => setUnmaskedId(null), 1000);
    }
    setLastTap({ id, time: now });
  };

  const maskNickname = (name: string) => {
    if (name.length <= 1) return '*';
    if (name.length === 2) return name[0] + '*';
    return name[0] + '*'.repeat(name.length - 2) + name[name.length - 1];
  };
  const handleDownloadPoster = async () => {
    if (!milongaInfo || !posterCardRef.current) return;
    
    try {
      const dataUrl = await toJpeg(posterCardRef.current, {
        quality: 0.95,
        backgroundColor: '#1a1a1a',
        cacheBust: true,
        pixelRatio: 2,
      });
      
      const link = document.createElement('a');
      const dateTag = selectedDate ? selectedDate.substring(5) : 'poster';
      link.download = `milonga_lucy_${dateTag}.jpg`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error('Download failed:', e);
      alert('포스터 저장에 실패했습니다: ' + e);
    }
  };

  const handleDeleteMilonga = async () => {
    if (!milongaInfo?.id) return;
    if (!confirm(t.home.registration.deleteConfirm || '정말로 이 밀롱가 정보를 삭제하시겠습니까?')) return;
    
    try {
      await deleteMilongaInfo(milongaInfo.id);
      alert(t.home.registration.deleteSuccess || '삭제되었습니다.');
      setShowPosterFullscreen(false);
      if (onHome) onHome();
      // Trigger update event for other components
      window.dispatchEvent(new CustomEvent('ft_milonga_updated'));
    } catch (e) {
      alert('삭제 실패: ' + e);
    }
  };

  const handlePrevDate = () => {
    const idx = activeDates.indexOf(selectedDate);
    if (idx < activeDates.length - 1 && onSelectDate) {
      onSelectDate(activeDates[idx + 1]);
    }
  };

  const handleNextDate = () => {
    const idx = activeDates.indexOf(selectedDate);
    if (idx > 0 && onSelectDate) {
      onSelectDate(activeDates[idx - 1]);
    }
  };

  if (!selectedDate && !isAdmin) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyMsg}>
          {t.home.milonga.noSchedule}<br/>{t.home.milonga.checkBack}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Premium Tab Navigation (Moved to top) */}
      <div className={styles.tabNav}>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'poster' ? styles.activeTabBtn : ''}`}
          onClick={() => setActiveTab('poster')}
        >
          {language === 'ko' ? '포스터' : 'Poster'}
        </button>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'reserve' ? styles.activeTabBtn : ''}`}
          onClick={() => setActiveTab('reserve')}
        >
          {language === 'ko' ? '테이블 예약' : 'Table Booking'}
          {reservations.length > 0 && <span className={styles.badge}>{reservations.length}</span>}
        </button>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'live' ? styles.activeTabBtn : ''}`}
          onClick={() => setActiveTab('live')}
        >
          {language === 'ko' ? '루씨 Live' : 'Lucy Live'}
          {lucyCountLast7Days > 0 && <span className={styles.badge}>{lucyCountLast7Days}</span>}
        </button>
      </div>

      {/* Navigation Controls (Moved below Tabs, Hidden in 'live' tab) */}
      {activeTab !== 'live' && activeDates.length > 1 && (
        <div className={styles.navControls}>
          <button 
            className="nav-btn-standard" 
            onClick={handlePrevDate}
            disabled={activeDates.indexOf(selectedDate) === activeDates.length - 1}
          >
            <span className="nav-btn-icon">←</span>
            <span style={{ marginLeft: '4px' }}>{language === 'ko' ? '이전' : 'Prev'}</span>
          </button>
          
          <div className={styles.navDateLabel}>{selectedDate?.split('-')?.slice(1)?.join('/') || ''}</div>
          
          <button 
            className="nav-btn-standard" 
            onClick={handleNextDate}
            disabled={activeDates.indexOf(selectedDate) === 0}
          >
            <span style={{ marginRight: '4px' }}>{language === 'ko' ? '다음' : 'Next'}</span>
            <span className="nav-btn-icon">→</span>
          </button>
        </div>
      )}

      {activeTab === 'poster' && (
        <section className={styles.heroSection}>
          {/* Poster & Message 통합 카드 (캡처 대상) */}
          <div ref={posterCardRef} className={styles.posterCard}>
            <div className={styles.heroImageWrapper}>
              {!milongaInfo ? (
                <Skeleton height={300} borderRadius={16} />
              ) : milongaInfo.posterUrl ? (
                <div 
                  className={styles.heroImageContainer}
                  onClick={() => setShowPosterFullscreen(true)}
                >
                  <img 
                    src={milongaInfo.posterUrl} 
                    alt="Milonga Lucy" 
                    className={styles.heroImage} 
                    crossOrigin="anonymous"
                  />
                </div>
              ) : (
                <div className={styles.emptyPoster}>{t.home.milonga.noPoster || '준비중'}</div>
              )}
            </div>
            
            {milongaInfo?.message && (
              <div className={styles.messageArea}>
                <p className={styles.milongaMessage}>
                  &quot;{milongaInfo.message}&quot;
                </p>
                <div className={styles.creditLine}>Freestyle Tango</div>
              </div>
            )}
          </div>

          {/* Event Section */}
          <section className={styles.eventSection}>
            <div className={styles.sectionHeader}>
                <h3 className={styles.eventTitle}>{t.home.milonga.eventTitle}</h3>
                <p className={styles.sectionSubtitle}>{t.home.milonga.eventSubtitle}</p>
            </div>

            <div className={styles.eventGrid}>
              <div className={styles.eventCard}>
                <div className={styles.eventBadge}>Basic</div>
                <h3 className={styles.eventCardTitle}>{t.home.milonga.normalTable}</h3>
                <p className={styles.eventCardDesc}>{t.home.milonga.normalTableDesc}</p>
              </div>
              <div className={styles.eventCard}>
                <div className={styles.eventBadge}>Event</div>
                <h3 className={styles.eventCardTitle}>{t.home.milonga.event2plus1}</h3>
                <p className={styles.eventCardDesc}>{t.home.milonga.event2plus1Desc}</p>
              </div>
              <div className={styles.eventCard}>
                <div className={styles.eventBadge}>VIP</div>
                <h3 className={styles.eventCardTitle}>{t.home.milonga.event3plus1}</h3>
                <p className={styles.eventCardDesc}>{t.home.milonga.event3plus1Desc}</p>
              </div>
            </div>
          </section>
        </section>
      )}

      {activeTab === 'reserve' && (
        <>
          {/* Main Action Section - Prominent Booking Button */}
          {selectedDate && (
            <section className={styles.actionSection}>
              {isAdmin || new Date(selectedDate) >= new Date(new Date(new Date().getTime() - (6 * 60 * 60 * 1000)).setHours(0, 0, 0, 0)) ? (
                <button className={styles.bookingBtn} onClick={() => { resetForm(); setShowForm(true); }}>
                  {t.home.milonga.bookingBtn}
                </button>
              ) : (
                <div className={styles.bookingClosed}>{t.reserve.closed || 'Reservation Closed'}</div>
              )}
            </section>
          )}

          {/* Reservation List Section */}
          {selectedDate && (
            <section className={styles.listSection}>
              <div className={styles.sectionHeaderBetween}>
                <h2 className={styles.sectionTitle}>{t.home.milonga.bookingStatus}</h2>
                <div className={styles.selectedDateBadge}>
                  {formatDateLabel(selectedDate)}
                </div>
              </div>
              
              <div className={styles.resList}>
                {reservations.length === 0 ? (
                  <div className={styles.emptyMsg}>{t.home.milonga.noReservations}</div>
                ) : (
                  reservations.map((res, i) => {
                    const isMyRes = res.phone === myPhone || isAdmin || ['01072092468', '01012345678'].includes(myPhone);
                    return (
                      <div key={res.id} className={styles.resWrapper}>
                        <div className={res.option === '3+1 이벤트' ? styles.resItemVip : styles.resItem}>
                          <span className={styles.resIdx}>{i + 1}</span>
                          <span 
                            className={styles.resName}
                            onClick={() => handleNameClick(res.id)}
                            style={{ cursor: 'pointer', userSelect: 'none' }}
                          >
                            {unmaskedId === res.id ? res.nickname : maskNickname(res.nickname)}
                          </span>
                          <span className={styles.resOption}>{res.option}</span>
                          {isMyRes && (
                            <div className={styles.resActions}>
                              <button className={styles.resActionBtn} onClick={() => handleEdit(res)}>{t.home.registration.edit}</button>
                              <button className={`${styles.resActionBtn} ${styles.deleteBtn}`} onClick={() => handleDelete(res.id)}>{t.home.registration.delete}</button>
                            </div>
                          )}
                        </div>
                        {res.requests && <div className={styles.resReq}>💬 {res.requests}</div>}
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          )}
        </>
      )}

      {activeTab === 'live' && (
        <section className={styles.liveContainer}>
          {(() => {
            // Group media by relatedMilongaDate
            const groups: Record<string, MediaItem[]> = {};
            milongaMedia.forEach(item => {
              const date = item.relatedMilongaDate || 'Other';
              if (!groups[date]) groups[date] = [];
              groups[date].push(item);
            });

            // Sort dates descending
            const sortedDates = Object.keys(groups).sort((a, b) => b.localeCompare(a));

            if (mediaLoading) {
              return (
                <div style={{ padding: '20px' }}>
                  <Skeleton height={200} count={3} />
                </div>
              );
            }

            if (milongaMedia.length === 0) {
              return (
                <div className={styles.noAccess}>
                  <div style={{ opacity: 0.3, fontSize: '40px', marginBottom: '12px' }}>🎬</div>
                  <p>{t.home.registration?.noData || 'No data'}</p>
                </div>
              );
            }

            return sortedDates.map(date => (
              <div key={date} className={styles.dateGroup}>
                <div className={styles.dateDivider}>
                  <span>{formatDateLabel(date)}</span>
                  <div className={styles.dividerLine} />
                </div>
                <MediaList 
                  media={groups[date]}
                  t={t}
                  loading={false}
                  onSelect={setSelectedMedia}
                  isAdmin={isAdmin}
                  classes={classes}
                  onEdit={handleMediaEdit}
                  onDelete={handleMediaDelete}
                  language={language}
                />
              </div>
            ));
          })()}

          {selectedMedia && (
            <MediaDetail 
              item={selectedMedia}
              onClose={() => setSelectedMedia(null)}
              t={t}
              user={currentUser}
              isAdmin={!!isAdmin}
              onUpdate={fetchMedia}
              customTitle={language === 'ko' ? '루씨 Live' : 'Lucy Live'}
            />
          )}

          {showEditor && (
            <div className={styles.fullPopup} style={{ zIndex: 3000 }}>
              <div className={styles.popupHeader}>
                <button className={styles.backBtn} onClick={() => setShowEditor(false)}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
                </button>
                <h2 className={styles.sectionTitle} style={{ margin: 0 }}>{t.media?.edit || '영상 수정'}</h2>
                <div style={{ width: 40 }} />
              </div>
              <div className={styles.popupContent} style={{ padding: 20 }}>
                {(() => {
                  const MediaEditor = require('@/components/admin/MediaEditor').default;
                  return (
                    <MediaEditor 
                      initialData={editingMedia}
                      onClose={() => setShowEditor(false)} 
                      onSave={() => {
                        setShowEditor(false);
                        fetchMedia();
                        fetchLucyLiveCount();
                      }}
                      t={t}
                      classes={classes}
                      user={currentUser}
                    />
                  );
                })()}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Booking Form Modal */}
      <FullscreenModal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editingId ? t.home.milonga.editTitle : t.home.milonga.newTitle}
        isBottomSheet={true}
      >
        <div className={styles.formContent}>
          <div className={styles.formField}>
            <label>{t.home.milonga.dateLabel}</label>
            <input 
              type="text" 
              value={formatDateLabel(selectedDate)} 
              disabled 
              style={{ background: '#f2f4f6', color: '#8b95a1' }}
              className={styles.input}
            />
          </div>

          <div className={styles.formField}>
            <label>{t.home.milonga.optionLabel}</label>
            <div className={styles.optionGroup}>
              {(['테이블 예약', '2+1 이벤트', '3+1 이벤트'] as const).map(opt => (
                <button
                  key={opt}
                  className={`${styles.optionBtn} ${selectedOption === opt ? styles.activeOption : ''}`}
                  onClick={() => setSelectedOption(opt)}
                >
                  {opt === '테이블 예약' ? t.home.milonga.normalTable : 
                   opt === '2+1 이벤트' ? t.home.milonga.event2plus1 : 
                   t.home.milonga.event3plus1}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.formField}>
            <label>{t.home.registration.nickname}</label>
            <input 
              type="text" 
              placeholder={t.home.milonga.nicknamePlaceholder} 
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className={styles.input}
            />
          </div>

          <div className={styles.formField}>
            <label>{t.home.milonga.phoneLabel}</label>
            <input 
              type="tel" 
              placeholder="010-0000-0000" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={styles.input}
            />
          </div>

          <div className={styles.formField}>
            <label>{t.home.milonga.requestsLabel}</label>
            <textarea 
              placeholder={t.home.milonga.requestsPlaceholder} 
              value={requests}
              onChange={(e) => setRequests(e.target.value)}
              className={styles.textarea}
              rows={3}
            />
          </div>

          <div className={styles.priceDisplay}>
            <span className={styles.priceLabel}>{language === 'ko' ? '최종 결제 금액' : 'Total Amount'}</span>
            <span className={styles.priceValue}>
              {selectedOption === '테이블 예약' ? '10,000' : 
               selectedOption === '2+1 이벤트' ? '20,000' : '30,000'}원
            </span>
          </div>

          <button 
            className={styles.submitBtn} 
            onClick={handleBooking}
            disabled={isSubmitting}
          >
            {isSubmitting ? t.home.milonga.submitting : editingId ? t.home.milonga.saveEdit : t.home.milonga.saveNew}
          </button>
        </div>
      </FullscreenModal>

      {/* Poster Fullscreen Viewer */}
      <FullscreenModal
        isOpen={showPosterFullscreen}
        onClose={() => setShowPosterFullscreen(false)}
        hideHeader={true}
        noPadding={true}
      >
        <div className={styles.fullscreenPosterContainer}>
          <button className={styles.modalCloseBtn} onClick={() => setShowPosterFullscreen(false)}>
            ✕
          </button>
          {milongaInfo?.posterUrl && (
            <>
              <div className={styles.detailCardWrapper}>
                <img src={milongaInfo.posterUrl} alt="Poster Full" className={styles.fullscreenPoster} />
                {milongaInfo?.message && (
                  <div className={styles.messageArea}>
                    <p className={styles.milongaMessage} style={{ fontSize: '1rem' }}>
                      &quot;{milongaInfo.message}&quot;
                    </p>
                    <div className={styles.creditLine}>Freestyle Tango</div>
                  </div>
                )}
              </div>
              <div className={styles.fullscreenActions}>
                {isAdmin && onEdit && (
                  <>
                    <button className={`${styles.circleDownloadBtn} ${styles.deleteActionBtn}`} onClick={handleDeleteMilonga}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        <line x1="10" y1="11" x2="10" y2="17" />
                        <line x1="14" y1="11" x2="14" y2="17" />
                      </svg>
                      <span>{t.home.registration.delete}</span>
                    </button>
                    <button className={styles.circleDownloadBtn} onClick={() => {
                      setShowPosterFullscreen(false);
                      onEdit();
                    }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                      </svg>
                      <span>{t.home.registration.edit}</span>
                    </button>
                  </>
                )}
                <button className={styles.circleDownloadBtn} onClick={handleDownloadPoster}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  <span>{(t.home.registration as any).download || 'Download'}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </FullscreenModal>
    </div>
  );
}

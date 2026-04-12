'use client';

import React, { useState, useEffect } from 'react';
import styles from './Media.module.css';
import { useLanguage } from '@/contexts/LanguageContext';
import { MediaItem, getMedia, TangoClass, getClasses, CURRENT_REGISTRATION_MONTH } from '@/lib/db';
import MediaList from './MediaList';
import MediaDetail from './MediaDetail';
import { useModalHistory } from '@/hooks/useModalHistory';

interface MediaTabProps {
  t: any;
  isAdmin: boolean;
  user: any;
  requireIdentity?: (action: () => void) => void;
}

const MediaTab: React.FC<MediaTabProps> = ({ t, isAdmin, user, requireIdentity }) => {
  const { language } = useLanguage();
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [classes, setClasses] = useState<TangoClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [editingMedia, setEditingMedia] = useState<MediaItem | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [targetMonth, setTargetMonth] = useState<string>(CURRENT_REGISTRATION_MONTH);

  // Month navigation helpers
  const handlePrevMonth = () => {
    const [year, month] = targetMonth.split('-').map(Number);
    const prevDate = new Date(year, month - 2, 1);
    const prevYear = prevDate.getFullYear();
    const prevMonthStr = String(prevDate.getMonth() + 1).padStart(2, '0');
    setTargetMonth(`${prevYear}-${prevMonthStr}`);
  };

  const handleNextMonth = () => {
    const [year, month] = targetMonth.split('-').map(Number);
    const nextDate = new Date(year, month, 1);
    const nextYear = nextDate.getFullYear();
    const nextMonthStr = String(nextDate.getMonth() + 1).padStart(2, '0');
    setTargetMonth(`${nextYear}-${nextMonthStr}`);
  };

  const currentViewMonthLabel = (() => {
    const [year, month] = targetMonth.split('-');
    return `${month}월`;
  })();

  const handleCloseDetail = React.useCallback(() => setSelectedMedia(null), []);

  useModalHistory(!!selectedMedia, handleCloseDetail, 'mediaDetail');

  const fetchMedia = async (silent: boolean = false) => {
    try {
      if (!silent) setLoading(true);
      console.log(`[MediaTab] Fetching media for month: ${targetMonth}`);
      
      // Pass targetMonth to getMedia to enable server-side filtering
      const data = await getMedia(undefined, undefined, undefined, targetMonth);
      console.log(`[MediaTab] Received media for ${targetMonth}: ${data.length} items`);
      
      const generalMedia = data.filter(m => !m.relatedMilongaDate);
      console.log(`[MediaTab] Filtered general media: ${generalMedia.length} items`);
      
      setMediaList(generalMedia);
    } catch (error) {
      console.error("[MediaTab] Error fetching media:", error);
    } finally {
      if (!silent) setLoading(false);
    }
  };


  const fetchClasses = async () => {
    const data = await getClasses();
    setClasses(data);
  };

  useEffect(() => {
    console.log(`[MediaTab] targetMonth changed: ${targetMonth}`);
    fetchMedia();
    fetchClasses();

    const handleMediaUpdated = () => {
      console.log(`[MediaTab] Media updated event received`);
      fetchMedia(true);
    };
    window.addEventListener('ft_media_updated', handleMediaUpdated);
    return () => window.removeEventListener('ft_media_updated', handleMediaUpdated);
  }, [targetMonth]);

  const handleEdit = (item: MediaItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingMedia(item);
    setShowEditor(true);
  };

  const handleDelete = async (item: MediaItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!item.id) return;
    if (confirm(t.home?.registration?.deleteConfirm || '정말 삭제하시겠습니까?')) {
      const { deleteMedia } = await import('@/lib/db');
      await deleteMedia(item.id);
      fetchMedia();
    }
  };

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filter classes shown in the dropdown (only selected month)
  const displayClasses = classes.filter(cls => !cls.targetMonth || cls.targetMonth === targetMonth);

  const selectedClassName = selectedClassId === 'all' 
    ? t.media.filterAll 
    : classes.find(c => c.id === selectedClassId)?.title || t.media.filterAll;

  const filteredMedia = selectedClassId === 'all' 
    ? mediaList.filter(m => {
        if (m.relatedClassId) {
          const cls = classes.find(c => c.id === m.relatedClassId);
          return (cls?.targetMonth || '').trim() === targetMonth.trim();
        }
        // 수업 연관 없는 일반 영상은 생성일 기준
        return m.createdAt && m.createdAt.startsWith(targetMonth);
      })
    : mediaList.filter(m => m.relatedClassId === selectedClassId);

  return (
    <div className={styles.container}>
      <div className={styles.monthNav}>
        <button className={styles.monthNavBtn} onClick={handlePrevMonth}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
          <span>{t.home?.registration?.prevMonth || '이전'}</span>
        </button>
        <div className={styles.monthLabel}>
          {targetMonth.split('-')[0]}.{targetMonth.split('-')[1]}
        </div>
        <button className={styles.monthNavBtn} onClick={handleNextMonth}>
          <span>{t.home?.registration?.nextMonth || '다음'}</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>

      <div className={styles.filterSection}>
        <div 
          className={styles.dropdownTrigger}
          onClick={() => setIsFilterOpen(!isFilterOpen)}
        >
          <span>{selectedClassName}</span>
          <span style={{ fontSize: '12px' }}>{isFilterOpen ? '▲' : '▼'}</span>
        </div>

        {isFilterOpen && (
          <div className={styles.dropdownMenu}>
            <div 
              className={`${styles.dropdownItem} ${selectedClassId === 'all' ? styles.itemActive : ''}`}
              onClick={() => {
                setSelectedClassId('all');
                setIsFilterOpen(false);
              }}
            >
              <span className={styles.itemTitle}>{t.media.filterAll}</span>
            </div>
            {displayClasses.map(cls => (
              <div 
                key={cls.id}
                className={`${styles.dropdownItem} ${selectedClassId === cls.id ? styles.itemActive : ''}`}
                onClick={() => {
                  setSelectedClassId(cls.id);
                  setIsFilterOpen(false);
                }}
              >
                <span className={styles.itemTitle}>{cls.title}</span>
                <span className={styles.itemInstructor}>{cls.teacher1 || '프리스타일'}{cls.teacher2 ? ` & ${cls.teacher2}` : ''}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <MediaList 
        media={filteredMedia} 
        t={t} 
        onSelect={setSelectedMedia} 
        loading={loading}
        isAdmin={isAdmin}
        classes={classes}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {selectedMedia && (
        <MediaDetail 
          item={selectedMedia} 
          onClose={() => setSelectedMedia(null)} 
          t={t}
          user={user}
          isAdmin={isAdmin}
          onUpdate={fetchMedia}
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
              // Dynamically import MediaEditor to avoid layout issues
              const MediaEditor = require('@/components/admin/MediaEditor').default;
              return (
                <MediaEditor 
                  initialData={editingMedia}
                  onClose={() => setShowEditor(false)} 
                  onSave={() => {
                    setShowEditor(false);
                    fetchMedia();
                  }}
                  t={t}
                  classes={classes}
                  user={user}
                />
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaTab;

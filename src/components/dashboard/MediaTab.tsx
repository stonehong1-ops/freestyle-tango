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

  const handleCloseDetail = React.useCallback(() => setSelectedMedia(null), []);

  useModalHistory(!!selectedMedia, handleCloseDetail, 'mediaDetail');

  const fetchMedia = async (silent: boolean = false) => {
    if (!silent) setLoading(true);
    const data = await getMedia();
    // 루씨 라이브 데이터(관련 일자 있는 것) 제외
    const generalMedia = data.filter(m => !m.relatedMilongaDate);
    setMediaList(generalMedia);
    if (!silent) setLoading(false);
  };


  const fetchClasses = async () => {
    const data = await getClasses();
    setClasses(data);
  };

  useEffect(() => {
    fetchMedia();
    fetchClasses();

    const handleMediaUpdated = () => fetchMedia(true);
    window.addEventListener('ft_media_updated', handleMediaUpdated);
    return () => window.removeEventListener('ft_media_updated', handleMediaUpdated);
  }, []);

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filter classes shown in the dropdown (only current month)
  const displayClasses = classes.filter(cls => (cls.targetMonth || '2026-04').trim() === CURRENT_REGISTRATION_MONTH.trim());

  const selectedClassName = selectedClassId === 'all' 
    ? t.media.filterAll 
    : classes.find(c => c.id === selectedClassId)?.title || t.media.filterAll;

  const filteredMedia = selectedClassId === 'all' 
    ? mediaList 
    : mediaList.filter(m => m.relatedClassId === selectedClassId);

  return (
    <div className={styles.container}>
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
    </div>
  );
};

export default MediaTab;

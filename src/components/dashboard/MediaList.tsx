'use client';

import React, { memo } from 'react';
import styles from './Media.module.css';
import { MediaItem, TangoClass } from '@/lib/db';
import { formatRelativeTime } from '@/lib/utils';
import { Language } from '@/locales';

interface MediaListProps {
  media: MediaItem[];
  t: any;
  onSelect: (item: MediaItem) => void;
  loading: boolean;
  isAdmin?: boolean;
  classes?: TangoClass[];
  onEdit?: (item: MediaItem, e: React.MouseEvent) => void;
  onDelete?: (item: MediaItem, e: React.MouseEvent) => void;
  language?: Language;
}

const MediaList: React.FC<MediaListProps> = ({ 
  media, 
  t, 
  onSelect, 
  loading, 
  isAdmin, 
  classes = [],
  onEdit,
  onDelete,
  language = 'ko'
}) => {
  const [showMenuId, setShowMenuId] = React.useState<string | null>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenuId(null);
      }
    };
    if (showMenuId) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenuId]);

  const getYTThumbnail = (url: string) => {
    let id = url;
    if (url.includes('youtube.com/watch?v=')) {
      id = url.split('v=')[1].split('&')[0];
    } else if (url.includes('youtu.be/')) {
      id = url.split('youtu.be/')[1].split('?')[0];
    }
    return `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
  };

  const placeholderUrl = 'https://placehold.co/400x225/f2f4f6/adb5bd?text=No+Image';

  if (loading) {
    return (
      <div className={styles.noAccess}>
        <div style={{ opacity: 0.5 }}>{t.registration?.loading || 'Loading...'}</div>
      </div>
    );
  }

  if (media.length === 0) {
    return (
      <div className={styles.noAccess}>
        <div style={{ opacity: 0.3, fontSize: '40px' }}>🎬</div>
        <p>{t.registration?.noData || 'No data'}</p>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {media.map((item) => (
        <div key={item.id} className={styles.card} onClick={() => onSelect(item)}>
          <div className={styles.thumbnailWrapper}>
            {(() => {
              // 1. YouTube
              if (item.type === 'youtube') {
                return (
                  <img 
                    src={getYTThumbnail(item.videoUrl)} 
                    alt={item.title} 
                    className={styles.thumbnail}
                  />
                );
              }

              // 2. Explicit Thumbnail or Image type fallback (using videoUrl)
              // Ignore legacy placeholder strings
              const hasActualThumbnail = item.thumbnailUrl && 
                                        !item.thumbnailUrl.includes('/api/placeholder/') && 
                                        !item.thumbnailUrl.includes('placehold.co');
                                        
              const imageSrc = hasActualThumbnail ? item.thumbnailUrl : (item.type === 'image' ? item.videoUrl : null);
              if (imageSrc) {
                return (
                  <img 
                    src={imageSrc} 
                    alt={item.title} 
                    className={styles.thumbnail}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (target.src !== placeholderUrl) {
                        target.src = placeholderUrl;
                      }
                    }}
                  />
                );
              }

              // 3. Video Frame Extraction (including 'general' type)
              if (item.type === 'video' || item.type === 'demonstration' || item.type === 'general') {
                return (
                  <video 
                    src={`${item.videoUrl}#t=0.5`} 
                    className={styles.thumbnail} 
                    preload="metadata" 
                    muted 
                    playsInline 
                  />
                );
              }

              // 4. Final Placeholder
              return (
                <img 
                  src={placeholderUrl} 
                  alt={item.title} 
                  className={styles.thumbnail} 
                />
              );
            })()}
            {t.media?.type?.[item.type] && (
              <div className={styles.typeBadge}>
                {t.media.type[item.type]}
              </div>
            )}
          </div>

          <div className={styles.cardInfo}>
            <div className={styles.titleRow}>
              {item.title && item.title !== `${item.uploaderNickname}의 루씨 Live` && (
                <div className={styles.title}>{item.title}</div>
              )}
              {isAdmin && (
                <div className={styles.adminMenuWrapper} ref={showMenuId === item.id ? menuRef : null}>
                  <button 
                    className={styles.menuBtn} 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenuId(showMenuId === item.id ? null : (item.id || null));
                    }}
                  >
                    ⋮
                  </button>
                  {showMenuId === item.id && (
                    <div className={styles.adminDropdownMenu}>
                      <div className={styles.menuItem} onClick={(e) => {
                        e.stopPropagation();
                        setShowMenuId(null);
                        onEdit?.(item, e);
                      }}>
                        {t.home?.registration?.edit || t.common?.edit || '수정'}
                      </div>
                      <div className={`${styles.menuItem} ${styles.deleteItem}`} onClick={(e) => {
                        e.stopPropagation();
                        setShowMenuId(null);
                        onDelete?.(item, e);
                      }}>
                        {t.home?.registration?.delete || t.common?.delete || '삭제'}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {item.relatedClassId && (
              <div className={styles.relatedClass}>
                🏷️ {classes.find(c => c.id === item.relatedClassId)?.title || '연관 수업'}
              </div>
            )}

            <div className={styles.meta}>
              <span className={styles.uploaderName}>{item.uploaderNickname}</span>
              <div className={styles.counts}>
                <span>👁️ {item.viewCount || 0}</span>
                <span>❤️ {item.likeCount || 0}</span>
                <span>💬 {item.commentCount || 0}</span>
              </div>

            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default memo(MediaList);

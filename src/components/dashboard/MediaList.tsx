'use client';

import React, { memo } from 'react';
import styles from './Media.module.css';
import { MediaItem, TangoClass, remapStorageUrl } from '@/lib/db';
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

const VideoThumbnail = memo(({ src, title }: { src: string; title?: string }) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={videoRef}
      src={isVisible ? `${src}#t=0.5` : undefined}
      className={styles.thumbnail}
      muted
      playsInline
      preload="metadata"
      style={{ objectFit: 'cover', width: '100%', height: '100%' }}
    />
  );
});

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
      <div className={styles.noAccess} style={{ minHeight: '300px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className={styles.spinner} style={{ 
          width: '32px', 
          height: '32px', 
          border: '3px solid rgba(0,0,0,0.1)', 
          borderTopColor: '#0070f3', 
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <div style={{ opacity: 0.5 }}>{t.registration?.loading || 'Loading...'}</div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
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
                  <>
                    <img 
                      src={getYTThumbnail(item.videoUrl)} 
                      alt={item.title} 
                      className={styles.thumbnail}
                      loading="lazy"
                      decoding="async"
                    />
                    <div className={styles.videoPlayOverlay}>
                      <div className={styles.playIcon}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                      </div>
                    </div>
                  </>
                );
              }

              // 2. Resource Detection
              const finalThumbnail = item.thumbnailUrl ? remapStorageUrl(item.thumbnailUrl) : null;
              const finalVideoUrl = remapStorageUrl(item.videoUrl);
              const isVideoExt = /\.(mp4|mov|webm|quicktime|m4v)/i.test(item.videoUrl || '');
              const isImageExt = /\.(jpg|jpeg|png|webp|gif|avif)/i.test(item.videoUrl || '');
              
              const hasActualThumbnail = finalThumbnail && 
                                        !finalThumbnail.includes('/api/placeholder/') && 
                                        !finalThumbnail.includes('placehold.co');
                                        
              // Only show play icon for actual videos
              const isVideo = item.type === 'video' || item.type === 'demonstration' || (item.type === 'lucy' && isVideoExt) || (item.type === 'general' && isVideoExt);
              
              // Determine if we have a static image source
              let imageSrc = null;
              if (hasActualThumbnail) {
                imageSrc = finalThumbnail;
              } else if (isImageExt) {
                imageSrc = finalVideoUrl;
              }

              return (
                <>
                  {imageSrc ? (
                    <img 
                      src={imageSrc} 
                      alt={item.title} 
                      className={styles.thumbnail}
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (target.src !== placeholderUrl) {
                          target.src = placeholderUrl;
                        }
                      }}
                    />
                  ) : isVideo ? (
                    <VideoThumbnail src={finalVideoUrl} title={item.title} />
                  ) : (
                    <img src={placeholderUrl} alt="No Image" className={styles.thumbnail} />
                  )}
                  {isVideo && (
                    <div className={styles.videoPlayOverlay}>
                      <div className={styles.playIcon}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                      </div>
                    </div>
                  )}
                </>
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

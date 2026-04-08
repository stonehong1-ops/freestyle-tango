'use client';

import React, { memo } from 'react';
import styles from './Media.module.css';
import { MediaItem } from '@/lib/db';

interface MediaListProps {
  media: MediaItem[];
  t: any;
  onSelect: (item: MediaItem) => void;
  loading: boolean;
}

const MediaList: React.FC<MediaListProps> = ({ media, t, onSelect, loading }) => {
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
            {item.title && item.title !== `${item.uploaderNickname}의 루씨 Live` && (
              <div className={styles.title}>{item.title}</div>
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

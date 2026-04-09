'use client';

import React, { useState, useEffect } from 'react';
import styles from './Media.module.css';
import { 
  MediaItem, 
  MediaComment, 
  getMediaComments, 
  addMediaComment, 
  deleteMediaComment, 
  toggleMediaLike, 
  checkIfLiked, 
  checkClassAccess, 
  incMediaView,
  deleteMedia
} from '@/lib/db';

interface MediaDetailProps {
  item: MediaItem;
  onClose: () => void;
  t: any;
  user: any;
  isAdmin: boolean;
  onUpdate: (silent?: boolean) => void;
  customTitle?: string;
}



const MediaDetail: React.FC<MediaDetailProps> = ({ item, onClose, t, user, isAdmin, onUpdate, customTitle }) => {
  const [hasAccess, setHasAccess] = useState(item.type !== 'demonstration');
  const [comments, setComments] = useState<MediaComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(item.likeCount);
  const [viewCount, setViewCount] = useState(item.viewCount);
  const [loading, setLoading] = useState(true);

  const checkAccess = async () => {
    if (item.type === 'demonstration' && user?.phone) {
      // Admin/Instructor/Staff bypass check
      const isStaff = user.staffRole === 'admin' || user.staffRole === 'instructor' || user.staffRole === 'staff';
      if (isStaff) {
        setHasAccess(true);
        return;
      }

      const allowed = await checkClassAccess(user.phone, item.relatedClassId || '');
      setHasAccess(allowed || isAdmin);
    } else if (item.type === 'demonstration' && !user) {
      setHasAccess(false);
    } else {
      setHasAccess(true);
    }
  };

  const fetchComments = async () => {
    const data = await getMediaComments(item.id!);
    setComments(data);
  };

  const checkLike = async () => {
    if (user?.phone) {
      const liked = await checkIfLiked(item.id!, user.phone);
      setIsLiked(liked);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        // 기본 정보 로드
        await Promise.all([
          checkAccess(),
          fetchComments(),
          checkLike()
        ]);
        
        // 조회수 증가 처리 (무조건 +1)
        if (item.id) {
          await incMediaView(item.id);
          setViewCount(prev => (prev || 0) + 1);
          // 부모 리스트에 반영하기 위해 업데이트 요청 (사일런트 업데이트)
          onUpdate(true);
        }
      } catch (error) {
        console.error("Error initializing media detail:", error);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [item.id, user?.phone]); // item.id가 바뀔 때마다 (또는 사용자 로그인/로그아웃 시) 무조건 실행

  const handleLike = async () => {
    if (!user) return alert(t.mypage.loginPrompt);
    const newLike = await toggleMediaLike(item.id!, user.phone);
    setIsLiked(newLike);
    setLikeCount(prev => newLike ? prev + 1 : prev - 1);
    // 부모 리스트 동기화
    onUpdate(true);
  };


  const handleCommentSubmit = async () => {
    if (!user) return alert(t.mypage.loginPrompt);
    if (!newComment.trim()) return;
    await addMediaComment({
      mediaId: item.id!,
      nickname: user.nickname || 'Anonymous',
      phone: user.phone,
      content: newComment,
      createdAt: new Date().toISOString()
    });
    setNewComment('');
    await fetchComments();
    // 부모 리스트 동기화 (댓글 카운트)
    onUpdate(true);
  };


  const handleDelete = async () => {
    if (confirm(t.media?.deleteConfirm || 'Delete?')) {
      await deleteMedia(item.id!);
      onUpdate();
      onClose();
    }
  };

  const renderMedia = () => {
    if (item.type === 'youtube') {
      let id = item.videoUrl;
      const ytId = id.includes('v=') ? id.split('v=')[1].split('&')[0] : (id.includes('youtu.be/') ? id.split('youtu.be/')[1].split('?')[0] : id);

      return (
        <div className={styles.videoWrapper}>
          <iframe 
            src={`https://www.youtube.com/embed/${ytId}`} 
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
          ></iframe>
        </div>
      );
    }
    
    if (item.type === 'image') {
      return (
        <div className={styles.imageWrapper}>
          <img src={item.videoUrl} alt={item.title} className={styles.detailImage} />
        </div>
      );
    }

    return (
      <div className={styles.videoWrapper}>
        <video src={item.videoUrl} controls poster={item.thumbnailUrl}></video>
      </div>
    );
  };

  return (
    <div className={styles.fullPopup}>
      <div className={styles.popupHeader}>
        <button className={styles.backBtn} onClick={onClose}>
          <span style={{ fontSize: '20px' }}>←</span>
        </button>
        <span style={{ fontWeight: 600 }}>{customTitle || t.media?.title || 'Media'}</span>
        {isAdmin ? (
          <button className={styles.backBtn} onClick={handleDelete} style={{ color: '#ff4d4f' }}>
            🗑️
          </button>
        ) : <div style={{ width: 40 }} />}
      </div>

      <div className={styles.popupContent}>
        {loading ? (
          <div className={styles.noAccess}>{t.registration?.loading || 'Loading...'}</div>
        ) : !hasAccess ? (
          <div className={styles.noAccess}>
            <div className={styles.lockIcon}>🔒</div>
            <p>{t.media?.noAccess || 'Restricted Access'}</p>
            {!user && (
              <button 
                className={styles.filterBtn} 
                style={{ background: '#3182f6', color: '#fff', marginTop: '16px' }}
                onClick={() => window.location.href = '/?tab=status'}
              >
                {t.header?.login || 'Login'}
              </button>
            )}
          </div>
        ) : (
          <>
            <div className={styles.videoSection}>
              {renderMedia()}
            </div>
            
            <div className={styles.details}>
              {item.title && item.title !== `${item.uploaderNickname}의 루씨 Live` && (
                <h2 className={styles.mainTitle}>{item.title}</h2>
              )}
              <div className={styles.uploaderInfo}>
                <span>{item.uploaderNickname}</span>
                <span>•</span>
                <span>{item.createdAt ? `${item.createdAt.split('T')[0].replace(/-/g, '.')} ${item.createdAt.split('T')[1].substring(0, 5)}` : ''}</span>
                <span>•</span>
                <span>👁️ {viewCount}</span>
              </div>
              <p className={styles.description}>{item.description}</p>
              
              <div className={styles.actions}>
                <button 
                  className={`${styles.actionBtn} ${isLiked ? styles.liked : ''}`} 
                  onClick={handleLike}
                >
                  {isLiked ? '❤️' : '🤍'} {likeCount}
                </button>
                <div className={styles.actionBtn}>
                  💬 {comments.length}
                </div>
              </div>
            </div>

            <div className={styles.commentsArea}>
              <div className={styles.commentInputWrapper}>
                <input 
                  className={styles.commentInput} 
                  placeholder={t.media?.placeholder?.comment || 'Comment...'}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCommentSubmit()}
                />
                <button className={styles.commentSubmit} onClick={handleCommentSubmit}>
                  {t.reserve?.save || 'Save'}
                </button>
              </div>

              <div className={styles.commentList}>
                {comments.length === 0 ? (
                  <div className={styles.noComments}>
                    {t.media?.noComments || 'No comments yet.'}
                  </div>
                ) : (
                  comments.map((c) => (
                    <div key={c.id} className={styles.commentItem}>
                      <div className={styles.commentMeta}>
                        <span className={styles.commentNick}>{c.nickname}</span>
                        <span className={styles.commentDate}>
                          {c.createdAt ? `${c.createdAt.split('T')[0].replace(/-/g, '.')} ${c.createdAt.split('T')[1].substring(0, 5)}` : ''}
                        </span>
                      </div>
                      <p className={styles.commentText}>{c.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MediaDetail;

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
import { hasRole } from '@/utils/auth';

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
      const isStaff = hasRole(user, 'admin') || hasRole(user, 'instructor') || hasRole(user, 'staff');
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
    const finalUrl = remapStorageUrl(item.videoUrl);
    
    if (item.type === 'youtube') {
      let id = item.videoUrl;
      const ytId = id.includes('v=') ? id.split('v=')[1].split('&')[0] : (id.includes('youtu.be/') ? id.split('youtu.be/')[1].split('?')[0] : id);

      return (
        <div className={styles.videoWrapper}>
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${ytId}?autoplay=1`}
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
          <img 
            src={finalUrl} 
            alt={item.title} 
            className={styles.detailImage}
            crossOrigin="anonymous"
          />
        </div>
      );
    }

    return (
      <div className={styles.videoWrapper}>
        <video 
          src={finalUrl} 
          controls 
          autoPlay 
          playsInline
          className={styles.video}
        />
      </div>
    );
  };

  if (loading) {
    return (
      <div className={styles.detailOverlay}>
        <div className={styles.detailContent}>
          <div className={styles.loading}>{t.common?.loading || 'Loading...'}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.detailOverlay} onClick={onClose}>
      <div className={styles.detailContent} onClick={e => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>×</button>
        
        <div className={styles.mediaSection}>
          {hasAccess ? (
            renderMedia()
          ) : (
            <div className={styles.lockOverlay}>
              <div className={styles.lockIcon}>🔒</div>
              <p>{t.media.onlyForStudents || "이 영상은 수업 신청자만 볼 수 있습니다."}</p>
            </div>
          )}
        </div>

        <div className={styles.infoSection}>
          <div className={styles.header}>
            <h2 className={styles.detailTitle}>{customTitle || item.title}</h2>
            <div className={styles.stats}>
              <span>👁 {viewCount || 0}</span>
              <button 
                className={`${styles.likeBtn} ${isLiked ? styles.active : ''}`}
                onClick={handleLike}
              >
                ❤️ {likeCount || 0}
              </button>
              {isAdmin && (
                <button className={styles.deleteBtn} onClick={handleDelete}>
                  {t.common?.delete || '삭제'}
                </button>
              )}
            </div>
          </div>
          
          <p className={styles.description}>{item.description}</p>

          <div className={styles.commentsSection}>
            <h3>{t.media.comments || 'Comments'} ({comments.length})</h3>
            
            <div className={styles.commentInputWrapper}>
              <input
                type="text"
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder={t.media.commentPlaceholder || 'Add a comment...'}
                onKeyPress={e => e.key === 'Enter' && handleCommentSubmit()}
              />
              <button onClick={handleCommentSubmit}>{t.common?.send || 'Send'}</button>
            </div>

            <div className={styles.commentList}>
              {comments.map((comment, idx) => (
                <div key={idx} className={styles.commentItem}>
                  <div className={styles.commentHeader}>
                    <span className={styles.nickname}>{comment.nickname}</span>
                    <span className={styles.date}>{new Date(comment.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className={styles.commentText}>{comment.content}</p>
                  {(isAdmin || (user && user.phone === comment.phone)) && (
                    <button 
                      className={styles.deleteCommentBtn}
                      onClick={async () => {
                        await deleteMediaComment(item.id!, comment.id!);
                        fetchComments();
                        onUpdate(true);
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaDetail;

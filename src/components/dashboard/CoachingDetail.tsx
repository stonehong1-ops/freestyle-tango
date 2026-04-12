'use client';

import React, { useState, useEffect } from 'react';
import { CoachingItem, CoachingUpdate, getCoachingUpdates, addCoachingUpdate, updateCoachingItem, getUsers, updateCoachingUpdate, deleteCoachingUpdate } from '@/lib/db';
import { uploadFile } from '@/lib/storage';
import styles from './CoachingDetail.module.css';
import { useLanguage } from '@/contexts/LanguageContext';
import FullscreenModal from '@/components/common/FullscreenModal';

interface Props {
  item: CoachingItem;
  onBack: () => void;
  currentUser: any;
  isAdmin?: boolean;
}

export default function CoachingDetail({ item, onBack, currentUser, isAdmin }: Props) {
  const { t } = useLanguage();
  const [updates, setUpdates] = useState<CoachingUpdate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(item.progress);
  const [currentStatus, setCurrentStatus] = useState(item.status);
  const [studentInfo, setStudentInfo] = useState<any>(null);
  const [instructorInfo, setInstructorInfo] = useState<any>(null);
  const [showAddActivityModal, setShowAddActivityModal] = useState(false);
  const [selectedUpdate, setSelectedUpdate] = useState<CoachingUpdate | null>(null);
  const [showOptionsSheet, setShowOptionsSheet] = useState(false);
  const [showEditSheet, setShowEditSheet] = useState(false);
  const [editProgress, setEditProgress] = useState(0);
  const [editComment, setEditComment] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const isInstructor = currentUser?.phone?.replace(/[^0-9]/g, '') === item.instructorPhone;
  const canUpdate = isInstructor || isAdmin;

  useEffect(() => {
    loadUpdates();
    fetchUserInfos();
  }, [item.id]);

  const fetchUserInfos = async () => {
    try {
      const allUsers = await getUsers();
      const student = allUsers.find(u => u.phone.replace(/[^0-9]/g, '') === item.studentPhone);
      const instructor = allUsers.find(u => u.phone.replace(/[^0-9]/g, '') === item.instructorPhone);
      setStudentInfo(student);
      setInstructorInfo(instructor);
    } catch (error) {
      console.error("Error fetching user infos:", error);
    }
  };

  const loadUpdates = async () => {
    setIsLoading(true);
    try {
      const data = await getCoachingUpdates(item.id);
      setUpdates(data.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
    } catch (error) {
      console.error("Error loading updates:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
    } else {
      setPreview(null);
    }
  };

  const handleSaveUpdate = async () => {
    if (!newComment.trim() && !selectedFile) return;

    setIsSaving(true);
    setUploadProgress(0);

    try {
      let mediaUrls: string[] = [];
      if (selectedFile) {
        const path = `coaching/${item.id}/${Date.now()}_${selectedFile.name}`;
        const url = await uploadFile(selectedFile, path, {
          onProgress: (p) => setUploadProgress(p)
        });
        mediaUrls.push(url);
      }

      await addCoachingUpdate(item.id, {
        progress: currentProgress,
        comment: newComment,
        mediaUrls,
        senderPhone: currentUser?.phone?.replace(/[^0-9]/g, '') || ''
      });

      setNewComment('');
      setSelectedFile(null);
      setPreview(null);
      setShowAddActivityModal(false);
      loadUpdates();
    } catch (error) {
      alert(t.coaching.errorSave);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async () => {
    const newStatus = currentStatus === 'ongoing' ? 'solved' : 'ongoing';
    const newProg = newStatus === 'solved' ? 100 : currentProgress;
    
    try {
      await updateCoachingItem(item.id, {
        status: newStatus,
        progress: newProg,
        updatedAt: new Date().toISOString()
      });
      setCurrentStatus(newStatus);
      setCurrentProgress(newProg);
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleChat = async (targetPhone: string, targetNickname: string) => {
    if (!currentUser?.phone) return;
    try {
      const { getOrCreatePrivateRoom } = await import('@/lib/chat');
      const myPhone = currentUser.phone.replace(/[^0-9]/g, '');
      const otherPhone = targetPhone.replace(/[^0-9]/g, '');
      
      const roomId = await getOrCreatePrivateRoom(
        [
          { nickname: currentUser.nickname, phone: myPhone },
          { nickname: targetNickname, phone: otherPhone }
        ],
        myPhone
      );

      if (roomId) {
        window.dispatchEvent(new CustomEvent('ft_open_chat', {
          detail: {
            roomId: roomId,
            roomName: targetNickname,
            participants: [myPhone, otherPhone]
          }
        }));
      }
    } catch (error) {
      console.error("Chat Error:", error);
      alert("채팅방을 열 수 없습니다.");
    }
  };

  const handleOpenOptions = (update: CoachingUpdate) => {
    // Only allow owner or admin to edit/delete
    const userPhone = currentUser?.phone?.replace(/[^0-9]/g, '');
    if (!isAdmin && update.senderPhone !== userPhone) return;

    setSelectedUpdate(update);
    setShowOptionsSheet(true);
  };

  const handleStartEdit = () => {
    if (!selectedUpdate) return;
    setEditProgress(selectedUpdate.progress);
    setEditComment(selectedUpdate.comment);
    setShowOptionsSheet(false);
    setShowEditSheet(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedUpdate) return;
    setIsUpdating(true);
    try {
      await updateCoachingUpdate(selectedUpdate.id, item.id, {
        progress: editProgress,
        comment: editComment
      });
      setShowEditSheet(false);
      setSelectedUpdate(null);
      loadUpdates();
    } catch (error) {
      alert("수정 실패");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteUpdate = async () => {
    if (!selectedUpdate || !confirm(t.coaching.confirmDelete || "정말로 삭제하시겠습니까?")) return;
    try {
      await deleteCoachingUpdate(selectedUpdate.id, item.id);
      setShowOptionsSheet(false);
      setSelectedUpdate(null);
      loadUpdates();
    } catch (error) {
      alert("삭제 실패");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.premiumHeader}>
        <div className={styles.headerTop}>
          <button className={styles.backButton} onClick={onBack}>←</button>
          <div className={styles.headerActions}>
            {canUpdate && (
              <button 
                className={`${styles.smallSolveBtn} ${currentStatus === 'solved' ? styles.solved : ''}`}
                onClick={handleToggleStatus}
              >
                {currentStatus === 'solved' ? t.coaching.reopen : t.coaching.solved}
              </button>
            )}
          </div>
        </div>

        <div className={styles.headerContent}>
          <h2 className={styles.title}>{item.title}</h2>
          {item.description && <p className={styles.description}>{item.description}</p>}
          
          <div className={styles.involvedUsers}>
            <div className={styles.userCard}>
              <div className={styles.avatar}>
                {studentInfo?.photoURL ? <img src={studentInfo.photoURL} alt="" /> : <span>{item.studentNickname[0]}</span>}
              </div>
              <div className={styles.userInfo}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span className={styles.roleLabel}>{t.coaching.student}</span>
                    <span className={styles.userName}>{item.studentNickname}</span>
                  </div>
                  {currentUser?.phone?.replace(/[^0-9]/g, '') !== item.studentPhone && (
                    <button 
                      className={styles.chatIconBtn}
                      onClick={() => handleChat(item.studentPhone, item.studentNickname)}
                      title="Chat"
                    >
                      💬
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            <div className={styles.userCard}>
              <div className={styles.avatar}>
                {instructorInfo?.photoURL ? <img src={instructorInfo.photoURL} alt="" /> : <span>{item.instructorNickname[0]}</span>}
              </div>
              <div className={styles.userInfo}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span className={styles.roleLabel}>{t.coaching.instructor}</span>
                    <span className={styles.userName}>{item.instructorNickname}</span>
                  </div>
                  {currentUser?.phone?.replace(/[^0-9]/g, '') !== item.instructorPhone && (
                    <button 
                      className={styles.chatIconBtn}
                      onClick={() => handleChat(item.instructorPhone, item.instructorNickname)}
                      title="Chat"
                    >
                      💬
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className={styles.progressBanner}>
            <div className={styles.progressInfo}>
              <span>{t.coaching.progress}</span>
              <span className={styles.progressPercent}>{currentProgress}%</span>
            </div>
            <div className={styles.headerProgressBar}>
              <div className={styles.headerProgressFill} style={{ width: `${currentProgress}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className={styles.activityHeader}>
        <h4 className={styles.activityTitle}>{t.coaching.updates}</h4>
        {canUpdate && (
          <button 
            className={styles.addActivityBtn}
            onClick={() => setShowAddActivityModal(true)}
            disabled={currentStatus === 'solved'}
          >
            {t.coaching.activityAdd || '활동기록 추가'}
          </button>
        )}
      </div>

      <div className={styles.updatesList}>
        {isLoading ? (
          <div className={styles.loading}>Loading...</div>
        ) : updates.length === 0 ? (
          <p className={styles.empty}>{t.coaching.noUpdates || '기록이 없습니다.'}</p>
        ) : (
          Object.entries(
            updates.reduce((acc, u) => {
              const date = u.createdAt.split('T')[0];
              if (!acc[date]) acc[date] = [];
              acc[date].push(u);
              return acc;
            }, {} as Record<string, CoachingUpdate[]>)
          )
          .sort((a, b) => b[0].localeCompare(a[0]))
          .map(([date, items]) => (
            <div key={date} className={styles.dateGroup}>
              <div className={styles.dateHeader}>{date}</div>
              {items.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(u => (
                <div key={u.id} className={styles.updateItem}>
                  <div className={styles.updateHeader}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className={styles.updateProgress}>{u.progress}%</span>
                      <span className={styles.updateTime}>{u.createdAt.split('T')[1].split(':')[0]}</span>
                    </div>
                    {((currentUser?.phone?.replace(/[^0-9]/g, '') === u.senderPhone) || isAdmin) && (
                      <button 
                        className={styles.moreBtn}
                        onClick={() => handleOpenOptions(u)}
                      >
                        ⋮
                      </button>
                    )}
                  </div>
                  <p className={styles.comment}>{u.comment}</p>
                  <div className={styles.mediaContainer}>
                    {u.mediaUrls.map((url, idx) => (
                      <div key={idx} className={styles.mediaItem}>
                        {url.includes('.mp4') || url.includes('video') ? (
                          <video src={url} controls />
                        ) : (
                          <img src={url} alt="media" onClick={() => window.open(url)} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      {showAddActivityModal && (
        <div className={styles.modalOverlay} onClick={() => setShowAddActivityModal(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h4>{t.coaching.activityAdd || '활동 기록 추가'}</h4>
              <button className={styles.closeBtn} onClick={() => setShowAddActivityModal(false)}>✕</button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.field}>
                <label>{t.coaching.progress}</label>
                <div className={styles.sliderWrapper}>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    step="10"
                    value={currentProgress} 
                    onChange={(e) => setCurrentProgress(parseInt(e.target.value))}
                    className={styles.rangeInput}
                  />
                  <span className={styles.sliderValue}>{currentProgress}%</span>
                </div>
              </div>

              <div className={styles.field}>
                <label>{t.coaching.comment}</label>
                <textarea 
                  className={styles.modalTextarea}
                  placeholder={t.coaching.placeholderComment}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
              </div>

              <div className={styles.field}>
                <label>{t.coaching.media}</label>
                <div className={styles.mediaUploadArea}>
                  {!preview ? (
                    <label className={styles.uploadPlaceholder}>
                      <span className={styles.plusIcon}>+</span>
                      <span>{t.coaching.uploadMedia}</span>
                      <input 
                        type="file" 
                        hidden 
                        accept="image/*,video/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setSelectedFile(file);
                            setPreview(URL.createObjectURL(file));
                          }
                        }}
                      />
                    </label>
                  ) : (
                    <div className={styles.modalPreviewBox}>
                      {selectedFile?.type.startsWith('video') ? (
                        <video src={preview} />
                      ) : (
                        <img src={preview} alt="preview" />
                      )}
                      <button 
                        className={styles.removePreview}
                        onClick={() => {
                          setSelectedFile(null);
                          setPreview(null);
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setShowAddActivityModal(false)}>{t.coaching.cancel}</button>
              <button 
                className={styles.confirmBtn} 
                onClick={handleSaveUpdate}
                disabled={isSaving || !newComment.trim()}
              >
                {isSaving ? '...' : t.coaching.confirm}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Options Sheet */}
      <FullscreenModal
        isOpen={showOptionsSheet}
        onClose={() => setShowOptionsSheet(false)}
        isBottomSheet
        hideHeader
      >
        <div className={styles.sheetOptions}>
          <button className={styles.sheetBtn} onClick={handleStartEdit}>
            <span>✏️</span> {t.coaching.editActivity}
          </button>
          <button className={`${styles.sheetBtn} ${styles.delete}`} onClick={handleDeleteUpdate}>
            <span>🗑️</span> {t.coaching.deleteActivity}
          </button>
          <button className={styles.sheetBtn} onClick={() => setShowOptionsSheet(false)} style={{ background: 'white', marginTop: '8px' }}>
             {t.coaching.cancel}
          </button>
        </div>
      </FullscreenModal>

      {/* Edit Sheet */}
      <FullscreenModal
        isOpen={showEditSheet}
        onClose={() => setShowEditSheet(false)}
        isBottomSheet
        title={t.coaching.editActivity}
      >
        <div className={styles.editForm}>
          <div className={styles.field}>
            <label>{t.coaching.progress}</label>
            <div className={styles.sliderWrapper}>
              <input 
                type="range" 
                min="0" 
                max="100" 
                step="10"
                value={editProgress} 
                onChange={(e) => setEditProgress(parseInt(e.target.value))}
                className={styles.rangeInput}
              />
              <span className={styles.sliderValue}>{editProgress}%</span>
            </div>
          </div>

          <div className={styles.field}>
            <label>{t.coaching.comment}</label>
            <textarea 
              className={styles.modalTextarea}
              value={editComment}
              onChange={(e) => setEditComment(e.target.value)}
              placeholder={t.coaching.placeholderComment}
            />
          </div>

          <div className={styles.modalFooter}>
            <button className={styles.cancelBtn} onClick={() => setShowEditSheet(false)}>{t.coaching.cancel}</button>
            <button 
              className={styles.confirmBtn} 
              onClick={handleSaveEdit}
              disabled={isUpdating || !editComment.trim()}
            >
              {isUpdating ? '...' : t.common.save}
            </button>
          </div>
        </div>
      </FullscreenModal>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import styles from './MilongaMediaEditor.module.css';
import { MediaItem, addMedia } from '@/lib/db';
import { uploadFile } from '@/lib/storage';
import FullscreenModal from '@/components/common/FullscreenModal';

interface MilongaMediaEditorProps {
  onClose: () => void;
  onSave: () => void;
  milongaDate: string | null;
  t: any;
  user?: any;
}

const MilongaMediaEditor: React.FC<MilongaMediaEditorProps> = ({ onClose, onSave, milongaDate, t, user }) => {
  const [nickname, setNickname] = useState('');
  const [phone, setPhone] = useState('');
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) {
      setNickname(user.nickname || '');
      setPhone(user.phone || '');
    } else {
      const savedNickname = localStorage.getItem('ft_milonga_nick');
      const savedPhone = localStorage.getItem('ft_milonga_phone');
      if (savedNickname) setNickname(savedNickname);
      if (savedPhone) setPhone(savedPhone);
    }
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    if (selectedFile) {
      if (selectedFile.type.startsWith('image')) {
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result as string);
        reader.readAsDataURL(selectedFile);
      } else if (selectedFile.type.startsWith('video')) {
        setPreview(URL.createObjectURL(selectedFile));
      }
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname || !phone || !file) {
      alert(t.common?.fillRequired || "모든 필수 정보를 입력해 주세요.");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const path = `milonga_live/${milongaDate}/${Date.now()}_${file.name}`;
      const downloadUrl = await uploadFile(file, path, {
        onProgress: (progress) => setUploadProgress(progress)
      });

      const mediaData: Omit<MediaItem, 'id'> = {
        type: file.type.startsWith('image') ? 'image' : 'video',
        title: title || '',
        videoUrl: downloadUrl,
        thumbnailUrl: file.type.startsWith('image') ? downloadUrl : '',
        relatedMilongaDate: milongaDate || '',
        uploaderNickname: nickname,
        uploaderPhone: phone,
        createdAt: new Date().toISOString(),
        viewCount: 0,
        likeCount: 0,
        commentCount: 0
      };

      await addMedia(mediaData);
      
      // Save for next time
      localStorage.setItem('ft_milonga_nick', nickname);
      localStorage.setItem('ft_milonga_phone', phone);
      
      onSave();
    } catch (error: any) {
      console.error("Upload error:", error);
      alert(`업로드 실패: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <FullscreenModal 
      isOpen={true} 
      onClose={onClose} 
      title={t.language === 'ko' ? '루씨 Live 올리기' : 'Upload Lucy Live'}
      isBottomSheet={true}
    >
      <form onSubmit={handleSubmit} className={styles.container}>
        {!user && (
          <div className={styles.field}>
            <label className={styles.label}>{t.home.milonga.bookingInfo}</label>
            <div className={styles.idFields}>
              <div>
                <input 
                  type="text" 
                  placeholder={t.home.registration.nickname}
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className={styles.input}
                  required
                />
              </div>
              <div>
                <input 
                  type="tel" 
                  placeholder={t.home.registration.phone}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={styles.input}
                  required
                />
              </div>
            </div>
            <p className={styles.subtitle}>* 전화번호는 본인 확인(ID)용으로 사용됩니다.</p>
          </div>
        )}

        <div className={styles.field}>
          <label className={styles.label}>{t.home.milonga.mediaSelection || '미디어 선택'}</label>
          <div className={styles.mediaBox} onClick={() => document.getElementById('mediaFile')?.click()}>
            {preview ? (
              file?.type.startsWith('image') ? (
                <img src={preview} alt="preview" className={styles.preview} />
              ) : (
                <video src={preview} className={styles.preview} />
              )
            ) : (
              <p>📸 {t.home.milonga.mediaSelectDesc || '사진 또는 동영상 선택'}</p>
            )}
            <input 
              id="mediaFile"
              type="file" 
              accept="image/*,video/*" 
              onChange={handleFileChange}
              style={{ display: 'none' }}
              required
            />
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>{t.common?.title || '설명'}</label>
          <input 
            type="text" 
            placeholder={t.home.milonga.liveTitleInput || '간단한 설명 (선택)'}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={styles.input}
          />
        </div>

        {uploading && (
          <div className={styles.progressContainer}>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${uploadProgress}%` }}></div>
            </div>
            <span className={styles.progressText}>{Math.round(uploadProgress)}% {t.common?.uploading || '업로드 중...'}</span>
          </div>
        )}

        <button 
          type="submit" 
          className={styles.submitBtn} 
          disabled={uploading || !file || !nickname || !phone}
        >
          {uploading ? (t.common?.uploading || '처리 중...') : (t.common?.save || '올리기')}
        </button>
      </form>
    </FullscreenModal>
  );
};

export default MilongaMediaEditor;

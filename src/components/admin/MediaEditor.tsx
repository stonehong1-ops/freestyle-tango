'use client';

import React, { useState, useEffect } from 'react';
import styles from './MediaEditor.module.css';
import { MediaItem, addMedia, TangoClass, CURRENT_REGISTRATION_MONTH, getClasses } from '@/lib/db';
import { ref, getDownloadURL } from 'firebase/storage';
import { useAuth } from '@/contexts/AuthContext';
import { uploadFile } from '@/lib/storage';

interface MediaEditorProps {
  initialData?: MediaItem | null;
  onClose: () => void;
  onSave: () => void;
  t: any;
  classes: TangoClass[];
  user: any;
}

const MediaEditor: React.FC<MediaEditorProps> = ({ initialData, onClose, onSave, t, classes, user }) => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState<Partial<MediaItem>>(initialData || {
    type: 'youtube',
    title: '',
    videoUrl: '',
    relatedClassId: '',
    viewCount: 0,
    likeCount: 0
  });

  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(
    initialData?.thumbnailUrl || 
    (initialData?.type === 'youtube' ? `https://img.youtube.com/vi/${initialData.videoUrl}/mqdefault.jpg` : null) ||
    (initialData?.type === 'image' ? initialData.videoUrl : null) ||
    null
  );
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [isClassDropdownOpen, setIsClassDropdownOpen] = useState(false);

  // Filter classes based on current registration month
  const filteredClasses = classes.filter(c => {
    const month = (c.targetMonth || '2026-04').trim();
    return month === CURRENT_REGISTRATION_MONTH.trim();
  });

  // Auto-fetch YouTube Title & Thumbnail
  useEffect(() => {
    if (formData.type === 'youtube' && formData.videoUrl) {
      let id = formData.videoUrl;
      if (id.includes('v=')) id = id.split('v=')[1].split('&')[0];
      else if (id.includes('youtu.be/')) id = id.split('youtu.be/')[1].split('?')[0];
      else if (id.includes('shorts/')) id = id.split('shorts/')[1].split('?')[0];
      
      if (id && id.length > 5) {
        setThumbnailPreview(`https://img.youtube.com/vi/${id}/mqdefault.jpg`);
        const fetchTitle = async () => {
          try {
            const res = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${id}`);
            const data = await res.json();
            if (data.title) {
              setFormData(prev => ({ ...prev, title: data.title }));
            }
          } catch (err) {
            console.error("Failed to fetch youtube title", err);
          }
        };
        fetchTitle();
      } else {
        setThumbnailPreview(null);
      }
    } else if (formData.type !== 'youtube' && !file) {
      setThumbnailPreview(null);
    }
  }, [formData.videoUrl, formData.type, file]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setThumbnailPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || (!formData.videoUrl && !file)) {
      alert("제목과 미디어를 입력해주세요.");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    let finalVideoUrl = formData.videoUrl || '';
    let thumbnailUrl = '';

    try {
      if (file && formData.type !== 'youtube') {
        if (!currentUser) {
          alert("로그인이 필요합니다.");
          setUploading(false);
          return;
        }
        
        const uid = currentUser.uid;
        const path = `videos/${uid}/${Date.now()}_${file.name}`;
        
        finalVideoUrl = await uploadFile(file, path, {
          onProgress: (progress) => setUploadProgress(progress)
        });
      }

      if (formData.type === 'youtube') {
        let id = finalVideoUrl;
        if (id.includes('v=')) id = id.split('v=')[1].split('&')[0];
        else if (id.includes('youtu.be/')) id = id.split('youtu.be/')[1].split('?')[0];
        else if (id.includes('shorts/')) id = id.split('shorts/')[1].split('?')[0];
        finalVideoUrl = id;
        thumbnailUrl = `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
      } else {
        // We no longer force class poster as thumbnail for demonstration/general
        // These will now fallback to video frame (#t=0.5) in MediaList
      }

      const mediaData = {
        type: formData.type as any,
        title: formData.title || '',
        videoUrl: finalVideoUrl,
        thumbnailUrl: (formData.type === 'youtube' ? (thumbnailUrl || formData.thumbnailUrl) : ''),
        relatedClassId: formData.relatedClassId || '',
        uploaderNickname: formData.uploaderNickname || user?.nickname || 'Admin',
        uploaderPhone: formData.uploaderPhone || user?.phone || '',
        createdAt: formData.createdAt || new Date().toISOString(),
        viewCount: formData.viewCount || 0,
        likeCount: formData.likeCount || 0,
        commentCount: formData.commentCount || 0
      };

      if (initialData?.id) {
        const { updateMedia } = await import('@/lib/db');
        await updateMedia(initialData.id, mediaData);
      } else {
        await addMedia(mediaData);
      }
      
      onSave();
    } catch (error: any) {
      console.error("Error saving media:", error);
      if (error.code === 'storage/unauthorized') {
        alert("업로드 권한이 없습니다. (관리자 로그인을 확인해주세요)");
      } else {
        alert(`미디어 저장에 실패했습니다: ${error.message || '알 수 없는 오류'}`);
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h3>{initialData ? '미디어 수정' : '미디어 등록'}</h3>
          <button onClick={onClose} className={styles.closeBtn}>×</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label>유형</label>
            <select 
              value={formData.type} 
              onChange={(e) => setFormData({...formData, type: e.target.value as any})}
              className={styles.input}
            >
              <option value="youtube">유튜브</option>
              <option value="demonstration">시연</option>
              <option value="general">일반</option>
            </select>
          </div>

          <div className={styles.field}>
            <label>{formData.type === 'youtube' ? '유튜브에서 복사한 주소' : '동영상 선택'}</label>
            <div className={styles.mediaBox}>
              {formData.type === 'youtube' ? (
                <input 
                  type="text" 
                  value={formData.videoUrl} 
                  onChange={(e) => setFormData({...formData, videoUrl: e.target.value})}
                  className={styles.input}
                  placeholder="https://www.youtube.com/watch?v=..."
                  required
                />
              ) : (
                <div 
                  className={styles.fileDropZone}
                  onClick={() => document.getElementById('videoFile')?.click()}
                >
                  <p>{file ? file.name : (initialData?.videoUrl ? '기존 동영상이 등록되어 있습니다. 변경하려면 클릭하세요.' : '동영상을 선택하려면 이곳을 클릭하세요.')}</p>
                  <input 
                    id="videoFile"
                    type="file" 
                    accept="video/*" 
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                </div>
              )}
              
              {thumbnailPreview && (
                <div className={styles.thumbnailPreview}>
                   {formData.type === 'youtube' ? (
                     <img src={thumbnailPreview} alt="Youtube Preview" />
                   ) : formData.type === 'image' ? (
                     <img src={thumbnailPreview} alt="Image Preview" />
                   ) : (
                     <video src={thumbnailPreview.startsWith('data:') ? thumbnailPreview : `${thumbnailPreview}#t=0.5`} controls={thumbnailPreview.startsWith('data:')} />
                   )}
                </div>
              )}
            </div>
          </div>

          <div className={styles.field}>
            <label>제목</label>
            <input 
              type="text" 
              value={formData.title} 
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className={styles.input}
              placeholder="미디어 제목"
              required
            />
          </div>

          <div className={styles.field}>
            <label>관련 수업 선택</label>
            <div className={styles.customSelectWrapper}>
              <div 
                className={styles.customSelectTrigger}
                onClick={() => setIsClassDropdownOpen(!isClassDropdownOpen)}
              >
                <span>{formData.relatedClassId ? classes.find(c => c.id === formData.relatedClassId)?.title : '(연결된 수업 없음)'}</span>
                <span style={{ fontSize: '10px' }}>{isClassDropdownOpen ? '▲' : '▼'}</span>
              </div>

              {isClassDropdownOpen && (
                <div className={styles.customDropdown}>
                  <div 
                    className={`${styles.dropdownItem} ${!formData.relatedClassId ? styles.itemActive : ''}`}
                    onClick={() => {
                      setFormData({...formData, relatedClassId: ''});
                      setIsClassDropdownOpen(false);
                    }}
                  >
                    <span className={styles.dropdownTitle}>(연결된 수업 없음)</span>
                  </div>
                  {filteredClasses.map(c => (
                    <div 
                      key={c.id}
                      className={`${styles.dropdownItem} ${formData.relatedClassId === c.id ? styles.itemActive : ''}`}
                      onClick={() => {
                        setFormData({...formData, relatedClassId: c.id});
                        setIsClassDropdownOpen(false);
                      }}
                    >
                      <span className={styles.dropdownTitle}>{c.title}</span>
                      <span className={styles.dropdownInstructor}>{c.teacher1 || '프리스타일'}{c.teacher2 ? ` & ${c.teacher2}` : ''}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {uploading && (
            <div className={styles.progressContainer}>
              <div className={styles.progressBar} style={{ width: `${uploadProgress}%` }}></div>
              <span className={styles.progressText}>업로드 중... {Math.round(uploadProgress)}%</span>
            </div>
          )}

          <div className={styles.footer}>
            <button type="button" onClick={onClose} className={styles.cancelBtn} disabled={uploading}>
              취소
            </button>
            <button type="submit" className={styles.saveBtn} disabled={uploading}>
              저장하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MediaEditor;

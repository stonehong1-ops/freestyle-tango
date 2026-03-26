'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './MilongaEditor.module.css';
import { storage } from '@/lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { MilongaInfo, getMilongaInfo, updateMilongaInfo } from '@/lib/db';

export default function MilongaEditor() {
  const [formData, setFormData] = useState<Partial<MilongaInfo>>({
    posterUrl: '',
    title: "milonga 'LUCY'",
    subtitle: 'every Sunday',
    timeRange: '저녁 6 - 10',
    price: '13,000won',
    location: '서울마포구 합정동 386-37 지하2층',
    locationEn: 'B2, 386-37, Hapjeong-dong, Mapo-gu, Seoul',
    contact: 'Stone 010.7209.2468',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getMilongaInfo();
        if (data) {
          setFormData(prev => ({ ...prev, ...data }));
        }
      } catch (error) {
        console.error("Fetch Milonga Info Error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("이미지 파일이 너무 큽니다. (최대 10MB)");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const storageRef = ref(storage, `milonga/poster_${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    const timeoutId = setTimeout(() => {
      if (uploadProgress === 0 && isUploading) {
        alert("업로드가 시작되지 않습니다 (0%).\n\n확인 필요:\n1. Firebase Storage 규칙에서 'allow read, write: if true' 설정이 되어있나요?\n2. Vercel 환경변수(Storage Bucket)가 정확한지 확인해주세요.");
        setIsUploading(false);
      }
    }, 15000);

    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(Math.round(progress));
      },
      (error) => {
        clearTimeout(timeoutId);
        console.error("Upload failed", error);
        alert(`업로드 실패: ${error.message}\n(Firebase Storage 권한 설정을 확인해주세요)`);
        setIsUploading(false);
      },
      async () => {
        clearTimeout(timeoutId);
        try {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          setFormData(prev => ({ ...prev, posterUrl: url }));
          setIsUploading(false);
          alert('포스터가 업로드되었습니다!');
        } catch (err: any) {
          alert('URL 가져오기 실패: ' + err.message);
          setIsUploading(false);
        }
      }
    );
  };

  const handleSubmit = async () => {
    try {
      await updateMilongaInfo(formData);
      alert('밀롱가 정보가 저장되었습니다.');
      window.dispatchEvent(new Event('ft_milonga_updated'));
    } catch (e) {
      alert('저장 실패: ' + e);
    }
  };

  if (isLoading) return <div className={styles.loading}>로딩 중...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.inputGroup}>
        <label>밀롱가 포스터 (이미지)</label>
        <div 
          className={styles.imageBox} 
          onClick={() => fileInputRef.current?.click()}
        >
          {isUploading ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>업로드 중... ({uploadProgress}%)</div>
              <div style={{ width: '120px', height: '6px', background: '#e5e8eb', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${uploadProgress}%`, height: '100%', background: '#3182f6', transition: 'width 0.3s' }}></div>
              </div>
            </div>
          ) : formData.posterUrl ? (
            <img src={formData.posterUrl} alt="Poster" className={styles.preview} />
          ) : (
            <span>포스터 이미지 선택 (추천 비율 4:5)</span>
          )}
        </div>
        <input 
          type="file" 
          accept="image/*" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          onChange={handleImageUpload} 
        />
        <input 
          className={styles.input} 
          name="posterUrl" 
          value={formData.posterUrl} 
          onChange={handleChange} 
          placeholder="이미지 URL 직접 입력 (선택)"
        />
      </div>

      <div className={styles.inputGroup}>
        <label>제목</label>
        <input className={styles.input} name="title" value={formData.title} onChange={handleChange} />
      </div>

      <div className={styles.inputGroup}>
        <label>부제목</label>
        <input className={styles.input} name="subtitle" value={formData.subtitle} onChange={handleChange} />
      </div>

      <div className={styles.row}>
        <div className={styles.inputGroup}>
          <label>시간 (예: 저녁 6 - 10)</label>
          <input className={styles.input} name="timeRange" value={formData.timeRange} onChange={handleChange} />
        </div>
        <div className={styles.inputGroup}>
          <label>가격 (예: 13,000won)</label>
          <input className={styles.input} name="price" value={formData.price} onChange={handleChange} />
        </div>
      </div>

      <div className={styles.inputGroup}>
        <label>장소 (한글)</label>
        <input className={styles.input} name="location" value={formData.location} onChange={handleChange} />
      </div>

      <div className={styles.inputGroup}>
        <label>장소 (영문)</label>
        <input className={styles.input} name="locationEn" value={formData.locationEn} onChange={handleChange} />
      </div>

      <div className={styles.inputGroup}>
        <label>연락처 (예: Stone 010.7209.2468)</label>
        <input className={styles.input} name="contact" value={formData.contact} onChange={handleChange} />
      </div>

      <button className={styles.submitBtn} onClick={handleSubmit}>
        밀롱가 정보 저장하기
      </button>
    </div>
  );
}

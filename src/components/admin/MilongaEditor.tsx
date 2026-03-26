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
      const data = await getMilongaInfo();
      if (data) setFormData(data);
      setIsLoading(false);
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

    setIsUploading(true);
    const storageRef = ref(storage, `milonga/poster_${Date.now()}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed', null, 
      (error) => {
        console.error(error);
        alert('업로드 실패: ' + error.message);
        setIsUploading(false);
      }, 
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        setFormData(prev => ({ ...prev, posterUrl: url }));
        setIsUploading(false);
        alert('포스터가 업로드되었습니다!');
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
            <span>업로드 중...</span>
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

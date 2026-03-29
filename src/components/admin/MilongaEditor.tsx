'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './MilongaEditor.module.css';
import { MilongaInfo, getMilongaInfo, updateMilongaInfo } from '@/lib/db';

export default function MilongaEditor({ onClose, isNew }: { onClose?: () => void, isNew?: boolean }) {
  const [formData, setFormData] = useState<Partial<MilongaInfo>>({
    posterUrl: '',
    message: '',
    activeDate: ''
  });

  const [isLoading, setIsLoading] = useState(!isNew);
  const [isImageProcessing, setIsImageProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isNew) {
      setIsLoading(false);
      return;
    }
    const fetchData = async () => {
      try {
        const data = await getMilongaInfo();
        if (data) {
          setFormData(prev => ({ 
            ...prev, 
            ...data
          }));
        }
      } catch (error) {
        console.error("Fetch Milonga Info Error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [isNew]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsImageProcessing(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        let scale = 1;
        if (img.width > MAX_WIDTH) {
          scale = MAX_WIDTH / img.width;
        }
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          setFormData(prev => ({ ...prev, posterUrl: dataUrl }));
          setIsImageProcessing(false);
        } else {
          alert("이미지 컨텍스트를 생성하지 못했습니다.");
          setIsImageProcessing(false);
        }
      };
      img.onerror = () => {
        alert("이미지 처리에 실패했습니다.");
        setIsImageProcessing(false);
      };
      img.src = reader.result as string;
    };
    reader.onerror = () => {
      alert("이미지 로드에 실패했습니다.");
      setIsImageProcessing(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    try {
      const dataToSave = { ...formData };
      delete dataToSave.id;
      
      // Ensure activeDates is an array for backend compatibility
      if (dataToSave.activeDate) {
        dataToSave.activeDates = [dataToSave.activeDate];
      } else {
        dataToSave.activeDates = [];
      }
      
      await updateMilongaInfo(dataToSave as MilongaInfo);
      alert('밀롱가 정보가 저장되었습니다.');
      window.dispatchEvent(new Event('ft_milonga_updated'));
      if (onClose) onClose();
    } catch (e) {
      alert('저장 실패: ' + e);
    }
  };

  if (isLoading) return <div className={styles.loading}>로딩 중...</div>;

  return (
    <div className={styles.container}>
      {/* 1. Image Processing (Base64) */}
      <div className={styles.inputGroup}>
        <label>밀롱가 포스터 (이미지 업로드)</label>
        <div 
          className={styles.imageUploadBox}
          onClick={() => fileInputRef.current?.click()}
        >
          {isImageProcessing ? (
            <span>업로드 중...</span>
          ) : formData.posterUrl ? (
            <img src={formData.posterUrl} alt="포스터 미리보기" className={styles.imagePreview} />
          ) : (
            <span>여기를 클릭하여 이미지 선택</span>
          )}
        </div>
        <input 
          type="file" 
          accept="image/*" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          onChange={handleImageUpload} 
        />
      </div>

      {/* 2. Message Field */}
      <div className={styles.inputGroup}>
        <label>이번주 메시지</label>
        <textarea 
          className={`${styles.input} ${styles.textarea}`} 
          name="message" 
          value={formData.message} 
          onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))} 
          placeholder="공지 사항을 입력하세요..."
          rows={4}
        />
      </div>

      {/* 3. Single Date Selection Section */}
      <div className={styles.inputGroup}>
        <label>밀롱가 진행 일자</label>
        <input 
          type="date" 
          className={styles.input} 
          name="activeDate"
          value={formData.activeDate || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, activeDate: e.target.value }))}
        />
      </div>

      <button className={styles.submitBtn} onClick={handleSubmit}>
        밀롱가 등록
      </button>
    </div>
  );
}

'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './MilongaEditor.module.css';
import { MilongaInfo, getMilongaInfo, updateMilongaInfo } from '@/lib/db';

export default function MilongaEditor() {
  const [formData, setFormData] = useState<Partial<MilongaInfo>>({
    posterUrl: '',
    message: '',
    activeDates: []
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isImageProcessing, setIsImageProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getMilongaInfo();
        if (data) {
          setFormData(prev => ({ 
            ...prev, 
            ...data,
            activeDates: data.activeDates || []
          }));
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

  const handleAddDate = (date: string) => {
    if (!date) return;
    setFormData(prev => ({
      ...prev,
      activeDates: [...(prev.activeDates || []), date].sort()
    }));
  };

  const handleRemoveDate = (index: number) => {
    setFormData(prev => ({
      ...prev,
      activeDates: (prev.activeDates || []).filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    try {
      const dataToSave = { ...formData };
      delete dataToSave.id;
      await updateMilongaInfo(dataToSave);
      alert('밀롱가 정보가 저장되었습니다.');
      window.dispatchEvent(new Event('ft_milonga_updated'));
    } catch (e) {
      alert('저장 실패: ' + e);
    }
  };

  if (isLoading) return <div className={styles.loading}>로딩 중...</div>;

  return (
    <div className={styles.container}>
      {/* 1. Image Processing (Base64) - Same as ClassEditor */}
      <div className={styles.inputGroup}>
        <label>밀롱가 포스터 (클릭하여 이미지 선택)</label>
        <div 
          className={styles.imageBox} 
          onClick={() => fileInputRef.current?.click()}
        >
          {isImageProcessing ? (
            <span>이미지 처리 중...</span>
          ) : formData.posterUrl ? (
            <img src={formData.posterUrl} alt="Poster" className={styles.preview} />
          ) : (
            <span>이미지 선택 (수업 신청과 동일한 방식)</span>
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
        <label>이번주 메시지 (멀티라인)</label>
        <textarea 
          className={`${styles.input} ${styles.textarea}`} 
          name="message" 
          value={formData.message} 
          onChange={handleChange} 
          placeholder="공지 사항을 입력하세요..."
          rows={6}
        />
      </div>

      {/* 3. Date Selection Section */}
      <div className={styles.inputGroup}>
        <label>노출할 밀롱가 날짜 목록 (일요일)</label>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <input 
            type="date" 
            className={styles.input} 
            onChange={(e) => {
              handleAddDate(e.target.value);
              e.target.value = ''; // Reset after selecting
            }}
          />
        </div>
        <div className={styles.dateList}>
          {formData.activeDates?.map((date, idx) => (
            <div key={idx} className={styles.dateItem}>
              <span>{date} ({['일','월','화','수','목','금','토'][new Date(date).getDay()]}요일)</span>
              <button onClick={() => handleRemoveDate(idx)}>✕</button>
            </div>
          ))}
          {(!formData.activeDates || formData.activeDates.length === 0) && (
            <div className={styles.emptyText}>날짜를 추가하면 Lucy 페이지 드롭다운에 노출됩니다.</div>
          )}
        </div>
      </div>

      <button className={styles.submitBtn} onClick={handleSubmit}>
        밀롱가 정보 저장하기
      </button>
    </div>
  );
}

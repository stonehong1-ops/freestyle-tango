'use client';

import React, { useState, useRef } from 'react';
import styles from './ClassEditor.module.css';
import { storage } from '@/lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

interface ClassEditorProps {
  initialData?: any;
  onSave: (data: any) => void;
}

export default function ClassEditor({ initialData, onSave }: ClassEditorProps) {
  const [formData, setFormData] = useState({
    teacher1: initialData?.teacher1 || '',
    teacher2: initialData?.teacher2 || '',
    title: initialData?.title || '',
    type: initialData?.type || '체인지수업',
    level: initialData?.level || 'Basic',
    description: initialData?.description || '',
    imageUrl: initialData?.imageUrl || '',
    price: initialData?.price || '',
    time: initialData?.time || '',
    videoUrl: initialData?.videoUrl || '',
    teacherProfile: initialData?.teacherProfile || '',
    maleCount: initialData?.maleCount || 0,
    femaleCount: initialData?.femaleCount || 0,
    maxCount: initialData?.maxCount || 15,
  });

  const [dates, setDates] = useState<string[]>(
    initialData?.dates?.length > 0 ? initialData.dates : ['', '', '', '']
  );
  let extractedStart = '20:00';
  let extractedEnd = '21:30';
  if (initialData?.timeStr) {
    const parts = initialData.timeStr.split('-');
    if (parts[0]) extractedStart = parts[0].trim().padStart(5, '0');
    if (parts[1]) extractedEnd = parts[1].trim().padStart(5, '0');
  } else if (initialData?.time) {
    const match = initialData.time.match(/(\d{1,2}:\d{2})\s*(?:-|~)\s*(\d{1,2}:\d{2})/);
    if (match) {
      extractedStart = match[1].padStart(5, '0');
      extractedEnd = match[2].padStart(5, '0');
    }
  }

  const [startTime, setStartTime] = useState(extractedStart);
  const [endTime, setEndTime] = useState(extractedEnd);
  
  const [hasCurriculum, setHasCurriculum] = useState(!!initialData?.curriculum);
  const [curriculumWeeks, setCurriculumWeeks] = useState<string[]>(
    initialData?.curriculum 
      ? initialData.curriculum.split('\n').map((s: string) => s.replace(/^\d+주차:\s*/, '')) 
      : ['', '', '', '']
  );
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Strip everything except numbers
    const rawValue = e.target.value.replace(/[^0-9]/g, '');
    if (!rawValue) {
      setFormData(prev => ({ ...prev, price: '' }));
      return;
    }
    // Format with commas and append '원'
    const formatted = parseInt(rawValue, 10).toLocaleString('ko-KR') + '원';
    setFormData(prev => ({ ...prev, price: formatted }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        // Max width to keep base64 string well under 1MB
        const MAX_WIDTH = 800;
        let scale = 1;
        if (img.width > MAX_WIDTH) {
          scale = MAX_WIDTH / img.width;
        }
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // compress to 70% JPEG
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setFormData(prev => ({ ...prev, imageUrl: dataUrl }));
        setIsUploading(false);
      };
      img.onerror = () => {
        alert("이미지 처리에 실패했습니다.");
        setIsUploading(false);
      };
      img.src = reader.result as string;
    };
    reader.onerror = () => {
      alert("이미지 로드에 실패했습니다.");
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size (rough limit 50MB for 30s)
    if (file.size > 50 * 1024 * 1024) {
      alert("동영상 파일이 너무 큽니다. (최대 50MB)");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const storageRef = ref(storage, `videos/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    // 15초 동안 0%에서 멈춰있으면 안내 메시지 표시
    const timeoutId = setTimeout(() => {
      if (uploadProgress === 0 && isUploading) {
        alert("업로드가 시작되지 않습니다 (0%).\n\n확인 필요:\n1. Firebase Storage 규칙에서 'allow read, write: if true' 설정이 되어있나요?\n2. Vercel 환경변수(Storage Bucket)가 정확한지 확인해주세요.");
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
        alert(`동영상 업로드 중 오류가 발생했습니다: ${error.message}\n관리자에게 문의해주세요.`);
        setIsUploading(false);
      }, 
      () => {
        clearTimeout(timeoutId);
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setFormData(prev => ({ ...prev, videoUrl: downloadURL }));
          setIsUploading(false);
          alert("동영상이 성공적으로 업로드되었습니다!");
        }).catch(err => {
          console.error("URL retrieval failed", err);
          alert("동영상 경로를 가져오는데 실패했습니다.");
          setIsUploading(false);
        });
      }
    );
  };

  const handleDateChange = (index: number, value: string) => {
    let newDates = [...dates];
    newDates[index] = value;
    
    // Auto-fill subsequent weeks based on the 1st week
    if (index === 0 && value) {
      const d = new Date(value);
      for (let i = 1; i < 4; i++) {
        const nextDate = new Date(d);
        nextDate.setDate(d.getDate() + i * 7);
        // Format to YYYY-MM-DD for input type="date"
        const offset = nextDate.getTimezoneOffset()
        const kstNextDate = new Date(nextDate.getTime() - (offset*60*1000))
        newDates[i] = kstNextDate.toISOString().split('T')[0];
      }
      // Implicitly set the Day of the Week string
      const days = ['일', '월', '화', '수', '목', '금', '토'];
      setFormData(prev => ({ ...prev, time: `매주 ${days[d.getDay()]}요일 ${startTime} - ${endTime}` }));
    }
    
    setDates(newDates.slice(0, 4)); // Ensure strictly 4 dates
  };

  const addCurriculumWeek = () => setCurriculumWeeks(prev => [...prev, '']);
  const removeCurriculumWeek = () => setCurriculumWeeks(prev => prev.length > 1 ? prev.slice(0, -1) : prev);

  const handleCurriculumChange = (index: number, value: string) => {
    const newWeeks = [...curriculumWeeks];
    newWeeks[index] = value;
    setCurriculumWeeks(newWeeks);
  }

  const handleSubmit = () => {
    let finalCurriculum = '';
    if (hasCurriculum) {
      finalCurriculum = curriculumWeeks
        .map((text, i) => text.trim() ? `${i+1}주차: ${text}` : '')
        .filter(Boolean)
        .join('\n');
    }
    
    let finalTime = formData.time;
    const timeStr = `${startTime} - ${endTime}`;
    if (dates[0]) {
      const d = new Date(dates[0]);
      const days = ['일', '월', '화', '수', '목', '금', '토'];
      finalTime = `매주 ${days[d.getDay()]}요일 ${timeStr}`;
    }

    onSave({
      ...formData,
      time: finalTime,
      timeStr,
      dates: dates.filter(Boolean),
      curriculum: finalCurriculum,
    });
  };

  return (
    <div className={styles.form}>
      
      {/* 1. Image Upload */}
      <div className={styles.inputGroup}>
        <label>대표 이미지 업로드</label>
        <div 
          className={styles.imageUploadBox}
          onClick={() => fileInputRef.current?.click()}
        >
          {isUploading ? (
            <span>업로드 중...</span>
          ) : formData.imageUrl ? (
            <img src={formData.imageUrl} alt="preview" className={styles.imagePreview} />
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

      {/* 1.1 Video Upload */}
      <div className={styles.inputGroup}>
        <label>수업 동영상 업로드 (30초 내외 추천)</label>
        <div 
          className={styles.imageUploadBox}
          style={{ height: '120px', borderStyle: 'dashed' }}
          onClick={() => videoInputRef.current?.click()}
        >
          {isUploading && uploadProgress < 100 ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>동영상 업로드 중... ({uploadProgress}%)</div>
              <div style={{ width: '200px', height: '6px', background: '#f2f4f6', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${uploadProgress}%`, height: '100%', background: '#3182f6' }}></div>
              </div>
            </div>
          ) : formData.videoUrl ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.5rem' }}>✅</span>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>동영상 업로드 완료</div>
                <div style={{ fontSize: '0.8rem', color: '#8b95a1' }}>클릭하여 변경</div>
              </div>
            </div>
          ) : (
            <span style={{ fontSize: '0.9rem', color: '#8b95a1' }}>여기를 클릭하여 동영상 파일 선택</span>
          )}
        </div>
        <input 
          type="file" 
          accept="video/*" 
          ref={videoInputRef} 
          style={{ display: 'none' }} 
          onChange={handleVideoUpload} 
        />
      </div>

      <div className={styles.inputGroup}>
        <label>강사 프로필 (사진 아래 노출될 설명 - 약 30자)</label>
        <input 
          className={styles.input} 
          name="teacherProfile" 
          value={formData.teacherProfile} 
          onChange={handleChange} 
          placeholder="예: 10년 경력의 베테랑 강사, 밀롱가 전문"
          maxLength={50}
        />
      </div>

      <div className={styles.inputGroup}>
        <label>수업 제목</label>
        <input 
          className={styles.input} 
          name="title" 
          value={formData.title} 
          onChange={handleChange} 
          placeholder="예: 초급 탱고 테크닉"
        />
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <div className={styles.inputGroup} style={{ flex: 1 }}>
          <label>강사 1</label>
          <input className={styles.input} name="teacher1" value={formData.teacher1} onChange={handleChange} placeholder="이름" />
        </div>
        <div className={styles.inputGroup} style={{ flex: 1 }}>
          <label>강사 2</label>
          <input className={styles.input} name="teacher2" value={formData.teacher2} onChange={handleChange} placeholder="이름 (없으면 비움)" />
        </div>
      </div>

      {/* 2. Automated Dates (Fixed 4 Weeks) */}
      <div className={styles.inputGroup}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label>수업 진행 날짜 (1주차 선택 시 자동완성)</label>
        </div>
        
        <div className={styles.datesGrid}>
          {dates.slice(0, 4).map((date, index) => (
            <div key={index} className={styles.dateRow}>
              <span className={styles.weekLabel}>{index + 1}주차</span>
              <input 
                type="date"
                className={styles.input} 
                value={date} 
                onChange={(e) => handleDateChange(index, e.target.value)} 
              />
            </div>
          ))}
        </div>
      </div>
      
      <div className={styles.inputGroup}>
        <label>수업 진행 시간 (시작 - 종료)</label>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <input 
            type="time" 
            className={styles.input} 
            value={startTime} 
            onChange={(e) => {
              setStartTime(e.target.value);
              if (dates[0]) {
                const d = new Date(dates[0]);
                const days = ['일', '월', '화', '수', '목', '금', '토'];
                setFormData(prev => ({ ...prev, time: `매주 ${days[d.getDay()]}요일 ${e.target.value} - ${endTime}` }));
              }
            }} 
          />
          <span style={{ fontWeight: 600, color: '#4e5968' }}>~</span>
          <input 
            type="time" 
            className={styles.input} 
            value={endTime} 
            onChange={(e) => {
              setEndTime(e.target.value);
              if (dates[0]) {
                const d = new Date(dates[0]);
                const days = ['일', '월', '화', '수', '목', '금', '토'];
                setFormData(prev => ({ ...prev, time: `매주 ${days[d.getDay()]}요일 ${startTime} - ${e.target.value}` }));
              }
            }} 
          />
        </div>
      </div>

      {/* 3. Number-only Price */}
      <div className={styles.inputGroup}>
        <label>수강료 (숫자만 입력)</label>
        <input 
          className={styles.input} 
          value={formData.price} 
          onChange={handlePriceChange} 
          placeholder="0원"
        />
      </div>

      <div className={styles.inputGroup}>
        <label>강습 구분</label>
        <div className={styles.selectGroup}>
          {['체인지수업', '파트너수업'].map(t => (
            <button 
              key={t}
              className={`${styles.optionBtn} ${formData.type === t ? styles.active : ''}`}
              onClick={() => setFormData(prev => ({ ...prev, type: t }))}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        <div className={styles.inputGroup} style={{ flex: 1 }}>
          <label>리더 인원 (남성)</label>
          <input 
            type="number" 
            className={styles.input} 
            name="maleCount" 
            value={formData.maleCount} 
            onChange={handleChange} 
          />
        </div>
        <div className={styles.inputGroup} style={{ flex: 1 }}>
          <label>팔로워 인원 (여성)</label>
          <input 
            type="number" 
            className={styles.input} 
            name="femaleCount" 
            value={formData.femaleCount} 
            onChange={handleChange} 
          />
        </div>
        <div className={styles.inputGroup} style={{ flex: 1 }}>
          <label>최대 정원</label>
          <input 
            type="number" 
            className={styles.input} 
            name="maxCount" 
            value={formData.maxCount} 
            onChange={handleChange} 
          />
        </div>
      </div>

      <div className={styles.inputGroup}>
        <label>레벨</label>
        <select 
          className={styles.input} 
          name="level" 
          value={formData.level} 
          onChange={handleChange}
          style={{ background: '#f2f4f6', cursor: 'pointer' }}
        >
          {['All', 'Basic', 'Trainning', 'Intermediate', 'Advanced', 'Very-Advanced'].map(l => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      </div>

      <div className={styles.inputGroup}>
        <label>수업 설명</label>
        <textarea 
          className={`${styles.input} ${styles.textarea}`} 
          name="description" 
          value={formData.description} 
          onChange={handleChange} 
          placeholder="간략한 설명" 
        />
      </div>

      {/* 4. Optional Structured Curriculum */}
      <div className={styles.inputGroup}>
        <div className={styles.checkboxGroup}>
          <input 
            type="checkbox" 
            id="hasCur" 
            checked={hasCurriculum} 
            onChange={(e) => setHasCurriculum(e.target.checked)} 
          />
          <label htmlFor="hasCur" style={{ color: '#191f28', cursor: 'pointer', margin: 0 }}>커리큘럼 설정하기</label>
        </div>
        
        {hasCurriculum && (
          <div className={styles.curriculumContainer}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem', gap: '0.5rem' }}>
              <button className={styles.textBtn} onClick={addCurriculumWeek}>+ 내용 추가</button>
              <button className={styles.textBtn} onClick={removeCurriculumWeek} style={{ color: '#ef4444' }}>- 삭제</button>
            </div>
            
            <div className={styles.curriculumGrid}>
              {curriculumWeeks.map((text, index) => (
                <div key={index} className={styles.curriculumRow}>
                  <span className={styles.weekLabel}>{index + 1}주차</span>
                  <input 
                    className={styles.input} 
                    value={text} 
                    onChange={(e) => handleCurriculumChange(index, e.target.value)} 
                    placeholder="해당 주차의 수업 내용 입력"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <button className={styles.submitBtn} onClick={handleSubmit}>
        {initialData ? '수정 완료' : '수업 등록하기'}
      </button>
    </div>
  );
}

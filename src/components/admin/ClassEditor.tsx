'use client';

import React, { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import styles from './ClassEditor.module.css';
import { uploadFile } from '@/lib/storage';
import { TangoClass, CURRENT_REGISTRATION_MONTH } from '@/lib/db';

interface ClassEditorProps {
  initialData?: Partial<TangoClass>;
  onSave: (data: Omit<TangoClass, 'id'> | Partial<TangoClass>) => void;
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
    leaderCount: typeof initialData?.leaderCount === 'number' ? initialData.leaderCount : 0,
    followerCount: typeof initialData?.followerCount === 'number' ? initialData.followerCount : 0,
    maxCount: typeof initialData?.maxCount === 'number' ? initialData.maxCount : 15,
    targetMonth: initialData?.targetMonth || CURRENT_REGISTRATION_MONTH,
  });

  const [dates, setDates] = useState<string[]>(
    (initialData?.dates && initialData.dates.length > 0) ? initialData.dates : ['', '', '', '']
  );
  let extractedStart = '20:00';
  let extractedEnd = '21:30';
  if (initialData?.timeStr) {
    const parts = initialData.timeStr.split('-');
    if (parts[0]) extractedStart = parts[0].trim().padStart(5, '0');
    if (parts[1]) extractedEnd = parts[1].trim().padStart(5, '0');
  } else if (initialData?.time) {
    // Robust regex for time range (e.g. "20:00~21:30" or "20:00 - 21:30")
    const match = initialData.time.match(/(\d{1,2}:\d{2})\s*[:\-\~]\s*(\d{1,2}:\d{2})/);
    if (match) {
      extractedStart = match[1].padStart(5, '0');
      extractedEnd = match[2].padStart(5, '0');
    }
  }

  const [startTime, setStartTime] = useState(extractedStart);
  const [endTime, setEndTime] = useState(extractedEnd);
  
  const [hasCurriculum, setHasCurriculum] = useState(!!initialData?.curriculum);
  const [curriculumWeeks, setCurriculumWeeks] = useState<string[]>(
    (initialData?.curriculum && typeof initialData.curriculum === 'string')
      ? initialData.curriculum.split('\n\n').map((s: string) => s.replace(/^\d+주차:\n/, '')) 
      : ['', '', '', '']
  );
  
  const { currentUser } = useAuth();
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [imageUploadProgress, setImageUploadProgress] = useState(0);
  const [isVideoUploading, setIsVideoUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove "원" and any non-numeric characters before formatting
    const rawValue = e.target.value.replace(/[^0-9]/g, '');
    if (!rawValue) {
      setFormData(prev => ({ ...prev, price: '' }));
      return;
    }
    // Re-format to KRW with comma and single "원" suffix
    const formatted = parseInt(rawValue, 10).toLocaleString('ko-KR') + '원';
    setFormData(prev => ({ ...prev, price: formatted }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!currentUser) {
      alert('로그인이 필요합니다.');
      return;
    }

    setIsImageUploading(true);
    setImageUploadProgress(0);

    try {
      const { compressImage } = await import('@/lib/image-utils');
      // Compress to max 1600px for class images
      const optimizedBlob = await compressImage(file, { maxWidth: 1600, maxHeight: 1600, quality: 0.8 });

      const path = `classes/${currentUser.uid}/${Date.now()}_${file.name}`;
      const url = await uploadFile(optimizedBlob, path, {
        onProgress: (progress) => setImageUploadProgress(progress)
      });
      setFormData(prev => ({ ...prev, imageUrl: url }));
      alert("이미지가 성공적으로 업로드되었습니다!");
    } catch (error: any) {
      console.error("Image upload failed", error);
      alert(error.message || "이미지 업로드 중 오류가 발생했습니다.");
    } finally {
      setIsImageUploading(false);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!currentUser) {
      alert('로그인이 필요합니다.');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      alert('동영상 파일이 너무 큽니다. (최대 50MB)');
      return;
    }

    setIsVideoUploading(true);
    setUploadProgress(0);

    const timeoutId = setTimeout(() => {
      // access the state indirectly via the current snapshot value if possible, 
      // but since we are in an async function, we'll check the local state variable
      // (Note: uploadProgress might be stale here if we don't handle it carefully, but it's a UI alert)
      if (isVideoUploading) {
        alert("업로드가 시작되지 않습니다 (0%).\n\n확인 필요:\n1. Firebase Storage 규칙에서 'allow read, write: if true' 설정이 되어있나요?\n2. Vercel 환경변수(Storage Bucket)가 정확한지 확인해주세요.");
      }
    }, 15000);

    try {
      // 1. Double check auth - if not authed, try to sign in anonymously
      let uploadUID = currentUser?.uid;
      if (!uploadUID) {
        const { signInAnonymously } = await import('firebase/auth');
        const { auth } = await import('@/lib/firebase');
        const userCredential = await signInAnonymously(auth);
        uploadUID = userCredential.user.uid;
        console.log("Signed in anonymously for video upload:", uploadUID);
      }

      const path = `videos/${uploadUID}/${Date.now()}_${file.name}`;
      const url = await uploadFile(file, path, {
        onProgress: (progress) => setUploadProgress(progress)
      });
      setFormData(prev => ({ ...prev, videoUrl: url }));
      alert("동영상이 성공적으로 업로드되었습니다!");
    } catch (error: any) {
      console.error("Video upload failed", error);
      alert(error.message || "동영상 업로드 중 오류가 발생했습니다.");
    } finally {
      clearTimeout(timeoutId);
      setIsVideoUploading(false);
    }
  };

  const handleDateChange = (index: number, value: string) => {
    const newDates = [...dates];
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
        .map((text, i) => {
          const trimmed = text.trim();
          if (!trimmed) return '';
          // Ensure each week is separate, but allow line breaks WITHIN the week
          return `${i+1}주차:\n${trimmed}`;
        })
        .filter(Boolean)
        .join('\n\n');
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
      
      {/* 0. Target Month Selection */}
      <div className={styles.inputGroup}>
        <label style={{ color: '#3182f6', fontWeight: 600 }}>대상 월 (해당 월의 수업 목록에 노출됩니다)</label>
        <select 
          className={styles.input} 
          name="targetMonth" 
          value={formData.targetMonth} 
          onChange={handleChange}
          style={{ border: '1px solid #e5e8eb' }}
        >
          {Array.from({ length: 12 }, (_, i) => {
            const d = new Date(2026, i, 1);
            const val = d.toISOString().substring(0, 7);
            return <option key={val} value={val}>{d.getFullYear()}년 {i + 1}월</option>;
          })}
        </select>
      </div>
      
      {/* 1. Image Upload */}
      <div className={styles.inputGroup}>
        <label>대표 이미지 업로드</label>
        <div 
          className={styles.imageUploadBox}
          onClick={() => fileInputRef.current?.click()}
        >
          {isImageUploading ? (
            <span>업로드 중...</span>
          ) : formData.imageUrl ? (
            <img src={formData.imageUrl} alt="수업 대표 이미지 미리보기" className={styles.imagePreview} />
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
          {isVideoUploading ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                {uploadProgress < 100 ? `동영상 업로드 중... (${uploadProgress}%)` : '파일 처리 중...'}
              </div>
              <div style={{ width: '200px', height: '6px', background: '#f2f4f6', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${uploadProgress}%`, height: '100%', background: '#3182f6', transition: 'width 0.3s ease' }}></div>
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
          <span style={{ fontWeight: 400, color: '#8b95a1' }}>~</span>
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
          <label>리더 인원</label>
          <input 
            type="number" 
            className={styles.input} 
            name="leaderCount" 
            value={formData.leaderCount} 
            onChange={handleChange} 
          />
        </div>
        <div className={styles.inputGroup} style={{ flex: 1 }}>
          <label>팔로워 인원</label>
          <input 
            type="number" 
            className={styles.input} 
            name="followerCount" 
            value={formData.followerCount} 
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
                  <textarea 
                    className={`${styles.input} ${styles.textarea}`} 
                    value={text} 
                    onChange={(e) => handleCurriculumChange(index, e.target.value)} 
                    placeholder="해당 주차의 수업 내용 입력 (줄바꿈 가능)"
                    rows={2}
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

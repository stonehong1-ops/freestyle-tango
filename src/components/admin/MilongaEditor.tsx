'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './MilongaEditor.module.css';
import { MilongaInfo, getMilongaInfo, updateMilongaInfo } from '@/lib/db';
import { uploadFile } from '@/lib/storage';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

export default function MilongaEditor({ onClose, isNew, initialDate }: { onClose?: () => void, isNew?: boolean, initialDate?: string }) {
  const { t } = useLanguage();
  const { currentUser, loading: authLoading, error: authError } = useAuth();
  const [formData, setFormData] = useState<Partial<MilongaInfo>>({
    posterUrl: '',
    sourcePhotoUrl: '',
    message: '',
    activeDate: initialDate || new Date().toISOString().split('T')[0],
    djName: 'Stone',
    timeInfo: '20:00 - 00:00',
    startTime: '20:00',
    endTime: '00:00'
  });

  const DEFAULT_PHOTO = '/images/posters/default_milonga.png';

  const [id, setId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(!isNew);
  const [debugStatus, setDebugStatus] = useState<string>('');
  const [isImageProcessing, setIsImageProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [sourcePhotoUrl, setSourcePhotoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isNew) {
      setIsLoading(false);
      return;
    }
    const fetchData = async (targetDate?: string) => {
      try {
        const dateToFetch = targetDate || formData.activeDate;
        const data = await getMilongaInfo(dateToFetch);
        if (data) {
          setFormData(data);
          setId(data.id || null);
          const dj = data.djName || 'Stone';
          const start = data.startTime || '20:00';
          const end = data.endTime || '00:00';
          const time = `${start} - ${end}`;
          generatePoster(data.sourcePhotoUrl || DEFAULT_PHOTO, data.activeDate || '', dj, time);
        } else {
          // Reset to defaults for new date
          const dj = 'Stone';
          const start = '20:00';
          const end = '00:00';
          const time = `${start} - ${end}`;
          
          setFormData(prev => ({
            ...prev,
            activeDate: dateToFetch || prev.activeDate,
            posterUrl: '',
            sourcePhotoUrl: '',
            message: prev.message,
            djName: dj,
            startTime: start,
            endTime: end,
            timeInfo: time
          }));
          setId(null);
          generatePoster(DEFAULT_PHOTO, dateToFetch || '', dj, time);
        }
      } catch (error) {
        console.error("Fetch Milonga Info Error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [isNew]);

  const generatePoster = (photoSrc: string, dateStr: string, dj: string, time: string) => {
    if (!photoSrc) return;
    setIsImageProcessing(true);
    setDebugStatus('Generating...');
    
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = photoSrc;
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const canvasW = 800;
        const canvasH = 1120;
        canvas.width = canvasW;
        canvas.height = canvasH;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setIsImageProcessing(false);
          setDebugStatus('Ctx Failed');
          return;
        }

        // 1. Background (White)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvasW, canvasH);

        // Utility
        const drawText = (text: string, x: number, y: number, font: string, color: string, align: 'left' | 'center' | 'right' = 'left', letterSpacing = 0) => {
          ctx.font = font;
          ctx.textAlign = align;
          ctx.textBaseline = 'top';
          ctx.fillStyle = color;
          
          if (letterSpacing > 0 && 'letterSpacing' in ctx) {
            (ctx as any).letterSpacing = `${letterSpacing}px`;
          } else if ('letterSpacing' in ctx) {
            (ctx as any).letterSpacing = '0px';
          }
          
          ctx.fillText(text, x, y);
        };

        const premiumFont = "'Outfit', 'Inter', -apple-system, sans-serif";
        const mainColor = '#111111';
        const grayColor = '#555555';
        const accentColor = '#ce2b5b'; // Deep elegant red/pink for contrast on white

        // =======================
        // TOP SECTION (0 ~ 280)
        // =======================
        // Title (Larger)
        drawText("milonga LUCY", canvasW / 2, 50, `300 100px ${premiumFont}`, mainColor, 'center', 4);
        
        // Sub-info
        drawText('every Sunday', canvasW / 2, 160, `300 38px ${premiumFont}`, grayColor, 'center', 2);
        drawText(`${time} | 13,000won`, canvasW / 2, 208, `400 34px ${premiumFont}`, grayColor, 'center');

        // =======================
        // MIDDLE SECTION: PHOTO (260 ~ 800 -> h=540)
        // =======================
        const photoY = 260;
        const photoH = 540;
        
        ctx.save();
        ctx.rect(0, photoY, canvasW, photoH);
        ctx.clip();
        
        const imgRatio = img.width / img.height;
        const targetRatio = canvasW / photoH;
        let drawW, drawH, drawX, drawY;
        if (imgRatio > targetRatio) {
          drawH = photoH;
          drawW = img.width * (photoH / img.height);
          drawX = (canvasW - drawW) / 2;
          drawY = photoY;
        } else {
          drawW = canvasW;
          drawH = img.height * (canvasW / img.width);
          drawX = 0;
          drawY = photoY + (photoH - drawH) / 2;
        }
        ctx.drawImage(img, drawX, drawY, drawW, drawH);
        ctx.restore();

        // =======================
        // BOTTOM SECTION (800 ~ 1120)
        // =======================
        // Date Logic
        let displayDate = 'TBD';
        let dayName = 'SUN';
        if (dateStr) {
          const d = new Date(dateStr + 'T00:00:00'); 
          displayDate = `${d.getMonth() + 1}.${d.getDate()}`;
          const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
          dayName = dayNames[d.getDay()] || 'SUN';
        }

        // Distinct Date & DJ
        const bottomY = 820;
        
        // DJ
        drawText(`with DJ ${dj || 'Stone'}`, canvasW / 2, bottomY + 30, `bold 42px ${premiumFont}`, accentColor, 'center');
        
        // Date
        drawText(`${displayDate} ${dayName}`, canvasW / 2, bottomY + 90, `bold 84px ${premiumFont}`, mainColor, 'center');

        // Address & Staff at the VERY bottom
        const footerY = canvasH - 80;
        drawText('서울 마포구양화로3길 55 어반오아시스빌딩 B2 프리스타일탱고', canvasW / 2, footerY, `400 18px ${premiumFont}`, grayColor, 'center');
        drawText('스톤 010.7209.2468', canvasW / 2, footerY + 28, `400 18px ${premiumFont}`, '#888888', 'center');

        const finalDataUrl = canvas.toDataURL('image/jpeg', 0.92);
        setFormData(prev => ({ ...prev, posterUrl: finalDataUrl }));
        setIsImageProcessing(false);
        setDebugStatus('Success');
      } catch (err) {
        console.error("Canvas Error:", err);
        setIsImageProcessing(false);
        setDebugStatus('Error: ' + (err as Error).message);
      }
    };
    
    img.onerror = () => {
      setIsImageProcessing(false);
      setDebugStatus('Image Load Failed');
    };
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      setFormData(prev => ({ ...prev, sourcePhotoUrl: dataUrl }));
      setSourcePhotoUrl(dataUrl);
      const time = `${formData.startTime || '20:00'} - ${formData.endTime || '00:00'}`;
      generatePoster(dataUrl, formData.activeDate || '', formData.djName || 'Stone', time);
    };
    reader.readAsDataURL(file);
  };

  // Removed internal download button as per user request

  // Helper function to upload either a Data URL or a File/Blob using the common utility
  const uploadToStorage = async (input: string | File | Blob, path: string) => {
    return await uploadFile(input, path, {
      onProgress: (progress) => setUploadProgress(progress)
    });
  };

  const handleSubmit = async () => {
    if (authLoading) {
      alert('서버 연결 중입니다. 잠시만 기다려 주세요.');
      return;
    }

    if (!currentUser) {
      alert(`서버 연결에 실패했습니다: ${authError || 'Unknown Error'}\n페이지를 새로고침해 주세요.`);
      return;
    }

    if (!formData.activeDate) {
      alert('진행 일자를 선택해주세요.');
      return;
    }

    if (isSaving) return;

    setIsSaving(true);
    setUploadProgress(0);
    setDebugStatus('준비 중...');
    
    try {
      let finalSourceUrl = formData.sourcePhotoUrl || '';
      let finalPosterUrl = formData.posterUrl || '';

      const dateTag = formData.activeDate;
      const timestamp = Date.now();

      // 1. Source Photo Upload
      if (finalSourceUrl && finalSourceUrl.startsWith('data:')) {
        setDebugStatus('사진 업로드 중 (1/2)...');
        finalSourceUrl = await uploadToStorage(finalSourceUrl, `milongas/source/${dateTag}_${timestamp}.jpg`);
      }

      // 2. Poster Upload
      if (finalPosterUrl && finalPosterUrl.startsWith('data:')) {
        setDebugStatus('포스터 업로드 중 (2/2)...');
        finalPosterUrl = await uploadToStorage(finalPosterUrl, `milongas/posters/${dateTag}_${timestamp}.jpg`);
      }

      const timeInfo = `${formData.startTime || '20:00'} - ${formData.endTime || '00:00'}`;
      
      const dataToSave = { 
        ...formData, 
        id,
        timeInfo,
        sourcePhotoUrl: finalSourceUrl,
        posterUrl: finalPosterUrl
      };

      // 3. Firestore Sync
      setDebugStatus('데이터베이스에 저장 중...');
      await updateMilongaInfo(dataToSave as MilongaInfo);
      
      setDebugStatus('저장 완료!');
      console.log(`[Save] Registration successful for ${dateTag} by ${currentUser?.uid}`);
      alert('밀롱가 정보와 포스터가 성공적으로 저장 및 게시되었습니다.');
      window.dispatchEvent(new Event('ft_milonga_updated'));
      if (onClose) onClose();
    } catch (e: any) {
      console.error("Submit Error:", e);
      alert(`저장 중 오류가 발생했습니다: \n${e.message || String(e)}`);
    } finally {
      setIsSaving(false);
      setUploadProgress(0);
      setDebugStatus('');
    }
  };


  if (isLoading) return <div className={styles.loading}>로딩 중...</div>;

  return (
    <div className={styles.container}>
      {/* Basic Info Section - Moved to Top */}
      <div className={styles.row}>
        <div className={styles.inputGroup} style={{ flex: 1 }}>
          <label>밀롱가 진행 일자</label>
          <input 
            type="date" 
            className={styles.input} 
            name="activeDate"
            value={formData.activeDate || ''}
            onChange={async (e) => {
              const newDate = e.target.value;
              setIsLoading(true);
              const data = await getMilongaInfo(newDate);
              const dj = data?.djName || 'Stone';
              const start = data?.startTime || '20:00';
              const end = data?.endTime || '00:00';
              const time = `${start} - ${end}`;

              if (data) {
                setFormData(data);
                setId(data.id || null);
                generatePoster(data.sourcePhotoUrl || DEFAULT_PHOTO, newDate, dj, time);
              } else {
                setFormData(prev => ({
                  ...prev,
                  activeDate: newDate,
                  posterUrl: '',
                  sourcePhotoUrl: '',
                  djName: dj,
                  startTime: start,
                  endTime: end,
                  timeInfo: time
                }));
                setId(null);
                generatePoster(DEFAULT_PHOTO, newDate, dj, time);
              }
              setIsLoading(false);
            }}
          />
        </div>
        
        <div className={styles.inputGroup} style={{ flex: 1 }}>
          <label>DJ 이름</label>
          <input 
            type="text" 
            className={styles.input} 
            placeholder="예: Stone"
            value={formData.djName || ''}
            onChange={(e) => {
              const newDj = e.target.value;
              setFormData(prev => ({ ...prev, djName: newDj }));
              const photo = sourcePhotoUrl || formData.sourcePhotoUrl;
              const time = `${formData.startTime || '20:00'} - ${formData.endTime || '00:00'}`;
              if (photo) generatePoster(photo, formData.activeDate || '', newDj, time);
            }}
          />
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.inputGroup} style={{ flex: 1 }}>
          <label>{t.startTime}</label>
          <input 
            type="time" 
            className={styles.input} 
            value={formData.startTime || '20:00'}
            onChange={(e) => {
              const newStart = e.target.value;
              setFormData(prev => ({ ...prev, startTime: newStart }));
              const photo = sourcePhotoUrl || formData.sourcePhotoUrl;
              const time = `${newStart} - ${formData.endTime || '00:00'}`;
              if (photo) generatePoster(photo, formData.activeDate || '', formData.djName || 'Stone', time);
            }}
          />
        </div>
        <div className={styles.inputGroup} style={{ flex: 1 }}>
          <label>{t.endTime}</label>
          <input 
            type="time" 
            className={styles.input} 
            value={formData.endTime || '00:00'}
            onChange={(e) => {
              const newEnd = e.target.value;
              setFormData(prev => ({ ...prev, endTime: newEnd }));
              const photo = sourcePhotoUrl || formData.sourcePhotoUrl;
              const time = `${formData.startTime || '20:00'} - ${newEnd}`;
              if (photo) generatePoster(photo, formData.activeDate || '', formData.djName || 'Stone', time);
            }}
          />
        </div>
      </div>

      <div className={styles.inputGroup}>
        <label>앱 하단 공지 메시지 (선택 사항)</label>
        <textarea 
          className={`${styles.input} ${styles.textarea}`} 
          name="message" 
          value={formData.message} 
          onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))} 
          placeholder="공지 사항을 입력하세요..."
          rows={3}
        />
      </div>

      {/* Image Upload Section - Moved to Bottom */}
      <div className={styles.inputGroup}>
        <label>밀롱가 DJ 사진 (포스터 자동 생성)</label>
        <div 
          className={styles.imageUploadBox}
          onClick={() => fileInputRef.current?.click()}
        >
          {isImageProcessing ? (
            <div className={styles.processingOverlay}>
               <span>{debugStatus || 'Generating...'}</span>
            </div>
          ) : formData.posterUrl ? (
            <img src={formData.posterUrl} alt="포스터 미리보기" className={styles.imagePreview} />
          ) : (
            <div className={styles.placeholder}>
              <span className={styles.plus}>+</span>
              <span>DJ 사진을 업로드하세요</span>
            </div>
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

      {(isSaving || uploadProgress > 0) && (
        <div className={styles.statusContainer}>
          <div className={styles.statusText}>
            <span>{debugStatus || '저장 중...'}</span>
            <span>{Math.round(uploadProgress)}%</span>
          </div>
          <div className={styles.progressBarTrack}>
            <div 
              className={styles.progressBarFill} 
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      <div className={styles.footerActions}>
        <button className={styles.cancelBtn} onClick={onClose} disabled={isSaving}>
          취소
        </button>
        <button 
          className={styles.submitBtn} 
          onClick={handleSubmit}
          disabled={isImageProcessing || isSaving}
        >
          {isSaving ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
               <span className={styles.spinner}></span> {debugStatus || '저장 중...'}
            </span>
          ) : isImageProcessing ? '포스터 생성 중...' : '밀롱가 정보 저장 & 게시'}
        </button>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import styles from './ExtraScheduleEditor.module.css';
import { useLanguage } from '@/contexts/LanguageContext';
import { addExtraSchedule, updateExtraSchedule, ExtraSchedule } from '@/lib/db';

interface ExtraScheduleEditorProps {
  initialData?: ExtraSchedule | null;
  defaultDate?: string;
  onClose: () => void;
  onSave: () => void;
}

export default function ExtraScheduleEditor({ initialData, defaultDate, onClose, onSave }: ExtraScheduleEditorProps) {
  const { t, language } = useLanguage();
  const getInitialTimes = () => {
    if (initialData?.startTime && initialData?.endTime) {
      return { startTime: initialData.startTime, endTime: initialData.endTime };
    }
    if (initialData?.time) {
      const parts = initialData.time.split(' - ');
      if (parts.length === 2) {
        return { startTime: parts[0], endTime: parts[1] };
      }
      return { startTime: initialData.time, endTime: initialData.time };
    }
    return { startTime: '19:00', endTime: '21:00' };
  };

  const initialTimes = getInitialTimes();

  const [formData, setFormData] = useState<Partial<ExtraSchedule>>(initialData ? {
    ...initialData,
    ...initialTimes
  } : {
    title: '',
    date: defaultDate || new Date().toISOString().split('T')[0],
    ...initialTimes,
    time: `${initialTimes.startTime} - ${initialTimes.endTime}`,
    memo: ''
  });


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.date || !formData.startTime || !formData.endTime) {
      alert(language === 'ko' ? '제목, 날짜, 시작시간, 종료시간은 필수입니다.' : 'Title, Date, Start Time, and End Time are required.');
      return;
    }

    // Combine startTime and endTime into the legacy 'time' field for display/compatibility
    const combinedTime = `${formData.startTime} - ${formData.endTime}`;
    const dataToSave = { ...formData, time: combinedTime };

    try {
      if (initialData?.id) {
        await updateExtraSchedule(initialData.id, dataToSave);
      } else {
        await addExtraSchedule(dataToSave as Omit<ExtraSchedule, 'id'>);
      }
      onSave();
    } catch (err) {
      console.error('Error saving extra schedule:', err);
      alert('Error saving schedule');
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.field}>
        <label>{language === 'ko' ? '제목' : 'Title'}</label>
        <input 
          type="text" 
          value={formData.title} 
          onChange={e => setFormData({...formData, title: e.target.value})}
          placeholder={language === 'ko' ? '일정 제목을 입력하세요' : 'Enter schedule title'}
        />
      </div>

      <div className={styles.grid}>
        <div className={styles.field}>
          <label>{language === 'ko' ? '날짜' : 'Date'}</label>
          <input 
            type="date" 
            value={formData.date} 
            onChange={e => setFormData({...formData, date: e.target.value})}
          />
        </div>
        <div className={styles.field}>
          <div className={styles.timeInputs}>
            <div className={styles.timeSubField}>
              <label>{language === 'ko' ? '시작' : 'Start'}</label>
              <input 
                type="time" 
                value={formData.startTime} 
                onChange={e => setFormData({...formData, startTime: e.target.value})}
              />
            </div>
            <div className={styles.timeSubField}>
              <label>{language === 'ko' ? '종료' : 'End'}</label>
              <input 
                type="time" 
                value={formData.endTime} 
                onChange={e => setFormData({...formData, endTime: e.target.value})}
              />
            </div>
          </div>
        </div>
      </div>

      <div className={styles.field}>
        <label>{language === 'ko' ? '메모' : 'Memo'}</label>
        <textarea 
          value={formData.memo} 
          onChange={e => setFormData({...formData, memo: e.target.value})}
          placeholder={language === 'ko' ? '추가 정보나 메모를 입력하세요' : 'Enter additional info or memo'}
          rows={3}
        />
      </div>


      <div className={styles.actions}>
        <button type="button" className={styles.cancelBtn} onClick={onClose}>
          {language === 'ko' ? '취소' : 'Cancel'}
        </button>
        <button type="submit" className={styles.saveBtn}>
          {language === 'ko' ? '저장' : 'Save'}
        </button>
      </div>
    </form>
  );
}

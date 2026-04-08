import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import styles from './StayTemplateEditor.module.css';

interface TemplatesMap {
  [stayId: string]: {
    [type: string]: string;
  };
}

const DEFAULT_TEMPLATES: TemplatesMap = {
  hapjeong: {
    checkin_3d: "[Tango Stay 합정] 안녕하세요 {name}님, 3일 후 입실 안내드립니다. 주소: 마포구... 비밀번호: ...",
    checkin_day: "[Tango Stay 합정] 안녕하세요 {name}님, 오늘 입실일입니다! 체크인 시간은 오후 3시입니다.",
    checkout_1d: "[Tango Stay 합정] 안녕하세요 {name}님, 내일 퇴실 안내드립니다. 분리수거 부탁드리며...",
    checkout_day: "[Tango Stay 합정] {name}님, 그동안 이용해주셔서 감사합니다. 퇴실 처리가 완료되었습니다."
  },
  deokeun: {
    checkin_3d: "[Tango Stay 덕은] 안녕하세요 {name}님, 3일 후 입실 안내드립니다. 주소: 덕양구... 비밀번호: ...",
    checkin_day: "[Tango Stay 덕은] 안녕하세요 {name}님, 오늘 입실일입니다! 체크인 시간은 오후 3시입니다.",
    checkout_1d: "[Tango Stay 덕은] 안녕하세요 {name}님, 내일 퇴실 안내드립니다. 분리수거 부탁드리며...",
    checkout_day: "[Tango Stay 덕은] {name}님, 그동안 이용해주셔서 감사합니다. 퇴실 처리가 완료되었습니다."
  }
};

interface Props {
  onClose: () => void;
  language: string;
}

export default function StayTemplateEditor({ onClose, language }: Props) {
  const [templates, setTemplates] = useState<TemplatesMap>(DEFAULT_TEMPLATES);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'hapjeong' | 'deokeun'>('hapjeong');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const docRef = doc(db, 'admin_settings', 'stay_sms_templates');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        setTemplates(snap.data() as TemplatesMap);
      }
    } catch (err) {
      console.error("Error fetching templates:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await setDoc(doc(db, 'admin_settings', 'stay_sms_templates'), templates);
      alert(language === 'ko' ? '저장되었습니다.' : 'Saved successfully.');
      onClose();
    } catch (err) {
      console.error("Error saving templates:", err);
      alert('Error saving.');
    }
  };

  const handleChange = (stayId: string, type: string, value: string) => {
    setTemplates(prev => ({
      ...prev,
      [stayId]: {
        ...prev[stayId],
        [type]: value
      }
    }));
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;

  return (
    <div className={styles.editorContainer}>
      <div className={styles.editorTabs}>
        <button 
          className={`${styles.editorTabBtn} ${activeTab === 'hapjeong' ? styles.active : ''}`}
          onClick={() => setActiveTab('hapjeong')}
        >
          {language === 'ko' ? '합정' : 'Hapjeong'}
        </button>
        <button 
          className={`${styles.editorTabBtn} ${activeTab === 'deokeun' ? styles.active : ''}`}
          onClick={() => setActiveTab('deokeun')}
        >
          {language === 'ko' ? '덕은' : 'Deokeun'}
        </button>
      </div>

      <div className={styles.editorBody}>
        <p className={styles.placeholderHint}>
          {language === 'ko' ? '* 예약 정보 자동 치환: {name}, {checkIn}, {checkOut} 등을 입력하세요.' : '* Placeholders: {name}, {checkIn}, {checkOut}'}
        </p>

        <label className={styles.editorLabel}>{language === 'ko' ? '입실 3일전 문자' : '3d before Check-in'}</label>
        <textarea 
          className={styles.editorTextarea}
          value={templates[activeTab]?.checkin_3d || ''}
          onChange={(e) => handleChange(activeTab, 'checkin_3d', e.target.value)}
        />

        <label className={styles.editorLabel}>{language === 'ko' ? '입실 당일 문자' : 'Check-in Day'}</label>
        <textarea 
          className={styles.editorTextarea}
          value={templates[activeTab]?.checkin_day || ''}
          onChange={(e) => handleChange(activeTab, 'checkin_day', e.target.value)}
        />

        <label className={styles.editorLabel}>{language === 'ko' ? '퇴실 하루전 문자' : '1d before Check-out'}</label>
        <textarea 
          className={styles.editorTextarea}
          value={templates[activeTab]?.checkout_1d || ''}
          onChange={(e) => handleChange(activeTab, 'checkout_1d', e.target.value)}
        />

        <label className={styles.editorLabel}>{language === 'ko' ? '퇴실 문자' : 'Check-out Day'}</label>
        <textarea 
          className={styles.editorTextarea}
          value={templates[activeTab]?.checkout_day || ''}
          onChange={(e) => handleChange(activeTab, 'checkout_day', e.target.value)}
        />
      </div>

      <div className={styles.editorActions}>
        <button className={styles.cancelBtn} onClick={onClose}>
          {language === 'ko' ? '취소' : 'Cancel'}
        </button>
        <button className={styles.saveBtn} onClick={handleSave}>
          {language === 'ko' ? '저장하기' : 'Save'}
        </button>
      </div>
    </div>
  );
}

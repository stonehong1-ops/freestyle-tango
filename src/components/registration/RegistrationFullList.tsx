'use client';

import React, { useState } from 'react';
import { TangoClass, Registration } from '@/lib/db';
import { useLanguage } from '@/contexts/LanguageContext';
import styles from './RegistrationFullList.module.css';
import { useModalHistory } from '@/hooks/useModalHistory';

interface Props {
  classes: TangoClass[];
  registrations: Registration[];
  selectedMonth: string;
  availableMonths: string[];
  onMonthChange: (month: string) => void;
  isAdmin: boolean;
  onClose: () => void;
}

const getRegTypeLabel = (type?: string) => {
  if (!type) return '개별수강';
  // If it's one of the specific payment options, return it as is
  return type;
};

export default function RegistrationFullList({ classes, registrations, selectedMonth, availableMonths, onMonthChange, isAdmin }: Props) {
  const { t, language } = useLanguage();
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);

  useModalHistory(!!selectedReg, () => setSelectedReg(null), 'regDetail');

  // Filter registrations for the selected month
  const monthRegistrations = registrations.filter(r => (r.month || r.date?.substring(0, 7)) === selectedMonth);

  const leaders = monthRegistrations.filter(r => r.role === 'leader');
  const followers = monthRegistrations.filter(r => r.role === 'follower');

  const getClassesForReg = (reg: Registration) => {
    return classes.filter(c => reg.classIds.includes(c.id));
  };

  const groupClassesByDay = (regClasses: TangoClass[]) => {
    const grouped: { [key: string]: TangoClass[] } = {};
    regClasses.forEach(c => {
      // Extract day from time string (e.g., "월요일 19:30")
      const dayMatch = c.time.match(/([월화수목금토일])요일/);
      const day = dayMatch ? dayMatch[1] : '기타';
      
      if (!grouped[day]) grouped[day] = [];
      grouped[day].push(c);
    });
    return grouped;
  };

  const renderDetailModal = () => {
    if (!selectedReg) return null;

    const regClasses = getClassesForReg(selectedReg);
    const grouped = groupClassesByDay(regClasses);
    const dayNames = t.home.registration.daysFull || ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '기타'];

    const handleTypeChange = async (newType: string) => {
      if (!selectedReg) return;
      try {
        const { updateRegistration } = await import('@/lib/db');
        await updateRegistration(selectedReg.id, { type: newType });
        setSelectedReg({ ...selectedReg, type: newType });
        window.dispatchEvent(new Event('ft_registrations_updated'));
      } catch (e) {
        alert('유형 변경 중 오류가 발생했습니다.');
      }
    };

    const handleStatusChange = async (newStatus: 'waiting' | 'paid') => {
      if (!selectedReg) return;
      try {
        const { updateRegistration } = await import('@/lib/db');
        const updates: any = { status: newStatus };
        if (newStatus === 'paid' && !selectedReg.paidAt) {
          updates.paidAt = new Date().toISOString();
        }
        await updateRegistration(selectedReg.id, updates);
        setSelectedReg({ ...selectedReg, ...updates });
        window.dispatchEvent(new Event('ft_registrations_updated'));
      } catch (e) {
        alert('상태 변경 중 오류가 발생했습니다.');
      }
    };

    return (
      <div className={styles.modalOverlay} onClick={() => setSelectedReg(null)}>
        <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
          <div className={styles.modalHeader}>
            <h2>{selectedReg.nickname}님의 신청 상세</h2>
            <button className={styles.closeBtn} onClick={() => setSelectedReg(null)}>×</button>
          </div>
          
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.label}>구분:</span>
              <span className={styles.value}>{getRegTypeLabel(selectedReg.type)}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>연락처:</span>
              <span className={styles.value}>{selectedReg.phone}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>역할:</span>
              <span className={styles.value}>{selectedReg.role === 'leader' ? '리더' : '팔로워'}</span>
            </div>
            {selectedReg.amount !== undefined && (
              <div className={styles.infoItem}>
                <span className={styles.label}>금액:</span>
                <span className={styles.value}>{selectedReg.amount.toLocaleString()}원</span>
              </div>
            )}
            <div className={styles.infoItem}>
              <span className={styles.label}>신청일:</span>
              <span className={styles.value}>{new Date(selectedReg.date).toLocaleDateString()}</span>
            </div>
          </div>

          <div className={styles.classesSection}>
            <h3>신청 수업 목록</h3>
            {Object.keys(grouped).length === 0 ? (
              <p className={styles.noData}>신청한 수업이 없습니다.</p>
            ) : (
              <div className={styles.dayGroups}>
                {['월', '화', '수', '목', '금', '토', '일', '기타'].map(day => {
                  if (!grouped[day]) return null;
                  return (
                    <div key={day} className={styles.dayGroup}>
                      <h4 className={styles.dayTitle}>{day}요일</h4>
                      <ul className={styles.classList}>
                        {grouped[day].map(c => (
                          <li key={c.id} className={styles.classItem}>
                            <span className={styles.className}>{c.title}</span>
                            <span className={styles.classTime}>{c.timeStr}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    );
  };

  const renderTable = (list: Registration[], title: string) => (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>{title}</h3>
      <div className={styles.adminTableWrapper}>
        <table className={styles.adminTable}>
          <thead>
            <tr>
              <th style={{ width: '25%' }}>{t.home.registration.nickname}</th>
              <th style={{ width: '20%', textAlign: 'center' }}>{language === 'ko' ? '수업수' : 'Classes'}</th>
              <th style={{ width: '55%' }}>{language === 'ko' ? '신청 유형' : 'Type'}</th>
            </tr>
          </thead>
          <tbody>
            {list.length > 0 ? (
              list.map(reg => (
                <tr key={reg.id}>
                  <td 
                    className={styles.clickableName} 
                    onClick={() => setSelectedReg(reg)}
                  >
                    {reg.nickname}
                  </td>
                  <td style={{ textAlign: 'center' }}>{reg.classIds?.length || 0}</td>
                  <td>{getRegTypeLabel(reg.type)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} style={{ textAlign: 'center', padding: '20px' }}>
                  {t.home.registration.noData || '신청 내역이 없습니다.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className={styles.container}>

      <div className={styles.content}>
        <div className={styles.summary}>
          {language === 'ko' ? '전체 요약: ' : 'Summary: '}
          리더 {leaders.length}명 / 팔로워 {followers.length}명
        </div>
        {renderTable(leaders, language === 'ko' ? '리더 명단' : 'Leaders')}
        <div style={{ height: '2rem' }} />
        {renderTable(followers, language === 'ko' ? '팔로워 명단' : 'Followers')}
      </div>
      {renderDetailModal()}
    </div>
  );
}

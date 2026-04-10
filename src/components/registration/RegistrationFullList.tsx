'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  if (!type) return '미지정';
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
              {isAdmin ? (
                <select 
                  className={styles.editSelect}
                  value={selectedReg.type || ''} 
                  onChange={(e) => handleTypeChange(e.target.value)}
                >
                  {(t.home.payment.options || []).map((opt: string) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : (
                <span className={styles.value}>{getRegTypeLabel(selectedReg.type)}</span>
              )}
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>상태:</span>
              {isAdmin ? (
                <select 
                  className={styles.editSelect}
                  value={selectedReg.status || 'waiting'} 
                  onChange={(e) => handleStatusChange(e.target.value as 'waiting' | 'paid')}
                >
                  <option value="waiting">대기중</option>
                  <option value="paid">결제완료</option>
                </select>
              ) : (
                <span className={styles.value}>{selectedReg.status === 'paid' ? '결제완료' : '대기중'}</span>
              )}
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

  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    };
    if (activeMenuId) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeMenuId]);

  const handleDeleteRegistration = async (regId: string) => {
    if (!confirm(t.home?.registration?.deleteConfirm || '정말 삭제하시겠습니까?')) return;
    try {
      const { deleteRegistration } = await import('@/lib/db');
      await deleteRegistration(regId);
      alert(t.home?.admin?.saveSuccess || '삭제되었습니다.');
      window.dispatchEvent(new Event('ft_registrations_updated'));
    } catch (e) {
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  const renderTable = (list: Registration[], title: string) => (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>{title}</h3>
      <div className={styles.adminTableWrapper}>
        <table className={styles.adminTable}>
          <thead>
            <tr>
              <th style={{ width: '20%' }}>{t.home.registration.nickname}</th>
              <th style={{ width: '45%' }}>{language === 'ko' ? '신청 수업' : 'Classes'}</th>
              <th style={{ width: '25%' }}>{language === 'ko' ? '신청 유형' : 'Type'}</th>
              {isAdmin && <th style={{ width: '10%' }}></th>}
            </tr>
          </thead>
          <tbody>
            {list.length > 0 ? (
              list.map(reg => {
                const regClasses = getClassesForReg(reg);
                const classTitles = regClasses.map(c => c.title).join(', ');
                
                return (
                  <tr key={reg.id}>
                    <td 
                      className={isAdmin ? styles.clickableName : ''} 
                      onClick={() => isAdmin && setSelectedReg(reg)}
                    >
                      {reg.nickname}
                    </td>
                    <td style={{ fontSize: '0.85rem', color: '#4e5968' }}>{classTitles}</td>
                    <td>{getRegTypeLabel(reg.type)}</td>
                    {isAdmin && (
                      <td style={{ textAlign: 'right', position: 'relative' }}>
                        <button 
                          className={styles.menuBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(activeMenuId === reg.id ? null : reg.id);
                          }}
                        >
                          ⋮
                        </button>
                        {activeMenuId === reg.id && (
                          <div className={styles.dropdownMenu} ref={menuRef}>
                            <div 
                              className={styles.dropdownItem}
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuId(null);
                                // For editing, we reuse the detail modal for now OR just open it
                                setSelectedReg(reg);
                              }}
                            >
                              {t.home.registration.edit}
                            </div>
                            <div 
                              className={`${styles.dropdownItem} ${styles.danger}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuId(null);
                                handleDeleteRegistration(reg.id);
                              }}
                            >
                              {t.home.registration.delete}
                            </div>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={isAdmin ? 4 : 3} style={{ textAlign: 'center', padding: '20px' }}>
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

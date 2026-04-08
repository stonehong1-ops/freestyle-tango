import React, { useState, useEffect } from 'react';
import { FullStayReservation, Registration, TangoClass, User, getUsers } from '@/lib/db';
import styles from './AdminChecklist.module.css';
import { useLanguage } from '@/contexts/LanguageContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import StayTemplateEditor from './StayTemplateEditor';

interface Props {
  reservations: FullStayReservation[];
  registrations: Registration[];
  classes: TangoClass[];
  onEditRegistration?: (reg: Registration) => void;
  onEditReservation?: (res: FullStayReservation) => void;
}

interface TemplatesMap {
  [stayId: string]: {
    [type: string]: string;
  };
}

interface TaskStatus {
  checkin_3d?: boolean;
  checkin_day?: boolean;
  checkout_1d?: boolean;
  checkout_day?: boolean;
}

interface AllTaskStatuses {
  [resId: string]: TaskStatus;
}

export default function AdminChecklist({ 
  reservations, 
  registrations, 
  onEditRegistration,
  onEditReservation
}: Props) {
  const { language } = useLanguage();
  const [templates, setTemplates] = useState<TemplatesMap | null>(null);
  const [taskStatuses, setTaskStatuses] = useState<AllTaskStatuses>({});
  const [activities, setActivities] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isActivitiesLoading, setIsActivitiesLoading] = useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const snap = await getDoc(doc(db, 'admin_settings', 'stay_sms_templates'));
        if (snap.exists()) {
          setTemplates(snap.data() as TemplatesMap);
        }
      } catch (err) {
        console.error("Templates fetch error:", err);
      }
    };
    fetchTemplates();
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'admin_settings', 'stay_task_status_all'), (doc) => {
      if (doc.exists()) {
        setTaskStatuses(doc.data() as AllTaskStatuses);
      }
    });
    return () => unsub();
  }, []);
  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async (query?: string) => {
    setIsActivitiesLoading(true);
    try {
      const acts = await getUsers(query);
      setActivities(acts);
    } catch (error) {
      console.error("Fetch Activities Error:", error);
    } finally {
      setIsActivitiesLoading(false);
    }
  };

  const handleSearch = () => {
    fetchActivities(searchQuery);
  };

  const getDayOfWeek = (dateStr: string) => {
    const days = language === 'ko' ? ['일', '월', '화', '수', '목', '금', '토'] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[new Date(dateStr).getDay()];
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}.${d.getDate()}(${getDayOfWeek(dateStr)})`;
  };

  const getStatus = (res: FullStayReservation) => {
    const tIn = new Date(res.checkIn);
    tIn.setHours(0,0,0,0);
    const tOut = new Date(res.checkOut);
    tOut.setHours(0,0,0,0);
    
    const diffIn = Math.floor((tIn.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const diffOut = Math.floor((tOut.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffIn === 3) return language === 'ko' ? '입실 3일전' : '3d before In';
    if (diffIn === 0) return language === 'ko' ? '입실 당일' : 'Check-in Day';
    if (diffOut === 1) return language === 'ko' ? '퇴실 1일전' : '1d before Out';
    if (diffOut === 0) return language === 'ko' ? '퇴실 당일' : 'Check-out Day';
    
    if (today >= tIn && today < tOut) {
      return language === 'ko' ? `퇴실 D-${diffOut}` : `Out D-${diffOut}`;
    }

    return diffIn > 0 ? (language === 'ko' ? `입실 D-${diffIn}` : `In D-${diffIn}`) : (language === 'ko' ? '진행중' : 'In Progress');
  };

  const activeReservations = reservations
    .filter(res => {
      if (res.status === 'cancelled') return false;
      const outDate = new Date(res.checkOut);
      outDate.setHours(23, 59, 59, 999);
      return outDate >= today;
    })
    .sort((a, b) => {
      const getPriorityDiff = (res: FullStayReservation) => {
        const tIn = new Date(res.checkIn);
        tIn.setHours(0,0,0,0);
        const tOut = new Date(res.checkOut);
        tOut.setHours(0,0,0,0);
        
        const diffIn = Math.floor((tIn.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        const diffOut = Math.floor((tOut.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        // 아직 입실 전이면 입실 D-day 기준
        if (diffIn >= 0) return diffIn;
        // 이미 입실 중이면 퇴실 D-day 기준
        return diffOut;
      };
      
      return getPriorityDiff(a) - getPriorityDiff(b);
    });

  const handleAction = async (res: FullStayReservation, type: keyof TaskStatus) => {
    const isDone = !!taskStatuses[res.id]?.[type];
    
    if (templates) {
      const stayId = res.stayId;
      const rawTemplate = templates[stayId]?.[type] || '';
      
      if (rawTemplate) {
        let body = rawTemplate
          .replace(/{name}/g, res.name)
          .replace(/{checkIn}/g, res.checkIn)
          .replace(/{checkOut}/g, res.checkOut)
          .replace(/{stayName}/g, res.stayId === 'hapjeong' ? '합정' : '덕은');

        const phone = res.phone.replace(/[^0-9]/g, '');
        window.location.href = `sms:${phone}?body=${encodeURIComponent(body)}`;
      }
    }

    const newStatus = {
      ...taskStatuses[res.id],
      [type]: !isDone
    };

    try {
      await setDoc(doc(db, 'admin_settings', 'stay_task_status_all'), {
        ...taskStatuses,
        [res.id]: newStatus
      }, { merge: true });
    } catch (err) {
      console.error("Task status update error:", err);
    }
  };

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone.replace(/[^0-9]/g, '')}`;
  };

  const handleEmptySMS = (phone: string) => {
    window.location.href = `sms:${phone.replace(/[^0-9]/g, '')}`;
  };

  const unpaidRegs = registrations.filter(reg => reg.status === 'waiting');

  return (
    <div className={styles.container}>
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>🏠 {language === 'ko' ? '스테이 체크리스트' : 'Stay Checklist'}</h3>
          <div className={styles.headerActions}>
            <span className={styles.countBadge}>{activeReservations.length}</span>
          </div>
        </div>

        <div className={styles.cardList}>
          {activeReservations.map(res => {
            const stayName = res.stayId === 'hapjeong' ? (language === 'ko' ? '합정' : 'Hapjeong') : (language === 'ko' ? '덕은' : 'Deokeun');
            const status = taskStatuses[res.id] || {};
            const milestone = getStatus(res);

            const steps = [
              { key: 'checkin_3d' as const, label: language === 'ko' ? '3일전' : '3d' },
              { key: 'checkin_day' as const, label: language === 'ko' ? '입실일' : 'In' },
              { key: 'checkout_1d' as const, label: language === 'ko' ? '하루전' : '1d' },
              { key: 'checkout_day' as const, label: language === 'ko' ? '퇴실일' : 'Out' }
            ];

            return (
              <div key={res.id} className={styles.stayCard}>
                <div className={styles.cardHeader}>
                  <span className={`${styles.stayNameBadge} ${res.stayId === 'hapjeong' ? styles.hapjeong : styles.deokeun}`}>
                    {stayName}
                  </span>
                  <span className={styles.statusBadge}>[ {milestone} ]</span>
                </div>
                
                <div className={styles.cardLineGuest}>
                  <span className={styles.guestInfoText}><strong>{res.name}</strong>({res.guests}{language === 'ko' ? '인' : 'p'})</span>
                  <div className={styles.phoneGroup}>
                    <span className={styles.phoneNum}>{res.phone}</span>
                    <button className={styles.miniIconBtn} onClick={() => handleCall(res.phone)}>📞</button>
                    <button className={styles.miniIconBtn} onClick={() => handleEmptySMS(res.phone)}>💬</button>
                  </div>
                </div>

                <div className={styles.cardLineDates}>
                  {formatDate(res.checkIn)} ~ {formatDate(res.checkOut)}
                </div>

                <div className={styles.cardLineMessage}>
                  {res.message || (language === 'ko' ? '(요청사항 없음)' : '(No messages)')}
                </div>

                <div className={styles.cardLineTodo}>
                  {steps.map(step => (
                    <button 
                      key={step.key}
                      className={`${styles.todoToggle} ${status[step.key] ? styles.done : ''}`}
                      onClick={() => handleAction(res, step.key)}
                    >
                      <span className={styles.checkIcon}>{status[step.key] ? '✅' : 'ㅁ'}</span>
                      <span className={styles.stepLabel}>{step.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}

          {activeReservations.length === 0 && (
            <div className={styles.emptyState}>{language === 'ko' ? '진행 중인 예약이 없습니다.' : 'No active reservations.'}</div>
          )}
        </div>
      </section>


    </div>
  );
}

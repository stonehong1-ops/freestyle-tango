import React, { useState, useEffect } from 'react';
import { TangoClass } from '@/lib/db';
import styles from './RegistrationStatus.module.css';

interface Props {
  classes: TangoClass[];
  onClose: () => void;
  requireIdentity?: (action: () => void) => void;
}

export default function RegistrationStatus({ classes, onClose, requireIdentity }: Props) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSuccess, setIsSuccess] = useState(false);
  // Remove manual name/phone state as it's handled by IdentityForm


  useEffect(() => {
    const saved = localStorage.getItem('my_tango_classes');
    if (saved) {
      setSelectedIds(new Set(JSON.parse(saved)));
    }
  }, []);

  const toggleSelection = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const grouped = classes.reduce((acc, cls) => {
    const day = cls.time.match(/([월화수목금토일]요일)/)?.[1] || '기타';
    if (!acc[day]) acc[day] = [];
    acc[day].push(cls);
    return acc;
  }, {} as Record<string, TangoClass[]>);

  const handleRegister = (type: string) => {
    const action = () => {
      localStorage.setItem('my_tango_classes', JSON.stringify(Array.from(selectedIds)));
      setIsSuccess(true);
    };

    if (requireIdentity) {
      requireIdentity(action);
    } else {
      action();
    }
  };

  if (isSuccess) {
    return (
      <div className={styles.successContainer}>
        <div className={styles.successIcon}>✨</div>
        <h2 className={styles.successTitle}>환영합니다.</h2>
        <p className={styles.successMessage}>
          신청은 완료되었습니다.<br/>
          위 계좌로 입금하시기 바랍니다.
        </p>
        <p className={styles.successMessageInfo}>
          입금시 닉네임을 알 수 있거나,<br/>
          입금자명을 스톤에게 보내주셔야<br/>
          정확히 확인할 수 있습니다.
        </p>
        <div className={styles.bankBox}>
          <span className={styles.bankLabel}>계좌번호</span>
          <span className={styles.bankNumber}>카카오뱅크 3333-14-3169646 홍병석</span>
        </div>
        <button className={styles.closeBtn} onClick={onClose}>확인</button>
      </div>
    );
  }

  const daysOrdered = ['월요일','화요일','수요일','목요일','금요일','토요일','일요일','기타'];

  return (
    <div className={styles.container}>
      <p className={styles.headerDesc}>기존에 신청한 수업은 체크되어 있습니다. 원하는 수업을 체크하여 한 번에 신청해 보세요.</p>
      
      <div className={styles.listContainer}>
        {daysOrdered.map(day => {
          if (!grouped[day] || grouped[day].length === 0) return null;
          return (
            <div key={day} className={styles.dayGroup}>
              <h3 className={styles.dayTitle}>{day}</h3>
              <div className={styles.classList}>
                {grouped[day].map(cls => (
                  <label key={cls.id} className={styles.classItem}>
                    <input 
                      type="checkbox" 
                      className={styles.checkbox}
                      checked={selectedIds.has(cls.id)}
                      onChange={() => toggleSelection(cls.id)}
                    />
                    <div className={styles.classInfo}>
                      <div className={styles.classTitle}>{cls.title}</div>
                      <div className={styles.classMeta}>{cls.time} | 강사: {cls.teacher1}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.footer}>
        {selectedIds.size === 1 && (
          <button className={styles.actionBtn} onClick={() => handleRegister('single')}>
            12만원 개별수업신청
          </button>
        )}
        <button className={styles.actionBtnPrimary} onClick={() => handleRegister('month1')}>
          {selectedIds.size >= 2 ? '18만원 1개월 수강신청' : '18만원 1개월 멤버쉽신청'}
        </button>
        <button className={styles.actionBtnMembership} onClick={() => handleRegister('month6')}>
          6개월 멤버쉽신청
        </button>
      </div>
    </div>
  );
}

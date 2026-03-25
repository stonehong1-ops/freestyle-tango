'use client';

import React from 'react';
import { TangoClass, Registration } from '@/lib/db';
import styles from './StatisticsView.module.css';

interface StatisticsViewProps {
  classes: TangoClass[];
  registrations: Registration[];
}

export default function StatisticsView({ classes, registrations }: StatisticsViewProps) {
  const currentMonth = new Date().toISOString().substring(0, 7);
  const monthRegs = registrations.filter(r => r.month === currentMonth || r.date.startsWith(currentMonth));
  
  const totalRevenue = monthRegs
    .filter(r => r.status === 'paid')
    .reduce((sum, r) => sum + (r.amount || 0), 0);

  const pendingRevenue = monthRegs
    .filter(r => r.status === 'waiting')
    .reduce((sum, r) => {
      // Estimate pending based on class prices if amount not set
      if (r.amount) return sum + r.amount;
      const classTotal = r.classIds.reduce((cSum, cid) => {
        const cls = classes.find(c => c.id === cid);
        const price = parseInt((cls?.price || '0').replace(/[^0-9]/g, ''));
        return cSum + price;
      }, 0);
      return sum + classTotal;
    }, 0);

  const totalStudents = new Set(monthRegs.map(r => r.phone)).size;
  const genderStats = monthRegs.reduce((acc, r) => {
    acc[r.role] = (acc[r.role] || 0) + 1;
    return acc;
  }, { leader: 0, follower: 0 });

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        <div className={styles.statCard}>
          <div className={styles.label}>이번 달 확정 수입</div>
          <div className={styles.value}>{totalRevenue.toLocaleString()}원</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.label}>예상 총 수입 (미입금 포함)</div>
          <div className={styles.value}>{(totalRevenue + pendingRevenue).toLocaleString()}원</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.label}>고유 신청인원</div>
          <div className={styles.value}>{totalStudents}명</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.label}>남녀 비율</div>
          <div className={styles.value}>L {genderStats.leader} : F {genderStats.follower}</div>
        </div>
      </div>

      <h3 className={styles.listTitle}>수업별 신청 현황</h3>
      <div className={styles.classList}>
        {classes.filter(c => (c.targetMonth || '') >= currentMonth).map(cls => {
          const clsRegs = monthRegs.filter(r => r.classIds.includes(cls.id));
          const lCount = clsRegs.filter(r => r.role === 'leader').length;
          const fCount = clsRegs.filter(r => r.role === 'follower').length;
          
          return (
            <div key={cls.id} className={styles.classItem}>
              <div className={styles.classInfo}>
                <div className={styles.className}>{cls.title}</div>
                <div className={styles.classSub}>{cls.time} | {cls.teacher1}</div>
              </div>
              <div className={styles.classCount}>
                <span className={styles.leader}>L {lCount}</span>
                <span className={styles.follower}>F {fCount}</span>
                <span className={styles.total}>내일 {lCount + fCount} / {cls.maxCount || 20}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

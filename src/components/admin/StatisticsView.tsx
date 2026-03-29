import React from 'react';
import { TangoClass, Registration, MilongaReservation, getAllMilongaReservations, getStayReservationList } from '@/lib/db';
import styles from './StatisticsView.module.css';

interface StatisticsViewProps {
  classes: TangoClass[];
  registrations: Registration[];
}

export default function StatisticsView({ classes, registrations }: StatisticsViewProps) {
  const [milongaRes, setMilongaRes] = React.useState<MilongaReservation[]>([]);
  const [stayRes, setStayRes] = React.useState<any[]>([]);
  
  React.useEffect(() => {
    const fetchMilonga = async () => {
      const data = await getAllMilongaReservations();
      setMilongaRes(data);
    };
    const fetchStay = async () => {
      // Fetch stay reservations for both hapjeong and deokeun
      const [hRes, dRes] = await Promise.all([
        getStayReservationList('hapjeong'),
        getStayReservationList('deokeun')
      ]);
      setStayRes([...hRes, ...dRes]);
    };
    fetchMilonga();
    fetchStay();
  }, []);

  const currentMonth = new Date().toISOString().substring(0, 7);
  
  // Improvement: registrations are already tied to specific classes via classIds.
  // Instead of a global monthRegs, let's just use all registrations and filter as needed.
  const relevantRegs = registrations; 
  
  const totalRevenue = relevantRegs
    .filter(r => (r.month === currentMonth || r.date.startsWith(currentMonth)) && r.status === 'paid')
    .reduce((sum, r) => sum + (r.amount || 0), 0);

  const pendingRevenue = relevantRegs
    .filter(r => (r.month === currentMonth || r.date.startsWith(currentMonth)) && r.status === 'waiting')
    .reduce((sum, r) => {
      if (r.amount) return sum + r.amount;
      const classTotal = r.classIds.reduce((cSum, cid) => {
        const cls = classes.find(c => c.id === cid);
        const price = parseInt((cls?.price || '0').replace(/[^0-9]/g, ''));
        return cSum + price;
      }, 0);
      return sum + classTotal;
    }, 0);

  const monthlyStudents = new Set(relevantRegs.filter(r => r.month === currentMonth || r.date.startsWith(currentMonth)).map(r => r.phone)).size;
  const genderStats = relevantRegs
    .filter(r => r.month === currentMonth || r.date.startsWith(currentMonth))
    .reduce((acc, r) => {
      acc[r.role] = (acc[r.role] || 0) + 1;
      return acc;
    }, { leader: 0, follower: 0 } as Record<string, number>);

  // Milonga Stats
  const upcomingMilongas = Array.from(new Set(milongaRes.map(m => m.milongaDate))).sort();

  return (
    <div className={styles.container}>
      {/* 1. Overall Stats */}
      <h3 className={styles.listTitle}>{currentMonth} 수업 요약</h3>
      <div className={styles.grid}>
        <div className={styles.statCard}>
          <div className={styles.label}>확정 수입</div>
          <div className={styles.value}>{totalRevenue.toLocaleString()}원</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.label}>예상 총 수입</div>
          <div className={styles.value}>{(totalRevenue + pendingRevenue).toLocaleString()}원</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.label}>신청 인원</div>
          <div className={styles.value}>{monthlyStudents}명</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.label}>남녀 비율</div>
          <div className={styles.value}>L {genderStats.leader} : F {genderStats.follower}</div>
        </div>
      </div>

      {/* 2. Milonga Stats */}
      <h3 className={styles.listTitle}>밀롱가 예약 현황</h3>
      <div className={styles.milongaGrid}>
        {upcomingMilongas.length === 0 ? (
          <div className={styles.emptyText}>데이터 없음</div>
        ) : upcomingMilongas.map(date => {
          const dateRes = milongaRes.filter(m => m.milongaDate === date);
          const lCount = dateRes.filter(m => m.role === 'leader').length;
          const fCount = dateRes.filter(m => m.role === 'follower').length;
          return (
            <div key={date} className={styles.milongaCard}>
              <div className={styles.milongaDate}>{date.split('-').slice(1).join('/')}</div>
              <div className={styles.milongaCount}>
                <span className={styles.leader}>L {lCount}</span>
                <span className={styles.follower}>F {fCount}</span>
                <span className={styles.total}>총 {lCount + fCount}명</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2.5 Stay Reservation Stats */}
      <h3 className={styles.listTitle}>스테이 예약 현황</h3>
      <div className={styles.milongaGrid}>
        {stayRes.length === 0 ? (
          <div className={styles.emptyText}>데이터 없음</div>
        ) : (
          ['hapjeong', 'deokeun'].map(sid => {
            const sRes = stayRes.filter(r => r.stayId === sid);
            return (
              <div key={sid} className={styles.milongaCard}>
                <div className={styles.milongaDate}>{sid === 'hapjeong' ? '합정' : '덕은'}</div>
                <div className={styles.milongaCount}>
                  <span className={styles.total}>확정 {sRes.length}건</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 3. Class List with Detailed Table */}
      <h3 className={styles.listTitle} style={{ marginTop: '2rem' }}>수업별 신청자 명단</h3>
      <div className={styles.classList}>
        {classes.filter(c => (c.targetMonth || '') >= currentMonth).map(cls => {
          const clsRegs = registrations.filter(r => r.classIds.includes(cls.id));
          const leaders = clsRegs.filter(r => r.role === 'leader');
          const followers = clsRegs.filter(r => r.role === 'follower');
          
          return (
            <div key={cls.id} className={styles.classSection}>
              <div className={styles.classHeader}>
                <div className={styles.classInfo}>
                  <div className={styles.className}>{cls.title}</div>
                  <div className={styles.classSub}>{cls.time} ({cls.targetMonth})</div>
                </div>
                <div className={styles.classCount}>
                  <span className={styles.leader}>L{leaders.length}</span>
                  <span className={styles.follower}>F{followers.length}</span>
                  <span className={styles.total}>합 {leaders.length + followers.length}명 / 정원 {cls.maxCount || 20}</span>
                </div>
              </div>
              
              <div className={styles.applicantList}>
                <div className={styles.tableContainer}>
                  <table className={styles.applicantTable}>
                    <thead>
                      <tr>
                        <th>구분</th>
                        <th>닉네임</th>
                        <th>신청일</th>
                        <th>수업수</th>
                        <th>상태</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...leaders, ...followers].length === 0 ? (
                        <tr>
                          <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#8b95a1' }}>신청자 없음</td>
                        </tr>
                      ) : (
                        [...leaders, ...followers].map(reg => (
                          <tr key={reg.id}>
                            <td className={reg.role === 'leader' ? styles.leader : styles.follower}>
                              {reg.role === 'leader' ? 'L' : 'F'}
                            </td>
                            <td>{reg.nickname}</td>
                            <td className={styles.regDate}>{reg.date.split('T')[0].substring(5)}</td>
                            <td>
                              <span className={styles.classCountBadge}>{reg.classIds.length}</span>
                            </td>
                            <td>
                              <span className={`${styles.statusBadge} ${reg.status === 'paid' ? styles.statusPaid : styles.statusWaiting}`}>
                                {reg.status === 'paid' ? '완료' : '대기'}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

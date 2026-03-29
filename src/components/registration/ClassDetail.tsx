import { Registration } from '@/lib/db';

interface ClassDetailProps {
  id: string;
  level: string;
  type: string;
  title: string;
  time: string;
  teacher1: string;
  teacher2: string;
  description: string;
  curriculum: string;
  price: string;
  imageUrl?: string;
  teacherProfile?: string;
  videoUrl?: string;
  registrations?: Registration[];
  isApplied?: boolean;
  dates?: string[];
  onRegister: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  isAdmin?: boolean;
}

const maskName = (name: string) => {
  if (!name) return '';
  if (name.length <= 1) return name;
  if (name.length === 2) return name[0] + '*';
  return name[0] + '*'.repeat(name.length - 2) + name[name.length - 1];
};

export default function ClassDetail({ 
  id, 
  level, 
  type,
  title, 
  time, 
  teacher1, 
  teacher2,
  description,
  curriculum,
  price,
  imageUrl,
  teacherProfile,
  videoUrl,
  registrations = [],
  dates = [],
  isApplied,
  onRegister,
  onEdit,
  onDelete,
  isAdmin
}: ClassDetailProps) {
  // Filter registrations for THIS class ID
  const classRegs = registrations.filter(r => r.classIds && r.classIds.includes(id));
  
  // Group by role (normalize to handle potential literal quotes)
  const leaders = classRegs.filter(r => (r.role || '').replace(/"/g, '') === 'leader');
  const followers = classRegs.filter(r => (r.role || '').replace(/"/g, '') === 'follower');
  return (
    <div style={{ padding: '0', display: 'flex', flexDirection: 'column', gap: '0', background: '#fff' }}>
      {/* 수업 대표 이미지 */}
      <div style={{ width: '100%', height: '200px', background: '#f2f4f6', overflow: 'hidden' }}>
        {imageUrl ? (
          <img src={imageUrl} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#adb5bd', fontSize: '2rem', fontWeight: 800 }}>TANGO</div>
        )}
      </div>

      {teacherProfile && (
        <div style={{ padding: '0.75rem 2rem', background: '#f8f9fa', color: '#3182f6', fontSize: '0.9rem', fontWeight: 600, borderBottom: '1px solid #f2f4f6' }}>
          &quot;{teacherProfile}&quot;
        </div>
      )}

      <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <header>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#3182f6', marginBottom: '0.5rem' }}>{level} · {type}</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#191f28', marginBottom: '0.5rem' }}>{title}</h2>
          <div style={{ color: '#4e5968', fontSize: '0.95rem' }}>{time}</div>
          <div style={{ color: '#8b95a1', fontSize: '0.9rem', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>강사: {teacher1} {teacher2 && `& ${teacher2}`}</span>
            <span style={{ fontWeight: 700, color: '#191f28', fontSize: '1.1rem' }}>{price}</span>
          </div>
        </header>

        <section style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '12px', borderLeft: '4px solid #3182f6' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#4e5968', marginBottom: '0.8rem' }}>수업 일정 (4주 과정)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.8rem' }}>
            {dates.length > 0 ? (
              dates.slice(0, 4).map((date, idx) => {
                const d = new Date(date);
                const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
                const formatted = `${d.getMonth() + 1}월 ${d.getDate()}일 (${dayNames[d.getDay()]})`;
                return (
                   <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      width: '20px', 
                      height: '20px', 
                      borderRadius: '50%', 
                      background: '#3182f6', 
                      color: '#fff', 
                      fontSize: '0.7rem', 
                      fontWeight: 800 
                    }}>
                      {idx + 1}
                    </span>
                    <span style={{ color: '#191f28', fontWeight: 600, fontSize: '0.95rem' }}>{formatted}</span>
                  </div>
                );
              })
            ) : (
              <div style={{ color: '#8b95a1', fontSize: '0.9rem', gridColumn: 'span 2' }}>등록된 일정이 없습니다.</div>
            )}
          </div>
          
          <div style={{ height: '1px', background: '#eef3f6', margin: '1rem 0' }} />
          
          <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#4e5968', marginBottom: '0.4rem' }}>커리큘럼 상세</h3>
          <p style={{ color: '#191f28', fontWeight: 600, fontSize: '0.95rem', whiteSpace: 'pre-wrap', margin: 0 }}>{curriculum}</p>
        </section>
        
        {videoUrl && (
          <section>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#191f28', marginBottom: '1rem' }}>미리보기 영상</h3>
            <div style={{ width: '100%', borderRadius: '14px', overflow: 'hidden', background: '#000', lineHeight: 0 }}>
              <video 
                src={videoUrl} 
                controls 
                style={{ width: '100%', maxHeight: '400px' }} 
                playsInline
              />
            </div>
          </section>
        )}

        <section>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#191f28', marginBottom: '1rem' }}>수업 소개</h3>
          <p style={{ color: '#4e5968', lineHeight: 1.6, fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>{description}</p>
        </section>



        <section style={{ marginTop: '1rem', borderTop: '1px solid #f2f4f6', paddingTop: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#191f28', marginBottom: '1rem' }}>현재 신청 현황</h3>
          <div style={{ background: '#f9fafb', padding: '1.2rem', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.8rem', fontSize: '0.9rem' }}>
              <span style={{ fontWeight: 700, color: '#3182f6', minWidth: '70px' }}>리더 {leaders.length}명</span>
              <span style={{ color: '#4e5968', lineHeight: 1.4 }}>
                {leaders.length > 0 ? leaders.map(l => isAdmin ? l.nickname : maskName(l.nickname)).join(', ') : '신청 대기 중'}
              </span>
            </div>
            <div style={{ width: '100%', height: '1px', background: '#eef3f6' }} />
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.8rem', fontSize: '0.9rem' }}>
              <span style={{ fontWeight: 700, color: '#ff4b82', minWidth: '70px' }}>팔로워 {followers.length}명</span>
              <span style={{ color: '#4e5968', lineHeight: 1.4 }}>
                {followers.length > 0 ? followers.map(f => isAdmin ? f.nickname : maskName(f.nickname)).join(', ') : '신청 대기 중'}
              </span>
            </div>
          </div>
        </section>

        {isAdmin && (
          <section style={{ marginTop: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#191f28', marginBottom: '1rem' }}>신청자 상세 명단 (관리자)</h3>
            <div style={{ overflowX: 'auto', background: '#fff', borderRadius: '12px', border: '1px solid #e5e8eb' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e8eb' }}>
                    <th style={{ padding: '0.75rem', textAlign: 'left', color: '#8b95a1' }}>구분</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', color: '#8b95a1' }}>닉네임</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', color: '#8b95a1' }}>연락처</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', color: '#8b95a1' }}>상태</th>
                  </tr>
                </thead>
                <tbody>
                  {[...leaders, ...followers].length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#8b95a1' }}>신청자 없음</td>
                    </tr>
                  ) : (
                    [...leaders, ...followers].map(reg => (
                      <tr key={reg.id} style={{ borderBottom: '1px solid #f2f4f6' }}>
                        <td style={{ padding: '0.75rem', color: reg.role === 'leader' ? '#3182f6' : '#ff4b82', fontWeight: 700 }}>
                          {reg.role === 'leader' ? '리더' : '팔로워'}
                        </td>
                        <td style={{ padding: '0.75rem', fontWeight: 600 }}>{reg.nickname}</td>
                        <td style={{ padding: '0.75rem', color: '#4e5968' }}>{reg.phone}</td>
                        <td style={{ padding: '0.75rem' }}>
                          <span style={{ 
                            padding: '2px 6px', 
                            borderRadius: '4px', 
                            fontSize: '0.7rem', 
                            fontWeight: 700,
                            background: reg.status === 'paid' ? '#e7f5ed' : '#f2f4f6',
                            color: reg.status === 'paid' ? '#1ea559' : '#8b95a1'
                          }}>
                            {reg.status === 'paid' ? '입금완료' : '대기중'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <footer style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', paddingTop: '1.5rem', borderTop: '1px solid #f2f4f6', paddingBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', flex: 1 }}>
              {onEdit && (
                <button 
                  onClick={() => onEdit(id)}
                  style={{ flex: 1, padding: '1rem', borderRadius: '14px', border: '1px solid #f2f4f6', background: '#fff', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  수정
                </button>
              )}
              {onDelete && (
                <button 
                  onClick={() => onDelete(id)}
                  style={{ flex: 1, padding: '1rem', borderRadius: '14px', border: '1px solid #fee2e2', background: '#fdf2f2', color: '#ef4444', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  삭제
                </button>
              )}
            </div>
            <button 
              onClick={() => !isApplied && onRegister(id)}
              disabled={isApplied}
              style={{ 
                flex: 1.5, 
                padding: '1rem', 
                borderRadius: '14px', 
                border: 'none', 
                background: isApplied ? '#e5e8eb' : '#3182f6', 
                color: isApplied ? '#adb5bd' : '#fff', 
                fontSize: '1rem', 
                fontWeight: 700, 
                cursor: isApplied ? 'default' : 'pointer' 
              }}
            >
              {isApplied ? '신청완료' : '신청수업 목록에 담기'}
            </button>
          </div>
          <div style={{ textAlign: 'center', color: '#8b95a1', fontSize: '0.8rem', letterSpacing: '-0.3px' }}>
            추후 내 신청현황에서 모든 수업을 한꺼번에 신청하실 수 있습니다
          </div>
        </footer>
      </div>
    </div>
  );
}

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
  onRegister: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
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
  onRegister,
  onEdit,
  onDelete
}: ClassDetailProps) {
  // Filter registrations for THIS class ID
  const classRegs = registrations.filter(r => r.classIds && r.classIds.includes(id));
  
  // Group by gender (default missing to male/leader as per request)
  const leaders = classRegs.filter(r => r.gender === 'male' || !r.gender);
  const followers = classRegs.filter(r => r.gender === 'female');
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
          "{teacherProfile}"
        </div>
      )}

      <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <header>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#3182f6', marginBottom: '0.5rem' }}>{level} · {type}</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#191f28', marginBottom: '0.5rem' }}>{title}</h2>
          <div style={{ color: '#4e5968', fontSize: '0.95rem' }}>{time}</div>
          <div style={{ color: '#8b95a1', fontSize: '0.9rem', marginTop: '0.5rem' }}>
            강사: {teacher1} {teacher2 && `& ${teacher2}`}
          </div>
        </header>
        
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

        <section>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#191f28', marginBottom: '1rem' }}>커리큘럼</h3>
          <p style={{ color: '#4e5968', lineHeight: 1.6, fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>{curriculum}</p>
        </section>

        <section style={{ marginTop: '1rem', borderTop: '1px solid #f2f4f6', paddingTop: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#191f28', marginBottom: '1rem' }}>현재 신청 현황</h3>
          <div style={{ background: '#f9fafb', padding: '1.2rem', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.8rem', fontSize: '0.9rem' }}>
              <span style={{ fontWeight: 700, color: '#3182f6', minWidth: '70px' }}>리더 {leaders.length}명</span>
              <span style={{ color: '#4e5968', lineHeight: 1.4 }}>
                {leaders.length > 0 ? leaders.map(l => maskName(l.nickname)).join(', ') : '신청 대기 중'}
              </span>
            </div>
            <div style={{ width: '100%', height: '1px', background: '#eef3f6' }} />
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.8rem', fontSize: '0.9rem' }}>
              <span style={{ fontWeight: 700, color: '#ff4b82', minWidth: '70px' }}>팔로워 {followers.length}명</span>
              <span style={{ color: '#4e5968', lineHeight: 1.4 }}>
                {followers.length > 0 ? followers.map(f => maskName(f.nickname)).join(', ') : '신청 대기 중'}
              </span>
            </div>
          </div>
        </section>

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
              onClick={() => onRegister(id)}
              style={{ flex: 1.5, padding: '1rem', borderRadius: '14px', border: 'none', background: '#3182f6', color: '#fff', fontSize: '1rem', fontWeight: 700, cursor: 'pointer' }}
            >
              수업신청 선택하기
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

import React, { useState, useRef, useEffect } from 'react';
import { Registration } from '@/lib/db';
import { useLanguage } from '@/contexts/LanguageContext';

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
  isRegistered?: boolean;
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
  isRegistered,
  onRegister,
  onEdit,
  onDelete,
  isAdmin
}: ClassDetailProps) {
  const { t, language } = useLanguage();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

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
        <header style={{ position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#3182f6', marginBottom: '0.5rem' }}>{level} · {type}</div>
            
            {isAdmin && (
              <div style={{ position: 'relative' }} ref={menuRef}>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(!showMenu);
                  }}
                  style={{ 
                    background: '#f2f4f6', 
                    border: 'none', 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '50%', 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    color: '#4e5968', 
                    fontSize: '1.2rem' 
                  }}
                >
                  ⋮
                </button>
                {showMenu && (
                  <div style={{ 
                    position: 'absolute', 
                    top: '100%', 
                    right: 0, 
                    background: '#fff', 
                    borderRadius: '12px', 
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)', 
                    padding: '8px', 
                    zIndex: 100, 
                    minWidth: '120px',
                    marginTop: '4px'
                  }}>
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(false);
                        onEdit?.(id);
                      }}
                      style={{ padding: '12px 16px', fontSize: '0.9rem', fontWeight: 600, color: '#191f28', cursor: 'pointer', borderRadius: '8px' }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f2f4f6')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      {t.home.registration.edit}
                    </div>
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(false);
                        onDelete?.(id);
                      }}
                      style={{ padding: '12px 16px', fontSize: '0.9rem', fontWeight: 600, color: '#ef4444', cursor: 'pointer', borderRadius: '8px' }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fdf2f2')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      {t.home.registration.delete}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#191f28', marginBottom: '0.5rem', paddingRight: isAdmin ? '40px' : '0' }}>{title}</h2>
          <div style={{ color: '#4e5968', fontSize: '0.95rem' }}>{time}</div>
          <div style={{ color: '#8b95a1', fontSize: '0.9rem', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{t.home.registration.teacherLabel} {teacher1} {teacher2 && `& ${teacher2}`}</span>
            <span style={{ fontWeight: 700, color: '#191f28', fontSize: '1.1rem' }}>{price}</span>
          </div>
        </header>

        <section style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '12px', borderLeft: '4px solid #3182f6' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#4e5968', marginBottom: '0.8rem' }}>{t.home.registration.datesTitle}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.8rem' }}>
            {dates.length > 0 ? (
              dates.slice(0, 4).map((date, idx) => {
                const d = new Date(date);
                const dayNames = t.home.registration.dayNames || ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                const formatted = `${d.getMonth() + 1}/${d.getDate()} (${dayNames[d.getDay()] || ''})`;
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
              <div style={{ color: '#8b95a1', fontSize: '0.9rem', gridColumn: 'span 2' }}>{t.home.registration.noDates}</div>
            )}
          </div>
          
          <div style={{ height: '1px', background: '#eef3f6', margin: '1rem 0' }} />
          
          <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#4e5968', marginBottom: '0.4rem' }}>{t.home.registration.curriculumTitle}</h3>
          <p style={{ color: '#191f28', fontWeight: 600, fontSize: '0.95rem', whiteSpace: 'pre-wrap', margin: 0 }}>{curriculum}</p>
        </section>
        
        {videoUrl && (
          <section>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#191f28', marginBottom: '1rem' }}>{t.home.registration.previewTitle}</h3>
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
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#191f28', marginBottom: '1rem' }}>{t.home.registration.introTitle}</h3>
          <p style={{ color: '#4e5968', lineHeight: 1.6, fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>{description}</p>
        </section>



        <section style={{ marginTop: '1rem', borderTop: '1px solid #f2f4f6', paddingTop: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#191f28', marginBottom: '1rem' }}>{t.home.registration.currentStatus}</h3>
          <div style={{ background: '#f9fafb', padding: '1.2rem', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.8rem', fontSize: '0.9rem' }}>
              <span style={{ fontWeight: 700, color: '#3182f6', minWidth: '70px' }}>{t.home.registration.leader} {leaders.length}</span>
              <span style={{ color: '#4e5968', lineHeight: 1.4 }}>
                {leaders.length > 0 ? leaders.map(l => isAdmin ? l.nickname : maskName(l.nickname)).join(', ') : t.home.registration.waiting}
              </span>
            </div>
            <div style={{ width: '100%', height: '1px', background: '#eef3f6' }} />
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.8rem', fontSize: '0.9rem' }}>
              <span style={{ fontWeight: 700, color: '#ff4b82', minWidth: '70px' }}>{t.home.registration.follower} {followers.length}</span>
              <span style={{ color: '#4e5968', lineHeight: 1.4 }}>
                {followers.length > 0 ? followers.map(f => isAdmin ? f.nickname : maskName(f.nickname)).join(', ') : t.home.registration.waiting}
              </span>
            </div>
          </div>
        </section>

        <footer style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', paddingTop: '1.5rem', borderTop: '1px solid #f2f4f6', paddingBottom: '2rem' }}>
          {isAdmin && (onEdit || onDelete) && (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {onEdit && (
                <button 
                  onClick={() => onEdit(id)}
                  style={{ flex: 1, padding: '1rem', borderRadius: '14px', border: '1px solid #f2f4f6', background: '#fff', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  {t.home.registration.edit}
                </button>
              )}
              {onDelete && (
                <button 
                  onClick={() => onDelete(id)}
                  style={{ flex: 1, padding: '1rem', borderRadius: '14px', border: '1px solid #fee2e2', background: '#fdf2f2', color: '#ef4444', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  {t.home.registration.delete}
                </button>
              )}
            </div>
          )}
          <div style={{ textAlign: 'center', color: '#8b95a1', fontSize: '0.8rem', letterSpacing: '-0.3px' }}>
            {t.home.registration.footerNote}
          </div>
        </footer>
      </div>
    </div>
  );
}

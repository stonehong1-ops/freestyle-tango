'use client';

import React, { useState, useEffect } from 'react';
import { Registration, TangoClass, CURRENT_REGISTRATION_MONTH, User, getUsers } from '@/lib/db';

export default function RegistrationAdmin() {
  const [activeSubTab, setActiveSubTab] = useState<'registrations' | 'visits'>('registrations');
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [classes, setClasses] = useState<TangoClass[]>([]);
  const [activities, setActivities] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [adminMonth, setAdminMonth] = useState(CURRENT_REGISTRATION_MONTH);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, [activeSubTab]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { getRegistrations, getClasses } = await import('@/lib/db');
      if (activeSubTab === 'registrations') {
        const [regs, cls] = await Promise.all([getRegistrations(), getClasses()]);
        setRegistrations(regs);
        setClasses(cls);
      } else {
        const acts = await getUsers();
        setActivities(acts);
      }
    } catch (error) {
      console.error("Fetch Admin Data Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    setIsLoading(true);
    const acts = await getUsers(searchQuery);
    setActivities(acts);
    setIsLoading(false);
  };

  const filteredRegs = registrations.filter(reg => (reg.month || '2026-04') === adminMonth);
  
  const leaders = filteredRegs.filter(r => (r.role || '').replace(/"/g, '') === 'leader');
  const followers = filteredRegs.filter(r => (r.role || '').replace(/"/g, '') === 'follower');

  const availableMonths = Array.from(new Set([
    '2026-04',
    ...registrations.map(r => r.month).filter(Boolean) as string[]
  ])).sort();

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  const formatVisitDate = (ts: any) => {
    if (!ts) return '-';
    // ts is Firestore Timestamp
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <div style={{ padding: '1rem' }}>
      {/* Tab Switcher */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', background: '#f2f4f6', padding: '4px', borderRadius: '12px' }}>
        <button 
          onClick={() => setActiveSubTab('registrations')}
          style={{ 
            flex: 1, padding: '8px', borderRadius: '10px', border: 'none', 
            background: activeSubTab === 'registrations' ? 'white' : 'transparent',
            boxShadow: activeSubTab === 'registrations' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
            fontWeight: 700, cursor: 'pointer', transition: '0.2s'
          }}
        >
          신청 현황
        </button>
        <button 
          onClick={() => setActiveSubTab('visits')}
          style={{ 
            flex: 1, padding: '8px', borderRadius: '10px', border: 'none', 
            background: activeSubTab === 'visits' ? 'white' : 'transparent',
            boxShadow: activeSubTab === 'visits' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
            fontWeight: 700, cursor: 'pointer', transition: '0.2s'
          }}
        >
          최근 방문
        </button>
      </div>

      {activeSubTab === 'registrations' ? (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#191f28' }}>수업 신청 현황</h2>
            <select 
              value={adminMonth} 
              onChange={(e) => setAdminMonth(e.target.value)}
              style={{ padding: '0.4rem 0.8rem', borderRadius: '10px', border: '1px solid #ddd', fontSize: '0.9rem' }}
            >
              {availableMonths.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {/* Leaders Section */}
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#3182f6', marginBottom: '0.75rem', paddingBottom: '0.4rem', borderBottom: '2px solid #3182f6' }}>
                리더 ({leaders.length}명)
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {leaders.map(reg => (
                  <div key={reg.id} style={{ background: '#f8f9fa', padding: '0.8rem', borderRadius: '12px', border: '1px solid #edf1f5' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                      <span style={{ fontWeight: 700, color: '#191f28', fontSize: '0.9rem' }}>{reg.nickname}</span>
                      <span style={{ fontSize: '0.75rem', color: '#8b95a1' }}>{formatDate(reg.date)}</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#4e5968' }}>
                      신청 수업: <span style={{ fontWeight: 700, color: '#3182f6' }}>{reg.classIds.length}개</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Followers Section */}
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#f04452', marginBottom: '0.75rem', paddingBottom: '0.4rem', borderBottom: '2px solid #f04452' }}>
                팔로워 ({followers.length}명)
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {followers.map(reg => (
                  <div key={reg.id} style={{ background: '#f8f9fa', padding: '0.8rem', borderRadius: '12px', border: '1px solid #edf1f5' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                      <span style={{ fontWeight: 700, color: '#191f28', fontSize: '0.9rem' }}>{reg.nickname}</span>
                      <span style={{ fontSize: '0.75rem', color: '#8b95a1' }}>{formatDate(reg.date)}</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#4e5968' }}>
                      신청 수업: <span style={{ fontWeight: 700, color: '#f04452' }}>{reg.classIds.length}개</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="text" 
                placeholder="닉네임 또는 번호 검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                style={{ 
                  flex: 1, padding: '12px 16px', borderRadius: '12px', border: '1px solid #e5e8eb',
                  fontSize: '0.95rem', outline: 'none', background: '#f9fafb'
                }}
              />
              <button 
                onClick={handleSearch}
                style={{ 
                  padding: '8px 16px', borderRadius: '12px', border: 'none', 
                  background: '#3182f6', color: 'white', fontWeight: 700, cursor: 'pointer'
                }}
              >
                검색
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {isLoading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#8b95a1' }}>데이터 로딩 중...</div>
            ) : activities.length > 0 ? (
              activities.map(act => (
                <div key={act.phone} style={{ display: 'flex', alignItems: 'center', background: '#f8f9fa', padding: '1rem', borderRadius: '16px', border: '1px solid #edf1f5' }}>
                  {act.photoURL ? (
                    <img src={act.photoURL} alt={act.nickname} style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '12px', background: '#eee' }} />
                  ) : (
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#3182f6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px', fontWeight: 700 }}>
                      {act.nickname.charAt(0)}
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: '#191f28', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {act.nickname}
                      <span style={{ fontSize: '0.75rem', fontWeight: 400, color: '#8b95a1' }}>{act.phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-****-$3')}</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#4e5968', marginTop: '2px' }}>
                      최근 방문: <span style={{ color: '#3182f6', fontWeight: 600 }}>{formatVisitDate(act.lastVisit)}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#8b95a1' }}>방문 이력이 없습니다.</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

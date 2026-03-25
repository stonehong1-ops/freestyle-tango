'use client';

import React, { useState, useEffect } from 'react';
import { Registration, TangoClass, CURRENT_REGISTRATION_MONTH } from '@/lib/db';

export default function RegistrationAdmin() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [classes, setClasses] = useState<TangoClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [adminMonth, setAdminMonth] = useState(CURRENT_REGISTRATION_MONTH);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { getRegistrations, getClasses } = await import('@/lib/db');
      const [regs, cls] = await Promise.all([getRegistrations(), getClasses()]);
      setRegistrations(regs);
      setClasses(cls);
    } catch (error) {
      console.error("Fetch Admin Data Error:", error);
    } finally {
      setIsLoading(false);
    }
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

  if (isLoading) return <div style={{ textAlign: 'center', padding: '2rem' }}>신청 데이터 불러오는 중...</div>;

  return (
    <div style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#191f28' }}>수업 신청 현황</h2>
        <select 
          value={adminMonth} 
          onChange={(e) => setAdminMonth(e.target.value)}
          style={{ padding: '0.5rem 1rem', borderRadius: '12px', border: '1px solid #ddd', fontSize: '1rem' }}
        >
          {availableMonths.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Leaders Section */}
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#3182f6', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid #3182f6' }}>
            리더 ({leaders.length}명)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {leaders.map(reg => (
              <div key={reg.id} style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '14px', border: '1px solid #edf1f5' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ fontWeight: 700, color: '#191f28' }}>{reg.nickname}</span>
                  <span style={{ fontSize: '0.8rem', color: '#8b95a1' }}>{formatDate(reg.date)}</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#4e5968' }}>
                  신청 수업: <span style={{ fontWeight: 700, color: '#3182f6' }}>{reg.classIds.length}개</span>
                </div>
              </div>
            ))}
            {leaders.length === 0 && <div style={{ color: '#adb5bd', fontSize: '0.9rem', textAlign: 'center', padding: '2rem' }}>신청자가 없습니다.</div>}
          </div>
        </div>

        {/* Followers Section */}
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f04452', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid #f04452' }}>
            팔로워 ({followers.length}명)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {followers.map(reg => (
              <div key={reg.id} style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '14px', border: '1px solid #edf1f5' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ fontWeight: 700, color: '#191f28' }}>{reg.nickname}</span>
                  <span style={{ fontSize: '0.8rem', color: '#8b95a1' }}>{formatDate(reg.date)}</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#4e5968' }}>
                  신청 수업: <span style={{ fontWeight: 700, color: '#f04452' }}>{reg.classIds.length}개</span>
                </div>
              </div>
            ))}
            {followers.length === 0 && <div style={{ color: '#adb5bd', fontSize: '0.9rem', textAlign: 'center', padding: '2rem' }}>신청자가 없습니다.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { Registration, TangoClass } from '@/lib/db';

export default function RegistrationAdmin() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [classes, setClasses] = useState<TangoClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
    } catch (error: unknown) {
      console.error("Fetch Admin Data Error:", error);
    } finally {
      setIsLoading(false);
    }
  };



  // Counts are now handled automatically on the fly in the class list UI

  const getClassTitles = (ids: string[]) => {
    return ids.map(id => {
      const cls = classes.find(c => c.id === id);
      return cls ? cls.title : '알 수 없는 수업';
    }).join(', ');
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  if (isLoading) return <div style={{ textAlign: 'center', padding: '2rem' }}>신청 내역 불러오는 중...</div>;

  return (
    <div style={{ background: '#fff', borderRadius: '16px', padding: '1rem', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem', gap: '0.5rem' }}>

        {/* Counts are now calculated on the fly, no recalibration needed */}
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '2px solid #eee' }}>
              <th style={{ padding: '1rem', textAlign: 'left', color: '#8b95a1' }}>날짜</th>
              <th style={{ padding: '1rem', textAlign: 'left', color: '#8b95a1' }}>닉네임</th>
              <th style={{ padding: '1rem', textAlign: 'left', color: '#8b95a1' }}>역할</th>
              <th style={{ padding: '1rem', textAlign: 'left', color: '#8b95a1' }}>신청수업</th>
              <th style={{ padding: '1rem', textAlign: 'left', color: '#8b95a1' }}>구분</th>
              <th style={{ padding: '1rem', textAlign: 'left', color: '#8b95a1' }}>연락처</th>
            </tr>
          </thead>
          <tbody>
            {registrations.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#adb5bd' }}>신청 내역이 없습니다.</td>
              </tr>
            ) : (
              registrations.map(reg => (
                <tr key={reg.id} style={{ borderBottom: '1px solid #f2f4f6' }}>
                  <td style={{ padding: '1rem', color: '#4e5968' }}>{formatDate(reg.date)}</td>
                  <td style={{ padding: '1rem', fontWeight: 700, color: '#191f28' }}>{reg.nickname}</td>
                  <td style={{ padding: '1rem' }}>
                    {(() => {
                      const role = (reg.role || '').replace(/"/g, '');
                      return (
                        <span style={{ 
                          padding: '0.3rem 0.6rem', 
                          borderRadius: '8px', 
                          fontSize: '0.75rem',
                          background: role === 'leader' ? '#e8f3ff' : '#fff0f2',
                          color: role === 'leader' ? '#1b64da' : '#f04452',
                          fontWeight: 700
                        }}>
                          {role === 'leader' ? '리더' : '팔로워'}
                        </span>
                      );
                    })()}
                  </td>
                  <td style={{ padding: '1rem', color: '#4e5968', maxWidth: '300px' }}>{getClassTitles(reg.classIds)}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      padding: '0.3rem 0.6rem', 
                      borderRadius: '8px', 
                      fontSize: '0.8rem',
                      background: reg.type === '6개월 멤버쉽' ? '#fff0f2' : reg.type === '1개월 신청' ? '#eef3ff' : '#f2f4f6',
                      color: reg.type === '6개월 멤버쉽' ? '#f04452' : reg.type === '1개월 신청' ? '#3182f6' : '#4e5968',
                      fontWeight: 600
                    }}>
                      {reg.type}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', color: '#8b95a1', fontSize: '0.8rem' }}>{reg.phone}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

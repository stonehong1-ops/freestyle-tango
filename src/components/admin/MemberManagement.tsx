'use client';

import React, { useState, useEffect } from 'react';
import { User, Registration, getUsers, remapStorageUrl } from '@/lib/db';
import { useLanguage } from '@/contexts/LanguageContext';
import { hasRole } from '@/utils/auth';

interface Props {
  registrations: Registration[];
  onClose: () => void;
}

export default function MemberManagement({ registrations, onClose }: Props) {
  const { t } = useLanguage();
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'lastVisit' | 'createdAt' | 'engagement'>('engagement');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchData();
  }, []);

  const handleChat = async (targetUser: any) => {
    try {
      const stored = localStorage.getItem('ft_user');
      if (!stored) {
        alert("로그인이 필요합니다.");
        return;
      }
      const currentUser = JSON.parse(stored);
      
      const { getOrCreatePrivateRoom } = await import('@/lib/chat');
      const myPhone = currentUser.phone.replace(/[^0-9]/g, '');
      const otherPhone = targetUser.phone.replace(/[^0-9]/g, '');
      
      if (myPhone === otherPhone) {
        alert("자기 자신과는 채팅할 수 없습니다.");
        return;
      }

      const roomId = await getOrCreatePrivateRoom(
        [
          { nickname: currentUser.nickname, phone: myPhone },
          { nickname: targetUser.nickname || targetUser.phone, phone: otherPhone }
        ],
        myPhone
      );

      if (roomId) {
        window.dispatchEvent(new CustomEvent('ft_open_chat', {
          detail: {
            roomId: roomId,
            roomName: targetUser.nickname || targetUser.phone,
            participants: [myPhone, otherPhone]
          }
        }));
        onClose(); // MemberManagement 모달 닫기
      }
    } catch (error) {
      console.error("Chat Error:", error);
      alert("채팅방을 열 수 없습니다.");
    }
  };

  const handleSort = (type: typeof sortBy) => {
    if (sortBy === type) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(type);
      setSortOrder('desc');
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const data = await getUsers(); // Fetches all users from Firestore
      setUsers(data);
    } catch (error) {
      console.error("Fetch Users Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Combine Firestore users with users from registrations
  const allMembers = React.useMemo(() => {
    const memberMap = new Map<string, any>();

    // 1. Add people from registrations (base data)
    registrations.forEach(reg => {
      const phone = (reg.phone || '').replace(/[^0-9]/g, '');
      if (!phone) return;
      
      const existing = memberMap.get(phone);
      // Keep the most recent registration's nickname/role
      if (!existing || (reg.month || '') > (existing._month || '')) {
        memberMap.set(phone, {
          phone,
          nickname: reg.nickname || 'Guest',
          role: reg.role,
          createdAt: reg.date,
          _month: reg.month, // for internal sorting
          regCount: 0,
          settings: { pushEnabled: false, openChat: false, privateChat: false }
        });
      }
      
      const current = memberMap.get(phone);
      if (current) current.regCount = (current.regCount || 0) + 1;
    });

    // 2. Merge with Firestore users (more detailed data)
    (users || []).forEach(user => {
      const phone = (user.phone || '').replace(/[^0-9]/g, '');
      if (!phone) return;
      const existing = memberMap.get(phone);
      memberMap.set(phone, {
        ...(existing || { regCount: 0 }),
        ...user,
        phone // ensure consistent phone
      });
    });

    // 3. Calculate Engagement Score & Percentile
    const members = Array.from(memberMap.values()).map(m => {
      const visitScore = (m.visitCount || 0) * 2;
      const dwellScore = (m.dwellMinutes || 0) * 1;
      const regScore = (m.regCount || 0) * 20;
      return { ...m, engagementScore: visitScore + dwellScore + regScore };
    });

    // Rank them to get percentile
    const sortedByScore = [...members].sort((a, b) => b.engagementScore - a.engagementScore);
    const total = sortedByScore.length;
    
    return members.map(m => {
      const rank = sortedByScore.findIndex(s => s.phone === m.phone);
      const topPercent = total > 0 ? Math.max(1, Math.ceil(((rank + 1) / total) * 100)) : 100;
      return { ...m, topPercent };
    });
  }, [users, registrations]);

  const filteredMembers = React.useMemo(() => {
    let result = allMembers;
    
    if (searchQuery.trim()) {
      const lowerSearch = searchQuery.toLowerCase();
      const cleanSearch = lowerSearch.replace(/[^0-9]/g, '');
      
      result = result.filter(m => 
        (m.nickname || '').toLowerCase().includes(lowerSearch) ||
        (m.phone || '').replace(/[^0-9]/g, '').includes(cleanSearch)
      );
    }

    return result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'engagement') {
        comparison = b.engagementScore - a.engagementScore;
      } else {
        const fieldPath = sortBy as keyof any;
        const timeA = (a[fieldPath]?.toDate ? a[fieldPath].toDate().getTime() : (a[fieldPath] ? new Date(a[fieldPath]).getTime() : 0));
        const timeB = (b[fieldPath]?.toDate ? b[fieldPath].toDate().getTime() : (b[fieldPath] ? new Date(b[fieldPath]).getTime() : 0));
        comparison = timeB - timeA;
      }
      
      // Default comparison is DESC, so if sortOrder is ASC, reverse result
      return sortOrder === 'desc' ? comparison : -comparison;
    });
  }, [allMembers, searchQuery, sortBy, sortOrder]);

  const formatVisitDate = (ts: any) => {
    if (!ts) return '-';
    try {
      const d = ts.toDate ? ts.toDate() : new Date(ts);
      if (isNaN(d.getTime())) return '-';
      return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    } catch(e) { return '-'; }
  };

  const formatDateOnly = (ts: any) => {
    if (!ts) return '-';
    try {
      const d = ts.toDate ? ts.toDate() : new Date(ts);
      if (isNaN(d.getTime())) return '-';
      return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
    } catch(e) { return '-'; }
  };

  const getLastRegistrationMonth = (phone: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const userRegs = registrations
      .filter(r => (r.phone || '').replace(/[^0-9]/g, '') === cleanPhone)
      .sort((a, b) => (b.month || '').localeCompare(a.month || ''));
    return userRegs.length > 0 ? userRegs[0].month : '-';
  };

  const handleToggleInstructor = async (phone: string, currentStatus: boolean) => {
    try {
      const { updateUserProfile } = await import('@/lib/db');
      await updateUserProfile(phone, { isInstructor: !currentStatus });
      
      // Update local state
      setUsers(prev => prev.map(u => 
        u.phone === phone ? { ...u, isInstructor: !currentStatus } : u
      ));
    } catch (error) {
      console.error("Toggle Instructor Error:", error);
      alert(t.admin.member.errorToggle);
    }
  };

  const SortIcon = ({ type }: { type: typeof sortBy }) => {
    if (sortBy !== type) return <span style={{ opacity: 0.3, fontSize: '0.7rem' }}>↕</span>;
    return <span style={{ fontSize: '0.7rem' }}>{sortOrder === 'asc' ? '▲' : '▼'}</span>;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#f2f4f6' }}>
      {/* Search & Sort Area */}
      <div style={{ padding: '1.25rem', background: 'white', borderBottom: '1px solid #eee' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem' }}>
          <input 
            type="text" 
            placeholder={t.admin.member.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ 
              flex: 1, padding: '12px 16px', borderRadius: '12px', border: '1px solid #e5e8eb',
              fontSize: '0.95rem', outline: 'none', background: '#f9fafb'
            }}
          />
          <button 
            style={{ 
              padding: '0 20px', borderRadius: '12px', border: 'none', 
              background: '#3182f6', color: 'white', fontWeight: 700, cursor: 'pointer',
              whiteSpace: 'nowrap', flexShrink: 0
            }}
            onClick={() => {(document?.activeElement as any)?.blur()}}
          >
            {t.admin.member.searchBtn}
          </button>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => handleSort('engagement')}
            style={{ 
              flex: 1, padding: '10px 8px', borderRadius: '12px', border: 'none',
              background: sortBy === 'engagement' ? '#3182f6' : '#f2f4f6',
              color: sortBy === 'engagement' ? 'white' : '#4e5968',
              fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', transition: '0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px'
            }}
          >
            🔥 {t.admin.member.engagement} <SortIcon type="engagement" />
          </button>
          <button 
            onClick={() => handleSort('createdAt')}
            style={{ 
              flex: 1, padding: '10px 8px', borderRadius: '12px', border: 'none',
              background: sortBy === 'createdAt' ? '#3182f6' : '#f2f4f6',
              color: sortBy === 'createdAt' ? 'white' : '#4e5968',
              fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', transition: '0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px'
            }}
          >
            {t.admin.member.joinDate} <SortIcon type="createdAt" />
          </button>
          <button 
            onClick={() => handleSort('lastVisit')}
            style={{ 
              flex: 1, padding: '10px 8px', borderRadius: '12px', border: 'none',
              background: sortBy === 'lastVisit' ? '#3182f6' : '#f2f4f6',
              color: sortBy === 'lastVisit' ? 'white' : '#4e5968',
              fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', transition: '0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px'
            }}
          >
            {t.admin.member.recentVisit} <SortIcon type="lastVisit" />
          </button>
        </div>
      </div>

      {/* Member List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#8b95a1' }}>{t.admin.member.loading}</div>
        ) : filteredMembers.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filteredMembers.map(user => {
              const lastMonth = getLastRegistrationMonth(user.phone);
              const pushStatus = user.settings?.pushEnabled ? 'ON' : 'OFF';
              
              return (
                <div key={user.phone} style={{ background: 'white', padding: '1.25rem', borderRadius: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', border: '1px solid #f2f4f6' }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                    {user.photoURL ? (
                      <img src={remapStorageUrl(user.photoURL)} alt={user.nickname} style={{ width: '44px', height: '44px', borderRadius: '15px', marginRight: '12px', background: '#f2f4f6', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '44px', height: '44px', borderRadius: '15px', background: user.role === 'leader' ? '#3182f6' : '#f04452', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px', fontWeight: 800, fontSize: '1.1rem' }}>
                        {(user.nickname || '?').charAt(0)}
                      </div>
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ fontWeight: 800, color: '#191f28', fontSize: '1.1rem' }}>{user.nickname || 'Guest'}</div>

                            {user.device && (
                              <div title={user.device} style={{ display: 'flex', alignItems: 'center', opacity: 0.7 }}>
                                {user.device === 'ios' && (
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 20.94c1.88 0 3.05-1.12 4.14-1.12 1.09 0 2.22 1.05 4.11 1.05.7 0 1.25-.19 1.76-.57-1.1-1.28-1.85-3.32-1.85-5.71 0-3.32 2.37-5.06 2.37-5.06-1.1-1.61-2.82-1.92-3.41-1.92-1.6 0-2.31.84-3.41.84-1.08 0-2.2-.84-3.4-.84-1.94 0-4.14 1.34-4.14 5.2 0 1.83.67 4.1 1.84 5.92 1.03 1.63 2.08 2.21 3.03 2.21zm.2-16.74c1.1 0 2.31-.83 2.31-2.2 0-.15-.02-.32-.05-.48-1.54.07-2.31.95-2.31 2.2 0 .15.02.32.05.48z"/>
                                  </svg>
                                )}
                                {user.device === 'android' && (
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M5 16s0-2 2-2 2 2 2 2v2H5v-2zM15 16s0-2 2-2 2 2 2 2v2h-4v-2zM10 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM14 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
                                    <path d="M6 3l1.5 2M18 3l-1.5 2M4 7h16v8H4zM4 15a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4H4z"/>
                                  </svg>
                                )}
                                {user.device === 'pc' && (
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                                    <line x1="8" y1="21" x2="16" y2="21"/>
                                    <line x1="12" y1="17" x2="12" y2="21"/>
                                  </svg>
                                )}
                              </div>
                            )}
                          </div>
                          <div style={{ fontSize: '0.85rem', color: '#8b95a1', marginTop: '2px' }}>
                            {user.phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3')}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button 
                            onClick={() => handleChat(user)}
                            style={{ 
                              background: '#f2f4f6', border: 'none', borderRadius: '8px', 
                              width: '32px', height: '32px', display: 'flex', alignItems: 'center', 
                              justifyContent: 'center', cursor: 'pointer', fontSize: '1rem' 
                            }}
                            title="Message"
                          >
                            💬
                          </button>
                          <div style={{ 
                            padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700,
                            background: user.role === 'leader' ? '#e8f3ff' : '#fff0f0',
                            color: user.role === 'leader' ? '#3182f6' : '#f04452'
                          }}>
                            {user.role === 'leader' ? t.admin.member.leader : t.admin.member.follower}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                        {hasRole(user, 'admin') && (
                          <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '0.65rem', background: '#fee500', color: '#191f28', fontWeight: 800 }}>ADMIN</span>
                        )}
                        {hasRole(user, 'staff') && (
                          <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '0.65rem', background: '#3182f6', color: 'white', fontWeight: 800 }}>STAFF</span>
                        )}
                        {hasRole(user, 'instructor') && (
                          <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '0.65rem', background: '#00c73c', color: 'white', fontWeight: 800 }}>INSTRUCTOR</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', paddingTop: '12px', borderTop: '1px solid #f2f4f6' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '0.75rem', color: '#8b95a1' }}>{t.admin.member.joinDate}</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4e5968' }}>{formatDateOnly(user.createdAt)}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '0.75rem', color: '#8b95a1' }}>{t.admin.member.pushStatus}</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: pushStatus === 'ON' ? '#3182f6' : '#f04452' }}>
                        {pushStatus}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '0.75rem', color: '#8b95a1' }}>{t.admin.member.recentVisit}</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4e5968' }}>{formatVisitDate(user.lastVisit)}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '0.75rem', color: '#8b95a1' }}>{t.admin.member.lastRegMonth}</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#191f28' }}>{lastMonth}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '0.75rem', color: '#3182f6', fontWeight: 600 }}>🔥 {t.admin.member.engagement}</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#3182f6' }}>
                        {t.admin.member.topPercent.replace('{percent}', String(user.topPercent))}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px dashed #eee', paddingTop: '10px', gridColumn: 'span 2' }}>
                      <span style={{ fontSize: '0.75rem', color: '#8b95a1', marginBottom: '2px' }}>회원 역할 설정</span>
                      <select 
                        value={Array.isArray(user.staffRole) ? user.staffRole[0] : (user.staffRole?.includes(',') ? user.staffRole.split(',')[0].trim() : (user.staffRole || 'none'))}
                        onChange={async (e) => {
                          const newRole = e.target.value as any;
                          try {
                            const { updateUserProfile } = await import('@/lib/db');
                            await updateUserProfile(user.phone, { 
                              staffRole: newRole,
                              isInstructor: newRole === 'instructor' || newRole === 'admin'
                            });
                            setUsers(prev => prev.map(u => 
                              u.phone === user.phone ? { ...u, staffRole: newRole, isInstructor: newRole === 'instructor' || newRole === 'admin' } : u
                            ));
                          } catch (error) {
                            console.error("Update Role Error:", error);
                            alert("역할 변경 중 오류가 발생했습니다.");
                          }
                        }}
                        style={{ 
                          width: '100%', padding: '10px', borderRadius: '12px', border: '1px solid #e5e8eb',
                          background: '#f9fafb', color: '#191f28', fontSize: '0.85rem', fontWeight: 700,
                          outline: 'none', cursor: 'pointer'
                        }}
                      >
                        <option value="none">일반 회원 (None)</option>
                        <option value="instructor">강사 (Instructor)</option>
                        <option value="staff">운영스탭 (Staff)</option>
                        <option value="admin">관리자 (Admin)</option>
                      </select>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '5rem 0', color: '#8b95a1' }}>
            {t.admin.member.noResults}
          </div>
        )}
      </div>
    </div>
  );
}

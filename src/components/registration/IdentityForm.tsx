'use client';

import React, { useState } from 'react';
import styles from './RegistrationForm.module.css';

interface IdentityFormProps {
  onClose: () => void;
  onComplete: () => void;
}

export default function IdentityForm({ onClose, onComplete }: IdentityFormProps) {
  const [role, setRole] = useState<'leader' | 'follower' | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 11);
    setPhone(value);
  };

  const handleComplete = () => {
    if (role && name && phone.length >= 10) {
      localStorage.setItem('ft_user', JSON.stringify({ nickname: name, phone, role }));
      window.dispatchEvent(new Event('ft_user_updated'));
      onComplete();
    }
  };

  return (
    <div className={styles.formContainer} style={{ padding: '0 0.5rem' }}>
      <h2 style={{ fontSize: '1.25rem', color: '#191f28', marginBottom: '0.4rem', fontWeight: 700 }}>정보 입력</h2>
      <p style={{ fontSize: '0.9rem', color: '#8b95a1', marginBottom: '1.5rem' }}>회원님의 정보를 입력해 주세요.</p>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', fontSize: '0.85rem', color: '#4e5968', marginBottom: '0.5rem', fontWeight: 600 }}>역할</label>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            onClick={() => setRole('leader')}
            style={{
              flex: 1, padding: '0.8rem', borderRadius: '12px', border: 'none',
              background: role === 'leader' ? '#3182f6' : '#f2f4f6',
              color: role === 'leader' ? '#fff' : '#4e5968',
              fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            리더
          </button>
          <button 
            onClick={() => setRole('follower')}
            style={{
              flex: 1, padding: '0.8rem', borderRadius: '12px', border: 'none',
              background: role === 'follower' ? '#3182f6' : '#f2f4f6',
              color: role === 'follower' ? '#fff' : '#4e5968',
              fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            팔로워
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', fontSize: '0.85rem', color: '#4e5968', marginBottom: '0.5rem', fontWeight: 600 }}>이름</label>
        <input 
          type="text" placeholder="홍길동" value={name} onChange={(e) => setName(e.target.value)}
          style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #eef3f6', background: '#f9fafb', fontSize: '1rem' }}
        />
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <label style={{ display: 'block', fontSize: '0.85rem', color: '#4e5968', marginBottom: '0.5rem', fontWeight: 600 }}>휴대폰 번호 (숫자만)</label>
        <input 
          type="tel" placeholder="01012345678" value={phone} onChange={handlePhoneChange}
          style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #eef3f6', background: '#f9fafb', fontSize: '1rem' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button 
          onClick={onClose}
          style={{ flex: 1, padding: '1rem', borderRadius: '12px', border: 'none', background: '#f2f4f6', color: '#4e5968', fontWeight: 600, cursor: 'pointer' }}
        >
          취소
        </button>
        <button 
          onClick={handleComplete}
          disabled={!role || !name || phone.length < 10}
          style={{
            flex: 2, padding: '1rem', borderRadius: '12px', border: 'none',
            background: (!role || !name || phone.length < 10) ? '#e5e8eb' : '#3182f6',
            color: '#fff', fontWeight: 600, cursor: 'pointer'
          }}
        >
          확인
        </button>
      </div>
    </div>
  );
}

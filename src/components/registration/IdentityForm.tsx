'use client';

import React, { useState } from 'react';
import styles from './RegistrationForm.module.css';

interface IdentityFormProps {
  onClose: () => void;
  onComplete: () => void;
}

export default function IdentityForm({ onClose, onComplete }: IdentityFormProps) {
  const [role, setRole] = useState<'leader' | 'follower' | null>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('ft_user') : null;
    return saved ? JSON.parse(saved).role : null;
  });
  const [name, setName] = useState(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('ft_user') : null;
    return saved ? JSON.parse(saved).nickname : '';
  });
  const [phone, setPhone] = useState(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('ft_user') : null;
    return saved ? JSON.parse(saved).phone : '';
  });

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

  const isFormValid = role && name.trim() !== '' && phone.length >= 10;

  return (
    <div className={styles.formContainer} style={{ gap: '1rem', padding: '0 0.5rem' }}>
      <p style={{ 
        fontSize: '0.95rem', 
        color: '#4e5968', 
        marginBottom: '0.5rem', 
        textAlign: 'center',
        lineHeight: '1.5',
        wordBreak: 'keep-all'
      }}>
        내 닉네임과 전화번호가 필요한 서비스입니다.
      </p>

      <div style={{ marginBottom: '0.75rem' }}>
        <label style={{ display: 'block', fontSize: '0.85rem', color: '#8b95a1', marginBottom: '0.4rem', fontWeight: 600 }}>역할</label>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            onClick={() => setRole('leader')}
            className={`${styles.roleBtn} ${role === 'leader' ? styles.selected : ''}`}
            style={{ 
              flex: 1, padding: '0.75rem', borderRadius: '12px', border: '1px solid #f2f4f6',
              background: role === 'leader' ? '#3182f6' : '#f9fafb',
              color: role === 'leader' ? '#fff' : '#4e5968',
              fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
              aspectRatio: 'unset', height: 'auto', flexDirection: 'row', gap: '0'
            }}
          >
            리더
          </button>
          <button 
            onClick={() => setRole('follower')}
            className={`${styles.roleBtn} ${role === 'follower' ? styles.selected : ''}`}
            style={{ 
              flex: 1, padding: '0.75rem', borderRadius: '12px', border: '1px solid #f2f4f6',
              background: role === 'follower' ? '#3182f6' : '#f9fafb',
              color: role === 'follower' ? '#fff' : '#4e5968',
              fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
              aspectRatio: 'unset', height: 'auto', flexDirection: 'row', gap: '0'
            }}
          >
            팔로워
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '0.75rem' }}>
        <label style={{ display: 'block', fontSize: '0.85rem', color: '#8b95a1', marginBottom: '0.4rem', fontWeight: 600 }}>이름 (닉네임)</label>
        <input 
          type="text" 
          placeholder="사용하실 닉네임을 입력해주세요" 
          value={name} 
          onChange={(e) => setName(e.target.value)}
          className={styles.input}
          style={{ padding: '0.8rem 1rem', borderRadius: '12px', background: '#f9fafb', border: '1px solid #f2f4f6' }}
        />
      </div>

      <div style={{ marginBottom: '1.25rem' }}>
        <label style={{ display: 'block', fontSize: '0.85rem', color: '#8b95a1', marginBottom: '0.4rem', fontWeight: 600 }}>휴대폰 번호 (숫자만)</label>
        <input 
          type="tel" 
          placeholder="01012345678" 
          value={phone} 
          onChange={handlePhoneChange}
          className={styles.input}
          style={{ padding: '0.8rem 1rem', borderRadius: '12px', background: '#f9fafb', border: '1px solid #f2f4f6' }}
        />
      </div>

      <button 
        onClick={handleComplete}
        disabled={!isFormValid}
        className={styles.nextBtn}
        style={{ 
          marginTop: '0', 
          padding: '1rem', 
          borderRadius: '16px',
          background: !isFormValid ? '#e5e8eb' : '#3182f6',
          fontSize: '1.05rem'
        }}
      >
        확인
      </button>
    </div>
  );
}

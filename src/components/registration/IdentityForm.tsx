'use client';

import React, { useState } from 'react';
import styles from './RegistrationForm.module.css';

interface IdentityFormProps {
  onClose: () => void;
  onComplete: () => void;
}

export default function IdentityForm({ onClose, onComplete }: IdentityFormProps) {
  const [gender, setGender] = useState<'male' | 'female' | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only numbers
    const value = e.target.value.replace(/[^0-9]/g, '');
    setPhone(value);
  };

  const handleComplete = () => {
    if (gender && name && phone) {
      localStorage.setItem('ft_user', JSON.stringify({ nickname: name, phone, gender }));
      window.dispatchEvent(new Event('ft_user_updated'));
      onComplete();
    }
  };

  return (
    <div className={styles.formContainer} style={{ padding: '0.5rem 0' }}>
      <div>
        <h2 className={styles.stepTitle} style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
          정보를 입력해 주세요
        </h2>
        <p className={styles.stepDesc} style={{ marginBottom: '1.5rem' }}>
          성함과 연락처를 남겨주시면 신청이 진행됩니다.
        </p>

        <div className={styles.inputGroup}>
          <div className={styles.inputWrapper}>
            <label className={styles.inputLabel}>성별</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                onClick={() => setGender('male')}
                style={{
                  flex: 1,
                  padding: '0.8rem',
                  borderRadius: '12px',
                  border: 'none',
                  background: gender === 'male' ? '#3182f6' : '#f2f4f6',
                  color: gender === 'male' ? '#fff' : '#4e5968',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                리더 (남)
              </button>
              <button 
                onClick={() => setGender('female')}
                style={{
                  flex: 1,
                  padding: '0.8rem',
                  borderRadius: '12px',
                  border: 'none',
                  background: gender === 'female' ? '#3182f6' : '#f2f4f6',
                  color: gender === 'female' ? '#fff' : '#4e5968',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                팔로워 (여)
              </button>
            </div>
          </div>

          <div className={styles.inputWrapper}>
            <label className={styles.inputLabel}>이름 (또는 닉네임)</label>
            <input 
              className={styles.input} 
              type="text" 
              placeholder="예: 홍길동"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className={styles.inputWrapper}>
            <label className={styles.inputLabel}>휴대폰 번호 (- 없이 숫자만)</label>
            <input 
              className={styles.input} 
              type="tel" 
              placeholder="01012345678"
              value={phone}
              onChange={handlePhoneChange}
              maxLength={11}
            />
          </div>
        </div>
      </div>

      <footer className={styles.footer} style={{ marginTop: '2rem' }}>
        <button className={styles.backBtn} onClick={onClose}>
          취소
        </button>
        <button 
          className={styles.nextBtn} 
          onClick={handleComplete}
          disabled={!gender || !name || phone.length < 10}
        >
          확인
        </button>
      </footer>
    </div>
  );
}

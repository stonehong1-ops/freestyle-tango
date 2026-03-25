'use client';

import React, { useState } from 'react';
import styles from './RegistrationForm.module.css';

interface IdentityFormProps {
  onClose: () => void;
  onComplete: () => void;
}

export default function IdentityForm({ onClose, onComplete }: IdentityFormProps) {
  const [step, setStep] = useState<'gender' | 'info'>('gender');
  const [gender, setGender] = useState<'male' | 'female' | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const handleNext = () => {
    if (step === 'gender' && gender) {
      setStep('info');
    } else if (step === 'info' && name && phone) {
      localStorage.setItem('ft_user', JSON.stringify({ nickname: name, phone, gender }));
      window.dispatchEvent(new Event('ft_user_updated'));
      onComplete();
    }
  };

  const handleBack = () => {
    if (step === 'info') {
      setStep('gender');
    } else {
      onClose();
    }
  };

  return (
    <div className={styles.formContainer}>
      <div>
        <h2 className={styles.stepTitle}>
          {step === 'gender' ? '성별을 선택해 주세요' : '연락처를 남겨주세요'}
        </h2>
        <p className={styles.stepDesc}>
          {step === 'gender' 
            ? '원활한 성비 균형을 위해 성별 확인이 필요합니다.' 
            : '신청 결과 안내를 위해 정확한 정보를 입력해 주세요.'}
        </p>

        {step === 'gender' ? (
          <div className={styles.genderGrid}>
            <button 
              className={`${styles.genderBtn} ${gender === 'male' ? styles.selected : ''}`}
              onClick={() => setGender('male')}
            >
              <span className={styles.genderIcon}>👔</span>
              <span className={styles.genderLabel}>리더 (남성)</span>
            </button>
            <button 
              className={`${styles.genderBtn} ${gender === 'female' ? styles.selected : ''}`}
              onClick={() => setGender('female')}
            >
              <span className={styles.genderIcon}>👠</span>
              <span className={styles.genderLabel}>팔로워 (여성)</span>
            </button>
          </div>
        ) : (
          <div className={styles.inputGroup}>
            <div className={styles.inputWrapper}>
              <label className={styles.inputLabel}>이름 (또는 닉네임)</label>
              <input 
                className={styles.input} 
                type="text" 
                placeholder="홍길동"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className={styles.inputWrapper}>
              <label className={styles.inputLabel}>휴대폰 번호</label>
              <input 
                className={styles.input} 
                type="tel" 
                placeholder="010-0000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      <footer className={styles.footer}>
        <button className={styles.backBtn} onClick={handleBack}>
          이전
        </button>
        <button 
          className={styles.nextBtn} 
          onClick={handleNext}
          disabled={step === 'gender' ? !gender : (!name || !phone)}
        >
          {step === 'gender' ? '다음' : '완료하고 넘어가기'}
        </button>
      </footer>
    </div>
  );
}

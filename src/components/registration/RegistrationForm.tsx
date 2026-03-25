'use client';

import React, { useState } from 'react';
import styles from './RegistrationForm.module.css';

interface RegistrationFormProps {
  classId: string;
  classTitle: string;
  onClose: () => void;
}

type Step = 'role' | 'info' | 'success';

export default function RegistrationForm({ classId, onClose }: RegistrationFormProps) {
  const [step, setStep] = useState<Step>('role');
  const [role, setRole] = useState<'leader' | 'follower' | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  React.useEffect(() => {
    const savedUser = localStorage.getItem('ft_user');
    if (savedUser) {
      const { nickname, phone } = JSON.parse(savedUser);
      setName(nickname || '');
      setPhone(phone || '');
      setRole('follower'); // default for ease, they can change it
    }
  }, []);

  const handleNext = () => {
    if (step === 'role' && role) {
      setStep('info');
    } else if (step === 'info' && name && phone) {
      const saved = localStorage.getItem('my_tango_classes');
      const ids = saved ? new Set(JSON.parse(saved) as string[]) : new Set<string>();
      ids.add(classId);
      localStorage.setItem('my_tango_classes', JSON.stringify(Array.from(ids)));
      
      // Save user identity unconditionally
      localStorage.setItem('ft_user', JSON.stringify({ nickname: name, phone }));
      window.dispatchEvent(new Event('ft_user_updated'));
      
      setStep('success');
    }
  };

  const handleBack = () => {
    if (step === 'info') {
      setStep('role');
    } else {
      onClose();
    }
  };

  if (step === 'success') {
    return (
      <div className={styles.successArea} style={{ textAlign: 'center' }}>
        <div className={styles.successIcon} style={{ fontSize: '4rem', marginBottom: '1rem' }}>✨</div>
        <h2 className={styles.stepTitle}>환영합니다.</h2>
        <p className={styles.stepDesc} style={{ marginBottom: '1rem', color: '#4e5968' }}>
          신청은 완료되었습니다.<br/>
          위 계좌로 입금하시기 바랍니다.
        </p>
        <p className={styles.stepDesc} style={{ fontSize: '0.9rem', color: '#8b95a1', marginBottom: '2rem' }}>
          입금시 닉네임을 알 수 있거나,<br/>
          입금자명을 스톤에게 보내주셔야<br/>
          정확히 확인할 수 있습니다.
        </p>
        <div style={{ background: '#f2f4f6', padding: '1.5rem', borderRadius: '16px', marginBottom: '2rem', width: '100%' }}>
          <span style={{ display: 'block', fontSize: '0.85rem', color: '#8b95a1', marginBottom: '0.5rem' }}>계좌번호</span>
          <span style={{ display: 'block', fontSize: '1.1rem', fontWeight: 800, color: '#191f28' }}>카카오뱅크 3333-14-3169646 홍병석</span>
        </div>
        <button className={styles.nextBtn} onClick={onClose} style={{ width: '100%' }}>
          확인
        </button>
      </div>
    );
  }

  return (
    <div className={styles.formContainer}>
      <div>
        <h2 className={styles.stepTitle}>
          {step === 'role' ? '역할을 선택해 주세요' : '연락처를 남겨주세요'}
        </h2>
        <p className={styles.stepDesc}>
          {step === 'role' 
            ? '원활한 성비 균형을 위해 역할 확인이 필요합니다.' 
            : '신청 결과 안내를 위해 정확한 정보를 입력해 주세요.'}
        </p>

        {step === 'role' ? (
          <div className={styles.roleGrid}>
            <button 
              className={`${styles.roleBtn} ${role === 'leader' ? styles.selected : ''}`}
              onClick={() => setRole('leader')}
            >
              <span className={styles.roleIcon}>👔</span>
              <span className={styles.roleLabel}>리더</span>
            </button>
            <button 
              className={`${styles.roleBtn} ${role === 'follower' ? styles.selected : ''}`}
              onClick={() => setRole('follower')}
            >
              <span className={styles.roleIcon}>👠</span>
              <span className={styles.roleLabel}>팔로워</span>
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
          disabled={step === 'role' ? !role : (!name || !phone)}
        >
          {step === 'role' ? '다음' : '신청 완료하기'}
        </button>
      </footer>
    </div>
  );
}

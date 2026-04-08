'use client';

import React, { useState } from 'react';
import { signInAnonymously } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { uploadFile } from '@/lib/storage';
import { updateRegistrationPhoto, getUserByPhone, trackUserVisit, updateUserProfile } from '@/lib/db';
import styles from './RegistrationForm.module.css';

const getDeviceType = () => {
  if (typeof window === 'undefined') return 'unknown';
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) return 'ios';
  if (ua.includes('android')) return 'android';
  if (ua.includes('windows') || ua.includes('macintosh')) return 'pc';
  return 'unknown';
};

interface IdentityFormProps {
  onClose: () => void;
  onComplete: () => void;
  isEdit?: boolean;
}

export default function IdentityForm({ onClose, onComplete, isEdit = false }: IdentityFormProps) {
  const [step, setStep] = useState<'phone' | 'profile'>(isEdit ? 'profile' : 'phone');
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
  const [photoURL, setPhotoURL] = useState<string>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('ft_user') : null;
    return saved ? JSON.parse(saved).photoURL : '';
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 11);
    setPhone(value);
  };

  const handleNextStep = async () => {
    if (phone.length < 10) return;
    
    setIsLoading(true);
    try {
      const existingUser = await getUserByPhone(phone);
      if (existingUser) {
        // Welcoming back existing user
        const userData = { 
          nickname: existingUser.nickname, 
          phone: existingUser.phone, 
          role: existingUser.role || 'leader',
          photoURL: existingUser.photoURL || ''
        };
        
        // Update states to fill the profile form
        setName(existingUser.nickname);
        setRole(existingUser.role as 'leader' | 'follower' || 'leader');
        setPhotoURL(existingUser.photoURL || '');
        
        localStorage.setItem('ft_user', JSON.stringify(userData));
        await trackUserVisit(userData.phone, userData.nickname, userData.photoURL, userData.role, getDeviceType());
        window.dispatchEvent(new Event('ft_user_updated'));
        
        if (isEdit) {
          setStep('profile');
        } else {
          onComplete();
        }
      } else {
        // New user, go to profile step
        setStep('profile');
      }
    } catch (error) {
      console.error("Error checking user:", error);
      setStep('profile');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to map legacy roles if any
  const rolesMap = (r?: string) => {
    if (r === 'leader' || r === 'follower') return r;
    return null;
  };

  const handleComplete = async () => {
    if (role && name && phone.length >= 10) {
      const userData = { nickname: name, phone, role, photoURL };
      localStorage.setItem('ft_user', JSON.stringify(userData));
      
      try {
        await trackUserVisit(phone, name, photoURL, role, getDeviceType());
        await updateUserProfile(phone, { nickname: name, photoURL, role });
      } catch (e) {
        console.error("Error updating user profile:", e);
      }

      window.dispatchEvent(new Event('ft_user_updated'));
      onComplete();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { compressImage } = await import('@/lib/image-utils');
      // Compress to max 1024px for profile photos
      const optimizedBlob = await compressImage(file, { maxWidth: 1024, maxHeight: 1024, quality: 0.85 });

      if (!auth.currentUser) {
        await signInAnonymously(auth);
      }

      const cleanPhone = phone.replace(/[^0-9]/g, '') || 'anonymous';
      const path = `users/${cleanPhone}/profile.jpg`;
      
      const url = await uploadFile(optimizedBlob, path);
      setPhotoURL(url);
    } catch (error: any) {
      console.error("Error uploading image:", error);
      alert(error.message || '이미지 업로드에 실패했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  const isFormValid = role && name.trim() !== '' && phone.length >= 10;

  return (
    <div className={styles.formContainer} style={{ gap: '1rem', padding: '0 0.5rem' }}>
      <p style={{ 
        fontSize: '0.95rem', 
        color: '#4e5968', 
        marginBottom: '1rem', 
        textAlign: 'center',
        lineHeight: '1.5',
        wordBreak: 'keep-all'
      }}>
        {isEdit ? '회원 정보를 수정합니다.' : '이 서비스는 로그인을 해야합니다.'}
      </p>

      {step === 'phone' ? (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#adb5bd', marginBottom: '0.6rem', fontWeight: 400 }}>휴대폰 번호 (숫자만)</label>
            <input 
              type="tel" 
              placeholder="01012345678" 
              value={phone} 
              onChange={handlePhoneChange}
              className={styles.input}
              autoFocus
              style={{ padding: '1rem', borderRadius: '12px', background: '#f9fafb', border: '1px solid #f2f4f6', fontSize: '1.1rem' }}
            />
          </div>
          <button 
            onClick={handleNextStep}
            disabled={phone.length < 10 || isLoading}
            className={styles.nextBtn}
            style={{ 
              padding: '1rem', 
              borderRadius: '16px',
              background: phone.length < 10 || isLoading ? '#e5e8eb' : '#3182f6',
              fontSize: '1.05rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {isLoading ? <div className={styles.spinner} style={{ width: '20px', height: '20px' }} /> : '계속하기'}
          </button>
        </div>
      ) : (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Profile Photo Upload Section */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem', position: 'relative' }}>
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept="image/*"
              onChange={handleFileChange}
              disabled={isUploading}
            />
            <div 
              onClick={() => fileInputRef.current?.click()}
              style={{ 
                width: '90px', 
                height: '90px', 
                borderRadius: '50%', 
                background: photoURL ? `url(${photoURL}) center/cover no-repeat` : '#f2f4f6', 
                cursor: isUploading ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '3px solid #fff',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                transition: 'all 0.2s',
                position: 'relative',
                overflow: 'hidden'
              } as React.CSSProperties}
            >
              {!photoURL && !isUploading && (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#8b95a1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              )}
              {isUploading && (
                <div className={styles.spinner} style={{ width: '24px', height: '24px' }} />
              )}
              <div style={{ 
                position: 'absolute', 
                bottom: '0', 
                left: '0', 
                right: '0', 
                background: 'rgba(0,0,0,0.3)', 
                color: '#fff', 
                fontSize: '10px', 
                padding: '2px 0', 
                textAlign: 'center',
                opacity: photoURL ? 0 : 1,
                transition: 'opacity 0.2s'
              }}>
                변경
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#adb5bd', marginBottom: '0.4rem', fontWeight: 400 }}>역할</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                onClick={() => setRole('leader')}
                className={`${styles.roleBtn} ${role === 'leader' ? styles.selected : ''}`}
                style={{ 
                  flex: 1, padding: '0.75rem', borderRadius: '12px', border: '1px solid #f2f4f6',
                  background: role === 'leader' ? '#3182f6' : '#f9fafb',
                  color: role === 'leader' ? '#fff' : '#4e5968',
                  fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s',
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
                  fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s',
                  aspectRatio: 'unset', height: 'auto', flexDirection: 'row', gap: '0'
                }}
              >
                팔로워
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#adb5bd', marginBottom: '0.4rem', fontWeight: 400 }}>닉네임</label>
            <input 
              type="text" 
              placeholder="사용하실 닉네임을 입력해주세요" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              className={styles.input}
              style={{ padding: '0.8rem 1rem', borderRadius: '12px', background: '#f9fafb', border: '1px solid #f2f4f6' }}
            />
          </div>

          <button 
            onClick={handleComplete}
            disabled={!isFormValid}
            className={styles.nextBtn}
            style={{ 
              padding: '1rem', 
              borderRadius: '16px',
              background: !isFormValid ? '#e5e8eb' : '#3182f6',
              fontSize: '1.05rem'
            }}
          >
            {isEdit ? '수정 완료' : '등록 완료'}
          </button>
        </div>
      )}
    </div>
  );
}

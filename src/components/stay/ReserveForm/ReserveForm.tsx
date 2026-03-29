'use client';

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { submitStayReservation } from '@/lib/db';
import styles from './ReserveForm.module.css';

interface ReserveFormProps {
  stayId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalAmount: number;
  onBack: () => void;
  onComplete: (data: any) => void;
}

export default function ReserveForm({
  stayId,
  checkIn,
  checkOut,
  guests,
  totalAmount,
  onBack,
  onComplete
}: ReserveFormProps) {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [countryCode, setCountryCode] = useState('+82');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      alert(t.reserve.errorFill);
      return;
    }

    setIsSubmitting(true);
    
    const cleanPhone = phone.replace(/-/g, '').trim();
    const fullPhone = countryCode + cleanPhone;

    const formData = {
      stayId,
      name: name.trim(), 
      phone: fullPhone, 
      checkIn, 
      checkOut, 
      guests, 
      message
    };

    const result = await submitStayReservation(formData);
    
    if (result.success) {
      onComplete({
        ...formData,
        totalAmount
      });
    } else {
      alert(t.reserve.errorFail);
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button onClick={onBack} className={styles.backBtn}>
          &larr; {t.calendar.clearBtn}
        </button>
        <h1 className={styles.title}>{t.reserve.title}</h1>
        <p className={styles.routeDesc}>
          {checkIn} ~ {checkOut} / {guests}{t.reserve.guests} / {totalAmount.toLocaleString()}{t.calendar.won}
        </p>
      </header>

      <div className={styles.content}>
        <div className={styles.formSection}>
          <div className={styles.paymentGuide}>
            <h3>💳 {t.calendar.feeGuideTitle} (Deposit)</h3>
            <p className={styles.account}>KakaoBank 3333-03-7249602 (Hong Byeong-seok)</p>
            <p className={styles.warning}><strong>{t.complete.desc}</strong></p>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="name">{t.reserve.nameLabel} <span className={styles.required}>*</span></label>
              <input 
                type="text" 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder={t.reserve.namePlace} 
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="phone">{t.reserve.phoneLabel} <span className={styles.required}>*</span></label>
              <div className={styles.phoneInputContainer}>
                <select 
                  className={styles.countrySelect}
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                >
                  <option value="+82">KR (+82)</option>
                  <option value="+1">US (+1)</option>
                  <option value="+81">JP (+81)</option>
                  <option value="+86">CN (+86)</option>
                  <option value="+84">VN (+84)</option>
                  <option value="+63">PH (+63)</option>
                  <option value="+66">TH (+66)</option>
                  <option value="+65">SG (+65)</option>
                  <option value="+60">MY (+60)</option>
                  <option value="+886">TW (+886)</option>
                  <option value="+34">ES (+34)</option>
                  <option value="+33">FR (+33)</option>
                  <option value="+39">IT (+39)</option>
                  <option value="+44">UK (+44)</option>
                  <option value="+49">DE (+49)</option>
                  <option value="+90">TR (+90)</option>
                </select>
                <input 
                  type="tel" 
                  id="phone" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  placeholder={t.reserve.phonePlace} 
                  required
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="message">{t.reserve.reqLabel}</label>
              <textarea 
                id="message" 
                value={message} 
                onChange={(e) => setMessage(e.target.value)} 
                rows={3} 
                placeholder={t.reserve.reqPlace} 
              />
            </div>

            <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
              {isSubmitting ? t.reserve.submitting : t.reserve.submitBtn}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

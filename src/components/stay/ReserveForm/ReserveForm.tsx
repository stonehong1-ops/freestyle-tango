import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { submitStayReservation } from '@/lib/db';
import { calculateStayPrice, PricingResult } from '@/lib/stay-utils';
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
  guests: initialGuests,
  onBack,
  onComplete
}: ReserveFormProps) {
  const { t, language } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [countryCode, setCountryCode] = useState('+82');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  
  const [currentGuests, setCurrentGuests] = useState(initialGuests);
  const [pricing, setPricing] = useState<PricingResult | null>(null);

  useEffect(() => {
    const result = calculateStayPrice(stayId, checkIn, checkOut, currentGuests);
    setPricing(result);
  }, [stayId, checkIn, checkOut, currentGuests]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      alert(t.reserve.errorFill);
      return;
    }

    setIsSubmitting(true);
    
    const cleanPhone = phone.replace(/[^\d+]/g, '').trim();
    // Prepend country code if phone doesn't start with '+'
    const fullPhone = phone.startsWith('+') ? phone : countryCode + cleanPhone;

    const formData = {
      stayId,
      name: name.trim(), 
      phone: fullPhone, 
      checkIn, 
      checkOut, 
      guests: currentGuests, 
      message
    };

    const result = await submitStayReservation(formData);
    
    if (result.success) {
      onComplete({
        ...formData,
        totalAmount: pricing?.total || 0
      });
    } else {
      alert(t.reserve.errorFail);
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button onClick={onBack} className={styles.backBtn} aria-label="Go back">
          &larr; {language === 'ko' ? '뒤로가기' : 'Back'}
        </button>
        <h1 className={styles.title}>{t.reserve.title}</h1>
      </header>

      <div className={styles.content}>
        {/* Left/Top: Pricing & Info Summary */}
        <aside className={styles.summarySidebar}>
          <div className={styles.summaryCard}>
            <h3 className={styles.summaryTitle}>{language === 'ko' ? '예약 내역 확인' : 'Reservation Summary'}</h3>
            
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>{language === 'ko' ? '일정' : 'Dates'}</span>
              <div className={styles.infoValue}>
                {checkIn} ~ {checkOut}
                <span className={styles.nightBadge}>{pricing?.nights}{t.calendar.days}</span>
              </div>
            </div>

            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>{t.calendar.guestSelectLabel}</span>
              <div className={styles.infoValue}>
                <select 
                  className={styles.inlineSelect}
                  value={currentGuests}
                  onChange={(e) => setCurrentGuests(parseInt(e.target.value))}
                >
                  {[1, 2, 3, 4].map(n => (
                    <option key={n} value={n}>{n}{t.reserve.guests}</option>
                  ))}
                </select>
              </div>
            </div>

            <hr className={styles.divider} />

            {pricing && (
              <div className={styles.pricingList}>
                <div className={styles.priceItem}>
                  <span>{t.calendar.baseFee} ({pricing.nights}{t.calendar.days})</span>
                  <span>{pricing.baseNightly.toLocaleString()}{t.calendar.won}</span>
                </div>
                {pricing.guestSurcharge > 0 && (
                  <div className={styles.priceItem}>
                    <span>{t.calendar.guestFee}</span>
                    <span>+{pricing.guestSurcharge.toLocaleString()}{t.calendar.won}</span>
                  </div>
                )}
                {pricing.weekendSurcharge > 0 && (
                  <div className={styles.priceItem}>
                    <span>{t.calendar.weekendFee}</span>
                    <span>+{pricing.weekendSurcharge.toLocaleString()}{t.calendar.won}</span>
                  </div>
                )}
                <div className={styles.priceItem}>
                  <span>{t.calendar.cleaningFee}</span>
                  <span>+{pricing.cleaningFee.toLocaleString()}{t.calendar.won}</span>
                </div>
                {pricing.discount > 0 && (
                  <div className={`${styles.priceItem} ${styles.discount}`}>
                    <span>{t.calendar.longStayDiscount}</span>
                    <span>-{pricing.discount.toLocaleString()}{t.calendar.won}</span>
                  </div>
                )}
                <div className={styles.totalPrice}>
                  <span>{language === 'ko' ? '총 결제 금액' : 'Total Amount'}</span>
                  <span>{pricing.total.toLocaleString()}{t.calendar.won}</span>
                </div>
              </div>
            )}
          </div>

          <div className={styles.paymentCard}>
            <h3>💳 {t.calendar.feeGuideTitle} (Deposit)</h3>
            <div className={styles.accountList}>
              <p><strong>KR (한국계좌):</strong> KakaoBank 3333-03-7249602 (홍병석)</p>
              <p><strong>Wise (USD):</strong> Acc 352665336763211 / Routing 084009519</p>
              <p><strong>International:</strong> SWIFT/BIC TRWIUS35XXX</p>
            </div>
          </div>
        </aside>

        {/* Right/Bottom: Information Form */}
        <main className={styles.formSection}>
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
                  <option value="+44">UK (+44)</option>
                  <option value="+61">AU (+61)</option>
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

            <div className={styles.directWarning}>
              {t.reserve.directBookingWarning.split('\n').map((line: string, i: number) => (
                <p key={i}>{line}</p>
              ))}
            </div>

            <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
              {isSubmitting ? t.reserve.submitting : t.reserve.submitBtn}
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}

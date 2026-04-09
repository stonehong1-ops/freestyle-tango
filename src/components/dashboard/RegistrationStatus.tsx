'use client';

import React, { useState, useEffect } from 'react';
import { TangoClass, Registration } from '@/lib/db';
import styles from './RegistrationStatus.module.css';
import { useLanguage } from '@/contexts/LanguageContext';
import { useModalHistory } from '@/hooks/useModalHistory';

interface Props {
  classes: TangoClass[];
  selectedMonth: string; // From Home page
  onClose: () => void;
  requireIdentity?: (action: () => void) => void;
  hideForm?: boolean;
  hideHistory?: boolean;
}

export default function RegistrationStatus({ classes, selectedMonth, onClose, requireIdentity, hideForm, hideHistory }: Props) {
  const { t, language } = useLanguage();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSuccess, setIsSuccess] = useState(false);
  const [dbRegs, setDbRegs] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [paymentSheet, setPaymentSheet] = useState<{ isOpen: boolean, regId: string, type: string } | null>(null);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [editingRegId, setEditingRegId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>('');

  useModalHistory(!!paymentSheet?.isOpen, () => setPaymentSheet(null), 'paymentSheet');
  useModalHistory(isSuccess, () => { setIsSuccess(false); setEditingRegId(null); }, 'regSuccess');
  useModalHistory(!!editingRegId, () => { setEditingRegId(null); setSelectedIds(new Set()); setSelectedType(''); }, 'editReg');

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      // 1. Load from local first (Drafts)
      const localSaved = localStorage.getItem('my_tango_classes');
      if (localSaved) {
        setSelectedIds(new Set(JSON.parse(localSaved)));
      }

      // 2. Fetch history from DB 
      const savedUser = localStorage.getItem('ft_user');
      if (savedUser) {
        try {
          const { phone } = JSON.parse(savedUser);
          const normalizedPhone = phone.replace(/[^0-9]/g, ''); // Normalize phone number
          const { getAllRegistrationsByPhone } = await import('@/lib/db');
          const regs = await getAllRegistrationsByPhone(normalizedPhone);
          setDbRegs(regs);
        } catch (error) {
          console.error("DB Fetch Error:", error);
        }
      }
      setIsLoading(false);
    };

    loadData();
  }, []);


  const handleRegister = async (regType: string) => {
    const action = async () => {
      const savedUser = localStorage.getItem('ft_user');
      if (!savedUser) return;

      const { nickname, phone, role: rawRole } = JSON.parse(savedUser);
      const role = (rawRole || '').replace(/"/g, '');

      let typeDisplay = selectedType || (selectedIds.size === 1 ? '개별수강' : '1개월멤버쉽');
      const isAutoPaid = ['6개월멤버쉽(2차)', '6개월멤버쉽(3차)', '6개월멤버쉽(4차)', '6개월멤버쉽(5차)', '6개월멤버쉽(6차)'].includes(typeDisplay);

      try {
        const { addRegistration, updateRegistration } = await import('@/lib/db');

        if (editingRegId) {
          await updateRegistration(editingRegId, {
            classIds: Array.from(selectedIds),
            type: typeDisplay as '개별신청' | '1개월 신청' | '6개월 멤버쉽',
            date: new Date().toISOString()
          });
          alert(t.home.history.confirmSuccess);
          setEditingRegId(null);
        } else {
          // Double registration guard: Disallow new registration if they already have one for the month
          const currentRegs = await (await import('@/lib/db')).getAllRegistrationsByPhone(phone.replace(/[^0-9]/g, ''));
          const existing = currentRegs.find(r => r.month === selectedMonth);
          if (existing) {
            alert(t.home.history.alreadyRegistered || '이미 등록된 내역이 있습니다. 수정 기능을 이용해주세요.');
            return;
          }

          await addRegistration({
            date: new Date().toISOString(),
            nickname,
            phone: phone.replace(/[^0-9]/g, ''),
            role,
            classIds: Array.from(selectedIds),
            type: typeDisplay,
            month: selectedMonth,
            status: isAutoPaid ? 'paid' : 'waiting',
            amount: 0,
            ...(isAutoPaid ? { paidAt: new Date().toISOString() } : {})
          });
          setIsSuccess(true);
        }

        localStorage.removeItem('my_tango_classes');
        setSelectedIds(new Set());
        window.dispatchEvent(new Event('ft_user_updated'));
        window.dispatchEvent(new Event('ft_registrations_updated'));

        const regs = await (await import('@/lib/db')).getAllRegistrationsByPhone(phone.replace(/[^0-9]/g, ''));
        setDbRegs(regs);
        setSelectedType(''); // Reset type for next use
      } catch (error) {
        console.error("Registration Error:", error);
        alert(t.home.history.error);
      }
    };

    if (requireIdentity) requireIdentity(action);
    else action();
  };

  // Removed redundant second handlePopState listener

  const handlePaymentConfirm = (id: string, type: string) => {
    setPaymentSheet({ isOpen: true, regId: id, type });
    setSelectedOption(type); // Pre-populate with current type
  };

  const submitPayment = async () => {
    if (!selectedOption || !paymentSheet) {
      alert(t.home.payment.optionPrompt);
      return;
    }

    // Determine amount based on option text or index
    // Note: This logic is still tied to Korean strings in the DB for amount calculation,
    // but the UI will show localized options from the array.
    // To be safe, we map the localized options back to values.
    const options = t.home.payment.options;
    const index = options.indexOf(selectedOption);

    // Find the registration to get class count
    const reg = dbRegs.find(r => r.id === paymentSheet.regId);
    const classCount = reg?.classIds.length || 0;

    let amount = 0;
    if (index === 0) { // 개별수강
      amount = 120000;
    } else if (index === 1) { // 1개월멤버쉽
      amount = 180000; 
    } else if (index === 2) { // 6개월멤버쉽(1차)
      amount = 860000;
    } else { // 6개월멤버쉽(2차~6차)
      amount = 0;
    }

    try {
      const { updatePaymentStatus } = await import('@/lib/db');
      await updatePaymentStatus(paymentSheet.regId, amount, selectedOption);
      alert(t.home.history.confirmSuccess);
      setPaymentSheet(null);
      // Refresh
      const savedUser = localStorage.getItem('ft_user');
      if (savedUser) {
        const { phone } = JSON.parse(savedUser);
        const { getAllRegistrationsByPhone } = await import('@/lib/db');
        const regs = await getAllRegistrationsByPhone(phone);
        setDbRegs(regs);
      }
    } catch (e) {
      console.error(e);
      alert(t.home.history.error);
    }
  };

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
    if (!editingRegId) {
      localStorage.setItem('my_tango_classes', JSON.stringify(Array.from(newSelected)));
    }
    window.dispatchEvent(new Event('ft_user_updated'));
  };

  const handleDeleteRegistration = async (id: string) => {
    if (!confirm(t.home.history.deleteConfirm)) return;
    try {
      const { deleteRegistration } = await import('@/lib/db');
      await deleteRegistration(id);
      setDbRegs(prev => prev.filter(r => r.id !== id));
      alert(t.home.history.deleteSuccess);
      window.dispatchEvent(new Event('ft_registrations_updated'));
      window.dispatchEvent(new Event('ft_user_updated'));
    } catch (e) {
      alert(t.home.history.error);
    }
  };

  const handleEditRegistration = (reg: Registration) => {
    setEditingRegId(reg.id);
    setSelectedIds(new Set(reg.classIds));
    setSelectedType(reg.type); // Store current type when editing
    window.scrollTo({ top: 0, behavior: 'smooth' });

    setTimeout(() => {
      document.getElementById('selection-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Filter classes for the current selection month
  const activeMonthClasses = classes.filter(c => (c.targetMonth || '2026-04') === selectedMonth);

  const grouped = activeMonthClasses.reduce((acc, cls) => {
    const dayName = cls.time.match(/([월화수목금토일]요일)/)?.[1] || '기타';
    if (!acc[dayName]) acc[dayName] = [];
    acc[dayName].push(cls);
    return acc;
  }, {} as Record<string, TangoClass[]>);

  const handleCopySuccess = () => {
    const accountNumber = "3333143159646";
    navigator.clipboard.writeText(accountNumber).then(() => {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    });
  };

  if (isSuccess) {
    return (
      <div className={styles.successContainer}>
        <div className={styles.successIcon}>✨</div>
        <h2 className={styles.successTitle}>{t.home.success.welcome}</h2>
        <p className={styles.successMessage}>
          {t.home.success.completed.split('\n').map((line: string, i: number) => (
            <React.Fragment key={i}>{line}<br /></React.Fragment>
          ))}
        </p>
        <p className={styles.successMessageInfo}>
          {t.home.success.info.split('\n').map((line: string, i: number) => (
            <React.Fragment key={i}>{line}<br /></React.Fragment>
          ))}
        </p>
        <div className={styles.bankBox}>
          <span className={styles.bankLabel}>{t.home.success.bankLabel}</span>
          <span className={styles.bankNumber}>{t.home.success.bankNumber}</span>
          <button className={styles.copyBtnSmall} onClick={handleCopySuccess}>
            {t.home.success.copyBtn}
          </button>
        </div>
        <button className={styles.closeBtn} onClick={() => {
          setIsSuccess(false);
          setEditingRegId(null);
          onClose(); // Explicitly call onClose to remove the modal
        }}>{t.home.success.done}</button>

        {showToast && (
          <div className={styles.copyToast}>
            {t.home.success.copySuccess}
          </div>
        )}
      </div>
    );
  }

  const daysOrdered = ['월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일', '기타'];
  const existingRegForMonth = dbRegs.find(r => r.month === selectedMonth);

  return (
    <div className={styles.container}>
      {/* 1. History Section - Now shows current month's registration even if hideHistory is true */}
      {(!hideHistory || existingRegForMonth) && (
        <div className={styles.historySection}>
          <h3 className={styles.sectionTitle}>{hideHistory ? t.home.registration.currentStatus : t.home.history.title}</h3>
          {isLoading ? (
            <div className={styles.loadingSmall}>{t.home.history.loading}</div>
          ) : (hideHistory ? [existingRegForMonth] : dbRegs).length === 0 ? (
            <div className={styles.emptyHistory}>{t.home.history.empty}</div>
          ) : (
            <div className={styles.historyList}>
              {(hideHistory ? [existingRegForMonth] : dbRegs).filter(Boolean).map(reg => {
                if (!reg) return null;
                const monthName = reg.month ? reg.month.split('-')[1] : '4';
                const dayMap: Record<string, number> = {
                  '월요일': 0, '화요일': 1, '수요일': 2, '목요일': 3, '금요일': 4, '토요일': 5, '일요일': 6, '기타': 7
                };
                const dayShort: Record<string, string> = {
                  '월요일': '월', '화요일': '화', '수요일': '수', '목요일': '목', '금요일': '금', '토요일': '토', '일요일': '일', '기타': '기타'
                };

                const regClasses = classes
                  .filter(c => reg.classIds.includes(c.id))
                  .sort((a, b) => {
                    const dayA = a.time.match(/([월화수목금토일]요일)/)?.[1] || '기타';
                    const dayB = b.time.match(/([월화수목금토일]요일)/)?.[1] || '기타';
                    return dayMap[dayA] - dayMap[dayB];
                  });

                return (
                  <div key={reg.id} className={styles.historyCard}>
                    <div className={styles.cardHeader}>
                      <div className={styles.cardTitle}>
                        <span className={styles.monthTag}>{monthName}{language === 'ko' ? '월' : ''}</span>
                        {language === 'ko' ? `신청현황 (${reg.classIds.length}과목)` : `Applied Classes (${reg.classIds.length})`}
                      </div>
                      <div className={`${styles.statusBadge} ${reg.status === 'paid' ? styles.statusPaid : styles.statusWaiting}`}>
                        {reg.status === 'paid' ? t.home.history.statusPaid : t.home.history.statusWaiting}
                      </div>
                    </div>

                    <div className={styles.regInfo}>
                      {t.home.history.appliedDate.replace('{date}', new Date(reg.date).toLocaleString(language, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }))}
                    </div>

                    <div className={styles.regClasses}>
                      {regClasses.map(c => {
                        const dayName = c.time.match(/([월화수목금토일]요일)/)?.[1] || '기타';
                        return (
                          <div key={c.id} className={styles.regClassInner}>
                            • {dayShort[dayName]} : {c.title}
                          </div>
                        );
                      })}
                    </div>

                    <div className={styles.cardActions}>
                      {reg.status === 'paid' && (
                        <div className={styles.paidArea}>
                          <div className={styles.paidMessage}>
                            {t.home.history.paidMsg
                              .replace('{type}', reg.type)
                              .replace('{amount}', reg.amount?.toLocaleString() || '0')}
                          </div>
                          <div className={styles.paidDate}>
                            {t.home.history.paidDate.replace('{date}', new Date(reg.paidAt!).toLocaleString(language))}
                          </div>
                        </div>
                      )}

                      <div className={styles.unpaidActions}>
                        <div className={styles.unpaidHeader}>
                          {reg.status !== 'paid' && (
                            <button
                              className={styles.confirmPayBtn}
                              onClick={() => handlePaymentConfirm(reg.id, reg.type)}
                            >
                              {t.home.history.confirmPayBtn}
                            </button>
                          )}
                          <div className={styles.editDeleteGroup}>
                            <button
                              className={styles.editBtn}
                              onClick={() => handleEditRegistration(reg)}
                            >
                              {t.home.history.edit}
                            </button>
                            <button
                              className={styles.deleteBtn}
                              onClick={() => handleDeleteRegistration(reg.id)}
                            >
                              {t.home.history.delete}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <div className={styles.divider} />

      {/* 2. Current Selection Section */}
      {(!hideForm && !isLoading && (editingRegId || !existingRegForMonth || hideHistory)) ? (
        <>
          <div id="selection-section" className={styles.selectionSection}>
            <h3 className={styles.sectionTitle}>
              {editingRegId
                ? t.home.registrationStatus.editTitle
                : t.home.registrationStatus.newTitle.replace('{month}', selectedMonth.split('-')[1])}
            </h3>
            {editingRegId && (
              <button className={styles.cancelEditBtn} onClick={() => {
                setEditingRegId(null);
                setSelectedIds(new Set());
                setSelectedType('');
              }}>{t.home.registrationStatus.cancelEdit}</button>
            )}
            <div className={styles.typeSelectorArea}>
              <h4 className={styles.dayTitle}>Step 1. {t.home.registrationStatus.typeSelectorTitle}</h4>
              <p className={styles.typeHint}>{t.home.payment.placeholder || '먼저 신청 유형을 선택해주세요'}</p>
              <select
                className={styles.paymentSelect}
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="">{t.home.payment.placeholder}</option>
                {t.home.payment.options.map((opt: string, i: number) => (
                  <option key={i} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div className={styles.dividerLight} />

            <div className={styles.listContainer}>
              <h4 className={styles.dayTitle} style={{ padding: '1.5rem 0 0' }}>Step 2. {t.home.registrationStatus.selectPrompt || '수업 선택'}</h4>
              {daysOrdered.map(day => {
                if (!grouped[day] || grouped[day].length === 0) return null;
                return (
                  <div key={day} className={styles.dayGroup}>
                    <h4 className={styles.dayTitle}>{day}</h4>
                    <div className={styles.classList}>
                      {grouped[day].map(cls => (
                        <label key={cls.id} className={styles.classItem}>
                          <input
                            type="checkbox"
                            className={styles.checkbox}
                            checked={selectedIds.has(cls.id)}
                            onChange={() => toggleSelection(cls.id)}
                          />
                          <div className={styles.classInfo}>
                            <div className={styles.classTitle}>
                              {cls.title}
                              <span className={styles.classInstructor}> ({cls.teacher1}{cls.teacher2 ? ` & ${cls.teacher2}` : ''})</span>
                            </div>
                            <div className={styles.classMeta}>{cls.time}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className={styles.priceDisplay}>
            <span className={styles.priceLabel}>{language === 'ko' ? '예상 결제 금액' : 'Estimated Amount'}</span>
            <span className={styles.priceValue}>
              {(() => {
                if (selectedIds.size === 0 || selectedType === '') return '0원';
                const idx = t.home.payment.options.indexOf(selectedType);
                if (idx === 0) return '120,000원';
                if (idx === 1) return '180,000원';
                if (idx === 2) return '860,000원';
                return '0원';
              })()}
            </span>
          </div>

          <div className={styles.footer}>
            <button
              className={(selectedIds.size > 0 && selectedType !== '') ? styles.actionBtnPrimary : styles.actionBtnDisabled}
              onClick={() => {
                if (selectedIds.size === 0 || selectedType === '') return;
                handleRegister(selectedIds.size >= 2 ? 'month1' : 'single');
              }}
              disabled={selectedIds.size === 0 || selectedType === ''}
            >
              {selectedIds.size === 0
                ? t.home.registrationStatus.selectPrompt
                : selectedType === ''
                  ? (t.home.payment.placeholder || '신청 유형을 선택해주세요')
                  : (editingRegId ? t.home.registrationStatus.editSubmit : t.home.registrationStatus.newSubmit)}
            </button>
          </div>
        </>
      ) : null}

      {/* Payment Confirmation Bottom Sheet */}
      {paymentSheet?.isOpen && (
        <div className={styles.sheetOverlay}>
          <div className={styles.bottomSheet}>
            <div className={styles.sheetHeader}>
              <h4 className={styles.sheetTitle}>{t.home.payment.title}</h4>
              <p className={styles.sheetDesc}>{t.home.payment.desc}</p>
            </div>

            <select
              className={styles.paymentSelect}
              value={selectedOption}
              onChange={(e) => setSelectedOption(e.target.value)}
            >
              <option value="">{t.home.payment.placeholder}</option>
              {t.home.payment.options.map((opt: string, i: number) => (
                <option key={i} value={opt}>{opt}</option>
              ))}
            </select>

            {selectedOption && (
              <div className={styles.amountDisplay}>
                <span className={styles.amountLabel}>{language === 'ko' ? '결제 금액' : 'Amount'}</span>
                <span className={styles.amountValue}>
                  {(() => {
                    const idx = t.home.payment.options.indexOf(selectedOption);
                    if (idx === 0) return '120,000원';
                    if (idx === 1) return '180,000원';
                    if (idx === 2) return '860,000원';
                    return '0원';
                  })()}
                </span>
              </div>
            )}

            <div className={styles.sheetFooter}>
              <button className={styles.cancelBtn} onClick={() => setPaymentSheet(null)}>{t.home.payment.cancel}</button>
              <button className={styles.submitBtn} onClick={submitPayment}>{t.home.payment.submit}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

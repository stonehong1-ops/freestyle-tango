import React, { useState, useEffect } from 'react';
import { TangoClass, Registration } from '@/lib/db';
import styles from './RegistrationStatus.module.css';

interface Props {
  classes: TangoClass[];
  selectedMonth: string; // From Home page
  onClose: () => void;
  requireIdentity?: (action: () => void) => void;
}

export default function RegistrationStatus({ classes, selectedMonth, onClose, requireIdentity }: Props) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSuccess, setIsSuccess] = useState(false);
  const [dbRegs, setDbRegs] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [paymentSheet, setPaymentSheet] = useState<{ isOpen: boolean, regId: string, type: string } | null>(null);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [editingRegId, setEditingRegId] = useState<string | null>(null);
  // Remove manual name/phone state as it's handled by IdentityForm


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

      const typeDisplay = 
        regType === 'month1' ? '1개월 신청' : '개별신청';

      try {
        const { addRegistration, updateRegistration } = await import('@/lib/db');
        
        if (editingRegId) {
          await updateRegistration(editingRegId, {
            classIds: Array.from(selectedIds),
            type: typeDisplay as '개별신청' | '1개월 신청' | '6개월 멤버쉽',
            date: new Date().toISOString()
          });
          alert("신청 내역이 수정되었습니다.");
          setEditingRegId(null);
        } else {
          await addRegistration({
            date: new Date().toISOString(),
            nickname,
            phone: phone.replace(/[^0-9]/g, ''),
            role,
            classIds: Array.from(selectedIds),
            type: typeDisplay as '개별신청' | '1개월 신청',
            month: selectedMonth, 
            status: 'waiting'
          });
          setIsSuccess(true);
        }

        localStorage.removeItem('my_tango_classes');
        setSelectedIds(new Set());
        window.dispatchEvent(new Event('ft_user_updated'));
        window.dispatchEvent(new Event('ft_registrations_updated'));
        
        const regs = await (await import('@/lib/db')).getAllRegistrationsByPhone(phone.replace(/[^0-9]/g, ''));
        setDbRegs(regs);
      } catch (error) {
        console.error("Registration Error:", error);
        alert("신청 중 오류가 발생했습니다.");
      }
    };

    if (requireIdentity) requireIdentity(action);
    else action();
  };

  useEffect(() => {
    const handlePopState = () => {
      if (paymentSheet?.isOpen) {
        setPaymentSheet(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [paymentSheet]);

  const handlePaymentConfirm = (id: string, type: string) => {
    setPaymentSheet({ isOpen: true, regId: id, type });
    setSelectedOption('');
    window.history.pushState({ modal: 'paymentSheet' }, '', '');
  };

  const submitPayment = async () => {
    if (!selectedOption || !paymentSheet) {
      alert('옵션을 선택해주세요.');
      return;
    }

    // Determine amount based on option text
    let amount = 0;
    if (selectedOption.includes('18만원')) amount = 180000;
    else if (selectedOption.includes('12만원')) amount = 120000;
    else if (selectedOption.includes('86만원')) amount = 860000;
    else amount = 180000; // Membership sequels
    
    try {
      const { updatePaymentStatus } = await import('@/lib/db');
      await updatePaymentStatus(paymentSheet.regId, amount, selectedOption);
      alert('입금 확인 요청이 완료되었습니다.');
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
      alert('오류가 발생했습니다.');
    }
  };

  const calculateMembershipMonth = (currentReg: Registration) => {
    if (currentReg.type !== '6개월 멤버쉽') return null;
    const pastMemberRegs = dbRegs
      .filter(r => r.type === '6개월 멤버쉽')
      .sort((a, b) => a.date.localeCompare(b.date));
    
    const index = pastMemberRegs.findIndex(r => r.id === currentReg.id);
    return index !== -1 ? index + 1 : 1;
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
    if (!confirm('정말 신청 내역을 삭제하시겠습니까?')) return;
    try {
      const { deleteRegistration } = await import('@/lib/db');
      await deleteRegistration(id);
      setDbRegs(prev => prev.filter(r => r.id !== id));
      alert('삭제되었습니다.');
      window.dispatchEvent(new Event('ft_registrations_updated'));
      window.dispatchEvent(new Event('ft_user_updated'));
    } catch (e) {
      alert('오류가 발생했습니다.');
    }
  };

  const handleEditRegistration = (reg: Registration) => {
    setEditingRegId(reg.id);
    setSelectedIds(new Set(reg.classIds));
    document.getElementById('selection-section')?.scrollIntoView({ behavior: 'smooth' });
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
        <h2 className={styles.successTitle}>환영합니다.</h2>
        <p className={styles.successMessage}>
          신청은 완료되었습니다.<br/>
          위 계좌로 입금하시기 바랍니다.
        </p>
        <p className={styles.successMessageInfo}>
          입금시 닉네임을 알 수 있거나,<br/>
          입금자명을 스톤에게 보내주셔야<br/>
          정확히 확인할 수 있습니다.
        </p>
        <div className={styles.bankBox}>
          <span className={styles.bankLabel}>계좌번호</span>
          <span className={styles.bankNumber}>카카오뱅크 3333-14-3159646 홍병석</span>
          <button className={styles.copyBtnSmall} onClick={handleCopySuccess}>
            복사하기
          </button>
        </div>
        <button className={styles.closeBtn} onClick={() => {
          // Open payment sheet for the latest registration if possible
          // For now, just close and let them use the history list
          setIsSuccess(false);
          onClose();
        }}>완료</button>

        {showToast && (
          <div className={styles.copyToast}>
            계좌번호가 복사되었습니다
          </div>
        )}
      </div>
    );
  }

  const daysOrdered = ['월요일','화요일','수요일','목요일','금요일','토요일','일요일','기타'];
  const existingRegForMonth = dbRegs.find(r => r.month === selectedMonth);

  return (
    <div className={styles.container}>
      {/* 1. History Section */}
      <div className={styles.historySection}>
        <h3 className={styles.sectionTitle}>📅 나의 신청 내역</h3>
        {isLoading ? (
          <div className={styles.loadingSmall}>데이터를 불러오는 중...</div>
        ) : dbRegs.length === 0 ? (
          <div className={styles.emptyHistory}>아직 신청 내역이 없습니다.</div>
        ) : (
          <div className={styles.historyList}>
            {dbRegs.map(reg => {
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
                      <span className={styles.monthTag}>{monthName}월</span>
                      수업 신청 완료
                    </div>
                    <div className={`${styles.statusBadge} ${reg.status === 'paid' ? styles.statusPaid : styles.statusWaiting}`}>
                      {reg.status === 'paid' ? '입금 확인됨' : '입금 대기중'}
                    </div>
                  </div>
                  
                  <div className={styles.regInfo}>
                    신청일: {new Date(reg.date).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
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
                    {reg.status === 'paid' ? (
                      <div className={styles.paidArea}>
                        <div className={styles.paidMessage}>
                          {reg.type} {reg.amount?.toLocaleString()}원을 입금함
                        </div>
                        <div className={styles.paidDate}>확인일: {new Date(reg.paidAt!).toLocaleString()}</div>
                      </div>
                    ) : (
                      <div className={styles.unpaidActions}>
                        <div className={styles.unpaidHeader}>
                          <button 
                            className={styles.confirmPayBtn}
                            onClick={() => handlePaymentConfirm(reg.id, reg.type)}
                          >
                            입금완료 버튼 클릭
                          </button>
                          <div className={styles.editDeleteGroup}>
                            <button 
                              className={styles.editBtn}
                              onClick={() => handleEditRegistration(reg)}
                            >
                              수정
                            </button>
                            <button 
                              className={styles.deleteBtn}
                              onClick={() => handleDeleteRegistration(reg.id)}
                            >
                              삭제
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className={styles.divider} />

      {/* 2. Current Selection Section */}
      {(editingRegId || !existingRegForMonth) ? (
        <>
          <div id="selection-section" className={styles.selectionSection}>
            <h3 className={styles.sectionTitle}>
              {editingRegId ? '🔄 신청 내역 수정하기' : `✍️ ${selectedMonth.split('-')[1]}월 신규 신청하기`}
            </h3>
            {editingRegId && (
              <button className={styles.cancelEditBtn} onClick={() => {
                setEditingRegId(null);
                setSelectedIds(new Set());
              }}>수정 취소</button>
            )}
            <p className={styles.sectionDesc}>원하는 수업을 체크하고 하단 버튼을 눌러주세요.</p>
            
            <div className={styles.listContainer}>
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
                            <div className={styles.classTitle}>{cls.title}</div>
                            <div className={styles.classMeta}>{cls.time} | 강사: {cls.teacher1}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className={styles.footer}>
            <button 
              className={selectedIds.size > 0 ? styles.actionBtnPrimary : styles.actionBtnDisabled} 
              onClick={() => {
                if (selectedIds.size === 0) return;
                handleRegister(selectedIds.size >= 2 ? 'month1' : 'single');
              }}
              disabled={selectedIds.size === 0}
            >
              {selectedIds.size === 0 ? '신청할 수업을 선택하세요' : (editingRegId ? '신청 내역 수정 완료' : '수업 신청하기')}
            </button>
          </div>
        </>
      ) : null}

      {/* Payment Confirmation Bottom Sheet */}
      {paymentSheet?.isOpen && (
        <div className={styles.sheetOverlay}>
          <div className={styles.bottomSheet}>
            <div className={styles.sheetHeader}>
              <h4 className={styles.sheetTitle}>입금 확인 정보 선택</h4>
              <p className={styles.sheetDesc}>입금하신 항목을 선택해주세요.</p>
            </div>
            
            <select 
              className={styles.paymentSelect}
              value={selectedOption}
              onChange={(e) => setSelectedOption(e.target.value)}
            >
              <option value="">선택해주세요</option>
              <option value="1개월수강 18만원 입금하였습니다.">1개월수강 18만원 입금하였습니다.</option>
              <option value="단일수업 신청 12만원 입금하였습니다.">단일수업 신청 12만원 입금하였습니다.</option>
              <option value="6개월 멤버쉽 86만원을 입금하였습니다">6개월 멤버쉽 86만원을 입금하였습니다</option>
              <option value="기존 6개월 멤버쉽 2개월차입니다">기존 6개월 멤버쉽 2개월차입니다</option>
              <option value="기존 6개월 멤버쉽 3개월차입니다">기존 6개월 멤버쉽 3개월차입니다</option>
              <option value="기존 6개월 멤버쉽 4개월차입니다">기존 6개월 멤버쉽 4개월차입니다</option>
              <option value="기존 6개월 멤버쉽 5개월차입니다">기존 6개월 멤버쉽 5개월차입니다</option>
              <option value="기존 6개월 멤버쉽 마지막 월입니다">기존 6개월 멤버쉽 마지막 월입니다</option>
            </select>

            <div className={styles.sheetFooter}>
              <button className={styles.cancelBtn} onClick={() => setPaymentSheet(null)}>취소</button>
              <button className={styles.submitBtn} onClick={submitPayment}>입금확인</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

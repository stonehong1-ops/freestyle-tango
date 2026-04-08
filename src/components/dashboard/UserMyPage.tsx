'use client';

import React, { useState, useEffect } from 'react';
import { TangoClass, Registration, getUserByPhone, updateUserSettings } from '@/lib/db';
import AdminChecklist from '../admin/AdminChecklist';
import MemberManagement from '../admin/MemberManagement';
import StayTemplateEditor from '../admin/StayTemplateEditor';
import styles from './UserMyPage.module.css';
import { useLanguage } from '@/contexts/LanguageContext';
import FullscreenModal from '../common/FullscreenModal';
import IdentityForm from '../registration/IdentityForm';
import { getActiveCoupons, getUserCoupons, issueCoupon, useCoupon, getAllCouponIssuances, cancelCoupon, UserCoupon, Coupon } from '@/lib/coupon';
import { useModalHistory } from '@/hooks/useModalHistory';
import { Timestamp } from 'firebase/firestore';
import { requestNotificationPermission, registerFCMToken } from '@/lib/messaging';

interface Props {
  classes: TangoClass[];
  registrations?: Registration[];
  reservations?: any[];
  selectedMonth: string;
  availableMonths: string[];
  isAdmin?: boolean;
  onMonthChange: (month: string) => void;
  onOpenCouponEditor?: () => void;
  onHome: () => void;
  requireIdentity?: (action: () => void) => void;
}

export default function UserMyPage({ 
  classes, 
  registrations,
  reservations,
  selectedMonth, 
  availableMonths, 
  isAdmin,
  onMonthChange, 
  onOpenCouponEditor,
  onHome, 
  requireIdentity 
}: Props) {
  const { t, language } = useLanguage();
  const [activeSubTab, setActiveSubTab] = useState<'history' | 'profile' | 'wallet' | 'admin'>('history');
  const [showMemberManagement, setShowMemberManagement] = useState(false);
  const [showStayChecklist, setShowStayChecklist] = useState(false);
  const [showStaySMS, setShowStaySMS] = useState(false);

  useModalHistory(showMemberManagement, () => setShowMemberManagement(false), 'memberManagement');
  useModalHistory(showStayChecklist, () => setShowStayChecklist(false), 'stayChecklist');
  useModalHistory(showStaySMS, () => setShowStaySMS(false), 'staySMS');
  const [identity, setIdentity] = useState<{nickname: string, phone: string, role?: string, photoURL?: string} | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRecipientsModal, setShowRecipientsModal] = useState(false);
  const [selectedRecipients, setSelectedRecipients] = useState<{title: string, participants: any[]}>({ title: '', participants: [] });
  const [userCoupons, setUserCoupons] = useState<UserCoupon[]>([]);
  const [activeCoupons, setActiveCoupons] = useState<Coupon[]>([]);
  const [isLoadingCoupons, setIsLoadingCoupons] = useState(false);
  const [isRegisteringPush, setIsRegisteringPush] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [isSyncingPush, setIsSyncingPush] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('ft_user');
    if (stored) {
      const user = JSON.parse(stored);
      setIdentity(user);
    }
  }, []);

  const [allIssuances, setAllIssuances] = useState<Record<string, UserCoupon[]>>({});

  const fetchCoupons = async () => {
    if (!identity?.nickname) return;
    setIsLoadingCoupons(true);
    try {
      const [uCoupons, aCoupons] = await Promise.all([
        getUserCoupons(identity.phone),
        getActiveCoupons()
      ]);
      setUserCoupons(uCoupons);
      setActiveCoupons(aCoupons);

      // Fetch all issuances for transparency
      const activeIds = aCoupons.map(c => c.id).filter(Boolean) as string[];
      if (activeIds.length > 0) {
        const issuances = await getAllCouponIssuances(activeIds);
        const grouped: Record<string, UserCoupon[]> = {};
        issuances.forEach(iss => {
          if (!grouped[iss.couponId]) grouped[iss.couponId] = [];
          grouped[iss.couponId].push(iss);
        });
        setAllIssuances(grouped);
      }
    } catch (err) {
      console.error("Failed to fetch coupons:", err);
    } finally {
      setIsLoadingCoupons(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'wallet' && identity) {
      fetchCoupons();
    }
    if (activeSubTab === 'profile' && identity?.phone) {
      getUserByPhone(identity.phone).then(user => {
        if (user?.settings?.pushEnabled !== undefined) {
          setPushEnabled(user.settings.pushEnabled);
        }
      });
    }
  }, [activeSubTab, identity]);

  const handlePushToggle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!identity?.phone) return;
    
    const newValue = e.target.checked;
    setIsSyncingPush(true);
    
    try {
      if (newValue) {
        // Turning ON: Request permission and register token
        const granted = await requestNotificationPermission();
        if (granted) {
          try {
            const token = await registerFCMToken(identity.phone);
            if (token) {
              await updateUserSettings(identity.phone, { pushEnabled: true, token });
              setPushEnabled(true);
            }
          } catch (regError: any) {
            console.error("FCM Reg Toggle Error:", regError);
            let detail = regError.message || 'UNKNOWN';
            
            // Try to parse JSON if it's a detail object
            try {
              if (detail.startsWith('{')) {
                const parsed = JSON.parse(detail);
                detail = `[${parsed.name}] ${parsed.code}: ${parsed.message}`;
              }
            } catch (pErr) {}

            const errorMsg = language === 'ko' 
              ? `알림 등록에 실패했습니다.\n상세 정보: ${detail}\n\n브라우저 설정의 알림 허용 여부나 네트워크를 확인해주세요.` 
              : `Token registration failed.\nDetails: ${detail}\n\nPlease check your browser's notification settings or network.`;
            alert(errorMsg);
            setPushEnabled(false);
          }
        } else {
          alert(language === 'ko' ? '알림 권한이 거부되었습니다. 주소창의 자물쇠 아이콘을 클릭하여 권한을 허용해주세요.' : 'Notification permission denied. Please allow permissions in browser settings.');
          setPushEnabled(false);
        }
      } else {
        // Turning OFF
        await updateUserSettings(identity.phone, { pushEnabled: false });
        setPushEnabled(false);
      }
    } catch (err: any) {
      console.error("Push toggle error:", err);
      const detail = err?.message || err?.code || 'Unknown error';
      alert(language === 'ko' 
        ? `설정 업데이트 중 오류가 발생했습니다: ${detail}` 
        : `Error updating settings: ${detail}`);
    } finally {
      setIsSyncingPush(false);
    }
  };

  const monthName = selectedMonth ? selectedMonth.split('-')[1] : '04';

  const handleLogout = () => {
    if (window.confirm(language === 'ko' ? '로그아웃 하시겠습니까?' : 'Are you sure you want to logout?')) {
      localStorage.removeItem('ft_user');
      setIdentity(null);
      onHome();
    }
  };

  const handleEditInfo = () => {
    setShowEditModal(true);
  };

  const handleEditComplete = () => {
    const stored = localStorage.getItem('ft_user');
    if (stored) {
      setIdentity(JSON.parse(stored));
    }
    setShowEditModal(false);
  };

  const handleIssueCoupon = async (couponId: string) => {
    if (!identity?.nickname || !identity?.phone) return;
    
    // 1. Eligibility Check (April Student)
    if (!isEligible) {
      alert(language === 'ko' ? '이번 달 수업진행중인 사용자만 받을 수 있습니다' : 'Only available for students this month.');
      return;
    }

    // 2. 7-day Cooldown Check
    if (userCoupons.length > 0) {
      const now = Date.now();
      const lastIssuedAt = Math.max(...userCoupons.map(uc => uc.issuedAt?.toMillis() || 0));
      const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
      
      if (now - lastIssuedAt < sevenDaysInMs) {
        alert(language === 'ko' 
          ? '마지막 쿠폰 받은 7일 이후에 다른 쿠폰을 받을 수 있습니다' 
          : 'You can receive another coupon 7 days after your last claim.');
        return;
      }
    }

    // 3. Sold Out Check
    const targetCoupon = activeCoupons.find(c => c.id === couponId);
    if (targetCoupon && targetCoupon.issuedCount >= targetCoupon.totalQuantity) {
      alert(language === 'ko' 
        ? `정해진 쿠폰 ${targetCoupon.totalQuantity}매가 모두 발급되었습니다` 
        : `All ${targetCoupon.totalQuantity} coupons have been issued.`);
      return;
    }
    
    if (window.confirm(language === 'ko' ? '이 쿠폰을 받으시겠습니까?' : 'Would you like to get this coupon?')) {
      const res = await issueCoupon(couponId, identity.phone, identity.nickname);
      if (res.success) {
        alert(language === 'ko' ? '쿠폰이 발급되었습니다' : 'Coupon issued.');
        fetchCoupons();
      } else {
        if (res.message === 'COOLDOWN') {
          alert(language === 'ko' ? '마지막 쿠폰 받은 7일 이후에 다른 쿠폰을 받을 수 있습니다' : '7-day cooldown applies.');
        } else if (res.message === 'DUPLICATE') {
          alert(language === 'ko' ? '이미 발급받은 쿠폰입니다' : 'Already issued.');
        } else if (res.message === 'SOLD_OUT') {
          alert(language === 'ko' ? `정해진 쿠폰 ${targetCoupon?.totalQuantity || 0}매가 모두 발급되었습니다` : 'Sold out.');
        } else {
          alert(`발급 실패: ${res.message || '알 수 없는 오류'}`);
        }
      }
    }
  };

  const handleCancelCoupon = async (userCouponId: string, couponId: string) => {
    if (!window.confirm(language === 'ko' ? '정말 쿠폰을 취소(반납)하시겠습니까? 취소된 쿠폰 수량은 다시 복구됩니다.' : 'Are you sure you want to cancel and return the coupon? The original quantity will be restored.')) return;

    try {
      const res = await cancelCoupon(userCouponId, couponId);
      if (res.success) {
        alert(language === 'ko' ? '쿠폰이 성공적으로 취소되었습니다.' : 'Coupon successfully cancelled.');
        setShowRecipientsModal(false);
        fetchCoupons();
      } else {
        alert(language === 'ko' ? `취소 실패: ${res.message}` : `Cancellation failed: ${res.message}`);
      }
    } catch (err) {
      console.error("Cancellation Error:", err);
      alert(language === 'ko' ? '오류가 발생했습니다. 다시 시도해 주세요.' : 'An error occurred. Please try again.');
    }
  };

  const handleUseCoupon = async (userCouponId: string) => {
    const target = userCoupons.find(uc => uc.id === userCouponId);
    if (!target) return;
    
    const now = new Date();
    const isExpired = target.expiresAt && target.expiresAt.toDate() < now;
    
    if (isExpired || target.status === 'EXPIRED') {
      alert(language === 'ko' ? '사용 기간이 만료되어 사용할 수 없는 쿠폰입니다' : 'This coupon has expired and cannot be used.');
      fetchCoupons();
      return;
    }

    if (window.confirm(language === 'ko' ? '이 쿠폰을 사용하시겠습니까?' : 'Would you like to use this coupon?')) {
      await useCoupon(userCouponId);
      fetchCoupons();
    }
  };

  // Eligibility check: current month (2026-04) classes
  const isEligible = registrations?.some(reg => {
    const isThisUser = (identity?.phone && reg.phone?.replace(/[^0-9]/g, '') === identity.phone.replace(/[^0-9]/g, '')) || 
                      (identity?.nickname && reg.nickname === identity.nickname);
    const isThisMonth = reg.month === (selectedMonth || '2026-04');
    return isThisUser && isThisMonth;
  });

  return (
    <div className={styles.container}>
      <div className={styles.subTabs}>
        <button 
          className={`${styles.subTabBtn} ${activeSubTab === 'history' ? styles.active : ''}`}
          onClick={() => setActiveSubTab('history')}
        >
          {t.mypage.tabs.history}
        </button>
        <button 
          className={`${styles.subTabBtn} ${activeSubTab === 'wallet' ? styles.active : ''}`}
          onClick={() => setActiveSubTab('wallet')}
        >
          {t.mypage.tabs.wallet}
        </button>
        <button 
          className={`${styles.subTabBtn} ${activeSubTab === 'profile' ? styles.active : ''}`}
          onClick={() => setActiveSubTab('profile')}
        >
          {t.mypage.tabs.profile}
        </button>
        {isAdmin && (
          <button 
            className={`${styles.subTabBtn} ${activeSubTab === 'admin' ? styles.active : ''}`}
            onClick={() => setActiveSubTab('admin')}
          >
            어드민
          </button>
        )}
      </div>

      {activeSubTab === 'history' && (
        <div className={styles.selectorRow}>
          <button 
            className="nav-btn-standard" 
            onClick={() => {
              const idx = availableMonths?.indexOf(selectedMonth) ?? -1;
              if (idx > 0) onMonthChange?.(availableMonths[idx - 1]);
            }}
            disabled={!availableMonths || availableMonths.indexOf(selectedMonth) <= 0}
          >
            <span className="nav-btn-icon">←</span>
            <span style={{ marginLeft: '4px' }}>{language === 'ko' ? '이전' : 'Prev'}</span>
          </button>

          <div className={styles.monthTitle}>
            {selectedMonth?.split('-')?.[0] || ''}년 {parseInt(selectedMonth?.split('-')?.[1] || '0')}월
          </div>

          <button 
            className="nav-btn-standard" 
            onClick={() => {
              const idx = availableMonths?.indexOf(selectedMonth) ?? -1;
              if (idx !== -1 && idx < (availableMonths?.length ?? 0) - 1) onMonthChange?.(availableMonths[idx + 1]);
            }}
            disabled={!availableMonths || availableMonths.indexOf(selectedMonth) >= (availableMonths?.length ?? 0) - 1}
          >
            <span style={{ marginRight: '4px' }}>{language === 'ko' ? '다음' : 'Next'}</span>
            <span className="nav-btn-icon">→</span>
          </button>
        </div>
      )}

      <div className={styles.content}>
        {activeSubTab === 'history' && (
          <section className={styles.section}>
            <div className={styles.historyCardList}>
              {(() => {
                const myRegistrations = registrations?.filter(reg => 
                  (identity?.phone && reg.phone?.replace(/[^0-9]/g, '') === identity.phone.replace(/[^0-9]/g, '')) || 
                  (identity?.nickname && reg.nickname === identity.nickname)
                ) || [];

                return myRegistrations.length > 0 ? (
                  myRegistrations.map((reg) => (
                    <div key={reg.id} className={styles.premiumHistoryCard}>
                      <div className={styles.premiumCardHeader}>
                        <div className={styles.premiumMonthBadge}>
                          {reg.month?.split('-')[1]}월 신청 내역
                        </div>
                        <div className={`${styles.premiumStatusBadge} ${reg.status === 'paid' ? styles.statusPaid : styles.statusWaiting}`}>
                          {reg.status === 'paid' ? (language === 'ko' ? '결제완료' : 'Paid') : (language === 'ko' ? '입금확인중' : 'Pending')}
                        </div>
                      </div>
                      
                      <div className={styles.premiumCardBody}>
                        <div className={styles.premiumClassList}>
                          {reg.classIds?.map(cid => {
                            const target = classes.find(c => c.id === cid);
                            return target ? (
                              <div key={cid} className={styles.premiumClassItem}>
                                <span className={styles.premiumDot}>•</span>
                                <span className={styles.premiumClassTitle}>{target.title}</span>
                              </div>
                            ) : null;
                          })}
                        </div>
                      </div>

                      <div className={styles.premiumCardFooter}>
                        <span className={styles.premiumRegDate}>
                          {language === 'ko' ? '신청일' : 'Applied'}: {reg.date}
                        </span>
                        {reg.amount && (
                          <span className={styles.premiumAmount}>
                            {reg.amount.toLocaleString()}원
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={styles.emptyState}>{language === 'ko' ? '신청 내역이 없습니다.' : 'No registrations found.'}</div>
                );
              })()}
            </div>
          </section>
        )}

        {activeSubTab === 'wallet' && (
          <section className={styles.section}>
            {/* Issuance Rules Notice */}
            <div className={styles.noticeBox}>
              <div className={styles.noticeTitle}>
                {language === 'ko' ? '📢 쿠폰 발급 안내' : '📢 Coupon Notice'}
              </div>
              <ul className={styles.noticeList}>
                <li>{language === 'ko' ? '쿠폰 발급받은 분은 7일 이내 추가로 발급이 제한됩니다.' : 'Additional issuance is restricted for 7 days after receiving a coupon.'}</li>
                <li>{language === 'ko' ? '모든 쿠폰은 이번 달 수업신청자에게만 발급됩니다.' : 'Coupons are only available to this month\'s class applicants.'}</li>
                <li>{language === 'ko' ? '당일 오거나이저나 스탭에게 \'사용하기\' 버튼을 누르시게 하면 사용이 완료됩니다.' : 'Hand your device to a staff member to press the "Use" button on the day of use.'}</li>
                <li>{language === 'ko' ? '사용기간이 지나면 자동으로 사용불가 상태가 됩니다.' : 'Coupons automatically become unusable after the expiry date.'}</li>
              </ul>
            </div>

            {isLoadingCoupons ? (
              <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
              </div>
            ) : activeCoupons.length === 0 ? (
              <div className={styles.emptyState}>
                <p>{language === 'ko' ? '현재 발행 중인 쿠폰이 없습니다.' : 'No active coupons found.'}</p>
              </div>
            ) : (
              <div className={styles.couponList}>
                {(() => {
                  // Group coupons by creation date
                  const sorted = [...activeCoupons].sort((a, b) => 
                    (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0)
                  );
                  
                  let lastDate = '';
                  return sorted.map((coupon, index) => {
                    const userCoupon = userCoupons.find(uc => uc.couponId === coupon.id);
                    const isSoldOut = coupon.issuedCount >= coupon.totalQuantity;
                    const issuancesForThis = allIssuances[coupon.id!] || [];
                    
                    let buttonStatus: 'CLAIM' | 'USE' | 'USED' | 'SOLDOUT' = 'CLAIM';
                    let buttonText = language === 'ko' ? '쿠폰받기' : 'Get Coupon';
                    let userCouponId = '';

                    if (userCoupon) {
                      userCouponId = userCoupon.id!;
                      const now = new Date();
                      const isExpired = userCoupon.expiresAt && userCoupon.expiresAt.toDate() < now;

                      if (userCoupon.status === 'USED') {
                        buttonText = language === 'ko' ? '사용완료' : 'Used';
                        buttonStatus = 'USED';
                      } else if (userCoupon.status === 'EXPIRED' || isExpired) {
                        buttonText = language === 'ko' ? '기간만료' : 'Expired';
                        buttonStatus = 'USED';
                      } else {
                        buttonText = language === 'ko' ? '사용하기' : 'Use';
                        buttonStatus = 'USE';
                      }
                    } else if (isSoldOut) {
                      buttonText = language === 'ko' ? '발행완료' : 'Sold Out';
                      buttonStatus = 'SOLDOUT';
                    }

                    const currentDate = coupon.createdAt?.toDate().toLocaleDateString('ko-KR', {
                      year: 'numeric', month: '2-digit', day: '2-digit'
                    }) || '';
                    
                    const showSeparator = currentDate !== lastDate;
                    lastDate = currentDate;

                    return (
                      <React.Fragment key={coupon.id}>
                        {showSeparator && (
                          <div className={styles.dateSeparator}>
                            <span className={styles.dateText}>{currentDate}</span>
                          </div>
                        )}
                        <div className={`${styles.couponCard} ${buttonStatus === 'USED' || buttonStatus === 'SOLDOUT' ? styles.disabled : ''}`}>
                          <div className={`${styles.couponLeft} ${coupon.type === 'FREE' ? styles.purple : (index % 2 === 0 ? styles.blue : styles.green)}`}>
                            <div className={styles.discountValue}>
                              {coupon.type === 'FREE' ? (language === 'ko' ? '무료' : 'FREE') : (coupon.discountValue || '0')}
                            </div>
                            <div className={styles.discountUnit}>
                              {coupon.type === 'FREE' 
                                ? (language === 'ko' ? '입장권' : 'Pass') 
                                : (language === 'ko' 
                                    ? (Number(coupon.discountValue) >= 1000 ? '원 할인' : '만원 할인') 
                                    : 'OFF')}
                            </div>
                          </div>

                          <div className={styles.couponMiddle}>
                            <div className={styles.statusBadgeRow}>
                              <span className={`${styles.statusBadge} ${
                                buttonStatus === 'CLAIM' || buttonStatus === 'USE' ? styles.availableText : 
                                buttonStatus === 'USED' ? styles.usedText : styles.expiredText
                              }`}>
                                {buttonStatus === 'CLAIM' && (language === 'ko' ? '발급가능' : 'Available')}
                                {buttonStatus === 'USE' && (language === 'ko' ? '사용가능' : 'Ready')}
                                {buttonStatus === 'USED' && (language === 'ko' ? '사용완료' : 'Used')}
                                {buttonStatus === 'SOLDOUT' && (language === 'ko' ? '발행완료' : 'Sold Out')}
                              </span>
                            </div>
                            <h4 className={styles.couponTitle}>{coupon.title}</h4>
                            <div className={styles.couponLocation}>{coupon.location}</div>
                            <div className={styles.couponExpiry}>
                              {userCoupon?.expiresAt ? (
                                `${language === 'ko' ? '만료' : 'Exp'}: ${userCoupon.expiresAt.toDate().toLocaleDateString()}`
                              ) : (
                                language === 'ko' ? 
                                  (coupon.duration > 0 ? `발급 후 ${coupon.duration}개월 이내 사용` : '기간 제한 없음') : 
                                  (coupon.duration > 0 ? `Use within ${coupon.duration} months` : 'No expiry limit')
                              )}
                            </div>

                            {/* Recipient List moved to icon and bottom sheet */}
                            {issuancesForThis.length > 0 && (
                              <button 
                                className={styles.recipientCountBtn}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedRecipients({ title: coupon.title, participants: issuancesForThis });
                                  setShowRecipientsModal(true);
                                }}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.usersIcon}>
                                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                  <circle cx="9" cy="7" r="4" />
                                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                </svg>
                                <span>{issuancesForThis.length}{language === 'ko' ? '명' : '명'}</span>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="m9 18 6-6-6-6" />
                                </svg>
                              </button>
                            )}
                          </div>

                          <div className={styles.couponRight}>
                            <button 
                              className={`${styles.couponBtn} ${buttonStatus === 'USE' ? styles.useBtn : ''}`}
                              disabled={buttonStatus === 'USED' || buttonStatus === 'SOLDOUT'}
                              onClick={() => {
                                if (buttonStatus === 'CLAIM') handleIssueCoupon(coupon.id!);
                                else if (buttonStatus === 'USE') handleUseCoupon(userCouponId);
                              }}
                            >
                              <div style={{ textAlign: 'center' }}>
                                {buttonText.split(' ').map((line, i) => (
                                  <div key={i}>{line}</div>
                                ))}
                              </div>
                            </button>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  });
                })()}
              </div>
            )}
          </section>
        )}

        {activeSubTab === 'profile' && identity && (
          <section className={styles.section}>
            <div className={styles.profileHeader}>
              <div className={styles.avatarWrapper}>
                <div className={styles.avatarCircle} style={{ 
                  background: identity.photoURL ? `url(${identity.photoURL}) center/cover no-repeat` : '#f2f4f6'
                }}>
                  {!identity.photoURL && (
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#8b95a1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  )}
                </div>
              </div>
              <div className={styles.userNameGroup}>
                <h2 className={styles.userNickname}>{identity.nickname}</h2>
                <div className={styles.userRoleBadge}>
                  {identity.role === 'leader' ? (language === 'ko' ? '리더' : 'Leader') : (language === 'ko' ? '팔로어' : 'Follower')}
                </div>
              </div>
            </div>

            <div className={styles.infoCardList}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>{language === 'ko' ? '전화번호' : 'Phone'}</span>
                <span className={styles.infoValue}>{identity.phone}</span>
              </div>
              
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>{language === 'ko' ? '푸시 알림' : 'Push Notification'}</span>
                <div className={styles.toggleSwitch}>
                  <input 
                    type="checkbox" 
                    id="pushToggle"
                    checked={pushEnabled}
                    onChange={handlePushToggle}
                    disabled={isSyncingPush}
                  />
                  <label htmlFor="pushToggle" className={styles.toggleSlider}></label>
                </div>
              </div>
            </div>

            <div className={styles.actionButtons}>
              <button className={styles.editBtn} onClick={handleEditInfo}>
                {language === 'ko' ? '내 정보 수정' : 'Edit Profile'}
              </button>
              <button className={styles.logoutBtn} onClick={handleLogout}>
                {t.mypage.logoutBtn}
              </button>
            </div>
          </section>
        )}

        {activeSubTab === 'admin' && isAdmin && (
          <section className={styles.adminSection}>
            <div className={styles.adminMenuList}>
              <button className={styles.adminMenuItem} onClick={() => setShowMemberManagement(true)}>
                <div className={styles.adminMenuIcon}>👥</div>
                <div className={styles.adminMenuContent}>
                  <span className={styles.adminMenuLabel}>{language === 'ko' ? '회원 관리' : 'Members'}</span>
                  <span className={styles.adminMenuSubLabel}>{language === 'ko' ? '전체 회원 목록 및 정보 관리' : 'Manage all members and info'}</span>
                </div>
                <div className={styles.adminMenuArrow}>›</div>
              </button>
              
              <button className={styles.adminMenuItem} onClick={() => setShowStayChecklist(true)}>
                <div className={styles.adminMenuIcon}>📋</div>
                <div className={styles.adminMenuContent}>
                  <span className={styles.adminMenuLabel}>{language === 'ko' ? '스테이 체크리스트' : 'Stay Checklist'}</span>
                  <span className={styles.adminMenuSubLabel}>{language === 'ko' ? '숙소 예약 평면도 및 체크리스트' : 'Stay reservations and checklist'}</span>
                </div>
                <div className={styles.adminMenuArrow}>›</div>
              </button>
              
              <button className={styles.adminMenuItem} onClick={() => setShowStaySMS(true)}>
                <div className={styles.adminMenuIcon}>💬</div>
                <div className={styles.adminMenuContent}>
                  <span className={styles.adminMenuLabel}>{language === 'ko' ? '스테이 문자설정' : 'Stay SMS'}</span>
                  <span className={styles.adminMenuSubLabel}>{language === 'ko' ? '예약 확정 및 안내 메시지 관리' : 'Manage confirmation messages'}</span>
                </div>
                <div className={styles.adminMenuArrow}>›</div>
              </button>
              
              <button className={styles.adminMenuItem} onClick={onOpenCouponEditor}>
                <div className={styles.adminMenuIcon}>🎫</div>
                <div className={styles.adminMenuContent}>
                  <span className={styles.adminMenuLabel}>{language === 'ko' ? '쿠폰 발행 및 관리' : 'Coupons'}</span>
                  <span className={styles.adminMenuSubLabel}>{language === 'ko' ? '신규 쿠폰 발행 및 사용 현황' : 'Issue and manage coupons'}</span>
                </div>
                <div className={styles.adminMenuArrow}>›</div>
              </button>
            </div>
          </section>
        )}
      </div>

      <FullscreenModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title={language === 'ko' ? '내 정보 수정' : 'Edit My Info'}
        isBottomSheet={true}
      >
        <IdentityForm 
          onClose={() => setShowEditModal(false)}
          onComplete={handleEditComplete}
          isEdit={true}
        />
      </FullscreenModal>

      <FullscreenModal
        isOpen={showMemberManagement}
        onClose={() => setShowMemberManagement(false)}
        title={language === 'ko' ? '회원 관리' : 'Member Management'}
      >
        <MemberManagement 
          registrations={registrations || []}
          onClose={() => setShowMemberManagement(false)} 
        />
      </FullscreenModal>

      <FullscreenModal
        isOpen={showStayChecklist}
        onClose={() => setShowStayChecklist(false)}
        title={language === 'ko' ? '스테이 체크리스트' : 'Stay Checklist'}
      >
        <AdminChecklist 
          classes={classes}
          registrations={registrations || []}
          reservations={reservations || []}
        />
      </FullscreenModal>

      <FullscreenModal
        isOpen={showStaySMS}
        onClose={() => setShowStaySMS(false)}
        title={language === 'ko' ? '스테이 문자설정' : 'Stay SMS Settings'}
      >
        <StayTemplateEditor 
          onClose={() => setShowStaySMS(false)}
          language={language}
        />
      </FullscreenModal>

      <FullscreenModal
        isOpen={showRecipientsModal}
        onClose={() => setShowRecipientsModal(false)}
        title={language === 'ko' ? '쿠폰 발급 명단' : 'Coupon Recipients'}
        isBottomSheet={true}
        heightMode="half"
      >
        <div className={styles.modalScrollContent}>
          <div className={styles.modalCouponTitle}>{selectedRecipients.title}</div>
          <div className={styles.modalRecipientList}>
            {selectedRecipients.participants.length === 0 ? (
              <div className={styles.emptyState}>이 쿠폰을 받은 사람이 아직 없습니다.</div>
            ) : (
              selectedRecipients.participants.map((iss, i) => {
                // Correctly match photo logic
                const isCurrentUser = (iss.userId.replace(/[^0-9]/g, '') === identity?.phone.replace(/[^0-9]/g, ''));
                const reg = registrations?.find(r => 
                  (r.phone?.replace(/[^0-9]/g, '') === iss.userId.replace(/[^0-9]/g, '')) || 
                  (r.nickname === (iss.userName || iss.userId))
                );

                const displayPhotoURL = (isCurrentUser && identity?.photoURL) ? identity.photoURL : reg?.photoURL;
                const displayName = iss.userName || reg?.nickname || '알 수 없음';
                
                return (
                  <div key={i} className={styles.modalRecipientRow}>
                    <div className={styles.recipientInfo}>
                      <div 
                        className={styles.recipientAvatar}
                        style={displayPhotoURL ? { 
                          backgroundImage: `url(${displayPhotoURL})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          color: 'transparent'
                        } : {}}
                      >
                        {!displayPhotoURL && (displayName.charAt(0) || '?')}
                      </div>
                      <div className={styles.nameAndStatus}>
                        <span className={styles.recipientName}>
                          {displayName}
                          {isCurrentUser && <span className={styles.meBadge}>나</span>}
                        </span>
                        <span className={styles.recipientTime}>
                          {iss.issuedAt?.toDate().toLocaleString('ko-KR', {
                            month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>

                    <div className={styles.recipientActions}>
                      {isCurrentUser && iss.status === 'UNUSED' && (
                        <button 
                          className={styles.cancelIssuanceBtn}
                          onClick={() => handleCancelCoupon(iss.id!, iss.couponId)}
                        >
                          취소
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </FullscreenModal>
    </div>
  );
}


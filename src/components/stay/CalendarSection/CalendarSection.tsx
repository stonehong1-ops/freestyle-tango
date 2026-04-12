'use client';

import { useState, useEffect } from 'react';
import { onSnapshot, collection, query, where, QuerySnapshot, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { BlockedDateInfo, FullStayReservation, cancelStayReservation, updateStayReservation } from '@/lib/db';
import { useLanguage } from '@/contexts/LanguageContext';
import { useModalHistory } from '@/hooks/useModalHistory';
import { calculateStayPrice } from '@/lib/stay-utils';
import styles from './CalendarSection.module.css';

const maskName = (name: string) => {
  if (!name) return "***";
  if (name.length <= 2) return name.substring(0, 1) + "*";
  return name.substring(0, 1) + "*" + name.substring(2);
};

const maskPhone = (phone: string) => {
  if (!phone) return "****";
  // Clean dots, spaces, hyphens but keep plus for intl
  const cleaned = phone.replace(/[^\d+]/g, '');
  if (cleaned.length < 8) return phone.substring(0, 3) + "****";
  
  // Standard Mask: Keep last 4 digits and first 4-5 digits
  // e.g. +8201032987727 -> +8201****7727
  const last4 = phone.slice(-4);
  const prefix = phone.slice(0, -8); // Mask middle 4 digits of the rest
  return prefix + "****" + last4;
};

export default function CalendarSection({ 
  stayId = 'hapjeong',
  onReserve ,
  showInlineGrid = true,
  hideCalendar = false,
  forceListView = false,
  hideHeader = false
}: { 
  stayId?: string;
  onReserve?: (data: { checkIn: string, checkOut: string, guests: number, pricing: any }) => void;
  showInlineGrid?: boolean;
  hideCalendar?: boolean;
  forceListView?: boolean;
  hideHeader?: boolean;
}) {
  const { t, language } = useLanguage();
  
  // @ts-ignore
  const stayCal = t.stays[stayId]?.calendar || t.stays.hapjeong.calendar;

  // View mode
  const [isListOpen, setIsListOpen] = useState(false);
  const [selectedResForDetail, setSelectedResForDetail] = useState<FullStayReservation | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<FullStayReservation | null>(null);

  useModalHistory(isListOpen, () => setIsListOpen(false), 'stayList');
  useModalHistory(!!selectedResForDetail, () => setSelectedResForDetail(null), 'stayDetail');
  
  // Dates
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [checkIn, setCheckIn] = useState<string | null>(null);
  const [checkOut, setCheckOut] = useState<string | null>(null);
  const [blockedDates, setBlockedDates] = useState<BlockedDateInfo[]>([]);
  const [reservations, setReservations] = useState<FullStayReservation[]>([]);
  const [guests, setGuests] = useState(1);
  const [isHintVisible, setIsHintVisible] = useState(false);

  useEffect(() => {
    if (isHintVisible) {
      const timer = setTimeout(() => setIsHintVisible(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isHintVisible]);

  useEffect(() => {
    console.log(`Setting up real-time listener for ${stayId} reservations...`);
    const q = query(
      collection(db, 'reservations'),
      where('status', '!=', 'cancelled')
    );

    const unsubscribe = onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
      const allRes: FullStayReservation[] = [];
      const allBlocked: BlockedDateInfo[] = [];

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        let docStayId = data.stayId || 'hapjeong';
        if (docStayId === 'stayhapjeoung') docStayId = 'hapjeong';
        if (docStayId === 'staydeokeun' || docStayId === 'deokeun' || docStayId === '덕은' || docStayId === 'deogeun') docStayId = 'deokeun';
        if (docStayId !== stayId) return;

        const res = { ...data, id: docSnap.id, stayId: docStayId } as FullStayReservation;
        allRes.push(res);

        // Generate blocked dates
        const start = new Date(res.checkIn);
        const end = new Date(res.checkOut);
        if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
          const current = new Date(start);
          while (current < end) {
            allBlocked.push({
              date: current.toISOString().split('T')[0],
              maskedName: maskName(res.name || ""),
              checkIn: res.checkIn,
              checkOut: res.checkOut
            });
            current.setDate(current.getDate() + 1);
          }
        }
      });

      console.log(`Received ${allRes.length} reservations for ${stayId}`);
      setReservations(allRes.sort((a: any, b: any) => (a.checkIn || "").localeCompare(b.checkIn || "")));
      setBlockedDates(allBlocked);
    }, (error) => {
      console.error("Reservation listener error:", error);
    });

    return () => unsubscribe();
  }, [stayId]);

  const handleCancel = async (id: string) => {
    console.log("Attempting to cancel reservation:", id);
    if (!id) {
      alert(language === 'ko' ? '오류: 예약 ID가 없습니다.' : 'Error: No reservation ID found.');
      return;
    }

    const confirmMsg = language === 'ko' 
      ? '정말 이 예약을 취소(삭제)하시겠습니까?' 
      : 'Are you sure you want to cancel this reservation?';
    
    if (window.confirm(confirmMsg)) {
      try {
        const result = await cancelStayReservation(id);
        if (result.success) {
          alert(language === 'ko' ? '취소되었습니다.' : 'Cancelled successfully.');
          setSelectedResForDetail(null);
        } else {
          alert(language === 'ko' ? '삭제 실패: ' + result.error : 'Failed to delete: ' + result.error);
        }
      } catch (err) {
        console.error("Delete error:", err);
        alert("Delete error: " + (err as Error).message);
      }
    }
  };

  // 모달 오픈 시 본문 스크롤 방지
  useEffect(() => {
    if (isListOpen || selectedResForDetail) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isListOpen, selectedResForDetail]);

  const handleDateClick = async (dateStr: string) => {
    const isDateBlocked = blockedDates.some(b => b.date === dateStr);

    if (!checkIn || (checkIn && checkOut)) {
      if (isDateBlocked) {
        const fullRes = reservations.find(r => 
          dateStr >= r.checkIn && dateStr < r.checkOut
        );
        if (fullRes) {
          setSelectedResForDetail(fullRes);
        }
        return;
      }
      setCheckIn(dateStr);
      setCheckOut(null);

      const nextDay = new Date(dateStr);
      nextDay.setDate(nextDay.getDate() + 1);
      const nextDayStr = nextDay.toISOString().split('T')[0];

      if (blockedDates.some(b => b.date === nextDayStr)) {
        setCheckOut(nextDayStr);
        setIsHintVisible(false);
        
        // 다음 날 예약 차단으로 인한 자동 체크아웃 시 즉시 예약 트리거
        if (onReserve) {
          const pricing = calculateStayPrice(stayId, dateStr, nextDayStr, guests);
          if (pricing) {
            onReserve({ checkIn: dateStr, checkOut: nextDayStr, guests, pricing });
          }
        }
      } else {
        setIsHintVisible(true);
      }
    } else {
      const start = new Date(checkIn);
      const end = new Date(dateStr);
      
      if (end < start) {
        if (isDateBlocked) {
          const blockedInfo = blockedDates.find(b => b.date === dateStr);
          alert(`${t.calendar.blockedAlert} ${blockedInfo?.maskedName}\n${t.calendar.period} ${blockedInfo?.checkIn} ~ ${blockedInfo?.checkOut}`);
          return;
        }
        setCheckIn(dateStr);
        return;
      } else if (end.getTime() === start.getTime()) {
        setCheckOut(null);
        return;
      }
      
      let temp = new Date(start);
      let isValid = true;
      while (temp < end) {
        const tempStr = temp.toISOString().split('T')[0];
        if (blockedDates.some(b => b.date === tempStr)) {
          isValid = false;
          break;
        }
        temp.setDate(temp.getDate() + 1);
      }

      if (!isValid) {
        alert(t.calendar.invalidRange);
        if (!isDateBlocked) {
          setCheckIn(dateStr);
        }
      } else {
        setCheckOut(dateStr);
        setIsHintVisible(false);
        
        // 즉시 예약 트리거
        if (onReserve) {
          const pricing = calculateStayPrice(stayId, checkIn, dateStr, guests);
          if (pricing) {
            onReserve({ checkIn, checkOut: dateStr, guests, pricing });
          }
        }
      }
    }
  };

  const pricing = checkIn && checkOut ? calculateStayPrice(stayId, checkIn, checkOut, guests) : null;

  const handleReserveClick = () => {
    if (!checkIn || !checkOut || !pricing) return;
    if (onReserve) {
      onReserve({ checkIn, checkOut, guests, pricing });
    }
  };

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Monday start logic: (getDay() + 6) % 7
  const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;
  
  const days: (string | null)[] = Array.from({ length: firstDay }, () => null);
  for (let i = 1; i <= daysInMonth; i++) {
    const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    days.push(dStr);
  }

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const todayObj = new Date();
  const todayStr = `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, '0')}-${String(todayObj.getDate()).padStart(2, '0')}`;

  interface ListViewItem {
    type: 'available' | 'booked';
    start: number;
    end: number;
    nights?: number;
    total?: number;
    name?: string;
    isContinued?: boolean;
    isSpanning?: boolean;
  }

  const renderListView = () => {
    const monthsToShow = [];
    const now = new Date();
    // 현재 월부터 12월까지
    for (let m = now.getMonth(); m <= 11; m++) {
      monthsToShow.push(new Date(now.getFullYear(), m, 1));
    }

    const maskName = (name: string) => {
      if (!name) return "***";
      if (name.length <= 2) return name.substring(0, 1) + "*";
      return name.substring(0, 1) + "*" + name.substring(2);
    };

    return (
      <div className={styles.modalOverlay} onClick={() => setIsListOpen(false)}>
        <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
          <header className={styles.modalHeader}>
            <h3>{t.calendar.viewList}</h3>
            <button className={styles.closeBtn} onClick={() => setIsListOpen(false)} aria-label="Close">
              &times;
            </button>
          </header>
          <div className={styles.legendInModal}>
            <span className={styles.legItemInModal}>
              <span className={`${styles.box} ${styles.booked}`} /> {language === 'ko' ? '예약됨' : 'Booked'}
            </span>
          </div>
          <div className={styles.listView}>
            {monthsToShow.map((mDate) => {
              const year = mDate.getFullYear();
              const month = mDate.getMonth();
              const daysInMonth = new Date(year, month + 1, 0).getDate();
              
              const sortedReservations = reservations.filter(r => {
                const rStart = new Date(r.checkIn);
                const rEnd = new Date(r.checkOut);
                const mStart = new Date(year, month, 1);
                const mEnd = new Date(year, month, daysInMonth);
                return (rStart <= mEnd && rEnd >= mStart);
              }).sort((a, b) => a.checkIn.localeCompare(b.checkIn));

              const monthLabel = mDate.toLocaleString(
                language === 'ko' ? 'ko' : language,
                { year: 'numeric', month: 'long' }
              );

              const listItems: ListViewItem[] = [];
              let nextPossibleDay = 1;

              sortedReservations.forEach(res => {
                const rStart = new Date(res.checkIn);
                const rEnd = new Date(res.checkOut);
                
                const startDayOfRes = (rStart.getFullYear() === year && rStart.getMonth() === month) ? rStart.getDate() : 1;
                
                if (startDayOfRes > nextPossibleDay) {
                  listItems.push({
                    type: 'available',
                    start: nextPossibleDay,
                    end: startDayOfRes
                  });
                }
                
                const endDayOfRes = (rEnd.getFullYear() === year && rEnd.getMonth() === month) ? rEnd.getDate() : daysInMonth;
                
                const isContinued = rStart.getMonth() !== month || rStart.getFullYear() !== year;
                const isSpanning = rEnd.getMonth() !== month || rEnd.getFullYear() !== year;

                if (endDayOfRes >= startDayOfRes) {
                  const resPrice = calculateStayPrice(stayId, res.checkIn, res.checkOut, res.guests);
                  listItems.push({
                    type: 'booked',
                    start: startDayOfRes,
                    end: endDayOfRes,
                    nights: resPrice?.nights,
                    total: resPrice?.total,
                    name: maskName(res.name),
                    isContinued,
                    isSpanning
                  });
                  nextPossibleDay = endDayOfRes;
                }
              });

              if (nextPossibleDay < daysInMonth) {
                listItems.push({
                  type: 'available',
                  start: nextPossibleDay,
                  end: daysInMonth
                });
              }

              return (
                <section key={monthLabel} className={styles.monthSection}>
                  <h4 className={styles.monthHeader}>{monthLabel}</h4>
                  <ul className={styles.monthList}>
                    {listItems.map((item, idx) => (
                      <li key={idx} className={item.type === 'available' ? styles.itemAvailable : styles.itemBooked}>
                        {item.type === 'available' ? (
                          <span>{item.start} ~ {item.end}일 {t.calendar.available}</span>
                        ) : (
                          <span className={item.isContinued ? styles.continuedItem : ''}>
                            {item.isContinued ? '↳ ' : ''}
                            {item.isSpanning ? (
                              item.start === item.end ? `${item.start}일` : `${item.start} - ${item.end}일`
                            ) : (
                              item.start === item.end - 1 ? `${item.start}일` : `${item.start} - ${item.end - 1}일`
                            )} {item.name} / 
                            {item.isContinued || item.isSpanning ? ` (총 ${item.nights}${t.calendar.days}) ` : ` ${item.nights}${t.calendar.days} `} / 
                            {item.total?.toLocaleString()}{t.calendar.won} 
                            {item.isSpanning ? ' →' : ''}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
        </div>
      </div>
    );
  };
  
  const renderDetailModal = () => {
    if (!selectedResForDetail) return null;
    const res = isEditing && editData ? editData : selectedResForDetail;

    const maskName = (name: string) => {
      if (name.length <= 1) return name;
      if (name.length === 2) return name[0] + '*';
      return name[0] + '*'.repeat(name.length - 2) + name[name.length - 1];
    };

    const calculateNights = (checkIn: string, checkOut: string) => {
      try {
        const start = new Date(checkIn);
        const end = new Date(checkOut);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
        return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      } catch (e) {
        return 0;
      }
    };

    const nights = calculateNights(res.checkIn, res.checkOut);

    const closeModal = () => {
      setSelectedResForDetail(null);
      setIsEditing(false);
      setEditData(null);
    };

    const handleEditStart = () => {
      setEditData({ ...selectedResForDetail });
      setIsEditing(true);
    };

    const handleSaveLocal = async () => {
      if (!editData) return;
      const result = await updateStayReservation(editData.id, editData);
      if (result.success) {
        alert(language === 'ko' ? '수정되었습니다.' : 'Updated successfully.');
        setSelectedResForDetail(editData);
        setIsEditing(false);
      }
    };

    return (
      <div className={styles.modalOverlay} onClick={closeModal}>
        <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
          <header className={styles.modalHeader}>
            <h3>{language === 'ko' ? '예약 상세 정보' : 'Reservation Detail'}</h3>
            <button className={styles.closeBtn} onClick={closeModal} aria-label="Close">
              &times;
            </button>
          </header>
          <div className={styles.detailBody}>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>{language === 'ko' ? '예약자' : 'Guest'}</span>
              {isEditing ? (
                <input 
                  className={styles.editInput}
                  value={editData?.name}
                  onChange={e => setEditData(prev => prev ? ({...prev, name: e.target.value}) : null)}
                />
              ) : (
                <span className={styles.detailValue}>{maskName(res.name)}</span>
              )}
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>{language === 'ko' ? '연락처' : 'Contact'}</span>
              {isEditing ? (
                <input 
                  className={styles.editInput}
                  value={editData?.phone}
                  onChange={e => setEditData(prev => prev ? ({...prev, phone: e.target.value}) : null)}
                />
              ) : (
                <span className={styles.detailValue}>{maskPhone(res.phone)}</span>
              )}
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>{language === 'ko' ? '기간' : 'Period'}</span>
              {isEditing ? (
                <div className={styles.editRow}>
                  <input 
                    type="date"
                    className={styles.editInput}
                    value={editData?.checkIn}
                    onChange={e => setEditData(prev => prev ? ({...prev, checkIn: e.target.value}) : null)}
                  />
                  <span>~</span>
                  <input 
                    type="date"
                    className={styles.editInput}
                    value={(() => {
                      try {
                        if (!editData) return '';
                        const d = new Date(editData.checkOut);
                        if (isNaN(d.getTime())) return '';
                        d.setDate(d.getDate() - 1);
                        return d.toISOString().split('T')[0];
                      } catch (e) {
                        return '';
                      }
                    })()}
                    onChange={e => {
                      const d = new Date(e.target.value);
                      d.setDate(d.getDate() + 1);
                      const coFormat = d.toISOString().split('T')[0];
                      setEditData(prev => prev ? ({...prev, checkOut: coFormat}) : null);
                    }}
                  />
                </div>
              ) : (
                <span className={styles.detailValue}>
                  {(() => {
                    try {
                      const s = new Date(res.checkIn);
                      const e = new Date(res.checkOut);
                      if (isNaN(s.getTime()) || isNaN(e.getTime())) return res.checkIn + " ~ " + res.checkOut;
                      e.setDate(e.getDate() - 1);
                      const endStr = e.toISOString().split('T')[0];
                      return res.checkIn === endStr ? res.checkIn : `${res.checkIn} ~ ${endStr}`;
                    } catch (err) {
                      return res.checkIn + " ~ " + res.checkOut;
                    }
                  })()}
                  <span className={styles.nightCount}>
                    ({nights}{language === 'ko' ? '박' : ' Nights'})
                  </span>
                </span>
              )}
            </div>
            {!isEditing && (
              <div className={styles.detailRow} style={{ borderLeft: '4px solid var(--primary)', paddingLeft: '0.75rem', backgroundColor: 'var(--muted)', padding: '0.5rem 0.75rem', borderRadius: '4px' }}>
                <span className={styles.detailLabel} style={{ color: 'var(--primary)' }}>{language === 'ko' ? '퇴실' : 'Check-out'}</span>
                <span className={styles.detailValue} style={{ fontSize: '1.2rem' }}>
                  {res.checkOut}
                </span>
              </div>
            )}
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>{language === 'ko' ? '인원' : 'Guests'}</span>
              {isEditing ? (
                <select 
                  className={styles.editInput}
                  value={editData?.guests}
                  onChange={e => setEditData(prev => prev ? ({...prev, guests: parseInt(e.target.value)}) : null)}
                >
                  <option value={1}>1명</option>
                  <option value={2}>2명</option>
                  <option value={3}>3명</option>
                  <option value={4}>4명</option>
                </select>
              ) : (
                <span className={styles.detailValue}>{res.guests}{language === 'ko' ? '명' : ' Guests'}</span>
              )}
            </div>
            {(res.message || isEditing) && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>{language === 'ko' ? '요청사항' : 'Request'}</span>
                {isEditing ? (
                  <textarea 
                    className={styles.editTextarea}
                    value={editData?.message || ''}
                    onChange={e => setEditData(prev => prev ? ({...prev, message: e.target.value}) : null)}
                  />
                ) : (
                  <p className={styles.detailText}>{res.message}</p>
                )}
              </div>
            )}
          </div>
          <footer className={styles.modalFooter}>
            {isEditing ? (
              <>
                <button className={styles.secondaryBtn} onClick={() => setIsEditing(false)}>
                  {language === 'ko' ? '취소' : 'Cancel'}
                </button>
                <button className={styles.saveBtn} onClick={handleSaveLocal}>
                  {language === 'ko' ? '저장' : 'Save'}
                </button>
              </>
            ) : (
              <>
                <button className={styles.secondaryBtn} onClick={closeModal}>
                  {language === 'ko' ? '닫기' : 'Close'}
                </button>
                <button className={styles.editBtn} onClick={handleEditStart} style={{ flex: 1, backgroundColor: 'var(--background)', color: 'var(--primary)', border: '1px solid var(--primary)', fontSize: '1rem', fontWeight: '700' }}>
                  {language === 'ko' ? '수정하기' : 'Edit'}
                </button>
                <button 
                  className={styles.deleteBtn} 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCancel(res.id);
                  }} 
                  style={{ flex: 1 }}
                >
                  {language === 'ko' ? '삭제' : 'Delete'}
                </button>
              </>
            )}
          </footer>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container} id="reserve">
      {!hideCalendar && (
        <>
          {!hideHeader && (
            <header className={styles.header}>
              <h2 className={styles.title}>{stayCal.title}</h2>
              <p className={styles.desc}>{t.common.contact.desc}</p>
            </header>
          )}

          <div className={styles.content}>
            <div className={styles.calendarSection}>
              <div className={styles.calHeader}>
                <button onClick={prevMonth} type="button" className="nav-btn-standard">
                  <span className="nav-btn-icon">←</span>
                  <span style={{ marginLeft: '4px' }}>{language === 'ko' ? '이전' : 'Prev'}</span>
                </button>
                <h3 className={styles.calTitle}>
                  {currentMonth.toLocaleString(
                    language === 'ko' ? 'ko' : 
                    language === 'en' ? 'en' : 
                    language === 'ja' ? 'ja' : 
                    language === 'zh-CN' ? 'zh-Hans' : 
                    language === 'zh-TW' ? 'zh-Hant' : language,
                    { year: 'numeric', month: 'long' }
                  )}
                </h3>
                <button onClick={nextMonth} type="button" className="nav-btn-standard">
                  <span style={{ marginRight: '4px' }}>{language === 'ko' ? '다음' : 'Next'}</span>
                  <span className="nav-btn-icon">→</span>
                </button>
              </div>
              
              <div className={styles.weekdays}>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                  <div key={d}>{t.calendar[d as keyof typeof t.calendar]}</div>
                ))}
              </div>
              
              <div className={styles.daysGrid}>
                {days.map((dStr, idx) => {
                  if (!dStr) return <div key={`empty-${idx}`} className={styles.emptyDay} />;
                  
                  const dateObj = new Date(dStr);
                  const dayOfWeek = dateObj.getDay(); 
                  const isKoreanHoliday = (date: string) => {
                    const holidays = [
                      "2026-01-01", "2026-02-16", "2026-02-17", "2026-02-18", "2026-03-01", "2026-03-02", "2026-05-05",
                      "2026-05-24", "2026-05-25", "2026-06-06", "2026-08-15", "2026-08-17", "2026-09-24", "2026-09-25",
                      "2026-09-26", "2026-09-28", "2026-10-03", "2026-10-05", "2026-10-09", "2026-12-25"
                    ];
                    return holidays.includes(date);
                  };

                  const bookedInfo = blockedDates.find(b => b.date === dStr);
                  const isBlocked = !!bookedInfo;
                  const isStartOfBooking = isBlocked && bookedInfo?.checkIn === dStr;
                  const isPast = dStr < todayStr;
                  const isToday = dStr === todayStr;
                  const isCheckIn = checkIn === dStr;
                  const isCheckOut = checkOut === dStr;
                  const isInRange = checkIn && checkOut && dStr > checkIn && dStr < checkOut;
                  const isHoliday = isKoreanHoliday(dStr);
                  
                  let classNames = `${styles.dayBtn}`;
                  if (isPast) classNames += ` ${styles.past}`;
                  if (isToday) classNames += ` ${styles.today}`;
                  if (isBlocked) classNames += ` ${styles.booked}`;
                  if (isStartOfBooking) classNames += ` ${styles.bookedStart}`;
                  if (isCheckIn || isCheckOut) classNames += ` ${styles.selected}`;
                  if (isInRange) classNames += ` ${styles.inRange}`;
                  
                  if (isHoliday || dayOfWeek === 0) classNames += ` ${styles.sunday}`;
                  else if (dayOfWeek === 6) classNames += ` ${styles.saturday}`;

                  const dayNum = parseInt(dStr.split('-')[2]);

                  return (
                    <div key={dStr} className={styles.dayWrapper}>
                      <button 
                        type="button" 
                        disabled={isPast}
                        className={classNames}
                        onClick={() => handleDateClick(dStr)}
                      >
                        {dayNum}
                      </button>
                      {isCheckIn && !checkOut && isHintVisible && (
                        <div className={styles.floatingHint}>
                          {t.calendar.hintSelectOut}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className={styles.legend}>
                <span className={styles.legItem}><span className={styles.box} /> {t.calendar.available}</span>
                <span className={styles.legItem}><span className={`${styles.box} ${styles.booked}`} /> {t.calendar.booked}</span>
                <span className={styles.legItem}><span className={`${styles.box} ${styles.selected}`} /> {t.calendar.selected}</span>
              </div>
              
              {!checkOut && checkIn && (
                <p className={styles.calHint}>{t.calendar.hintSelectOut}</p>
              )}
            </div>

            {isListOpen && renderListView()}
            {selectedResForDetail && renderDetailModal()}

            <div className={styles.reserveAction}>
              {(!checkIn || !checkOut) && (
                <div className={styles.baseInfoList}>
                  <h3>{stayCal.feeGuideTitle}</h3>
                  <ul>
                    {stayCal.feeGuideLines.map((line: string, i: number) => (
                      <li key={i}>
                        {i === 0 ? <strong>{line}</strong> : line}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {(showInlineGrid || forceListView) && (
        <section className={styles.inlineListSection}>
          <div className={styles.inlineLegend}>
            <div className={styles.inlineLegendItem}>
              <span className={`${styles.inlineLegendBox} ${styles.booked}`} />
              <span>{t.home.stay.legendReserved}</span>
            </div>
            <div className={styles.inlineLegendItem}>
              <span className={`${styles.inlineLegendBox} ${styles.available}`} />
              <span>{t.home.stay.legendAvailable}</span>
            </div>
          </div>
          
          <div className={styles.inlineMonthGrid}>
            {(() => {
              const monthsToShow = [];
              const now = new Date();
              for (let m = now.getMonth(); m <= 11; m++) {
                monthsToShow.push(new Date(now.getFullYear(), m, 1));
              }

              const maskName = (name: string) => {
                if (!name) return "***";
                if (name.length <= 2) return name.substring(0, 1) + "*";
                return name.substring(0, 1) + "*" + name.substring(2);
              };

              return monthsToShow.map((mDate) => {
                const year = mDate.getFullYear();
                const month = mDate.getMonth();
                const daysInMonth = new Date(year, month + 1, 0).getDate();
                const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0: Sun, 1: Mon, ...
                
                const monthLabel = mDate.toLocaleString(
                  language === 'ko' ? 'ko' : language,
                  { year: 'numeric', month: 'long' }
                );

                // Generate days grid
                const days = [];
                // Padding for first day
                for (let i = 0; i < firstDayOfMonth; i++) {
                  days.push({ type: 'empty' });
                }
                // Actual days
                for (let d = 1; d <= daysInMonth; d++) {
                  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                  const res = reservations.find(r => dateStr >= r.checkIn && dateStr < r.checkOut);
                  
                  if (res) {
                    const isStart = dateStr === res.checkIn;
                    // For checkOut, the booked date is < r.checkOut, so the last day booked is day before checkout usually.
                    // But our data logic uses checkIn inclusive, checkOut exclusive for the grid.
                    days.push({ 
                      type: 'booked', 
                      day: d, 
                      fullRes: res,
                      isStart,
                      name: maskName(res.name)
                    });
                  } else {
                    days.push({ type: 'available', day: d });
                  }
                }

                return (
                  <div key={monthLabel} className={styles.inlineMonthCard}>
                    <h4 className={styles.inlineMonthTitle}>{monthLabel}</h4>
                    <div className={styles.miniWeekdays}>
                      {['S','M','T','W','T','F','S'].map((wd, i) => (
                        <span key={i}>{wd}</span>
                      ))}
                    </div>
                    <div className={styles.miniCalendarGrid}>
                      {days.map((item, idx) => {
                        if (item.type === 'empty') return <div key={idx} className={`${styles.miniDay} ${styles.miniDayEmpty}`} />;
                        
                        const isBooked = item.type === 'booked';
                        return (
                          <div 
                            key={idx} 
                            className={`
                              ${styles.miniDay} 
                              ${isBooked ? styles.miniDayBooked : styles.miniDayAvailable}
                              ${isBooked && item.isStart ? styles.miniDayStart : ''}
                            `}
                            onClick={() => {
                              if (isBooked && item.fullRes) {
                                setSelectedResForDetail(item.fullRes || null);
                              }
                            }}
                            title={(isBooked && item.fullRes) ? `${item.name} (${item.fullRes.checkIn} ~ ${item.fullRes.checkOut})` : `${item.day}일 예약가능`}
                          >
                            {item.day}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </section>
      )}
      {isListOpen && renderListView()}
      {selectedResForDetail && renderDetailModal()}
    </div>
  );
}

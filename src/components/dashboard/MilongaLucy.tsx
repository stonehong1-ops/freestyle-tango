'use client';

import React, { useState, useEffect } from 'react';
import styles from './MilongaLucy.module.css';
import { addMilongaReservation, getMilongaReservations, MilongaReservation, MilongaInfo, getMilongaInfo } from '@/lib/db';
import FullscreenModal from '@/components/common/FullscreenModal';

export default function MilongaLucy({ 
  selectedDate, 
  onHome,
  isAdmin,
  onEdit
}: { 
  selectedDate: string;
  onHome?: () => void;
  isAdmin?: boolean;
  onEdit?: () => void;
}) {
  const [reservations, setReservations] = useState<MilongaReservation[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [nickname, setNickname] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedOption, setSelectedOption] = useState<'테이블 예약' | '2+1 이벤트' | '3+1 이벤트'>('테이블 예약');
  const [requests, setRequests] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [milongaInfo, setMilongaInfo] = useState<MilongaInfo | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [myPhone, setMyPhone] = useState('');

  useEffect(() => {
    const savedPhone = localStorage.getItem('ft_milonga_phone');
    if (savedPhone) setMyPhone(savedPhone);
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchReservations();
    } else {
      setReservations([]);
    }
    fetchMilongaInfo();

    const handleUpdate = () => fetchMilongaInfo();
    window.addEventListener('ft_milonga_updated', handleUpdate);
    
    const handlePopState = () => {
      if (showForm) {
        setShowForm(false);
      }
    };
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('ft_milonga_updated', handleUpdate);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [selectedDate, showForm]);

  const fetchMilongaInfo = async () => {
    const info = await getMilongaInfo();
    setMilongaInfo(info);
  };

  const fetchReservations = async () => {
    const data = await getMilongaReservations(selectedDate);
    setReservations(data);
  };

  const formatDateLabel = (dateStr: string) => {
    if (!dateStr) return '일정 준비중';
    const [y, m, d] = dateStr.split('-');
    const date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    return `${parseInt(m)}/${parseInt(d)} ${dayNames[date.getDay()]}요일`;
  };

  const handleBooking = async () => {
    if (!nickname) {
      alert('닉네임을 입력해주세요.');
      return;
    }
    if (!phone || phone.length < 10) {
      alert('올바른 핸드폰 번호를 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      const reservationData = {
        milongaDate: selectedDate,
        nickname,
        phone: cleanPhone,
        option: selectedOption,
        requests,
        timestamp: new Date().toISOString()
      };

      if (editingId) {
        await import('@/lib/db').then(m => m.updateMilongaReservation(editingId, reservationData));
        alert('예약이 수정되었습니다!');
      } else {
        await addMilongaReservation(reservationData);
        alert('예약이 완료되었습니다!');
      }

      localStorage.setItem('ft_milonga_phone', cleanPhone);
      setMyPhone(cleanPhone);
      setShowForm(false);
      resetForm();
      fetchReservations();
    } catch (e) {
      alert('처리 실패: ' + e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setNickname('');
    const savedPhone = localStorage.getItem('ft_milonga_phone') || '';
    setPhone(savedPhone);
    setRequests('');
    setSelectedOption('테이블 예약');
    setEditingId(null);
  };

  const handleEdit = (res: MilongaReservation) => {
    setNickname(res.nickname);
    setPhone(res.phone);
    setSelectedOption(res.option);
    setRequests(res.requests || '');
    setEditingId(res.id);
    setShowForm(true);
    window.history.pushState({ modal: 'milongaForm' }, '', '');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      await import('@/lib/db').then(m => m.deleteMilongaReservation(id));
      alert('삭제되었습니다.');
      fetchReservations();
    } catch (e) {
      alert('삭제 실패: ' + e);
    }
  };

  const maskNickname = (name: string) => {
    if (name.length <= 1) return '*';
    if (name.length === 2) return name[0] + '*';
    return name[0] + '*'.repeat(name.length - 2) + name[name.length - 1];
  };

  if (!selectedDate && !isAdmin) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyMsg}>
          현재 등록된 밀롱가 일정이 없습니다.<br/>잠시 후 다시 확인해주세요.
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Hero Visual Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroImageWrapper}>
          {milongaInfo?.posterUrl && (
            <img src={milongaInfo.posterUrl} alt="Milonga Lucy" className={styles.heroImage} />
          )}
          
          {isAdmin && onEdit && (
            <div className={styles.editOverlay}>
              <button className={styles.editBtn} onClick={onEdit}>
                수정
              </button>
            </div>
          )}
        </div>
        
        {milongaInfo?.message && (
          <div className={styles.messageArea}>
            <p className={styles.milongaMessage}>
              &quot;{milongaInfo.message}&quot;
            </p>
          </div>
        )}
      </section>

      {/* Main Action Section - Prominent Booking Button */}
      {selectedDate && (
        <section className={styles.actionSection}>
          <button className={styles.bookingBtn} onClick={() => { resetForm(); setShowForm(true); window.history.pushState({ modal: 'milongaForm' }, '', ''); }}>
            🎟️ 밀롱가 테이블 예약하기
          </button>
        </section>
      )}

      {/* Event Section */}
      <section className={styles.eventSection}>
        <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>이벤트 안내</h2>
            <p className={styles.sectionSubtitle}>루씨에서 즐거운 추억을 만드세요</p>
        </div>

        <div className={styles.eventGrid}>
          <div className={styles.eventCard}>
            <div className={styles.eventBadge}>기본</div>
            <h3 className={styles.eventCardTitle}>테이블 예약</h3>
            <p className={styles.eventCardDesc}>2인 이상 테이블 신청 가능합니다.</p>
          </div>
          <div className={styles.eventCard}>
            <div className={styles.eventBadge}>이벤트</div>
            <h3 className={styles.eventCardTitle}>2+1 Event</h3>
            <p className={styles.eventCardDesc}>세 분이 오시면 한 분은 무료입니다.</p>
          </div>
          <div className={styles.eventCard}>
            <div className={styles.eventBadge}>VIP</div>
            <h3 className={styles.eventCardTitle}>3+1 Event</h3>
            <p className={styles.eventCardDesc}>네 분이 오시면 한 분은 무료입니다.</p>
          </div>
        </div>
      </section>

      {/* Reservation List Section */}
      {selectedDate && (
        <section className={styles.listSection}>
          <div className={styles.sectionHeaderBetween}>
            <h2 className={styles.sectionTitle}>예약 현황</h2>
            <div className={styles.selectedDateBadge}>
              {formatDateLabel(selectedDate)}
            </div>
          </div>
          
          <div className={styles.resList}>
            {reservations.length === 0 ? (
              <div className={styles.emptyMsg}>아직 예약이 없습니다.</div>
            ) : (
              reservations.map((res, i) => {
                const isMyRes = res.phone === myPhone || isAdmin || myPhone === '01072092468';
                return (
                  <div key={res.id} className={styles.resWrapper}>
                    <div className={res.option === '3+1 이벤트' ? styles.resItemVip : styles.resItem}>
                      <span className={styles.resIdx}>{i + 1}</span>
                      <span className={styles.resName}>{maskNickname(res.nickname)}</span>
                      <span className={styles.resOption}>{res.option}</span>
                      {isMyRes && (
                        <div className={styles.resActions}>
                          <button className={styles.resActionBtn} onClick={() => handleEdit(res)}>수정</button>
                          <button className={`${styles.resActionBtn} ${styles.deleteBtn}`} onClick={() => handleDelete(res.id)}>삭제</button>
                        </div>
                      )}
                    </div>
                    {res.requests && <div className={styles.resReq}>💬 {res.requests}</div>}
                  </div>
                );
              })
            )}
          </div>
        </section>
      )}

      {/* Booking Form Modal */}
      <FullscreenModal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editingId ? "예약 수정하기" : "테이블 및 이벤트 예약"}
        isBottomSheet={true}
      >
        <div className={styles.formContent}>
          <div className={styles.formField}>
            <label>예약 일자</label>
            <input 
              type="text" 
              value={formatDateLabel(selectedDate)} 
              disabled 
              style={{ background: '#f2f4f6', color: '#8b95a1' }}
              className={styles.input}
            />
          </div>

          <div className={styles.formField}>
            <label>예약 옵션 선택</label>
            <div className={styles.optionGroup}>
              {(['테이블 예약', '2+1 이벤트', '3+1 이벤트'] as const).map(opt => (
                <button
                  key={opt}
                  className={`${styles.optionBtn} ${selectedOption === opt ? styles.activeOption : ''}`}
                  onClick={() => setSelectedOption(opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.formField}>
            <label>닉네임</label>
            <input 
              type="text" 
              placeholder="닉네임을 입력하세요" 
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className={styles.input}
            />
          </div>

          <div className={styles.formField}>
            <label>핸드폰 번호 (예약 확인용)</label>
            <input 
              type="tel" 
              placeholder="010-0000-0000" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={styles.input}
            />
          </div>

          <div className={styles.formField}>
            <label>기타 요청사항 (선택)</label>
            <textarea 
              placeholder="요청사항을 입력하세요 (예: 와인 요청)" 
              value={requests}
              onChange={(e) => setRequests(e.target.value)}
              className={styles.textarea}
              rows={3}
            />
          </div>

          <button 
            className={styles.submitBtn} 
            onClick={handleBooking}
            disabled={isSubmitting}
          >
            {isSubmitting ? '처리 중...' : editingId ? '수정 완료하기' : '예약 완료하기'}
          </button>
        </div>
      </FullscreenModal>
    </div>
  );
}

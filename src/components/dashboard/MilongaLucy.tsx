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
  const [selectedOption, setSelectedOption] = useState<'테이블 예약' | '2+1 이벤트' | '3+1 이벤트'>('테이블 예약');
  const [requests, setRequests] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [milongaInfo, setMilongaInfo] = useState<MilongaInfo | null>(null);

  useEffect(() => {
    if (selectedDate) {
      fetchReservations();
    } else {
      setReservations([]);
    }
    fetchMilongaInfo();

    const handleUpdate = () => fetchMilongaInfo();
    window.addEventListener('ft_milonga_updated', handleUpdate);
    return () => window.removeEventListener('ft_milonga_updated', handleUpdate);
  }, [selectedDate]);

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
    setIsSubmitting(true);
    try {
      await addMilongaReservation({
        milongaDate: selectedDate,
        nickname,
        option: selectedOption,
        requests,
        timestamp: new Date().toISOString()
      });
      alert('예약이 완료되었습니다!');
      setShowForm(false);
      setNickname('');
      setRequests('');
      fetchReservations();
    } catch (e) {
      alert('예약 실패: ' + e);
    } finally {
      setIsSubmitting(false);
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
          <img src={milongaInfo?.posterUrl || "/images/logo.png"} alt="Milonga Lucy" className={styles.heroImage} />
          
          {isAdmin && onEdit && (
            <div className={styles.editOverlay}>
              <button className={styles.editBtn} onClick={onEdit}>
                ✍️ 포스터/텍스트 수정
              </button>
            </div>
          )}
        </div>
        
        {milongaInfo?.message && (
          <div className={styles.messageArea}>
            <p className={styles.milongaMessage}>
              {milongaInfo.message}
            </p>
          </div>
        )}
      </section>

      {/* Main Action Section - Prominent Booking Button */}
      {selectedDate && (
        <section className={styles.actionSection}>
          <button className={styles.bookingBtn} onClick={() => setShowForm(true)}>
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
              reservations.map((res, i) => (
                <div key={res.id} className={styles.resWrapper}>
                   <div className={res.option === '3+1 이벤트' ? styles.resItemVip : styles.resItem}>
                    <span className={styles.resIdx}>{i + 1}</span>
                    <span className={styles.resName}>{maskNickname(res.nickname)}</span>
                    <span className={styles.resOption}>{res.option}</span>
                  </div>
                  {res.requests && <div className={styles.resReq}>💬 {res.requests}</div>}
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {/* Booking Form Modal */}
      <FullscreenModal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title="테이블 및 이벤트 예약"
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
            {isSubmitting ? '처리 중...' : '예약 완료하기'}
          </button>
        </div>
      </FullscreenModal>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { 
  Coupon, 
  createCoupon, 
  getActiveCoupons, 
  deleteCoupon,
  UserCoupon,
  getAllCouponIssuances,
  syncCouponCount
} from '@/lib/coupon';
import styles from './CouponEditor.module.css';

interface CouponEditorProps {
  onClose: () => void;
}

const CouponEditor: React.FC<CouponEditorProps> = ({ onClose }) => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [issuances, setIssuances] = useState<Record<string, UserCoupon[]>>({});
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    type: 'FREE' as 'FREE' | 'DISCOUNT',
    discountValue: 0,
    duration: 0,
    totalQuantity: 0
  });

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const data = await getActiveCoupons();
      setCoupons(data);
      
      // Fetch all issuances for active coupons
      const activeIds = data.map(c => c.id).filter(Boolean) as string[];
      if (activeIds.length > 0) {
        const allIssuances = await getAllCouponIssuances(activeIds);
        const grouped: Record<string, UserCoupon[]> = {};
        allIssuances.forEach(iss => {
          if (!grouped[iss.couponId]) grouped[iss.couponId] = [];
          grouped[iss.couponId].push(iss);
        });
        setIssuances(grouped);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.location || formData.totalQuantity <= 0) {
      alert('모든 필드를 정확히 입력해주세요.');
      return;
    }

    try {
      await createCoupon(formData);
      alert('쿠폰이 발행되었습니다.');
      setIsModalOpen(false); 
      setFormData({
        title: '',
        location: '',
        type: 'FREE',
        discountValue: 0,
        duration: 0,
        totalQuantity: 0
      });
      fetchCoupons();
    } catch (err) {
      alert('발행 실패');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('이 쿠폰을 삭제(비활성화)하시겠습니까?')) return;
    try {
      await deleteCoupon(id);
      fetchCoupons();
    } catch (err) {
      alert('삭제 실패');
    }
  };

  const formatTime = (ts: any) => {
    if (!ts) return '';
    const date = ts.toDate();
    return date.toLocaleString('ko-KR', { 
      month: '2-digit', 
      day: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    });
  };

  return (
    <div className={styles.editorContainer}>
      <div className={styles.editorHeader}>
        <h3>쿠폰 발행 관리</h3>
        <button className={styles.addBtn} onClick={() => setIsModalOpen(true)}>
          신규 쿠폰 발행
        </button>
      </div>

      {/* Main List View */}
      <div className={styles.list}>
        {loading ? (
          <p>로딩 중...</p>
        ) : coupons.length === 0 ? (
          <p className={styles.empty}>발행된 쿠폰이 없습니다.</p>
        ) : (
          coupons.map(coupon => (
            <div key={coupon.id} className={styles.couponItem}>
              <div className={styles.couponInfo}>
                <div className={styles.couponTitle}>{coupon.title}</div>
                <div className={styles.couponMeta}>
                  <span>{coupon.location}</span>
                  <span>•</span>
                  <span>{coupon.type === 'FREE' ? '무료' : `${coupon.discountValue} 할인`}</span>
                  <span>•</span>
                  <span>{coupon.duration === 0 ? '상시' : `${coupon.duration}개월`}</span>
                </div>
                <div className={styles.couponStats}>
                  발급 현황: <strong>{issuances[coupon.id!]?.length || 0}</strong> / {coupon.totalQuantity}
                  {(issuances[coupon.id!]?.length || 0) >= coupon.totalQuantity && <span className={styles.soldOutTag}>완료</span>}
                  
                  {coupon.issuedCount !== (issuances[coupon.id!]?.length || 0) && (
                    <button 
                      className={styles.syncButton}
                      onClick={async () => {
                        if (confirm('실제 명단 수와 발급 숫자를 동기화하시겠습니까?')) {
                          await syncCouponCount(coupon.id!);
                          // Reload
                          window.location.reload();
                        }
                      }}
                      title="DB 발급 숫자 보정"
                    >
                      🔄 숫자 보정
                    </button>
                  )}
                </div>

                {/* Receiver List */}
                <div className={styles.recipientsList}>
                  {issuances[coupon.id!]?.map((iss, idx) => (
                    <div key={iss.id || idx} className={styles.recipientRow}>
                      <span className={styles.recipientName}>
                        {iss.userName ? iss.userName : (iss.userId || '알 수 없음')}
                      </span>
                      <span className={styles.issuedTime}>{formatTime(iss.issuedAt)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <button className={styles.deleteBtn} onClick={() => handleDelete(coupon.id!)}>X</button>
            </div>
          ))
        )}
      </div>

      {/* Modal Popup (Image 3 Scenario) */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>쿠폰 발행 관리</h3>
              <button className={styles.listBtn} onClick={() => setIsModalOpen(false)}>목록 보기</button>
            </div>
            
            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label>쿠폰 제목</label>
                <input 
                  type="text" 
                  placeholder="예: 밀롱가 무료 입장권" 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                />
              </div>
              <div className={styles.formGroup}>
                <label>장소 / 행사</label>
                <input 
                  type="text" 
                  placeholder="예: 강남 루씨" 
                  value={formData.location}
                  onChange={e => setFormData({...formData, location: e.target.value})}
                />
              </div>
              <div className={styles.formGroup}>
                <label>구분</label>
                <select 
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value as any})}
                >
                  <option value="FREE">무료 (FREE)</option>
                  <option value="DISCOUNT">할인 (D.C)</option>
                </select>
              </div>
              {formData.type === 'DISCOUNT' && (
                <div className={styles.formGroup}>
                  <label>할인 금액 / 비율</label>
                  <input 
                    type="number" 
                    placeholder="숫자만 입력" 
                    value={formData.discountValue}
                    onChange={e => setFormData({...formData, discountValue: parseInt(e.target.value)})}
                  />
                </div>
              )}
              <div className={styles.formGroup}>
                <label>사용 가능 기간 (개월 수)</label>
                <input 
                  type="number" 
                  min="0" 
                  max="12"
                  placeholder="0 = 상시, 1~12 = 개월 수" 
                  value={formData.duration}
                  onChange={e => setFormData({...formData, duration: parseInt(e.target.value) || 0})}
                />
                <small className={styles.formHelp}>0을 입력하면 상시 유효, 1 이상은 발급 후 해당 개월 수만큼 유효합니다.</small>
              </div>
              <div className={styles.formGroup}>
                <label>발행 수량 (선착순)</label>
                <input 
                  type="number" 
                  placeholder="예: 50" 
                  value={formData.totalQuantity}
                  onChange={e => setFormData({...formData, totalQuantity: parseInt(e.target.value)})}
                />
              </div>
              <div className={styles.actions}>
                <button type="submit" className={styles.submitBtn}>발행하기</button>
                <button type="button" className={styles.cancelBtn} onClick={() => setIsModalOpen(false)}>취소</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponEditor;

import { useState } from 'react';
import styles from './MembershipGuide.module.css';
import LocationSection from '../common/LocationSection';

export default function MembershipGuide() {
  const [showToast, setShowToast] = useState(false);

  const handleCopy = () => {
    const accountNumber = "3333143159646";
    navigator.clipboard.writeText(accountNumber).then(() => {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    });
  };
  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <h1 className={styles.title}>
          <span style={{ color: '#3182f6' }}>FREESTYLE</span><br/>
          TANGO
        </h1>
        <div className={styles.highlightBadge}>
          ✨ 18만원으로 모든 수업을 들을 수 있어요!
        </div>
      </section>

      {/* Benefits Section */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>💎 멤버십 혜택</h2>
        <ul className={styles.list}>
          <li className={styles.listItem}>
             <span className={styles.bullet}>•</span>
            <div>
              <strong style={{ color: '#191f28' }}>월 멤버십 : 18만</strong><br/>
              모든 수업 수강 가능 / 해외 워크샵 D.C<br/>
              <span style={{ color: '#ef4444', fontSize: '0.9rem', fontWeight: 600, display: 'block', marginTop: '0.25rem' }}>🔥 처음 오시는 분 6개월 멤버십 20% D.C (86만원)</span>
            </div>
          </li>
          <li className={styles.listItem}>
             <span className={styles.bullet}>•</span>
            <div>
              <strong style={{ color: '#191f28' }}>멤버십 전체 오픈플로어 사용</strong> (월 16시간)
            </div>
          </li>
          <li className={styles.listItem}>
             <span className={styles.bullet}>•</span>
            <div>
              <strong style={{ color: '#191f28' }}>파트너 신청 권한</strong><br/>
              파트너수업 외 2개 클래스 파트너 신청 가능 (공연/대회 파트너 또는 6개월 이상 파트너쉽만 대상)
            </div>
          </li>
          <li className={styles.listItem}>
             <span className={styles.bullet}>•</span>
            <div>
              <strong style={{ color: '#191f28' }}>특별 할인 & 무료 레슨</strong><br/>
              강사/스탭/루씨스탭 월 10만원 D.C<br/>
              처음오신분 및 소개하신분 개인레슨 1회 무료
            </div>
          </li>
        </ul>
      </section>

      {/* Culture Section */}
      <section className={styles.section}>
        <h2 className={`${styles.sectionTitle} ${styles.cultureTitle}`}>🌱 이런 문화 꼭 만들거에요!</h2>
        <ul className={styles.list}>
          <li className={styles.listItem}>
            <span className={styles.bullet}>✓</span>
            <div>
              <strong style={{ color: '#191f28' }}>모두에게 나이스하게, 블랙없는 커뮤니티</strong><br/>
              <span style={{ color: '#3182f6', fontWeight: 500 }}>(Happy space, Warm people)</span>
            </div>
          </li>
          <li className={styles.listItem}>
            <span className={styles.bullet}>✓</span>
            <div>
              <strong style={{ color: '#191f28' }}>15인 기준 남/녀 인원 맞추기</strong><br/>
              한 팀씩 추가하여 균형있는 수업 분위기 조성
            </div>
          </li>
        </ul>
      </section>

      {/* Location Map Section */}
      <section className={styles.section}>
        <LocationSection />
      </section>

      {/* Bank Account Section */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>💰 계좌 안내</h2>
        <div className={styles.bankAccountBox}>
          <span className={styles.bankName}>카카오뱅크 (홍병석)</span>
          <span className={styles.accountNumber}>3333-14-3159646</span>
          <button className={styles.copyBtn} onClick={handleCopy}>
            복사하기
          </button>
        </div>
        <p style={{ fontSize: '0.85rem', color: '#8b95a1', textAlign: 'center', margin: 0 }}>
          복사 후 은행 앱에서 붙여넣어 주세요.
        </p>
      </section>

      {/* Host / Contact Section */}
      <section className={styles.hostSection}>
        <div className={styles.hostHeader}>
          <div className={styles.hostPhoto}>
             <img src="/images/stone.jpg" alt="Stone" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div className={styles.hostInfo}>
            <h3>Stone | 홍병석</h3>
            <p>Tango Instructor (010.7209.2468)</p>
          </div>
        </div>

        <div className={styles.contactGrid}>
          <a href="tel:010-7209-2468" className={styles.contactBtn}>📞 전화</a>
          <a href="https://open.kakao.com/me/StoneHong" target="_blank" rel="noopener noreferrer" className={styles.contactBtn} style={{ background: '#FEE500', color: '#000', border: 'none' }}>💬 카톡</a>
          <a href="https://wa.me/821072092468" target="_blank" rel="noopener noreferrer" className={styles.contactBtn} style={{ background: '#25D366', color: '#fff', border: 'none' }}>🟩 WhatsApp</a>
        </div>

        {/* Open Chat Banner */}
        <div className={styles.openChatBanner}>
          <a href="https://open.kakao.com/o/glYslQvc" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
            <div className={styles.openChatBox}>
              <img src="/images/kakaotalk_openchat.png" alt="KakaoTalk" style={{ width: '40px', height: '40px', borderRadius: '10px' }} />
              <span className={styles.openChatText}>
                신청하신 분은 &apos;오픈톡방&apos;에 반드시 들어오셔야 수업 안내를 받으실 수 있어요! (클릭)
              </span>
            </div>
          </a>
        </div>
        <div className={styles.footerText}>
          <p className={styles.copyright}>© {new Date().getFullYear()} FreestyleTango. All rights reserved.</p>
        </div>
      </section>

      {showToast && (
        <div className={styles.copyToast}>
          계좌번호가 복사되었습니다
        </div>
      )}
    </div>
  );
}

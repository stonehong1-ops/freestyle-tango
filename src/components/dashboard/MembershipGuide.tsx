import React from 'react';
import styles from './MembershipGuide.module.css';

export default function MembershipGuide() {
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

      {/* Open Chat Banner */}
      <div style={{ padding: '0 1.5rem', marginBottom: '1.5rem' }}>
        <a href="https://open.kakao.com/o/glYslQvc" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
          <div style={{ padding: '1rem', background: '#fff0f2', border: '1px solid #ffe4e6', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', cursor: 'pointer' }}>
            <span style={{ color: '#e11d48', fontWeight: 800, fontSize: '0.85rem', lineHeight: 1.5 }}>
              신청하신 분은 '오픈톡방'에 반드시 들어오셔야<br/>수업 안내를 받으실 수 있어요! (클릭)
            </span>
          </div>
        </a>
      </div>

      {/* Benefits Card */}
      <section className={styles.card}>
        <h2 className={styles.cardTitle}>💎 멤버십 혜택</h2>
        <ul className={styles.list}>
          <li className={styles.listItem}>
             <span className={styles.bullet}>•</span>
            <div>
              <strong style={{ color: '#191f28', fontSize: '1rem' }}>월 멤버십 : 18만</strong><br/>
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
              파트너수업 외 2개 클래스 파트너 신청 가능 (기존 파트너만 대상)
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

      {/* Culture Card */}
      <section className={`${styles.card} ${styles.cultureCard}`}>
        <h2 className={`${styles.cardTitle} ${styles.cultureTitle}`}>🌱 이런 문화 꼭 만들거에요!</h2>
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

      {/* Contact & Info */}
      <section className={`${styles.card} ${styles.contactCard}`}>
        <h2 className={`${styles.cardTitle} ${styles.contactTitle}`}>📍 프리스타일 탱고</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
          <div className={styles.contactItem}>
            <span className={styles.contactLabel}>오시는 길</span>
            <span className={styles.contactValue} style={{ textAlign: 'right' }}>마포구 합정동 386-37<br/>어반오아시스빌딩 B2</span>
          </div>
          <div className={styles.contactItem}>
            <span className={styles.contactLabel}>문의</span>
            <span className={styles.contactValue}>스톤 010.7209.2468</span>
          </div>
          <div className={styles.contactItem}>
            <span className={styles.contactLabel}>계좌안내</span>
            <span className={`${styles.contactValue} ${styles.bankValue}`}>카카오뱅크 3333-14-3159646 홍병석</span>
          </div>
        </div>
      </section>

      {/* Host / Contact Section like TangoStay */}
      <section className={styles.card} style={{ marginTop: '2rem', border: 'none', background: '#f8f9fa', padding: '2rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', overflow: 'hidden', background: '#eee' }}>
             <img src="/images/stonehong.jpg" alt="Stone" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#191f28' }}>Stone | 홍병석</h3>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.9rem', color: '#4e5968' }}>Tango Instructor & Developer</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
          <a href="tel:010-7209-2468" className={styles.contactBtn}>📞 전화</a>
          <a href="https://open.kakao.com/o/sNq0Irmi" target="_blank" rel="noopener noreferrer" className={styles.contactBtn} style={{ background: '#FEE500', color: '#000', border: 'none' }}>💬 카카오톡</a>
          <a href="https://wa.me/821072092468" target="_blank" rel="noopener noreferrer" className={styles.contactBtn} style={{ background: '#25D366', color: '#fff', border: 'none' }}>🟩 와츠앱</a>
        </div>
        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <p style={{ fontSize: '0.75rem', color: '#adb5bd' }}>© {new Date().getFullYear()} FreestyleTango. All rights reserved.</p>
        </div>
      </section>
    </div>
  );
}

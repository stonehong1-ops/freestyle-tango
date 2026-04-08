import { useState } from 'react';
import styles from './MembershipGuide.module.css';
import LocationSection from '../common/LocationSection';
import CompactHostProfile from '../common/CompactHostProfile';
import { useLanguage } from '@/contexts/LanguageContext';

export default function MembershipGuide() {
  const { t } = useLanguage();
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
        <div className={styles.membershipIntro}>
          {t.home.info.intro.split('\n').map((line: string, i: number) => (
            <p key={i} style={{ margin: '0 0 0.5rem 0', color: '#4e5968', fontSize: '1.05rem', lineHeight: '1.6', textAlign: 'center' }}>
              {line || <br />}
            </p>
          ))}
        </div>
        <div className={styles.membershipHighlight} style={{ 
          backgroundColor: '#ffd400', 
          color: '#191f28', 
          padding: '1rem', 
          borderRadius: '12px', 
          fontWeight: 800, 
          fontSize: '1.1rem',
          textAlign: 'center',
          margin: '1.5rem 0'
        }}>
          {t.home.info.highlight}
        </div>
      </section>

      {/* Benefits Section */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t.home.info.benefitsTitle}</h2>
        <ul className={styles.list}>
          {t.home.info.benefits.map((benefit: string, i: number) => (
            <li key={i} className={styles.listItem}>
              <span className={styles.bullet}>•</span>
              <div style={{ color: '#333d4b', fontSize: '1rem', fontWeight: 600 }}>{benefit}</div>
            </li>
          ))}
        </ul>
      </section>

      {/* Culture Section */}
      <section className={styles.section}>
        <h2 className={`${styles.sectionTitle} ${styles.cultureTitle}`}>{t.home.info.cultureTitle}</h2>
        <ul className={styles.list}>
          {t.home.info.cultureList.map((item: string, i: number) => (
            <li key={i} className={styles.listItem}>
              <span className={styles.bullet}>✓</span>
              <div style={{ color: '#333d4b', fontSize: '1rem', fontWeight: 600 }}>{item}</div>
            </li>
          ))}
        </ul>
      </section>

      {/* Location Map Section */}
      <section className={styles.section}>
        <LocationSection />
      </section>

      {/* Bank Account Section */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t.home.info.bankTitle}</h2>
        <div className={styles.bankAccountBox}>
          <span className={styles.bankName}>{t.home.info.bankName}</span>
          <span className={styles.accountNumber}>3333-14-3159646</span>
          <button className={styles.copyBtn} onClick={handleCopy}>
            {t.home.info.copyBtn}
          </button>
        </div>
        <p style={{ fontSize: '0.85rem', color: '#8b95a1', textAlign: 'center', margin: 0 }}>
          {t.home.info.copyHint}
        </p>
      </section>

      {/* Host / Contact Section */}
      <section className={styles.hostSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{t.home.info.contactTitle}</h2>
        </div>
        
        <CompactHostProfile showBio={true} className={styles.hostProfileCard} />

        {/* Open Chat Banner */}
        <div className={styles.openChatBanner}>
          <a href="https://open.kakao.com/o/glYslQvc" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
            <div className={styles.openChatBox}>
              <img src="/images/kakaotalk_openchat.png" alt="KakaoTalk" style={{ width: '40px', height: '40px', borderRadius: '10px' }} />
              <span className={styles.openChatText}>
                {t.home.info.openChatBanner}
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
          {t.home.info.copySuccess}
        </div>
      )}
    </div>
  );
}

const spanStyles = styles.bullet || '';


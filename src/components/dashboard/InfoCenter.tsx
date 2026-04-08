'use client';

import React, { useState } from 'react';
import styles from './InfoCenter.module.css';
import LocationSection from '../common/LocationSection';
import CompactHostProfile from '../common/CompactHostProfile';
import { useLanguage } from '@/contexts/LanguageContext';

export default function InfoCenter() {
  const { language, t } = useLanguage();
  const [activeSubTab, setActiveSubTab] = useState<'location'|'membership'|'story'>('location');
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
       <div className={styles.subTabs}>
        <button 
          className={`${styles.subTabBtn} ${activeSubTab === 'location' ? styles.active : ''}`}
          onClick={() => setActiveSubTab('location')}
        >
          {t.info.tabs.location}
        </button>
        <button 
          className={`${styles.subTabBtn} ${activeSubTab === 'membership' ? styles.active : ''}`}
          onClick={() => setActiveSubTab('membership')}
        >
          {language === 'ko' ? '멤버쉽' : (t.info?.tabs?.membership || 'Membership')}
        </button>
        <button 
          className={`${styles.subTabBtn} ${activeSubTab === 'story' ? styles.active : ''}`}
          onClick={() => setActiveSubTab('story')}
        >
          {t.info?.tabs?.story || 'Story'}
        </button>
      </div>

      <div className={styles.content}>
        {activeSubTab === 'location' && (
          <section className={`${styles.section} ${styles.placeGuideSection}`}>
            {/* 1. 포토갤러리 (Title removed, Horizontal Slider) */}
            <div className={styles.galleryGroup}>
              <div className={styles.horizontalSlider}>
                {['1.png', '11.jfif', '2.jpg', '3.jpg', '4.webp', '5.webp', '6.jpg', '7.jpg', '8.jpg', '9.jpg', '91.jpg', '92.jfif', '93.webp', '94.jpg'].map((img) => (
                  <div key={img} className={styles.sliderCard}>
                    <img src={`/images/photo/${img}`} alt="" loading="lazy" />
                  </div>
                ))}
              </div>
            </div>

            {/* 2. 길 (Location Map) */}
            <div className={styles.mapGroup}>
              <h3 className={styles.galleryTitle}>{t.info.tabs.location}</h3>
              <LocationSection />
            </div>

            {/* 4. 시설안내 */}
            <div className={styles.galleryGroup}>
              <h3 className={styles.galleryTitle}>{t.home.info.facilityGallery}</h3>
              <div className={styles.imageGrid}>
                {['1.png', '2.jpg', '3 (2).jpg', '3.jpg', '4.jpg', '41.jpg', '5.jpg', '7.jpg', '71.jpg', '8.jpg', '91.jpg', '92.jpg', '93.jpg'].map((img) => (
                  <div key={img} className={styles.imageCard}>
                    <img src={`/images/facility/${img}`} alt="" loading="lazy" />
                  </div>
                ))}
              </div>
            </div>

            {/* 3. 수업, 시설이용, 스테이 문의 (Banner - Moved here near contact) */}
            <div className={styles.contactBanner}>
              <div className={styles.contactIcon}>💬</div>
              <div className={styles.contactText}>
                {t.home.info.contactSlogan}
              </div>
            </div>

            <div className={styles.hostProfileCard}>
              <CompactHostProfile showBio={false} />
            </div>
          </section>
        )}

        {activeSubTab === 'membership' && (
          <section className={`${styles.section} ${styles.membershipSection}`}>
            <div className={styles.membershipHighlight}>
              {t.home.info.highlight}
            </div>

            <h2 className={styles.sectionTitle}>{t.home.info.benefitsTitle}</h2>
            <div className={styles.membershipBox}>
              <ul className={styles.list}>
                {t.home.info.benefits.map((benefit: string, i: number) => (
                  <li key={i} className={styles.listItem}>
                    <span className={styles.bullet}>•</span>
                    <div className={styles.benefitText}>{benefit}</div>
                  </li>
                ))}
              </ul>
            </div>

            <h2 className={styles.sectionTitle}>{t.home.info.cultureTitle}</h2>
            <div className={styles.membershipBox}>
              <ul className={styles.list}>
                {t.home.info.cultureList.map((item: string, i: number) => (
                  <li key={i} className={styles.listItem}>
                    <span className={styles.bullet}>✓</span>
                    <div className={styles.cultureText}>{item}</div>
                  </li>
                ))}
              </ul>
            </div>

            <h2 className={styles.sectionTitle}>{t.home.info.bankTitle}</h2>
            <div className={styles.bankAccountBox}>
              <span className={styles.bankName}>{t.home.info.bankName}</span>
              <span className={styles.accountNumber}>3333-14-3159646</span>
              <button className={styles.copyBtn} onClick={handleCopy}>
                {t.home.info.copyBtn}
              </button>
            </div>
          </section>
        )}

        {activeSubTab === 'story' && (
          <div className={styles.storySection}>
            {/* Core Campaign Section */}
            <div className={styles.campaignBanner}>
              <span className={styles.campaignTag}>{t.story.campaign.title}</span>
              <h2 className={styles.campaignSlogan}>{t.story.campaign.slogan}</h2>
              <p className={styles.campaignSloganKo}>{t.story.campaign.sloganKo}</p>
            </div>

            {/* Hero Section */}
            <div className={styles.storyHero}>
              <h3 className={styles.storyHeroTitle}>{t.story.hero.title}</h3>
              <p className={styles.storyHeroSubtitle}>{t.story.hero.subtitle}</p>
            </div>

            {/* Ethics Section */}
            <section className={styles.storySubSection}>
              <h4 className={styles.storySubTitle}>{t.story.ethics.title}</h4>
              <div className={styles.ethicsContainer}>
                <div className={`${styles.ethicsCard} ${styles.ethicsRespect}`}>
                  <h5>{t.story.ethics.respectTitle}</h5>
                  <p>{t.story.ethics.respectDesc}</p>
                </div>
                <div className={`${styles.ethicsCard} ${styles.ethicsTeaching}`}>
                  <h5>{t.story.ethics.teachingTitle}</h5>
                  <p>{t.story.ethics.teachingDesc}</p>
                  <span className={styles.ethicsTip}>{t.story.ethics.teachingDetail}</span>
                </div>
              </div>
            </section>

            {/* Projects Section */}
            <section className={styles.storySubSection}>
              <h4 className={styles.storySubTitle}>{t.story.projects.title}</h4>
              <div className={styles.projectGrid}>
                <div className={styles.projectCard}>
                  <div className={`${styles.projectThumb} ${styles.thumbAzit}`} />
                  <h5>{t.story.projects.azit.title}</h5>
                  <p>{t.story.projects.azit.desc}</p>
                </div>
                <div className={styles.projectCard}>
                  <div className={`${styles.projectThumb} ${styles.thumbCamp}`} />
                  <h5>{t.story.projects.camp.title}</h5>
                  <p>{t.story.projects.camp.desc}</p>
                </div>
                <div className={styles.projectCard}>
                  <div className={`${styles.projectThumb} ${styles.thumbNuevo}`} />
                  <h5>{t.story.projects.nuevo.title}</h5>
                  <p>{t.story.projects.nuevo.desc}</p>
                </div>
                <div className={styles.projectCard}>
                  <div className={`${styles.projectThumb} ${styles.thumbOrchestra}`} />
                  <h5>{t.story.projects.orchestra.title}</h5>
                  <p>{t.story.projects.orchestra.desc}</p>
                </div>
              </div>
            </section>

            {/* Roadmap Section */}
            <section className={styles.storySubSection}>
              <h4 className={styles.storySubTitle}>{t.story.roadmap.title}</h4>
              <div className={styles.roadmapList}>
                <div className={styles.roadmapItem}>
                  <div className={styles.roadmapIcon}>🤝</div>
                  <div className={styles.roadmapContent}>
                    <h5>{t.story.roadmap.cooperative.title}</h5>
                    <p>{t.story.roadmap.cooperative.desc}</p>
                  </div>
                </div>
                <div className={styles.roadmapItem}>
                  <div className={styles.roadmapIcon}>🎁</div>
                  <div className={styles.roadmapContent}>
                    <h5>{t.story.roadmap.donation.title}</h5>
                    <p>{t.story.roadmap.donation.desc}</p>
                  </div>
                </div>
                <div className={styles.roadmapItem}>
                  <div className={styles.roadmapIcon}>🎓</div>
                  <div className={styles.roadmapContent}>
                    <h5>{t.story.roadmap.instructor.title}</h5>
                    <p>{t.story.roadmap.instructor.desc}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Guidelines Section */}
            <section className={styles.storySubSection}>
              <h4 className={styles.storySubTitle}>{t.story.guidelines.title}</h4>
              <div className={styles.guidelineBox}>
                <ul className={styles.guidelineList}>
                  <li><span>✨</span> {t.story.guidelines.cleaning}</li>
                  <li><span>👟</span> {t.story.guidelines.shoes}</li>
                  <li><span>🚽</span> {t.story.guidelines.toilet}</li>
                  <li><span>♻️</span> {t.story.guidelines.trash}</li>
                  <li><span>🔌</span> {t.story.guidelines.power}</li>
                </ul>
                <div className={styles.facilityInfo}>
                  <div className={styles.facilityItem}><strong>WiFi</strong> {t.story.guidelines.facilities.wifi}</div>
                  <div className={styles.facilityItem}><strong>PC</strong> {t.story.guidelines.facilities.pc}</div>
                  <div className={styles.facilityItem}>{t.story.guidelines.facilities.lockers}</div>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>

      {showToast && (
        <div className={styles.copyToast}>
          {t.home.info.copySuccess}
        </div>
      )}
    </div>
  );
}

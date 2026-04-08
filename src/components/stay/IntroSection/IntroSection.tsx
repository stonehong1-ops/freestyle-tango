'use client';

import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';
import CompactHostProfile from '@/components/common/CompactHostProfile';
import styles from './IntroSection.module.css';

interface IntroSectionProps {
  showStory?: boolean;
  showContact?: boolean;
}

export default function IntroSection({ showStory = true, showContact = true }: IntroSectionProps) {
  const { t } = useLanguage();
  const story = t.common.story;
  const contact = t.common.contact;

  return (
    <div className={styles.container} id="intro">
      {showStory && (
        <>
          <header className={styles.header}>
            <h2 className={styles.title}>{story.title}</h2>
            <p className={styles.subtitle}>{story.subtitle}</p>
          </header>

          <div className={styles.content}>
            <article className={styles.storyBlock}>
              <p className={styles.leadParagraph}>
                {story.p1}
              </p>

              <div className={styles.solutionList}>
                <div className={styles.solutionItem}>
                  <div className={styles.solIcon}>🎁</div>
                  <div className={styles.solText}>
                    <h4>{story.sol1Title}</h4>
                    <p>{story.sol1Text}</p>
                  </div>
                </div>

                <div className={styles.solutionItem}>
                  <div className={styles.solIcon}>💧</div>
                  <div className={styles.solText}>
                    <h4>{story.sol2Title}</h4>
                    <p>{story.sol2Text}</p>
                  </div>
                </div>

                <div className={styles.solutionItem}>
                  <div className={styles.solIcon}>✨</div>
                  <div className={styles.solText}>
                    <h4>{story.sol3Title}</h4>
                    <p>{story.sol3Text}</p>
                  </div>
                </div>
              </div>
              
              <p className={styles.conclusion}>
                {story.closing}
              </p>
            </article>
          </div>
        </>
      )}

      {showStory && showContact && <hr className={styles.divider} />}

      {showContact && (
        <div className={styles.content} style={{ marginTop: showStory ? 0 : '1rem' }}>
          <CompactHostProfile showBio={true} className={styles.hostProfileWrapper} />
        </div>
      )}
    </div>
  );
}

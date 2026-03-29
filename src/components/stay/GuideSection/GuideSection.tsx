'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import styles from './GuideSection.module.css';

export default function GuideSection({ stayId = 'hapjeong' }: { stayId?: string }) {
  const { t } = useLanguage();
  
  // @ts-ignore
  const stayGuide = t.stays[stayId]?.guide || t.stays.hapjeong.guide;
  const hostGuide = t.common.hostGuide;

  return (
    <div className={styles.container} id="guide">
      <header className={styles.header}>
        <h2 className={styles.title}>{stayGuide.title}</h2>
        <p className={styles.subtitle}>{stayGuide.subtitle}</p>
      </header>
      
      <div className={styles.content}>
        
        <details className={styles.accordion} open>
          <summary>{stayGuide.highlights.title}</summary>
          <div className={styles.accordionContent}>
            <ul className={styles.customList}>
              {stayGuide.highlights.list.map((item: any, idx: number) => (
                <li key={idx}>
                  <strong>{item.t}</strong>
                  {item.d}
                </li>
              ))}
            </ul>
            <p className={styles.quote}>{stayGuide.highlights.quote}</p>
          </div>
        </details>

        <details className={styles.accordion}>
          <summary>{stayGuide.transport.title}</summary>
          <div className={styles.accordionContent}>
            <ul className={styles.customList}>
              {stayGuide.transport.list.map((item: any, idx: number) => (
                <li key={idx}>
                  <strong>{item.t}</strong>
                  {item.d}
                </li>
              ))}
            </ul>
          </div>
        </details>

        <details className={styles.accordion}>
          <summary>{stayGuide.facilities.title}</summary>
          <div className={styles.accordionContent}>
            <div className={styles.gridList}>
              <div className={styles.gridCol}>
                <h4>{stayGuide.facilities.base}</h4>
                <p>{stayGuide.facilities.baseDesc}</p>
              </div>
              <div className={styles.gridCol}>
                <h4>{stayGuide.facilities.add}</h4>
                <p>{stayGuide.facilities.addDesc}</p>
              </div>
            </div>
            
            <div className={styles.amenityBox}>
              <strong>{stayGuide.facilities.freeTitle}</strong>
              <p style={{ whiteSpace: 'pre-wrap' }}>
                {stayGuide.facilities.freeDesc}
              </p>
            </div>
          </div>
        </details>

        <details className={styles.accordion}>
          <summary>{hostGuide.title}</summary>
          <div className={styles.accordionContent}>
            <ul className={styles.customList}>
              {hostGuide.list.map((item, idx) => (
                <li key={idx}>
                  <strong>{item.t}</strong>
                  <span style={{ whiteSpace: 'pre-wrap' }}>{item.d}</span>
                </li>
              ))}
            </ul>
          </div>
        </details>

        <details className={styles.accordion}>
          <summary>{stayGuide.attractions.title}</summary>
          <div className={styles.accordionContent}>
            <ul className={styles.customList}>
              {stayGuide.attractions.list.map((item: any, idx: number) => (
                <li key={idx}>
                  <strong>{item.t}</strong>
                  {item.d}
                </li>
              ))}
            </ul>
          </div>
        </details>

        {stayGuide.neighborhood && (
          <details className={styles.accordion}>
            <summary>{stayGuide.neighborhood.title}</summary>
            <div className={styles.accordionContent}>
              <ul className={styles.customList}>
                {stayGuide.neighborhood.list.map((item: any, idx: number) => (
                  <li key={idx}>
                    <strong>{item.t}</strong>
                    <span style={{ whiteSpace: 'pre-wrap', display: 'block', marginTop: '4px', lineHeight: 1.6 }}>{item.d}</span>
                  </li>
                ))}
              </ul>
              {stayGuide.neighborhood.quote && (
                <p className={styles.quote}>{stayGuide.neighborhood.quote}</p>
              )}
            </div>
          </details>
        )}

        {stayGuide.story && (
          <details className={styles.accordion}>
            <summary>{stayGuide.story.title}</summary>
            <div className={styles.accordionContent}>
              <p style={{ marginBottom: '1rem', lineHeight: 1.6 }}>{stayGuide.story.desc}</p>
              <ul className={styles.customList}>
                {stayGuide.story.sections.map((item: any, idx: number) => (
                  <li key={idx}>
                    <strong>{item.t}</strong>
                    <span style={{ whiteSpace: 'pre-wrap', display: 'block', marginTop: '4px', lineHeight: 1.6 }}>{item.d}</span>
                  </li>
                ))}
              </ul>
              {stayGuide.story.quote && (
                <p className={styles.quote}>{stayGuide.story.quote}</p>
              )}
            </div>
          </details>
        )}

        {stayGuide.transportGuide && (
          <details className={styles.accordion}>
            <summary>{stayGuide.transportGuide.title}</summary>
            <div className={styles.accordionContent}>
              <ul className={styles.customList}>
                {stayGuide.transportGuide.list.map((item: any, idx: number) => (
                  <li key={idx}>
                    <strong>{item.t}</strong>
                    <span style={{ whiteSpace: 'pre-wrap', display: 'block', marginTop: '4px', lineHeight: 1.6 }}>{item.d}</span>
                  </li>
                ))}
              </ul>
            </div>
          </details>
        )}

        {stayGuide.complexNews && (
          <details className={styles.accordion}>
            <summary>{stayGuide.complexNews.title}</summary>
            <div className={styles.accordionContent}>
              <p style={{ marginBottom: '1rem', lineHeight: 1.6 }}>{stayGuide.complexNews.desc}</p>
              <ul className={styles.customList}>
                {stayGuide.complexNews.list.map((item: any, idx: number) => (
                  <li key={idx}>
                    <strong>{item.t}</strong>
                    <span style={{ whiteSpace: 'pre-wrap', display: 'block', marginTop: '4px', lineHeight: 1.6 }}>{item.d}</span>
                  </li>
                ))}
              </ul>
              {stayGuide.complexNews.quote && (
                <p className={styles.quote}>{stayGuide.complexNews.quote}</p>
              )}
            </div>
          </details>
        )}

      </div>
    </div>
  );
}

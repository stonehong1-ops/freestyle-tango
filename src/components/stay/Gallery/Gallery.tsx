'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';
import styles from './Gallery.module.css';

const baseCategories = ['전체', '거실', '침실', '키친', '화장실', '뷰'];

const hapjeongImages = [
  // 거실
  { id: 'img-1', categoryId: 1, src: '/images/20260317_143309.jpg' },
  { id: 'img-2', categoryId: 1, src: '/images/20260320_105323.jpg' },
  { id: 'img-3', categoryId: 1, src: '/images/20260319_130824.jpg' },
  { id: 'img-4', categoryId: 1, src: '/images/20260318_095315.jpg' },
  { id: 'img-5', categoryId: 1, src: '/images/20260311_140211.jpg' },
  { id: 'img-6', categoryId: 1, src: '/images/20260320_105309.jpg' },
  
  // 침실
  { id: 'img-8', categoryId: 2, src: '/images/20260319_123504.jpg' },
  { id: 'img-9', categoryId: 2, src: '/images/20260319_123516.jpg' },
  { id: 'img-10', categoryId: 2, src: '/images/20260319_124230.jpg' },
  { id: 'img-11', categoryId: 2, src: '/images/20260319_123529(1).jpg' },
  { id: 'img-12-b', categoryId: 2, src: '/images/20260320_140636.jpg' },
  
  // 키친
  { id: 'img-12-a', categoryId: 3, src: '/images/20260317_141751.jpg' },
  { id: 'img-13', categoryId: 3, src: '/images/20260310_181707.jpg' },
  
  // 화장실
  { id: 'img-14', categoryId: 4, src: '/images/20260313_155116.jpg' },
  { id: 'img-15', categoryId: 4, src: '/images/20260313_155135.jpg' },
  { id: 'img-16', categoryId: 4, src: '/images/20260320_132712.jpg' },
  
  // 뷰
  { id: 'img-17', categoryId: 5, src: '/images/20260316_190008.jpg' },
  { id: 'img-18', categoryId: 5, src: '/images/20260310_184549.jpg' },
  { id: 'img-19', categoryId: 5, src: '/images/20260310_184607.jpg' },
];

const deokeunImages = [
  { id: 'd-1', categoryId: 1, src: '/images/staysangam/1. 메인.jpg' },
  { id: 'd-2', categoryId: 2, src: '/images/staysangam/2. 침실.jpg' },
  { id: 'd-3', categoryId: 1, src: '/images/staysangam/3. 출입문과 입구 구조.jpg' },
  { id: 'd-4', categoryId: 1, src: '/images/staysangam/4. 책상과 화장대.jpg' },
  { id: 'd-5', categoryId: 1, src: '/images/staysangam/5. 아늑한 환경.jpg' },
  { id: 'd-6', categoryId: 1, src: '/images/staysangam/6. 구글TV, OTT 무료.jpg' },
  { id: 'd-7', categoryId: 2, src: '/images/staysangam/7. 넓은 옷장.jpg' },
  { id: 'd-8', categoryId: 1, src: '/images/staysangam/8. 공기청정기, 청소기, 스팀청소기.jpg' },
  { id: 'd-9', categoryId: 3, src: '/images/staysangam/9. 잘 준비된 주방.jpg' },
  { id: 'd-10', categoryId: 3, src: '/images/staysangam/10. 조리기구 완비.jpg' },
  { id: 'd-11', categoryId: 3, src: '/images/staysangam/11. 조리기구 완비.jpg' },
  { id: 'd-12', categoryId: 3, src: '/images/staysangam/12. 커피와 녹차 무료 제공.jpg' },
  { id: 'd-13', categoryId: 3, src: '/images/staysangam/13. 햇반, 라면, 컵라면 등 무료.jpg' },
  { id: 'd-14', categoryId: 4, src: '/images/staysangam/14. 모든 소모품 무료.jpg' },
  { id: 'd-15', categoryId: 4, src: '/images/staysangam/15. 비데 사용 가능.jpg' },
  { id: 'd-16', categoryId: 4, src: '/images/staysangam/16. 분리된 샤워실.jpg' },
  { id: 'd-17', categoryId: 1, src: '/images/staysangam/17. 1차 치료 키트 (진통제, 소화제 등 포함).jpg' },
  { id: 'd-18', categoryId: 5, src: '/images/staysangam/18. 피트니스센터 무료 이용.jpg' },
  { id: 'd-19', categoryId: 5, src: '/images/staysangam/19. 외부 건조 가능.jpg' }
];

const galleryDataMap: Record<string, any[]> = {
  hapjeong: hapjeongImages,
  deokeun: deokeunImages,
  hongdae: hapjeongImages
};

export default function Gallery({ stayId = 'hapjeong' }: { stayId?: string }) {
  const { t } = useLanguage();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // @ts-ignore - t.stays dynamic indexing
  const stayGallery = t.stays[stayId]?.gallery || t.stays.hapjeong.gallery;

  const currentImages = galleryDataMap[stayId] || galleryDataMap['hapjeong'];

  const imageData = currentImages.map((img, idx) => ({
    ...img,
    category: stayGallery.categories[img.categoryId],
    desc: stayGallery.descriptions[idx]
  }));

  const minSwipeDistance = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % imageData.length);
    }
    if (isRightSwipe && lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + imageData.length) % imageData.length);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') {
        setLightboxIndex(null);
        if (window.location.hash === '#gallery') {
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
        }
      }
      if (e.key === 'ArrowRight') setLightboxIndex(prev => prev !== null ? (prev + 1) % imageData.length : null);
      if (e.key === 'ArrowLeft') setLightboxIndex(prev => prev !== null ? (prev - 1 + imageData.length) % imageData.length : null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex]);

  const openLightbox = (idx: number) => {
    setLightboxIndex(idx);
    window.history.pushState({ lightbox: true }, '', '#gallery');
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
    if (window.location.hash === '#gallery') {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      if (window.location.hash !== '#gallery') {
        setLightboxIndex(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % imageData.length);
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + imageData.length) % imageData.length);
    }
  };

  return (
    <div className={styles.galleryContainer}>
      {/* 1. Main Hero Image */}
      <div 
        className={styles.mainImageWrapper} 
        onClick={() => openLightbox(0)}
      >
        <Image 
          src={imageData[0].src} 
          alt="TangoStay Hero" 
          fill
          className={styles.mainImage}
          priority
          sizes="(max-width: 1024px) 100vw, 1024px"
        />
        <button className={styles.seeMoreBtn}>
          {stayGallery.more} ({imageData.length})
        </button>
      </div>

      {/* 2. Lightbox Modal */}
      {lightboxIndex !== null && (
        <div className={styles.lightbox} onClick={closeLightbox}>
          <button className={styles.lightboxClose} onClick={closeLightbox}>&times;</button>
          
          <button className={styles.lightboxPrev} onClick={prevImage}>&#10094;</button>
          
          <div 
            className={styles.lightboxImageContainer} 
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <Image 
              src={imageData[lightboxIndex].src} 
              alt={imageData[lightboxIndex].category} 
              fill 
              className={styles.lightboxImage}
              sizes="100vw"
              priority
            />
            
            <div className={styles.captionOverlay}>
               <h3 className={styles.captionTitle}>{imageData[lightboxIndex].desc}</h3>
               <p className={styles.captionCategory}>{imageData[lightboxIndex].category} - {lightboxIndex + 1} / {imageData.length}</p>
            </div>
          </div>
          
          <button className={styles.lightboxNext} onClick={nextImage}>&#10095;</button>
        </div>
      )}
    </div>
  );
}

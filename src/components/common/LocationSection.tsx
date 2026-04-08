'use client';

import React from 'react';
import styles from './LocationSection.module.css';

export default function LocationSection() {
  const address = "서울 마포구 합정동 386-37";
  const bldg = "어반오아시스빌딩 B2";
  
  const naverUrl = `https://map.naver.com/p/search/${encodeURIComponent(address + " " + bldg)}`;
  const kakaoUrl = `https://map.kakao.com/link/search/${encodeURIComponent(address + " " + bldg)}`;
  const googleEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(address + " " + bldg)}&hl=ko&z=17&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className={styles.container}>

      
      <div className={styles.addressBox}>
        <strong>주소:</strong> {address}<br/>
        <strong>장소:</strong> {bldg}
      </div>

      <div className={styles.mapWrapper}>
        <iframe
          src={googleEmbedUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen={false}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="FreestyleTango Google Maps"
        />
      </div>

      <div className={styles.buttonGroup}>
        <a 
          href={naverUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className={`${styles.mapBtn} ${styles.naver}`}
        >
          네이버 지도
        </a>
        <a 
          href={kakaoUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className={`${styles.mapBtn} ${styles.kakao}`}
        >
          카카오 맵
        </a>
      </div>
    </div>
  );
}

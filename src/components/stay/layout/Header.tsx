'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { Language } from '@/locales';
import styles from './Header.module.css';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="#" className={styles.logo} onClick={closeMenu}>
          TangoStay
        </Link>
        
        <div className={styles.rightActions}>
          <select 
            value={language} 
            onChange={(e) => {
              setLanguage(e.target.value as Language);
              closeMenu();
            }}
            className={styles.langSelect}
          >
            <option value="ko">한국어</option>
            <option value="en">English</option>
            <option value="ja">日本語</option>
            <option value="zh-CN">简体中文</option>
            <option value="zh-TW">繁體中文</option>
            <option value="es">Español</option>
            <option value="vi">Tiếng Việt</option>
            <option value="it">Italiano</option>
            <option value="fr">Français</option>
            <option value="tr">Türkçe</option>
          </select>

          <button 
            className={styles.hamburgerBtn} 
            onClick={toggleMenu}
            aria-label="메뉴 열기"
          >
            <div className={`${styles.hamburgerLine} ${isMenuOpen ? styles.open : ''}`}></div>
            <div className={`${styles.hamburgerLine} ${isMenuOpen ? styles.open : ''}`}></div>
            <div className={`${styles.hamburgerLine} ${isMenuOpen ? styles.open : ''}`}></div>
          </button>
        </div>

      </div>

      {isMenuOpen && (
        <div className={styles.mobileMenu}>
          <nav className={styles.mobileNav}>
            <a href="#intro" onClick={closeMenu}>{t.header.story}</a>
            <a href="#location" onClick={closeMenu}>{t.header.location}</a>
            <a href="#guide" onClick={closeMenu}>{t.header.guide}</a>
            <a href="#contact" onClick={closeMenu}>{t.common.story.title} & {t.header.contact}</a>
          </nav>
        </div>
      )}
    </header>
  );
}

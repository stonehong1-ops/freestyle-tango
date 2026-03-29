'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { translations, Language, Translations } from '../locales';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations['ko'];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('ko');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Only access localStorage on the client side
    const saved = localStorage.getItem('tangostay_lang') as Language;
    if (saved && translations[saved]) {
      setLanguage(saved);
    }
    setMounted(true);
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('tangostay_lang', lang);
  };

  // Provide an initial render with the default language, 
  // but wait for mount to avoid hydration mismatch flashes
  if (!mounted) {
    return (
      <LanguageContext.Provider value={{ language: 'ko', setLanguage: handleSetLanguage, t: translations['ko'] }}>
        {children}
      </LanguageContext.Provider>
    );
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

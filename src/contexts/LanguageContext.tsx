'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { translations, Language, Translations } from '../locales';
import { SafeStorage } from '@/lib/storage';

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
    // Only access storage on the client side
    const saved = SafeStorage.get('tangostay_lang') as Language;
    if (saved && translations[saved]) {
      setLanguage(saved);
    }
    setMounted(true);
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    SafeStorage.set('tangostay_lang', lang);
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

  const createProxy = (target: any, fallback: any): any => {
    return new Proxy(target, {
      get: (obj, prop) => {
        if (prop === '$$typeof' || prop === 'prototype' || prop === 'then') return obj[prop];
        
        const val = obj[prop];
        const fbVal = fallback?.[prop];
        
        if (val === undefined || val === null) {
          return fbVal;
        }
        
        if (typeof val === 'object' && val !== null && fbVal && typeof fbVal === 'object') {
          return createProxy(val, fbVal);
        }
        
        return val;
      }
    });
  };

  const t = language === 'ko' ? translations['ko'] : createProxy(translations[language] || {}, translations['ko']);

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
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

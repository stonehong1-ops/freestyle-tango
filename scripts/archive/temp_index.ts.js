import ko from './ko';
import en from './en';
import ja from './ja';
import zhCN from './zh-CN';
import zhTW from './zh-TW';
import es from './es';
import vi from './vi';
import it from './it';
import fr from './fr';
import tr from './tr';

export type Language = 'ko' | 'en' | 'ja' | 'zh-CN' | 'zh-TW' | 'es' | 'vi' | 'it' | 'fr' | 'tr';

export type Translations = {
  [K in Language]: typeof ko;
};

export const translations: Translations = {
  'ko': ko,
  'en': en as any,
  'ja': ja as any,
  'zh-CN': zhCN as any,
  'zh-TW': zhTW as any,
  'es': es as any,
  'vi': vi as any,
  'it': it as any,
  'fr': fr as any,
  'tr': tr as any,
};

import { Language } from '@/locales';

export function formatRelativeTime(date: Date, language: Language = 'ko'): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return language === 'ko' ? '방금 전' : 'just now';
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return language === 'ko' ? `${diffInMinutes}분 전` : `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return language === 'ko' ? `${diffInHours}시간 전` : `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return language === 'ko' ? `${diffInDays}일 전` : `${diffInDays}d ago`;
  
  return date.toLocaleDateString(language === 'ko' ? 'ko-KR' : 'en-US');
}

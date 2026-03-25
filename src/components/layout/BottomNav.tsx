'use client';

import React from 'react';
import { Home, ShoppingBag, User, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { label: '메인', icon: Home, href: '/' },
  { label: '신청현황', icon: ShoppingBag, href: '/status' },
  { label: '마이페이지', icon: User, href: '/profile' },
  { label: '관리자', icon: ShieldCheck, href: '/admin' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-[68px] glass border-t border-[#f2f2f7] safe-area-bottom shadow-[0_-4px_24px_rgba(0,0,0,0.02)]">
      <div className="max-w-[600px] w-full mx-auto h-full flex justify-around items-center px-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex flex-col items-center justify-center space-y-1 w-full h-full transition-all active:scale-[0.9] ${
                isActive ? 'text-[#007aff]' : 'text-[#adb5bd]'
              }`}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[11.5px] font-bold ${isActive ? 'opacity-100' : 'opacity-80'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

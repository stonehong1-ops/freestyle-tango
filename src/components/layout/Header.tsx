'use client';

import React from 'react';

export default function Header() {
  return (
    <div className="pt-10 pb-6 px-5 bg-white">
      <div className="max-w-[600px] mx-auto">
        <div className="bg-white rounded-[32px] p-8 shadow-[0_12px_48px_rgba(0,0,0,0.08)] border border-[#f2f2f7]">
          <h1 className="text-[28px] font-extrabold tracking-tight text-[#191f28] leading-[1.25]">
            프리스타일탱고<br />
            <span className="text-[#007aff]">4월</span> 수업신청
          </h1>
        </div>
      </div>
    </div>
  );
}

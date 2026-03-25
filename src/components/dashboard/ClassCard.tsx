'use client';

import React from 'react';
import { ClassInfo } from '@/lib/mock_data';

interface ClassCardProps {
  classInfo: ClassInfo;
  onClick: (classInfo: ClassInfo) => void;
}

export default function ClassCard({ classInfo, onClick }: ClassCardProps) {
  const isWaiting = Math.abs(classInfo.leaders - classInfo.followers) >= 2;
  
  return (
    <div 
      onClick={() => onClick(classInfo)}
      className="bg-white rounded-[24px] p-5 flex gap-5 cursor-pointer active:scale-[0.98] transition-all hover:bg-gray-50 mb-4 overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-[#f2f2f7]"
    >
      {/* Photo - Left */}
      <div className="w-[90px] h-[90px] rounded-[16px] bg-[#f8f9fa] shrink-0 overflow-hidden relative border border-[#f2f2f7]">
        <img 
          src={classInfo.imageUrl} 
          alt={classInfo.instructors.join(', ')}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Info - Right */}
      <div className="flex flex-col flex-1 justify-between py-1">
        <div>
          <h3 className="text-[17px] font-bold text-[#191f28] leading-tight mb-1">
            {classInfo.title}
          </h3>
          <div className="flex items-center text-[13.5px] text-[#4e5968] font-semibold tracking-tight">
            <span>{classInfo.time}</span>
            <span className="mx-2 w-[1px] h-[10px] bg-[#dee2e6]" />
            <span className="text-[#007aff]">{classInfo.durationMin}분</span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center px-2 py-0.5 bg-[#f2f2f7] rounded-[7.5px] text-[11px] font-bold text-[#4e5968] tracking-tighter">
              <span className="text-[#007aff] mr-1.5 opacity-80">리더</span> {classInfo.leaders}
              <span className="mx-2 w-[1px] h-[8px] bg-[#dee2e6]" />
              <span className="text-[#ef4444] mr-1.5 opacity-80">팔로어</span> {classInfo.followers}
            </div>
            {isWaiting && (
              <span className="text-[10.5px] font-bold text-[#ef4444] px-1.5 py-0.5 border border-[#ef4444] rounded-[6px]">
                대기 중
              </span>
            )}
          </div>
          <span className="text-[12.5px] text-[#8b95a1] font-semibold">
            {classInfo.instructors.slice(0, 2).join(' · ')}
          </span>
        </div>
      </div>
    </div>
  );
}

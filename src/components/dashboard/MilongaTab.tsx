'use client';

import React, { useState, useEffect } from 'react';
import MilongaLucy from '@/components/dashboard/MilongaLucy';

interface MilongaTabProps {
  isAdminLogged: boolean;
  onHome: () => void;
  onEdit: () => void;
  currentUser?: any;
  requireIdentity?: (action: () => void) => void;
  onSubTabChange?: (tab: 'poster' | 'reserve' | 'live') => void;
  onDateChange?: (date: string) => void;
}

export default function MilongaTab({
  isAdminLogged,
  onHome,
  onEdit,
  currentUser,
  requireIdentity,
  onSubTabChange,
  onDateChange
}: MilongaTabProps) {
  const [selectedLucyDate, setSelectedLucyDateState] = useState("");
  
  const setSelectedLucyDate = (date: string) => {
    setSelectedLucyDateState(date);
    if (onDateChange) onDateChange(date);
  };
  const [activeLucyDates, setActiveLucyDates] = useState<string[]>([]);
  
  const fetchMilongaDates = async () => {
    const { getAllMilongas } = await import('@/lib/db');
    try {
      const allMilongas = await getAllMilongas();
      const dates = allMilongas.map(m => m.activeDate).filter(Boolean);
      setActiveLucyDates(dates);
      
      // Calculate cutoff time in KST (now - 6 hours) to allow milongas to stay focused until 6 AM next day
      const now = new Date();
      const kstFormatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Seoul',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
      
      const cutoff = new Date(now.getTime() - (6 * 60 * 60 * 1000));
      const cutoffStr = kstFormatter.format(cutoff);
      
      const sortedAsc = [...dates].sort();
      const currentMilongaDate = sortedAsc.find(d => d >= cutoffStr);
      
      if (currentMilongaDate) {
        setSelectedLucyDate(currentMilongaDate);
      } else if (dates.length > 0) {
        setSelectedLucyDate(dates[dates.length - 1]); // Show latest if all are older
      }
    } catch (e) {
      console.error('Error fetching milonga dates:', e);
    }
  };

  useEffect(() => {
    fetchMilongaDates();
    window.addEventListener('ft_milonga_updated', fetchMilongaDates);
    return () => window.removeEventListener('ft_milonga_updated', fetchMilongaDates);
  }, []);

  return (
    <MilongaLucy 
      selectedDate={selectedLucyDate}
      activeDates={activeLucyDates}
      onSelectDate={setSelectedLucyDate}
      onHome={onHome}
      isAdmin={isAdminLogged}
      onEdit={onEdit}
      currentUser={currentUser}
      requireIdentity={requireIdentity}
      onSubTabChange={onSubTabChange}
    />
  );
}

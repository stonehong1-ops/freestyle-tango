import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { signInAnonymously } from 'firebase/auth';
import { 
  getClasses, 
  getRegistrations, 
  getMonthlyNotice, 
  getStayReservationList,
  TangoClass, 
  Registration, 
  FullStayReservation,
  CURRENT_REGISTRATION_MONTH 
} from '@/lib/db';
import { useLanguage } from '@/contexts/LanguageContext';
import { SafeStorage } from '@/lib/storage';

export function useProjectData() {
  const [classes, setClasses] = useState<TangoClass[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [reservations, setReservations] = useState<FullStayReservation[]>([]);
  const [currentUser, setCurrentUser] = useState<{ nickname: string, phone: string, role?: 'leader' | 'follower', photoURL?: string } | null>(null);
  const [appliedClassIds, setAppliedClassIds] = useState<Set<string>>(new Set());
  const [selectedMonth, setSelectedMonth] = useState(CURRENT_REGISTRATION_MONTH);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdminLogged, setIsAdminLogged] = useState(false);
  const [monthlyNotice, setMonthlyNotice] = useState<string>('');
  
  const { t } = useLanguage();

  const checkAdminStatus = (user: { phone: string } | null) => {
    const adminPhones = ['01072092468', '01012345678'];
    if (user && adminPhones.includes(user.phone.replace(/[^0-9]/g, ''))) {
      setIsAdminLogged(true);
    } else {
      setIsAdminLogged(false);
    }
  };

  const fetchClasses = async () => {
    setIsLoading(true);
    try {
      const [classData, regData, resData] = await Promise.all([
        getClasses(), 
        getRegistrations(),
        getStayReservationList()
      ]);
      setClasses(classData);
      setRegistrations(regData);
      setReservations(resData);

        const savedUser = SafeStorage.getJson<{ phone: string }>('ft_user');
        if (savedUser) {
          const { phone } = savedUser;
          const normalizedPhone = phone.replace(/[^0-9]/g, '');
          const userRegs = regData.filter(r => r.phone === normalizedPhone);
          const dbClassIds = userRegs.flatMap(r => r.classIds || []);
          
          const localIds = SafeStorage.getJson<string[]>('my_tango_classes') || [];
          setAppliedClassIds(new Set([...dbClassIds, ...localIds]));
        }

      if (classData.length > 0) {
        const currentMonth = new Date().toISOString().substring(0, 7);
        const monthsWithClasses = Array.from(new Set(classData.map(c => c.targetMonth).filter(Boolean) as string[])).sort();
        const hasClassesInSelectedMonth = classData.some(c => c.targetMonth === selectedMonth);
        
        if (!hasClassesInSelectedMonth) {
          const futureMonths = monthsWithClasses.filter(m => m >= currentMonth);
          if (futureMonths.length > 0) {
            setSelectedMonth(futureMonths[0]);
          } else if (monthsWithClasses.length > 0) {
            setSelectedMonth(monthsWithClasses[monthsWithClasses.length - 1]);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchNotice = async () => {
      const notice = await getMonthlyNotice(selectedMonth);
      setMonthlyNotice(notice);
    };
    fetchNotice();
  }, [selectedMonth]);

  useEffect(() => {
    fetchClasses();
    const loadUser = () => {
      const user = SafeStorage.getJson<any>('ft_user');
      setCurrentUser(user);
      checkAdminStatus(user);
      
      const savedClasses = SafeStorage.getJson<string[]>('my_tango_classes');
      if (savedClasses) setAppliedClassIds(new Set(savedClasses));
      else setAppliedClassIds(new Set());
    };
    loadUser();

    window.addEventListener('ft_user_updated', loadUser);
    window.addEventListener('ft_classes_updated', fetchClasses);
    window.addEventListener('ft_registrations_updated', fetchClasses);

    // Anonymous Auth
    if (!auth.currentUser && SafeStorage.get('ft_user')) {
      signInAnonymously(auth).catch(err => console.error("Auth Error:", err));
    }

    return () => {
      window.removeEventListener('ft_user_updated', loadUser);
      window.removeEventListener('ft_classes_updated', fetchClasses);
      window.removeEventListener('ft_registrations_updated', fetchClasses);
    };
  }, []);

  return {
    classes,
    registrations,
    reservations,
    currentUser,
    appliedClassIds,
    selectedMonth,
    setSelectedMonth,
    isLoading,
    isAdminLogged,
    monthlyNotice,
    setMonthlyNotice,
    fetchClasses,
    setCurrentUser,
    setIsAdminLogged,
    setAppliedClassIds
  };
}

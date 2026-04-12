import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { signInAnonymously } from 'firebase/auth';
import { 
  getClasses, 
  getRegistrations, 
  getMonthlyNotice, 
  getStayReservationList,
  getUserByPhone,
  trackUserVisit,
  TangoClass, 
  User,
  Registration, 
  FullStayReservation,
  CURRENT_REGISTRATION_MONTH 
} from '@/lib/db';
import { useLanguage } from '@/contexts/LanguageContext';
import { SafeStorage } from '@/lib/storage';
import { hasRole } from '@/utils/auth';

export function useProjectData() {
  const [classes, setClasses] = useState<TangoClass[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [reservations, setReservations] = useState<FullStayReservation[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [appliedClassIds, setAppliedClassIds] = useState<Set<string>>(new Set());
  const [selectedMonth, setSelectedMonth] = useState(CURRENT_REGISTRATION_MONTH);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdminLogged, setIsAdminLogged] = useState(false);
  const [monthlyNotice, setMonthlyNotice] = useState<string>('');
  
  const { t } = useLanguage();

  const checkAdminStatus = (user: User | null) => {
    if (hasRole(user, 'admin')) {
      setIsAdminLogged(true);
    } else {
      setIsAdminLogged(false);
    }
  };

  const syncUserFromDB = async (phone: string) => {
    try {
      const user = SafeStorage.getJson<any>('ft_user');
      const dbUser = await getUserByPhone(phone);
      
      if (dbUser) {
        // Data Protection: Prioritize local identity if DB is sparse (e.g. background FCM update created a thin doc)
        const updatedUser = {
          ...user,
          ...dbUser,
          // Only use DB value if it actually exists/has content to prevent overwriting local with null
          nickname: dbUser.nickname || user?.nickname,
          photoURL: dbUser.photoURL || user?.photoURL,
          role: dbUser.role || user?.role,
          staffRole: dbUser.staffRole || (dbUser as any).staffrole || user?.staffRole
        };

        // If DB was missing identity info but we had it locally, restore it to DB (Self-healing)
        if (!dbUser.nickname && user?.nickname) {
          console.log('[Sync] Restoring missing DB identity info from local storage');
          const cleanPhone = phone.replace(/[^0-9]/g, '');
          // We don't wait for this to avoid blocking UI
          trackUserVisit(cleanPhone, user.nickname, user.photoURL, user.role, 'unknown', user.staffRole);
        }

        setCurrentUser(updatedUser);
        SafeStorage.setJson('ft_user', updatedUser);
        checkAdminStatus(updatedUser);
        console.log('User profile synced and protected:', updatedUser.nickname);
      }
    } catch (error) {
      console.error('Error syncing user from DB:', error);
    }
  };

  const fetchClasses = async () => {
    setIsLoading(true);
    try {
      // 1. Load Classes and process month selection
      const loadClassesData = async () => {
        try {
          const classData = await getClasses();
          setClasses(classData);
          
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
          return classData;
        } catch (e) {
          console.error('Error loading classes:', e);
          return [];
        }
      };

      // 2. Load Registrations and sync applied IDs
      const loadRegData = async () => {
        try {
          const regData = await getRegistrations();
          setRegistrations(regData);

          const savedUser = SafeStorage.getJson<{ phone: string }>('ft_user');
          if (savedUser) {
            const { phone } = savedUser;
            const normalizedPhone = phone?.replace(/[^0-9]/g, '');
            const userRegs = normalizedPhone ? regData.filter(r => r.phone === normalizedPhone) : [];
            const dbClassIds = userRegs.flatMap(r => r.classIds || []);
            const localIds = SafeStorage.getJson<string[]>('my_tango_classes') || [];
            setAppliedClassIds(new Set([...dbClassIds, ...localIds]));
          }
          return regData;
        } catch (e) {
          console.error('Error loading registrations:', e);
          return [];
        }
      };

      // 3. Load Reservations (the likely bottleneck) in background
      const loadResData = async () => {
        try {
          const resData = await getStayReservationList();
          setReservations(resData);
        } catch (e) {
          console.error('Error loading stay reservations (likely missing index):', e);
        }
      };

      // Wait for essential data first to unblock UI
      await Promise.all([loadClassesData(), loadRegData()]);
      setIsLoading(false);
      
      // Kick off reservations fetch in background
      loadResData();

    } catch (error) {
      console.error('Critical error in fetchClasses:', error);
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
      
      if (user?.phone) {
        syncUserFromDB(user.phone);
      }
      
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

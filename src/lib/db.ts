import { db } from './firebase';
export const CURRENT_REGISTRATION_MONTH = new Date().toISOString().substring(0, 7); // Dynamic month YYYY-MM
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where,
  orderBy,
  limit
} from 'firebase/firestore';

export interface TangoClass {
  id: string;
  teacher1: string;
  teacher2: string;
  title: string;
  type: string;
  level: string;
  description: string;
  curriculum: string;
  time: string;
  price: string;
  leaderCount: number;
  followerCount: number;
  maxCount: number;
  imageUrl?: string;
  teacherProfile?: string;
  videoUrl?: string;
  dates?: string[];
  timeStr?: string;
  targetMonth?: string; // YYYY-MM
}

export interface Registration {
  id: string;
  date: string;
  nickname: string;
  phone: string;
  role: 'leader' | 'follower';
  classIds: string[];
  type: '개별신청' | '1개월 신청' | '6개월 멤버쉽';
  month?: string; // YYYY-MM
  status?: 'waiting' | 'paid';
  paidAt?: string;
  amount?: number;
  paymentNote?: string;
}

export interface MilongaReservation {
  id: string;
  milongaDate: string; // YYYY-MM-DD
  nickname: string;
  phone: string;
  option: '테이블 예약' | '2+1 이벤트' | '3+1 이벤트';
  role?: 'leader' | 'follower';
  requests?: string;
  timestamp: string;
}

export interface MilongaInfo {
  id?: string;
  posterUrl: string;
  message: string;
  activeDate?: string;
  activeDates?: string[];
}

// --- Stay Reservation Types ---
export interface StayReservationRequest {
  stayId: string;
  name: string;
  phone: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  message: string;
}

export interface FullStayReservation extends StayReservationRequest {
  id: string;
  status: 'requested' | 'confirmed' | 'cancelled';
  createdAt: any;
  updatedAt?: any;
}

export interface BlockedDateInfo {
  date: string;
  maskedName: string;
  checkIn: string;
  checkOut: string;
}

const COLLECTION_NAME = 'tango_classes';

export const getClasses = async (): Promise<TangoClass[]> => {
  const q = query(collection(db, COLLECTION_NAME), orderBy('time', 'asc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(docSnap => ({
    id: docSnap.id,
    ...docSnap.data()
  } as TangoClass));
};

export const addClass = async (classData: Omit<TangoClass, 'id'>) => {
  return await addDoc(collection(db, COLLECTION_NAME), classData);
};

export const updateClass = async (id: string, classData: Partial<TangoClass>) => {
  const docRef = doc(db, COLLECTION_NAME, id);
  return await updateDoc(docRef, classData);
};

export const deleteClass = async (id: string) => {
  const docRef = doc(db, COLLECTION_NAME, id);
  return await deleteDoc(docRef);
};
const REG_COLLECTION = 'registrations';

export const addRegistration = async (regData: Omit<Registration, 'id'>) => {
  // We ALWAYS add a new record now to maintain history
  // Fallback month if not provided (should be provided by the UI)
  const dataToSave = {
    ...regData,
    month: regData.month || new Date().toISOString().substring(0, 7),
    status: regData.status || 'waiting'
  };
  return await addDoc(collection(db, REG_COLLECTION), dataToSave);
};

export const updatePaymentStatus = async (id: string, amount: number, paymentNote?: string) => {
  const docRef = doc(db, REG_COLLECTION, id);
  return await updateDoc(docRef, {
    status: 'paid',
    paidAt: new Date().toISOString(),
    amount: amount,
    paymentNote: paymentNote || ''
  });
};

export const deleteRegistration = async (id: string) => {
  const docRef = doc(db, REG_COLLECTION, id);
  return await deleteDoc(docRef);
};

export const updateRegistration = async (id: string, updates: Partial<Registration>) => {
  const docRef = doc(db, REG_COLLECTION, id);
  return await updateDoc(docRef, updates);
};

export const getRegistrations = async (): Promise<Registration[]> => {
  const q = query(collection(db, REG_COLLECTION), orderBy('date', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(docSnap => ({
    id: docSnap.id,
    ...docSnap.data()
  } as Registration));
};

// Counts are now calculated on the fly from registrations in the UI components

export const getRegistrationByPhone = async (phone: string): Promise<Registration | null> => {
  const q = query(
    collection(db, REG_COLLECTION), 
    where('phone', '==', phone), 
    orderBy('date', 'desc'),
    limit(1)
  );
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) return null;
  const docSnap = querySnapshot.docs[0];
  return { id: docSnap.id, ...docSnap.data() } as Registration;
};

export const getAllRegistrationsByPhone = async (phone: string): Promise<Registration[]> => {
  const q = query(
    collection(db, REG_COLLECTION), 
    where('phone', '==', phone), 
    orderBy('date', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(docSnap => ({
    id: docSnap.id,
    ...docSnap.data()
  } as Registration));
};

export const getClassesByMonth = async (month: string): Promise<TangoClass[]> => {
  const q = query(
    collection(db, COLLECTION_NAME), 
    where('targetMonth', '==', month),
    orderBy('time', 'asc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(docSnap => ({
    id: docSnap.id,
    ...docSnap.data()
  } as TangoClass));
};

const MILONGA_RES_COLLECTION = 'milonga_reservations';

export const addMilongaReservation = async (data: Omit<MilongaReservation, 'id'>) => {
  return await addDoc(collection(db, MILONGA_RES_COLLECTION), data);
};

export const getMilongaReservations = async (date: string): Promise<MilongaReservation[]> => {
  const q = query(
    collection(db, MILONGA_RES_COLLECTION),
    where('milongaDate', '==', date),
    orderBy('timestamp', 'asc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(docSnap => ({
    id: docSnap.id,
    ...docSnap.data()
  } as MilongaReservation));
};

export const getAllMilongaReservations = async (): Promise<MilongaReservation[]> => {
  const q = query(
    collection(db, MILONGA_RES_COLLECTION),
    orderBy('milongaDate', 'asc'),
    orderBy('timestamp', 'asc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(docSnap => ({
    id: docSnap.id,
    ...docSnap.data()
  } as MilongaReservation));
};

export const updateMilongaReservation = async (id: string, data: Partial<MilongaReservation>) => {
  const docRef = doc(db, MILONGA_RES_COLLECTION, id);
  return await updateDoc(docRef, data);
};

export const deleteMilongaReservation = async (id: string) => {
  const docRef = doc(db, MILONGA_RES_COLLECTION, id);
  return await deleteDoc(docRef);
};

const MILONGA_INFO_COLLECTION = 'milonga_info';

export const getMilongaInfo = async (): Promise<MilongaInfo | null> => {
  const q = query(collection(db, MILONGA_INFO_COLLECTION), limit(1));
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) return null;
  const docSnap = querySnapshot.docs[0];
  const data = docSnap.data();
  const info = { id: docSnap.id, ...data } as MilongaInfo;
  
  // Normalize: ensure activeDates is an array and activeDate is set
  if (info.activeDates) {
    if (typeof info.activeDates === 'string') {
      info.activeDates = [info.activeDates];
    }
  } else {
    info.activeDates = info.activeDate ? [info.activeDate] : [];
  }

  if (info.activeDates.length > 0 && !info.activeDate) {
    info.activeDate = info.activeDates[0];
  } else if (info.activeDate && info.activeDates.length === 0) {
    info.activeDates = [info.activeDate];
  }
  
  return info;
};

export const updateMilongaInfo = async (info: Partial<MilongaInfo>) => {
  const existing = await getMilongaInfo();
  // Remove id from the data to be saved/updated
  const dataToSave = { ...info };
  delete dataToSave.id;

  // Ensure activeDates is an array if we are saving dates
  if (dataToSave.activeDate && !dataToSave.activeDates) {
    dataToSave.activeDates = [dataToSave.activeDate];
  } else if (dataToSave.activeDates && !dataToSave.activeDate) {
    dataToSave.activeDate = dataToSave.activeDates[0];
  }
  
  if (existing) {
    // @ts-ignore
    const docRef = doc(db, MILONGA_INFO_COLLECTION, existing.id);
    return await updateDoc(docRef, dataToSave);
  } else {
    return await addDoc(collection(db, MILONGA_INFO_COLLECTION), dataToSave as MilongaInfo);
  }
};

// --- Stay Reservation Functions ---
const STAY_RES_COLLECTION = 'reservations';

const maskName = (name: string) => {
  if (!name) return "***";
  if (name.length <= 2) return name.substring(0, 1) + "*";
  return name.substring(0, 1) + "*" + name.substring(2);
};

export const getStayReservationList = async (stayId?: string): Promise<FullStayReservation[]> => {
  try {
    const snapshot = await getDocs(collection(db, STAY_RES_COLLECTION));
    const list: FullStayReservation[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.status === 'cancelled') return;
      
      let docStayId = data.stayId || 'hapjeong';
      if (docStayId === 'stayhapjeoung') docStayId = 'hapjeong';
      if (stayId && docStayId !== stayId) return;
      list.push({
        ...data,
        id: docSnap.id,
        stayId: docStayId
      } as FullStayReservation);
    });
    return list.sort((a, b) => (a.checkIn || "").localeCompare(b.checkIn || ""));
  } catch (error) {
    console.error("Error fetching stay reservation list: ", error);
    return [];
  }
};

export const getStayReservedDates = async (stayId?: string): Promise<BlockedDateInfo[]> => {
  try {
    const snapshot = await getDocs(collection(db, STAY_RES_COLLECTION));
    const blockedDates: BlockedDateInfo[] = [];
    
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.status === 'cancelled') return;
      
      let docStayId = data.stayId || 'hapjeong';
      if (docStayId === 'stayhapjeoung') docStayId = 'hapjeong';
      if (stayId && docStayId !== stayId) return;
      
      const start = new Date(data.checkIn);
      const end = new Date(data.checkOut);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) return;

      const current = new Date(start);
      while (current < end) {
        blockedDates.push({
          date: current.toISOString().split('T')[0],
          maskedName: maskName(data.name || ""),
          checkIn: data.checkIn,
          checkOut: data.checkOut
        });
        current.setDate(current.getDate() + 1);
        if (blockedDates.length > 2000) break;
      }
    });
    return blockedDates;
  } catch (error) {
    console.error("Error fetching stay reservations: ", error);
    return [];
  }
};

import { serverTimestamp } from 'firebase/firestore';

export const submitStayReservation = async (data: StayReservationRequest) => {
  try {
    const docRef = await addDoc(collection(db, STAY_RES_COLLECTION), {
      ...data,
      status: "requested",
      createdAt: serverTimestamp(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error adding stay reservation: ", error);
    return { success: false, error };
  }
};

export const cancelStayReservation = async (id: string) => {
  try {
    const docRef = doc(db, STAY_RES_COLLECTION, id);
    await updateDoc(docRef, { status: "cancelled" });
    return { success: true };
  } catch (error) {
    console.error("Error cancelling stay reservation: ", error);
    return { success: false, error };
  }
};

export const updateStayReservation = async (id: string, data: Partial<StayReservationRequest>) => {
  try {
    const docRef = doc(db, STAY_RES_COLLECTION, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating stay reservation: ", error);
    return { success: false, error };
  }
};
// --- Monthly Notice Functions ---
const MONTHLY_NOTICE_COLLECTION = 'monthly_notices';

export interface MonthlyNotice {
  month: string; // YYYY-MM
  content: string;
}

export const getMonthlyNotice = async (month: string): Promise<string> => {
  try {
    const q = query(collection(db, MONTHLY_NOTICE_COLLECTION), where('month', '==', month), limit(1));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return "";
    return querySnapshot.docs[0].data().content || "";
  } catch (error) {
    console.error("Error fetching monthly notice: ", error);
    return "";
  }
};

export const updateMonthlyNotice = async (month: string, content: string) => {
  try {
    const q = query(collection(db, MONTHLY_NOTICE_COLLECTION), where('month', '==', month), limit(1));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const docRef = doc(db, MONTHLY_NOTICE_COLLECTION, querySnapshot.docs[0].id);
      await updateDoc(docRef, { content });
    } else {
      await addDoc(collection(db, MONTHLY_NOTICE_COLLECTION), { month, content });
    }
    return { success: true };
  } catch (error) {
    console.error("Error updating monthly notice: ", error);
    return { success: false, error };
  }
};

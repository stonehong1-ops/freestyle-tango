import { db } from './firebase';
export const CURRENT_REGISTRATION_MONTH = '2026-04';
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
  option: '테이블 예약' | '2+1 이벤트' | '3+1 이벤트';
  requests?: string;
  timestamp: string;
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

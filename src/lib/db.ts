import { db } from './firebase';
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
}

export interface Registration {
  id: string;
  date: string;
  nickname: string;
  phone: string;
  role: 'leader' | 'follower';
  classIds: string[];
  type: '개별신청' | '1개월 신청' | '6개월 멤버쉽';
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
  // Check if a registration with this phone number already exists
  const q = query(collection(db, REG_COLLECTION), where('phone', '==', regData.phone), limit(1));
  const querySnapshot = await getDocs(q);
  
  if (!querySnapshot.empty) {
    // Update existing record
    const existingDoc = querySnapshot.docs[0];
    const docRef = doc(db, REG_COLLECTION, existingDoc.id);
    // Cast to any because the exact type mapping for Omit can sometimes be tricky with updateDoc
    // but here regData is exactly the fields we want to update.
    return await updateDoc(docRef, regData as object);
  } else {
    // Add new record
    return await addDoc(collection(db, REG_COLLECTION), regData);
  }
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
  const q = query(collection(db, REG_COLLECTION), where('phone', '==', phone), limit(1));
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) return null;
  const docSnap = querySnapshot.docs[0];
  return { id: docSnap.id, ...docSnap.data() } as Registration;
};

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
  increment,
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
  maleCount: number;
  femaleCount: number;
  maxCount: number;
  imageUrl?: string;
  teacherProfile?: string;
  videoUrl?: string;
}

export interface Registration {
  id: string;
  date: string;
  nickname: string;
  phone: string;
  gender: 'male' | 'female';
  classIds: string[];
  type: '개별신청' | '1개월 신청' | '6개월 멤버쉽';
}

const COLLECTION_NAME = 'tango_classes';

export const getClasses = async (): Promise<TangoClass[]> => {
  const q = query(collection(db, COLLECTION_NAME), orderBy('time', 'asc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
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
    return await updateDoc(docRef, regData as any);
  } else {
    // Add new record
    return await addDoc(collection(db, REG_COLLECTION), regData);
  }
};

export const getRegistrations = async (): Promise<Registration[]> => {
  const q = query(collection(db, REG_COLLECTION), orderBy('date', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Registration));
};

export const incrementClassCounts = async (id: string, gender: 'male' | 'female') => {
  const docRef = doc(db, COLLECTION_NAME, id);
  const field = gender === 'male' ? 'maleCount' : 'femaleCount';
  return await updateDoc(docRef, {
    [field]: increment(1)
  });
};

export const recalculateClassCounts = async () => {
  const [regs, cls] = await Promise.all([getRegistrations(), getClasses()]);
  
  const updates = cls.map(async (c) => {
    const maleCount = regs.filter(r => r.classIds.includes(c.id) && r.gender === 'male').length;
    const femaleCount = regs.filter(r => r.classIds.includes(c.id) && r.gender === 'female').length;
    
    const docRef = doc(db, COLLECTION_NAME, c.id);
    return await updateDoc(docRef, { maleCount, femaleCount });
  });

  return await Promise.all(updates);
};

export const getRegistrationByPhone = async (phone: string): Promise<Registration | null> => {
  const q = query(collection(db, REG_COLLECTION), where('phone', '==', phone), limit(1));
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) return null;
  const doc = querySnapshot.docs[0];
  return { id: doc.id, ...doc.data() } as Registration;
};

export const fixExistingGenders = async () => {
  const q = query(collection(db, REG_COLLECTION));
  const querySnapshot = await getDocs(q);
  const updates = querySnapshot.docs.map(async (d) => {
    if (!d.data().gender) {
      return await updateDoc(doc(db, REG_COLLECTION, d.id), { gender: 'male' });
    }
  });
  return await Promise.all(updates);
};

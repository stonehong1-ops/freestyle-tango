import { db } from './firebase';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy 
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

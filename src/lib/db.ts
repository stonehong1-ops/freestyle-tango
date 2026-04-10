import { db } from './firebase';

export const CURRENT_REGISTRATION_MONTH = (() => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
})(); // Dynamic month YYYY-MM in local time
import { 
  collection, 
  getDocs, 
  getDoc,
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  setDoc,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  query,
  where,
  orderBy,
  limit,
  increment,
  or
} from 'firebase/firestore';

/**
 * Firestore 쿼리에 타임아웃을 적용하는 헬퍼 함수
 * 인덱스가 없을 때 12초 이상 대기하는 현상을 방지합니다.
 */
const withTimeout = <T>(promise: Promise<T>, timeoutMs: number = 6000): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error('FIRESTORE_TIMEOUT')), timeoutMs)
    )
  ]);
};

// --- Storage URL Remapping Utility ---
const OLD_BUCKETS = ['tangostay-7355e.appspot.com', 'tangostay-7355e.firebasestorage.app', 'tangostay-7355e'];
const NEW_BUCKET_DOMAIN = 'freestyle-tango-seoul.firebasestorage.app';

export const remapStorageUrl = (url: any): any => {
  if (!url || typeof url !== 'string' || !url.includes('firebasestorage.googleapis.com')) return url;
  
  let remapped = url;
  
  // 1. Replace legacy bucket domains/ids with the new Seoul bucket domain
  OLD_BUCKETS.forEach(bucket => {
    if (remapped.includes(bucket)) {
      remapped = remapped.replace(new RegExp(bucket, 'g'), NEW_BUCKET_DOMAIN);
    }
  });
  
  // 2. STRIP LEGACY TOKENS: The old tokens are invalid in the new project.
  // We keep essential params like alt=media but strip &token=... or ?token=...
  if (remapped.includes('token=')) {
    // Standard case: ?alt=media&token=xyz -> ?alt=media
    // Edge case: ?token=xyz -> (remove params entirely)
    const urlObj = new URL(remapped);
    urlObj.searchParams.delete('token');
    remapped = urlObj.toString();
  }
  
  return remapped;
};


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
  type: '개별수강' | '1개월멤버쉽' | '6개월멤버쉽(1-6개월차)' | string;
  month?: string; // YYYY-MM
  status?: 'waiting' | 'paid';
  paidAt?: string;
  amount?: number;
  paymentNote?: string;
  photoURL?: string; // Profile photo URL
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
  sourcePhotoUrl?: string; // Original photo without text
  message: string;
  activeDate: string; // Required for indexing
  activeDates?: string[]; // Kept for legacy support
  djName?: string;
  timeInfo?: string;
  startTime?: string;
  endTime?: string;
}

export interface ExtraSchedule {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  startTime?: string; // HH:mm
  endTime?: string;   // HH:mm
  memo: string;
  imageUrl?: string;
}

export interface MediaItem {
  id?: string;
  type: 'youtube' | 'demonstration' | 'general' | 'image' | 'video' | 'lucy';
  title: string;
  description?: string;
  videoUrl: string; // Youtube ID or Storage URL
  thumbnailUrl?: string;
  relatedClassId?: string; // ID of the class
  relatedMilongaDate?: string; // YYYY-MM-DD
  uploaderNickname: string;
  uploaderPhone: string;
  createdAt: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
}

export interface MediaComment {
  id?: string;
  mediaId: string;
  nickname: string;
  phone: string;
  content: string;
  createdAt: string;
}

export interface UserCouponUsage {
  id?: string;
  phone: string;
  couponType: string; // 'membership_discount' | 'milonga_free'
  month: string;      // YYYY-MM
  usedAt: string;
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

export interface User {
  phone: string;
  nickname: string;
  photoURL?: string;
  role?: string;
  isInstructor?: boolean;
  staffRole?: string | string[];
  lastVisit: any; // Firestore Timestamp
  createdAt?: any;
  device?: 'ios' | 'android' | 'pc' | 'unknown';
  visitCount?: number;
  dwellMinutes?: number;
  settings?: {
    pushEnabled: boolean;
    openChat: boolean;
    privateChat: boolean;
    token?: string;
    pinnedRooms?: string[];
  }
}

export interface CoachingItem {
  id: string;
  title: string;
  description?: string;
  progress: number;
  status: 'ongoing' | 'solved';
  studentPhone: string;
  studentNickname: string;
  studentPhotoURL?: string;
  instructorPhone: string;
  instructorNickname: string;
  instructorPhotoURL?: string;
  createdAt: string;
  updatedAt: string;
  lastComment?: string;
  milestones?: { progress: number, date: string }[];
}

export interface CoachingUpdate {
  id: string;
  coachingItemId: string;
  progress: number;
  comment: string;
  mediaUrls: string[];
  createdAt: string;
}

const COLLECTION_NAME = 'tango_classes';

export const getClasses = async (): Promise<TangoClass[]> => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('time', 'asc'));
    // 3초 이내에 응답이 없으면 인덱스 누락으로 간주하고 폴백 실행
    const querySnapshot = await withTimeout(getDocs(q));
    return querySnapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        imageUrl: remapStorageUrl(data.imageUrl)
      } as TangoClass;
    });
  } catch (error: any) {
    if (error.message === 'FIRESTORE_TIMEOUT') {
      console.warn("getClasses query timed out (likely missing index), using fallback sorting.");
    } else {
      console.warn("Error fetching classes with orderBy:", error);
    }
    const qSimple = query(collection(db, COLLECTION_NAME));
    const querySnapshot = await getDocs(qSimple);
    const results = querySnapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        imageUrl: remapStorageUrl(data.imageUrl)
      } as TangoClass;
    });
    return results.sort((a, b) => (a.time || '').localeCompare(b.time || ''));
  }
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
  const updates: any = {
    status: 'paid',
    paidAt: new Date().toISOString(),
    amount: amount,
    paymentNote: paymentNote || ''
  };

  if (paymentNote) {
    if (paymentNote.includes('1개월')) {
      updates.type = '1개월멤버쉽';
    } else if (paymentNote.includes('6개월')) {
      // Extract installment number (e.g., "1차", "2차")
      const turnMatch = paymentNote.match(/(\d+)차/);
      const turn = turnMatch ? turnMatch[1] : '1';
      updates.type = `6개월멤버쉽(${turn}차)`;
    } else if (paymentNote.includes('개별')) {
      updates.type = '개별수강';
    }
  }

  return await updateDoc(docRef, updates);
};

export const deleteRegistration = async (id: string) => {
  const docRef = doc(db, REG_COLLECTION, id);
  return await deleteDoc(docRef);
};

export const updateRegistration = async (id: string, updates: Partial<Registration>) => {
  const docRef = doc(db, REG_COLLECTION, id);
  return await withTimeout(updateDoc(docRef, updates));
};

export const getRegistrations = async (): Promise<Registration[]> => {
  const q = query(collection(db, REG_COLLECTION), orderBy('date', 'desc'), limit(500));
  const querySnapshot = await withTimeout(getDocs(q));
  return querySnapshot.docs.map(docSnap => ({
    id: docSnap.id,
    ...docSnap.data()
  } as Registration));
};

export const getRegistrationByPhone = async (phone: string, classId: string): Promise<Registration | null> => {
  try {
    const q = query(
      collection(db, 'registrations'),
      where('phone', '==', phone),
      where('classIds', 'array-contains', classId)
    );
    const querySnapshot = await withTimeout(getDocs(q));
    if (querySnapshot.empty) return null;
    return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() } as Registration;
  } catch (error) {
    console.error("Error fetching registration: ", error);
    // Fallback: search all registrations for this phone (without class index)
    try {
      const qFallback = query(collection(db, 'registrations'), where('phone', '==', phone));
      const querySnapshot = await withTimeout(getDocs(qFallback));
      const found = querySnapshot.docs.find(d => {
        const data = d.data();
        return data.classIds && data.classIds.includes(classId);
      });
      if (found) return { id: found.id, ...found.data() } as Registration;
    } catch (fallbackError) {
      console.error("Fallback registration fetch failed:", fallbackError);
    }
    return null;
  }
};

export const getAllRegistrationsByPhone = async (phone: string): Promise<Registration[]> => {
  try {
    const q = query(collection(db, 'registrations'), where('phone', '==', phone));
    const querySnapshot = await withTimeout(getDocs(q));
    return querySnapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    } as Registration));
  } catch (error) {
    console.error("Error fetching all registrations: ", error);
    return [];
  }
};

export const updateRegistrationPhoto = async (phone: string, photoURL: string) => {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  
  // 1. Update in registrations
  const q = query(
    collection(db, REG_COLLECTION), 
    where('phone', '==', cleanPhone),
    orderBy('date', 'desc'),
    limit(5)
  );
  const snap = await withTimeout(getDocs(q));
  const regPromises = snap.docs.map(docSnap => 
    updateDoc(doc(db, REG_COLLECTION, docSnap.id), { photoURL })
  );
  
  // 2. Update in users
  const userRef = doc(db, USERS_COLLECTION, cleanPhone);
  const userPromise = updateDoc(userRef, { photoURL });
  
  return await Promise.all([...regPromises, userPromise]);
};

export const toggleUserPinnedRoom = async (phone: string, roomId: string, isPinned: boolean) => {
  try {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const userRef = doc(db, 'users', cleanPhone);
    
    // Check if user exists first or just try update
    if (isPinned) {
      await updateDoc(userRef, {
        'settings.pinnedRooms': arrayUnion(roomId)
      });
    } else {
      await updateDoc(userRef, {
        'settings.pinnedRooms': arrayRemove(roomId)
      });
    }
    return { success: true };
  } catch (err) {
    console.error("Error toggling pinned room:", err);
    return { success: false, error: err };
  }
};

export const updateUserProfile = async (phone: string, data: Partial<User>) => {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  
  // 1. Update in registrations (nickname, photoURL, role - but NOT isInstructor/staffRole as they are global user roles)
  const q = query(
    collection(db, REG_COLLECTION), 
    where('phone', '==', cleanPhone),
    orderBy('date', 'desc'),
    limit(10)
  );
  const snap = await withTimeout(getDocs(q));
  const regData: any = { ...data };
  delete regData.isInstructor; // Don't propagate isInstructor to registrations as it doesn't exist there
  delete regData.staffRole;    // Don't propagate staffRole to registrations as it doesn't exist there

  const regPromises = snap.docs.map(docSnap => 
    updateDoc(doc(db, REG_COLLECTION, docSnap.id), regData)
  );
  
  // 2. Update in users
  const userRef = doc(db, USERS_COLLECTION, cleanPhone);
  const userPromise = updateDoc(userRef, { ...data, lastVisit: serverTimestamp() });
  
  return await Promise.all([...regPromises, userPromise]);
};


const MILONGA_RES_COLLECTION = 'milonga_reservations';

export const addMilongaReservation = async (data: Omit<MilongaReservation, 'id'>) => {
  return await withTimeout(addDoc(collection(db, MILONGA_RES_COLLECTION), data));
};

export const getMilongaReservations = async (milongaDate: string): Promise<MilongaReservation[]> => {
  try {
    const q = query(
      collection(db, MILONGA_RES_COLLECTION),
      where('milongaDate', '==', milongaDate)
    );
    const querySnapshot = await withTimeout(getDocs(q));
    return querySnapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    } as MilongaReservation));
  } catch (error) {
    console.error("Error fetching milonga reservations: ", error);
    return [];
  }
};

export const getAllMilongaReservations = async (month?: string): Promise<MilongaReservation[]> => {
  try {
    let q;
    if (month) {
      const start = `${month}-01`;
      const end = `${month}-31`;
      q = query(
        collection(db, MILONGA_RES_COLLECTION),
        where('milongaDate', '>=', start),
        where('milongaDate', '<=', end),
        orderBy('milongaDate', 'desc')
      );
    } else {
      q = query(collection(db, MILONGA_RES_COLLECTION), orderBy('milongaDate', 'desc'), limit(500));
    }
    const querySnapshot = await withTimeout(getDocs(q));
    return querySnapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    } as MilongaReservation));
  } catch (error) {
    console.warn("getAllMilongaReservations failed, falling back to simple query:", error);
    try {
      const qSimple = query(collection(db, MILONGA_RES_COLLECTION), limit(500));
      const querySnapshot = await withTimeout(getDocs(qSimple));
      let results = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() } as MilongaReservation));
      if (month) {
        results = results.filter(r => r.milongaDate && r.milongaDate.startsWith(month));
      }
      return results.sort((a,b) => (b.milongaDate || '').localeCompare(a.milongaDate || ''));
    } catch (err) {
      return [];
    }
  }
};

export const updateMilongaReservation = async (id: string, data: Partial<MilongaReservation>) => {
  const docRef = doc(db, MILONGA_RES_COLLECTION, id);
  return await withTimeout(updateDoc(docRef, data));
};

export const deleteMilongaReservation = async (id: string) => {
  const docRef = doc(db, MILONGA_RES_COLLECTION, id);
  return await withTimeout(deleteDoc(docRef));
};

const MILONGA_INFO_COLLECTION = 'milonga_info';

export const getMilongaInfo = async (date?: string): Promise<MilongaInfo | null> => {
  if (date) {
    const q = query(collection(db, MILONGA_INFO_COLLECTION), where('activeDate', '==', date), limit(1));
    const querySnapshot = await withTimeout(getDocs(q));
    if (!querySnapshot.empty) {
      const docSnap = querySnapshot.docs[0];
      const data = docSnap.data();
      return { 
        ...data,
        id: docSnap.id, 
        posterUrl: remapStorageUrl(data.posterUrl),
        sourcePhotoUrl: remapStorageUrl(data.sourcePhotoUrl)
      } as unknown as MilongaInfo;
    }
    return null;
  }

  // Next upcoming or latest
  const today = new Date().toISOString().split('T')[0];
  const q = query(
    collection(db, MILONGA_INFO_COLLECTION), 
    where('activeDate', '>=', today),
    orderBy('activeDate', 'asc'),
    limit(1)
  );
  const querySnapshot = await withTimeout(getDocs(q));
  if (!querySnapshot.empty) {
    const docSnap = querySnapshot.docs[0];
    const data = docSnap.data();
    return {
      ...data,
      id: docSnap.id,
      posterUrl: remapStorageUrl(data.posterUrl),
      sourcePhotoUrl: remapStorageUrl(data.sourcePhotoUrl)
    } as unknown as MilongaInfo;
  }

  // If no future milonga, get the absolute latest one
  const qLatest = query(
    collection(db, MILONGA_INFO_COLLECTION),
    orderBy('activeDate', 'desc'),
    limit(1)
  );
  const latestSnapshot = await withTimeout(getDocs(qLatest));
  if (!latestSnapshot.empty) {
    const docSnap = latestSnapshot.docs[0];
    const data = docSnap.data();
    return {
      ...data,
      id: docSnap.id,
      posterUrl: remapStorageUrl(data.posterUrl),
      sourcePhotoUrl: remapStorageUrl(data.sourcePhotoUrl)
    } as unknown as MilongaInfo;
  }

  return null;
};


export const updateMilongaInfo = async (info: MilongaInfo) => {
  if (!info.activeDate) throw new Error("Milonga date is required");
  
  // Try to find existing doc for this date
  const q = query(collection(db, MILONGA_INFO_COLLECTION), where('activeDate', '==', info.activeDate), limit(1));
  const querySnapshot = await withTimeout(getDocs(q));
  
  const dataToSave = { ...info };
  delete dataToSave.id;
  
  if (!querySnapshot.empty) {
    const docRef = doc(db, MILONGA_INFO_COLLECTION, querySnapshot.docs[0].id);
    return await withTimeout(updateDoc(docRef, dataToSave));
  } else {
    return await withTimeout(addDoc(collection(db, MILONGA_INFO_COLLECTION), dataToSave));
  }
};

export const deleteMilongaInfo = async (id: string) => {
  const docRef = doc(db, MILONGA_INFO_COLLECTION, id);
  return await withTimeout(deleteDoc(docRef));
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
    let q;
    if (stayId) {
      const stayIds = [stayId];
      if (stayId === 'hapjeong') stayIds.push('stayhapjeoung');
      if (stayId === 'deokeun') stayIds.push('staydeokeun', '덕은', 'deogeun');
      
      q = query(
        collection(db, STAY_RES_COLLECTION),
        where('stayId', 'in', stayIds),
        orderBy('checkIn', 'desc'),
        limit(150)
      );
    } else {
      q = query(
        collection(db, STAY_RES_COLLECTION),
        orderBy('checkIn', 'desc'),
        limit(200)
      );
    }
    
    const snapshot = await withTimeout(getDocs(q), 8000);
    const list: FullStayReservation[] = [];
    
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.status === 'cancelled') return;
      
      let docStayId = data.stayId || 'hapjeong';
      if (docStayId === 'stayhapjeoung') docStayId = 'hapjeong';
      if (docStayId === 'staydeokeun' || docStayId === 'deokeun' || docStayId === '덕은' || docStayId === 'deogeun') docStayId = 'deokeun';
      
      list.push({
        ...data,
        id: docSnap.id,
        stayId: docStayId,
        guestName: maskName(data.guestName)
      } as unknown as FullStayReservation);
    });
    
    return list.sort((a, b) => (b.checkIn || "").localeCompare(a.checkIn || ""));
  } catch (error: any) {
    if (error.message === 'FIRESTORE_TIMEOUT') {
      console.error("STAY_RESERVATION_LIST_TIMEOUT: Please create Firestore index for stay_reservations collection. Link usually looks like: https://console.firebase.google.com/project/freestyle-tango-seoul/firestore/indexes");
    }
    console.warn("getStayReservationList failed, falling back:", error);
    // Fallback significantly limited to prevent 10s+ scan
    const qFallback = query(collection(db, STAY_RES_COLLECTION), limit(250));
    const snapshot = await withTimeout(getDocs(qFallback));
    const list: FullStayReservation[] = [];
    
    const targetIds = stayId ? [stayId] : [];
    if (stayId === 'hapjeong') targetIds.push('stayhapjeoung');
    if (stayId === 'deokeun') targetIds.push('staydeokeun', '덕은', 'deogeun');

    snapshot.forEach(d => {
      const data = d.data();
      if (data.status === 'cancelled') return;
      
      let docStayId = data.stayId || 'hapjeong';
      if (docStayId === 'stayhapjeoung') docStayId = 'hapjeong';
      if (['staydeokeun', 'deokeun', '덕은', 'deogeun'].includes(docStayId)) docStayId = 'deokeun';

      if (stayId && !targetIds.includes(data.stayId || 'hapjeong')) return;
      
      list.push({ 
        ...data,
        id: d.id, 
        stayId: docStayId, 
        guestName: maskName(data.guestName) 
      } as unknown as FullStayReservation);
    });
    return list.sort((a, b) => (b.checkIn || "").localeCompare(a.checkIn || ""));
  }
};

export const getStayReservedDates = async (month: string): Promise<string[]> => {
  try {
    const start = `${month}-01`;
    const end = `${month}-31`;
    const q = query(
      collection(db, STAY_RES_COLLECTION),
      where('checkIn', '>=', start),
      where('checkIn', '<=', end)
    );
    const querySnapshot = await withTimeout(getDocs(q));
    const dates: string[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.reservedDates) dates.push(...data.reservedDates);
    });
    return Array.from(new Set(dates));
  } catch (error) {
    console.error("Error fetching stay dates: ", error);
    return [];
  }
};

export const submitStayReservation = async (data: StayReservationRequest) => {
  try {
    const docRef = await withTimeout(addDoc(collection(db, STAY_RES_COLLECTION), {
      ...data,
      status: "requested",
      createdAt: serverTimestamp(),
    }));
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error adding stay reservation: ", error);
    return { success: false, error };
  }
};

export const cancelStayReservation = async (id: string) => {
  try {
    const docRef = doc(db, STAY_RES_COLLECTION, id);
    await withTimeout(updateDoc(docRef, { status: "cancelled" }));
    return { success: true };
  } catch (error) {
    console.error("Error cancelling stay reservation: ", error);
    return { success: false, error };
  }
};

export const updateStayReservation = async (id: string, data: Partial<StayReservationRequest>) => {
  try {
    const docRef = doc(db, STAY_RES_COLLECTION, id);
    await withTimeout(updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    }));
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
    const q = query(collection(db, MONTHLY_NOTICE_COLLECTION), where('month', '==', month));
    const querySnapshot = await withTimeout(getDocs(q));
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
    const querySnapshot = await withTimeout(getDocs(q));
    
    if (!querySnapshot.empty) {
      const docRef = doc(db, MONTHLY_NOTICE_COLLECTION, querySnapshot.docs[0].id);
      await withTimeout(updateDoc(docRef, { content }));
    } else {
      await withTimeout(addDoc(collection(db, MONTHLY_NOTICE_COLLECTION), { month, content }));
    }

    // [Trigger Notification] 
    if (typeof window !== 'undefined') {
      fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetPhones: 'all',
          title: '📢 월간 공지사항 업데이트',
          body: content.length > 50 ? content.substring(0, 50) + '...' : content,
          link: '/calendar'
        })
      }).catch(e => console.error("Global notice notification error:", e));
    }
    return { success: true };
  } catch (error) {
    console.error("Error updating monthly notice: ", error);
    return { success: false, error };
  }
};

// --- Calendar & Schedule Functions ---
const EXTRA_SCHEDULES_COLLECTION = 'extra_schedules';

export const getExtraSchedules = async (month?: string): Promise<ExtraSchedule[]> => {
  try {
    let q;
    if (month) {
      const start = `${month}-01`;
      const end = `${month}-31`;
      q = query(
        collection(db, EXTRA_SCHEDULES_COLLECTION),
        where('date', '>=', start),
        where('date', '<=', end),
        orderBy('date', 'asc')
      );
    } else {
      q = query(collection(db, EXTRA_SCHEDULES_COLLECTION), orderBy('date', 'asc'), limit(300));
    }

    const querySnapshot = await withTimeout(getDocs(q));
    return querySnapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        ...data,
        id: docSnap.id,
        imageUrl: remapStorageUrl(data.imageUrl)
      } as unknown as ExtraSchedule;
    });
  } catch (error: any) {
    console.error("[DB ERROR] getExtraSchedules failed, falling back:", error);
    // Fallback: Fetch latest 200 without filtering and filter in-memory
    try {
      const qFallback = query(collection(db, EXTRA_SCHEDULES_COLLECTION), limit(200));
      const querySnapshot = await withTimeout(getDocs(qFallback));
      let results = querySnapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          ...data,
          id: docSnap.id,
          imageUrl: remapStorageUrl(data.imageUrl)
        } as unknown as ExtraSchedule;
      });
      
      if (month) {
        results = results.filter(s => s.date && s.date.startsWith(month));
      }
      return results.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
    } catch (fallbackError) {
      return [];
    }
  }
};

export const addExtraSchedule = async (data: Omit<ExtraSchedule, 'id'>) => {
  return await addDoc(collection(db, EXTRA_SCHEDULES_COLLECTION), data);
};

export const updateExtraSchedule = async (id: string, data: Partial<ExtraSchedule>) => {
  const docRef = doc(db, EXTRA_SCHEDULES_COLLECTION, id);
  return await updateDoc(docRef, data);
};

export const deleteExtraSchedule = async (id: string) => {
  const docRef = doc(db, EXTRA_SCHEDULES_COLLECTION, id);
  return await deleteDoc(docRef);
};

// --- Media Functions ---
const MEDIA_COLLECTION = 'media';
const COMMENTS_COLLECTION = 'media_comments';
const LIKES_COLLECTION = 'media_likes';

export const getClassesByMonth = async (month: string): Promise<TangoClass[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME), 
      where('targetMonth', '==', month),
      orderBy('time', 'asc')
    );
    const querySnapshot = await withTimeout(getDocs(q));
    return querySnapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        ...data,
        id: docSnap.id,
        imageUrl: remapStorageUrl(data.imageUrl || data.posterUrl)
      } as unknown as TangoClass;
    });
  } catch (error: any) {
    console.error("[DB ERROR] getClassesByMonth failed, falling back:", error);
    // Fallback: Fetch all classes (usually small collection) and filter
    try {
      const qFallback = query(collection(db, COLLECTION_NAME), limit(300));
      const querySnapshot = await withTimeout(getDocs(qFallback));
      const results = querySnapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          ...data,
          id: docSnap.id,
          imageUrl: remapStorageUrl(data.imageUrl || data.posterUrl)
        } as unknown as TangoClass;
      });
      return results
        .filter(c => c.targetMonth === month)
        .sort((a, b) => (a.time || '').localeCompare(b.time || ''));
    } catch (fallbackError) {
      return [];
    }
  }
};

export const getAllMilongas = async (month?: string): Promise<MilongaInfo[]> => {
  try {
    const colName = MILONGA_INFO_COLLECTION || 'milonga_info';
    let q;
    
    if (month) {
      const start = `${month}-01`;
      const end = `${month}-31`;
      q = query(
        collection(db, colName),
        where('activeDate', '>=', start),
        where('activeDate', '<=', end),
        orderBy('activeDate', 'asc')
      );
    } else {
      q = query(collection(db, colName), orderBy('activeDate', 'desc'), limit(100));
    }

    const querySnapshot = await withTimeout(getDocs(q));
    return querySnapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        ...data,
        id: docSnap.id,
        posterUrl: remapStorageUrl(data.posterUrl),
        sourcePhotoUrl: remapStorageUrl(data.sourcePhotoUrl)
      } as unknown as MilongaInfo;
    });
  } catch (error: any) {
    console.warn("[DB ERROR] getAllMilongas failed, falling back:", error);
    try {
      const colName = MILONGA_INFO_COLLECTION || 'milonga_info';
      const qFallback = query(collection(db, colName), limit(100));
      const querySnapshot = await withTimeout(getDocs(qFallback));
      let results = querySnapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          ...data,
          id: docSnap.id,
          posterUrl: remapStorageUrl(data.posterUrl),
          sourcePhotoUrl: remapStorageUrl(data.sourcePhotoUrl)
        } as unknown as MilongaInfo;
      });
      if (month) {
        results = results.filter(m => m.activeDate && m.activeDate.startsWith(month));
      }
      return results.sort((a, b) => (a.activeDate || '').localeCompare(b.activeDate || ''));
    } catch (fallbackError) {
      return [];
    }
  }
};

export const getMedia = async (type?: string, classId?: string, milongaDate?: string, month?: string): Promise<MediaItem[]> => {
  try {
    let q;
    // Always use some limit and reliable ordering
    if (type) {
      q = query(collection(db, MEDIA_COLLECTION), where('type', '==', type), orderBy('createdAt', 'desc'), limit(100));
    } else if (classId) {
      q = query(collection(db, MEDIA_COLLECTION), where('relatedClassId', '==', classId), orderBy('createdAt', 'desc'), limit(100));
    } else if (milongaDate) {
      q = query(collection(db, MEDIA_COLLECTION), where('relatedMilongaDate', '==', milongaDate), orderBy('createdAt', 'desc'), limit(100));
    } else {
      q = query(collection(db, MEDIA_COLLECTION), orderBy('createdAt', 'desc'), limit(200));
    }

    const querySnapshot = await withTimeout(getDocs(q));
    let results = querySnapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        ...data,
        id: docSnap.id,
        thumbnailUrl: remapStorageUrl(data.thumbnailUrl),
        videoUrl: remapStorageUrl(data.videoUrl) 
      } as unknown as MediaItem;
    });

    // Simple month filtering can remain in-memory if query was broad, 
    // or we could add more specific indexes if needed.
    if (month) {
      results = results.filter(m => m.createdAt?.startsWith(month));
    }

    return results;
  } catch (error: any) {
    if (error.code === 'failed-precondition') {
      console.warn("Missing Index for getMedia. Defaulting to simple query.");
    }
    
    // Fallback: query without order by if index missing
    const qSimple = query(collection(db, MEDIA_COLLECTION), limit(200));
    const querySnapshot = await withTimeout(getDocs(qSimple));
    let results = querySnapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        ...data,
        id: docSnap.id,
        thumbnailUrl: remapStorageUrl(data.thumbnailUrl),
        videoUrl: remapStorageUrl(data.videoUrl) 
      } as unknown as MediaItem;
    });

    if (month) results = results.filter(m => m.createdAt?.startsWith(month));
    if (classId) results = results.filter(m => m.relatedClassId === classId);
    if (milongaDate) results = results.filter(m => m.relatedMilongaDate === milongaDate);
    if (type) results = results.filter(m => m.type === type);

    return results.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  }
};

export const addMedia = async (data: Omit<MediaItem, 'id'>) => {
  const docRef = await addDoc(collection(db, MEDIA_COLLECTION), data);
  
  // [Trigger Notification] 
  // 수업 관련 영상(시연/참고) 등록 시 수강생들에게 알림 발송
  if (data.relatedClassId && typeof window !== 'undefined') {
    (async () => {
      try {
        // 해당 수업 수강생 전화번호 목록 조회
        const q = query(collection(db, 'registrations'), where('classIds', 'array-contains', data.relatedClassId));
        const snap = await getDocs(q);
        const targetPhones = Array.from(new Set(snap.docs.map(d => d.data().phone))).filter(Boolean);

        if (targetPhones.length > 0) {
          fetch('/api/notifications/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              targetPhones,
              title: '📹 신규 수업 영상이 등록되었습니다',
              body: `[${data.title}] 영상을 확인해 보세요!`,
              link: '/media'
            })
          });
        }
      } catch (e) {
        console.error("Media notification error:", e);
      }
    })();
  }
  
  return docRef;
};


export const updateMedia = async (id: string, data: Partial<MediaItem>) => {
  const docRef = doc(db, MEDIA_COLLECTION, id);
  return await updateDoc(docRef, data);
};

export const deleteMedia = async (id: string) => {
  const docRef = doc(db, MEDIA_COLLECTION, id);
  return await deleteDoc(docRef);
};

// Modular increment for views
export const incMediaView = async (id: string) => {
  const docRef = doc(db, MEDIA_COLLECTION, id);
  return await updateDoc(docRef, { viewCount: increment(1) });
};

export const getMediaComments = async (mediaId: string): Promise<MediaComment[]> => {
  try {
    const q = query(collection(db, COMMENTS_COLLECTION), where('mediaId', '==', mediaId), orderBy('createdAt', 'asc'));
    const querySnapshot = await withTimeout(getDocs(q));
    return querySnapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    } as MediaComment));
  } catch (error) {
    console.warn("Could not fetch comments with orderBy (index might be missing):", error);
    // Fallback: Fetch without orderBy and sort manually in-memory
    const qSimple = query(collection(db, COMMENTS_COLLECTION), where('mediaId', '==', mediaId));
    const querySnapshot = await withTimeout(getDocs(qSimple));
    const results = querySnapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    } as MediaComment));
    return results.sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''));
  }
};


export const addMediaComment = async (data: Omit<MediaComment, 'id'>) => {
  const docRef = await addDoc(collection(db, COMMENTS_COLLECTION), data);
  const mediaRef = doc(db, MEDIA_COLLECTION, data.mediaId);
  await updateDoc(mediaRef, { commentCount: increment(1) });
  return docRef;
};

export const deleteMediaComment = async (id: string, mediaId: string) => {
  const docRef = doc(db, COMMENTS_COLLECTION, id);
  await deleteDoc(docRef);
  const mediaRef = doc(db, MEDIA_COLLECTION, mediaId);
  await updateDoc(mediaRef, { commentCount: increment(-1) });
};

export const toggleMediaLike = async (mediaId: string, phone: string) => {
  const q = query(collection(db, LIKES_COLLECTION), where('mediaId', '==', mediaId), where('phone', '==', phone));
  const querySnapshot = await withTimeout(getDocs(q));
  
  const mediaRef = doc(db, MEDIA_COLLECTION, mediaId);
  
  if (!querySnapshot.empty) {
    // Unlike
    await deleteDoc(doc(db, LIKES_COLLECTION, querySnapshot.docs[0].id));
    await updateDoc(mediaRef, { likeCount: increment(-1) });
    return false;
  } else {
    // Like
    await addDoc(collection(db, LIKES_COLLECTION), { mediaId, phone });
    await updateDoc(mediaRef, { likeCount: increment(1) });
    return true;
  }
};

export const checkIfLiked = async (mediaId: string, phone: string): Promise<boolean> => {
  const q = query(collection(db, LIKES_COLLECTION), where('mediaId', '==', mediaId), where('phone', '==', phone));
  const querySnapshot = await withTimeout(getDocs(q));
  return !querySnapshot.empty;
};

export const checkClassAccess = async (phone: string, classId: string): Promise<boolean> => {
  const regs = await getAllRegistrationsByPhone(phone);
  // Check if any registration contains this classId
  return regs.some(r => r.classIds && r.classIds.includes(classId));
};

// --- Coupon Functions ---
const COUPON_COLLECTION = 'user_coupons';

export const getUserCouponUsage = async (phone: string): Promise<UserCouponUsage[]> => {
  try {
    const q = query(
      collection(db, COUPON_COLLECTION),
      where('phone', '==', phone)
    );
    const querySnapshot = await withTimeout(getDocs(q));
    return querySnapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    } as UserCouponUsage));
  } catch (error) {
    console.error("Error fetching coupon usage: ", error);
    return [];
  }
};

export const useUserCoupon = async (phone: string, couponType: string, month: string) => {
  const { addDoc, collection } = await import('firebase/firestore');
  return await addDoc(collection(db, COUPON_COLLECTION), {
    phone,
    couponType,
    month,
    usedAt: new Date().toISOString()
  });
};

// --- User Table Functions ---
const USERS_COLLECTION = 'users';

export const trackUserVisit = async (phone: string, nickname: string, photoURL?: string, role?: string, device?: string, staffRole?: string | string[]) => {
  if (!phone) return;
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const docRef = doc(db, USERS_COLLECTION, cleanPhone);
  
  const data: any = {
    phone: cleanPhone,
    nickname,
    lastVisit: serverTimestamp(),
    visitCount: increment(1),
  };
  if (device) data.device = device;
  if (photoURL) data.photoURL = remapStorageUrl(photoURL);
  if (role) data.role = role;
  if (staffRole) data.staffRole = staffRole;
  
  // Create if not exists, merge for visits
  const docSnap = await withTimeout(getDoc(docRef));
  if (!docSnap.exists()) {
    data.createdAt = serverTimestamp();
  }
  
  return await setDoc(docRef, data, { merge: true });
};

export const updateUserPulse = async (phone: string) => {
  if (!phone) return;
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const docRef = doc(db, USERS_COLLECTION, cleanPhone);
  return await updateDoc(docRef, {
    dwellMinutes: increment(1),
    lastVisit: serverTimestamp() // Also update last active
  });
};

export const getUserByPhone = async (phone: string): Promise<User | null> => {
  if (!phone) return null;
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  try {
    const docRef = doc(db, USERS_COLLECTION, cleanPhone);
    const docSnap = await withTimeout(getDoc(docRef));
    
    if (!docSnap.exists()) return null;
    const data = docSnap.data();
    return { ...data, photoURL: remapStorageUrl(data.photoURL) } as User;
  } catch (error) {
    console.error("Error fetching user: ", error);
    return null;
  }
};

export const getUsers = async (search?: string): Promise<User[]> => {
  try {
    // Note: ordering by lastVisit will exclude users WHO DO NOT HAVE the field.
    // For admin search, we should probably order by nickname or just fetch all and filter.
    const q = query(collection(db, USERS_COLLECTION), limit(500));
    const querySnapshot = await withTimeout(getDocs(q));
    let results = querySnapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        ...data,
        photoURL: remapStorageUrl(data.photoURL)
      } as User;
    });

    if (search) {
      const lowerSearch = search.toLowerCase();
      const cleanSearch = lowerSearch.replace(/[^0-9]/g, '');
      results = results.filter(u => 
        (u.nickname || '').toLowerCase().includes(lowerSearch) || 
        (u.phone || '').replace(/[^0-9]/g, '').includes(cleanSearch)
      );
    }
    return results;
  } catch (error) {
    console.error("Error fetching users: ", error);
    return [];
  }
};

export const updateUserSettings = async (phone: string, settings: Partial<User['settings']>) => {
  if (!phone) return;
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const docRef = doc(db, USERS_COLLECTION, cleanPhone);
  
  // Update only the settings field
  const currentDoc = await getDoc(docRef);
  const existingData = currentDoc.exists() ? currentDoc.data() : {};
  const existingSettings = existingData.settings || {};

  return await setDoc(docRef, {
    settings: {
      ...existingSettings,
      ...settings
    }
  }, { merge: true });
};

// --- Coaching Functions ---
const COACHING_COLLECTION = 'coaching_items';
const COACHING_UPDATES_COLLECTION = 'coaching_updates';

export const getCoachingItems = async (params: { studentPhone?: string, instructorPhone?: string, isAdmin?: boolean, relatedPhone?: string }): Promise<CoachingItem[]> => {
  try {
    let q;
    if (params.isAdmin) {
      q = query(collection(db, COACHING_COLLECTION));
    } else if (params.relatedPhone) {
      // Show items where the user is either the student OR the instructor
      q = query(
        collection(db, COACHING_COLLECTION),
        or(
          where('studentPhone', '==', params.relatedPhone),
          where('instructorPhone', '==', params.relatedPhone)
        )
      );
    } else {
      if (params.studentPhone) {
        q = query(collection(db, COACHING_COLLECTION), where('studentPhone', '==', params.studentPhone));
      } else if (params.instructorPhone) {
        q = query(collection(db, COACHING_COLLECTION), where('instructorPhone', '==', params.instructorPhone));
      } else {
        q = query(collection(db, COACHING_COLLECTION));
      }
    }

    const snap = await withTimeout(getDocs(q));
    const results = snap.docs.map(d => {
      const data = d.data();
      return { 
        id: d.id, 
        ...data,
        studentPhotoURL: remapStorageUrl(data.studentPhotoURL),
        instructorPhotoURL: remapStorageUrl(data.instructorPhotoURL),
        // Handle both singular and plural (legacy compatibility)
        mediaUrl: remapStorageUrl(data.mediaUrl),
        mediaUrls: Array.isArray(data.mediaUrls) ? data.mediaUrls.map(remapStorageUrl) : []
      } as CoachingItem;
    });
    
    // Final filter and sort
    results.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
    return results;
  } catch (error) {
    console.error("Error fetching coaching items:", error);
    return [];
  }
};

export const addCoachingItem = async (data: Omit<CoachingItem, 'id'>) => {
  // Ensure we have photos if available
  const student = await getUserByPhone(data.studentPhone);
  const instructor = await getUserByPhone(data.instructorPhone);
  
  const finalData = {
    ...data,
    studentPhotoURL: student?.photoURL || '',
    instructorPhotoURL: instructor?.photoURL || '',
    milestones: data.milestones || []
  };
  
  return await addDoc(collection(db, COACHING_COLLECTION), finalData);
};

export const updateCoachingItem = async (id: string, data: Partial<CoachingItem>) => {
  const docRef = doc(db, COACHING_COLLECTION, id);
  return await updateDoc(docRef, { ...data, updatedAt: new Date().toISOString() });
};

export const getCoachingUpdates = async (coachingItemId: string): Promise<CoachingUpdate[]> => {
  try {
    const q = query(
      collection(db, COACHING_UPDATES_COLLECTION), 
      where('coachingItemId', '==', coachingItemId),
      orderBy('createdAt', 'asc')
    );
    const snap = await withTimeout(getDocs(q));
    return snap.docs.map(d => {
      const data = d.data();
      return { 
        id: d.id, 
        ...data,
        mediaUrl: remapStorageUrl(data.mediaUrl),
        mediaUrls: Array.isArray(data.mediaUrls) ? data.mediaUrls.map(remapStorageUrl) : []
      } as CoachingUpdate;
    });
  } catch (error) {
    console.warn("Could not fetch coaching updates with index:", error);
    const qSimple = query(collection(db, COACHING_UPDATES_COLLECTION), where('coachingItemId', '==', coachingItemId));
    const snap = await withTimeout(getDocs(qSimple));
    const results = snap.docs.map(d => {
      const data = d.data();
      return { 
        id: d.id, 
        ...data,
        mediaUrl: remapStorageUrl(data.mediaUrl),
        mediaUrls: Array.isArray(data.mediaUrls) ? data.mediaUrls.map(remapStorageUrl) : []
      } as CoachingUpdate;
    });
    return results.sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''));
  }
};

export const addCoachingUpdate = async (coachingItemId: string, data: Omit<CoachingUpdate, 'id' | 'coachingItemId' | 'createdAt'>) => {
  const now = new Date();
  const updateData = {
    ...data,
    coachingItemId,
    createdAt: now.toISOString()
  };
  const docRef = await addDoc(collection(db, COACHING_UPDATES_COLLECTION), updateData);
  
  // Format date as M/D for milestone
  const milestoneDate = `${now.getMonth() + 1}/${now.getDate()}`;
  
  // Update the main item's progress, updatedAt and push to milestones
  const itemRef = doc(db, COACHING_COLLECTION, coachingItemId);
  await updateDoc(itemRef, { 
    progress: data.progress,
    lastComment: data.comment,
    status: data.progress === 100 ? 'solved' : 'ongoing',
    updatedAt: now.toISOString(),
    milestones: arrayUnion({ progress: data.progress, date: milestoneDate })
  });
  
  return docRef;
};

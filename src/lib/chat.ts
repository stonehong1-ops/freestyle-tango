import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  Timestamp, 
  serverTimestamp,
  getDocs,
  getDoc,
  limit,
  arrayUnion,
  setDoc
} from 'firebase/firestore';
import { db } from './firebase';
import { ChatRoom, ChatMessage } from '@/types/chat';

const ROOMS_COLLECTION = 'chat_rooms';
const MESSAGES_COLLECTION = 'chat_messages';
const USERS_COLLECTION = 'users';

export const COMMUNITY_ROOM_ID = 'freestyle_suda_bang';
export const NOTICE_ROOM_ID = 'freestyle_notice';

// Get rooms accessible by user
export const subscribeRooms = (userPhone: string, isAdmin: boolean, pinnedRoomIds: string[], callback: (rooms: ChatRoom[]) => void) => {
  const roomsRef = collection(db, ROOMS_COLLECTION);
  const cleanPhone = userPhone.replace(/[^0-9]/g, '');
  
  // 1. Fetch public (community & notice) rooms
  const publicQ = query(roomsRef, where('type', 'in', ['public', 'notice']));
  
  // 2. Fetch private rooms where user is participant
  const privateQ = query(roomsRef, where('participants', 'array-contains', cleanPhone));

  const handleSnapshot = (allRooms: ChatRoom[]) => {
    // Sort logic: Notice > Community > Pinned > Time
    const sorted = allRooms.sort((a, b) => {
      // 1. Notice Room (공지사항)
      if (a.id === NOTICE_ROOM_ID) return -1;
      if (b.id === NOTICE_ROOM_ID) return 1;

      // 2. Community Room (수다방)
      if (a.id === COMMUNITY_ROOM_ID) return -1;
      if (b.id === COMMUNITY_ROOM_ID) return 1;

      // 3. User Pinned Rooms (개인 고정)
      const isAPinned = pinnedRoomIds.includes(a.id);
      const isBPinned = pinnedRoomIds.includes(b.id);
      if (isAPinned && !isBPinned) return -1;
      if (!isAPinned && isBPinned) return 1;
      
      // 4. By Time (최신 메시지 순)
      const timeA = a.lastMessageTime?.toMillis() || 0;
      const timeB = b.lastMessageTime?.toMillis() || 0;
      return timeB - timeA;
    });

    // Filtering duplicates
    const unique = sorted.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
    callback(unique);
  };

  // Combining both snapshots
  let publicRooms: ChatRoom[] = [];
  let privateRooms: ChatRoom[] = [];

  const unsubPublic = onSnapshot(publicQ, (snap) => {
    publicRooms = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatRoom));
    handleSnapshot([...publicRooms, ...privateRooms]);
  });

  const unsubPrivate = onSnapshot(privateQ, (snap) => {
    privateRooms = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatRoom));
    handleSnapshot([...publicRooms, ...privateRooms]);
  });

  return () => {
    unsubPublic();
    unsubPrivate();
  };
};

// Get a single chat room data
export const getChatRoom = async (roomId: string): Promise<ChatRoom | null> => {
  try {
    const roomRef = doc(db, ROOMS_COLLECTION, roomId);
    const roomSnap = await getDoc(roomRef);
    
    if (roomSnap.exists()) {
      return { id: roomSnap.id, ...roomSnap.data() } as ChatRoom;
    }
    return null;
  } catch (error) {
    console.error('[GET CHAT ROOM ERROR]', error);
    return null;
  }
};

// Subscribe to messages for a room
export const subscribeMessages = (roomId: string, callback: (messages: ChatMessage[]) => void) => {
  const q = query(
    collection(db, MESSAGES_COLLECTION),
    where('roomId', '==', roomId),
    orderBy('timestamp', 'asc'),
    limit(100)
  );
  
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage));
    callback(messages);
  });
};

// Send message
export const sendMessage = async (message: Omit<ChatMessage, 'id' | 'timestamp' | 'readBy'>, roomData?: { name?: string; participants?: string[] }) => {
  try {
    const sanitizedMessage = Object.fromEntries(
      Object.entries(message).filter(([_, v]) => v !== undefined)
    );

    const docRef = await addDoc(collection(db, MESSAGES_COLLECTION), {
      ...sanitizedMessage,
      readBy: [message.senderId.replace(/[^0-9]/g, '')], 
      timestamp: serverTimestamp()
    });
    
    const roomRef = doc(db, ROOMS_COLLECTION, message.roomId);
    const roomSnap = await getDoc(roomRef);
    const roomDataFirestore = roomSnap.exists() ? roomSnap.data() as any : {};
    const participants = roomDataFirestore.participants || roomData?.participants || [];
    
    // Update unreadCounts for others
    const currentUnreadCounts = roomDataFirestore.unreadCounts || {};
    participants.forEach((p: string) => {
      const cleanP = p.replace(/[^0-9]/g, '');
      const cleanSender = message.senderId.replace(/[^0-9]/g, '');
      if (cleanP !== cleanSender) {
        currentUnreadCounts[cleanP] = (currentUnreadCounts[cleanP] || 0) + 1;
      }
    });

    await updateDoc(roomRef, {
      lastMessage: message.type === 'text' ? message.text : `[${message.type}]`,
      lastMessageTime: serverTimestamp(),
      lastMessageSenderId: message.senderId.replace(/[^0-9]/g, ''),
      lastMessageReadBy: [message.senderId.replace(/[^0-9]/g, '')],
      unreadCounts: currentUnreadCounts
    });

    // Trigger Notification
    const targets = participants.filter((p: string) => p.replace(/[^0-9]/g, '') !== message.senderId.replace(/[^0-9]/g, ''));
    if (targets.length > 0) {
      fetch('/api/chat/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: message.roomId,
          roomName: roomDataFirestore.name || roomData?.name || (message.roomId === COMMUNITY_ROOM_ID ? '프리스타일 수다방' : '새 메시지'),
          senderName: message.senderName,
          text: message.type === 'text' ? message.text : `[${message.type}]`,
          targetPhones: targets
        })
      }).catch(err => console.error("Notification trigger error:", err));
    }
    
    return docRef.id;
  } catch (error) {
    console.error("Error in sendMessage:", error);
    throw error;
  }
};

export const leaveChatRoom = async (roomId: string, userPhone: string) => {
  try {
    const cleanPhone = userPhone.replace(/[^0-9]/g, '');
    const roomRef = doc(db, ROOMS_COLLECTION, roomId);
    const snap = await getDoc(roomRef);
    if (!snap.exists()) return;
    
    const participants = snap.data().participants || [];
    const newParticipants = participants.filter((p: string) => p !== cleanPhone);
    
    if (newParticipants.length === 0) {
      // Logic for deleting empty room could go here, but usually we just keep it
    }
    
    await updateDoc(roomRef, {
      participants: newParticipants
    });
  } catch (err) {
    console.error("Error leaving room:", err);
    throw err;
  }
};

export const updateChatRoom = async (roomId: string, data: Partial<ChatRoom>) => {
  const roomRef = doc(db, ROOMS_COLLECTION, roomId);
  await updateDoc(roomRef, data as any);
};

export const resetUnreadCount = async (roomId: string, userPhone: string) => {
  try {
    const cleanPhone = userPhone.replace(/[^0-9]/g, '');
    const roomRef = doc(db, ROOMS_COLLECTION, roomId);
    await updateDoc(roomRef, {
      [`unreadCounts.${cleanPhone}`]: 0
    });
  } catch (err) {
    console.error("Error resetting unread count:", err);
  }
};

// Mark message as read
export const markMessageAsRead = async (roomId: string, messageId: string, userPhone: string) => {
  try {
    const cleanPhone = userPhone.replace(/[^0-9]/g, '');
    
    // 1. Update individual message
    const messageRef = doc(db, MESSAGES_COLLECTION, messageId);
    await updateDoc(messageRef, {
      readBy: arrayUnion(cleanPhone)
    });

    // 2. Update room's lastMessageReadBy
    const roomRef = doc(db, ROOMS_COLLECTION, roomId);
    
    // Optimization: We could check if it's already in unreadCounts, but decrementing is safer
    // To prevent infinite calls, we usually handle this in the UI too
    await updateDoc(roomRef, {
      lastMessageReadBy: arrayUnion(cleanPhone),
      [`unreadCounts.${cleanPhone}`]: 0 // Resetting individual count on read
    });
  } catch (error) {
    console.error("Error marking message as read:", error);
  }
};

export const toggleReaction = async (messageId: string, userPhone: string, emoji: string) => {
  try {
    const messageRef = doc(db, MESSAGES_COLLECTION, messageId);
    const cleanPhone = userPhone.replace(/[^0-9]/g, '');
    
    const msgSnap = await getDoc(messageRef);
    if (!msgSnap.exists()) return;
    
    const data = msgSnap.data();
    const currentReactions = data.reactions || {};
    
    if (currentReactions[cleanPhone] === emoji) {
      const newReactions = { ...currentReactions };
      delete newReactions[cleanPhone];
      await updateDoc(messageRef, { reactions: newReactions });
    } else {
      await updateDoc(messageRef, {
        [`reactions.${cleanPhone}`]: emoji
      });
    }
  } catch (error) {
    console.error("Error toggling reaction:", error);
  }
};

export const updateChatMessage = async (messageId: string, updates: Partial<ChatMessage>) => {
  try {
    const messageRef = doc(db, MESSAGES_COLLECTION, messageId);
    await updateDoc(messageRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error updating chat message:", error);
    throw error;
  }
};

export const createChatRoom = async (room: Omit<ChatRoom, 'id' | 'createdAt'>) => {
  const docRef = await addDoc(collection(db, ROOMS_COLLECTION), {
    ...room,
    createdAt: serverTimestamp(),
    lastMessageTime: serverTimestamp()
  });
  return docRef.id;
};

export const maskPhoneNumber = (phone: string) => {
  const clean = phone.replace(/[^0-9]/g, '');
  if (clean.length < 10) return phone;
  return `${clean.slice(0, 3)}-****-${clean.slice(-4)}`;
};

export const searchUsers = async (searchTerm: string = '') => {
  const users: { nickname: string; phone: string; photoURL?: string; role?: string }[] = [];
  const cleanSearch = searchTerm.replace(/[^0-9a-zA-Z가-힣]/g, '').toLowerCase();

  const q = query(
    collection(db, USERS_COLLECTION),
    orderBy('nickname'),
    limit(500)
  );
  const snap = await getDocs(q);
  
  snap.docs.forEach(doc => {
    const data = doc.data();
    const rawPhone = data.phone || '';
    const cleanPhone = rawPhone.replace(/[^0-9]/g, '');
    const nickname = data.nickname || '';
    
    if (cleanPhone && nickname) {
      const match = !cleanSearch || 
                    nickname.toLowerCase().includes(cleanSearch) || 
                    cleanPhone.includes(cleanSearch);
      if (match) {
        users.push({ nickname, phone: cleanPhone, photoURL: data.photoURL, role: data.role });
      }
    }
  });

  return users;
};

// Get nicknames and photos for a list of phones
export const getParticipantsInfo = async (phones: string[]) => {
  const cleanPhones = phones.map(p => p.replace(/[^0-9]/g, ''));
  const results: { [phone: string]: { nickname: string; photoURL?: string } } = {};
  if (cleanPhones.length === 0) return results;

  const q = query(
    collection(db, USERS_COLLECTION),
    where('phone', 'in', cleanPhones)
  );
  const snap = await getDocs(q);
  snap.docs.forEach(doc => {
    const data = doc.data();
    const phone = data.phone?.replace(/[^0-9]/g, '');
    if (phone) {
      results[phone] = { nickname: data.nickname, photoURL: data.photoURL, ...data } as any;
    }
  });

  return results;
};

export const subscribeParticipantsInfo = (phones: string[], callback: (info: Record<string, any>) => void) => {
  const cleanPhones = phones.map(p => p.replace(/[^0-9]/g, '')).filter(p => p.length > 0);
  if (cleanPhones.length === 0) {
    callback({});
    return () => {};
  }

  const q = query(
    collection(db, USERS_COLLECTION),
    where('phone', 'in', cleanPhones)
  );

  return onSnapshot(q, (snapshot) => {
    const results: Record<string, any> = {};
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const phone = data.phone?.replace(/[^0-9]/g, '');
      if (phone) {
        results[phone] = { nickname: data.nickname, photoURL: data.photoURL, ...data } as any;
      }
    });
    callback(results);
  });
};

export const getOrCreatePrivateRoom = async (participants: { nickname: string; phone: string }[], createdBy: string, customName?: string) => {
  const cleanParticipants = participants.map(p => p.phone.replace(/[^0-9]/g, '')).sort();
  const roomsRef = collection(db, ROOMS_COLLECTION);
  
  if (cleanParticipants.length === 2) {
    const q = query(
      roomsRef, 
      where('participants', 'array-contains', cleanParticipants[0]),
      where('type', '==', 'private')
    );
    const snap = await getDocs(q);
    const existing = snap.docs.find(doc => {
      const data = doc.data();
      const p = data.participants as string[];
      return p.length === 2 && p.includes(cleanParticipants[1]);
    });
    
    if (existing) return existing.id;
  }

  // Create room name from participant nicknames (excluding creator if possible, but for group chats just list them)
  const roomName = participants
    .map(p => p.nickname)
    .join(', ')
    .slice(0, 50);
  
  const docRef = await addDoc(collection(db, ROOMS_COLLECTION), {
    name: customName || roomName,
    customName: customName || '',
    type: 'private',
    participants: cleanParticipants,
    createdBy: createdBy.replace(/[^0-9]/g, ''),
    createdAt: serverTimestamp(),
    lastMessageTime: serverTimestamp(),
    lastMessage: '채팅방이 생성되었습니다.'
  });
  
  return docRef.id;
};

export const inviteUserToChatRoom = async (roomId: string, user: { nickname: string; phone: string }, inviterName: string) => {
  try {
    if (roomId === COMMUNITY_ROOM_ID || roomId === NOTICE_ROOM_ID) return;
    
    const cleanPhone = user.phone.replace(/[^0-9]/g, '');
    const roomRef = doc(db, ROOMS_COLLECTION, roomId);
    
    // Add to participants
    await updateDoc(roomRef, {
      participants: arrayUnion(cleanPhone)
    });

    // Send system message
    await addDoc(collection(db, MESSAGES_COLLECTION), {
      roomId,
      senderId: 'system',
      senderName: 'System',
      text: `${user.nickname}님이 초대되었습니다.`,
      type: 'system',
      timestamp: serverTimestamp(),
      readBy: []
    });

    // Refresh last message
    await updateDoc(roomRef, {
      lastMessage: `${user.nickname}님이 초대되었습니다.`,
      lastMessageTime: serverTimestamp(),
      lastMessageSenderId: 'system'
    });
  } catch (err) {
    console.error("Error inviting user:", err);
    throw err;
  }
};

export const initializeSystemRooms = async () => {
  // Notice Room
  const noticeRef = doc(db, ROOMS_COLLECTION, NOTICE_ROOM_ID);
  const noticeSnap = await getDoc(noticeRef);
  if (!noticeSnap.exists()) {
    await setDoc(noticeRef, {
      name: '공지사항',
      type: 'notice',
      createdBy: 'admin',
      createdAt: serverTimestamp(),
      lastMessageTime: serverTimestamp(),
      lastMessage: '프리스타일 탱고 주요 공지사항입니다.'
    });
  }

  // Community Room
  const roomRef = doc(db, ROOMS_COLLECTION, COMMUNITY_ROOM_ID);
  const roomSnap = await getDoc(roomRef);
  if (!roomSnap.exists()) {
    await setDoc(roomRef, {
      name: '프리스타일 수다방',
      type: 'public',
      createdBy: 'admin',
      createdAt: serverTimestamp(),
      lastMessageTime: serverTimestamp(),
      lastMessage: '환영합니다! 자유롭게 대화하세요.'
    });
  } else if (roomSnap.data().name !== '프리스타일 수다방') {
    await updateDoc(roomRef, { name: '프리스타일 수다방' });
  }
};

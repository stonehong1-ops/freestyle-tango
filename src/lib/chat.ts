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
  arrayUnion
} from 'firebase/firestore';
import { db } from './firebase';
import { ChatRoom, ChatMessage } from '@/types/chat';

const ROOMS_COLLECTION = 'chat_rooms';
const MESSAGES_COLLECTION = 'chat_messages';

// Get rooms accessible by user
export const subscribeRooms = (userPhone: string, isAdmin: boolean, callback: (rooms: ChatRoom[]) => void) => {
  const roomsRef = collection(db, ROOMS_COLLECTION);
  
  // If admin, show all. If user, show public + rooms where they are participants
  const q = isAdmin 
    ? query(roomsRef, orderBy('lastMessageTime', 'desc'))
    : query(roomsRef, where('type', '==', 'public'), orderBy('lastMessageTime', 'desc')); // Simple version first
    
  return onSnapshot(q, (snapshot) => {
    const rooms = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatRoom));
    
    // For non-admins, we also need to fetch private/support rooms they are in
    if (!isAdmin) {
      const privateQ = query(roomsRef, where('participants', 'array-contains', userPhone.replace(/[^0-9]/g, '')), orderBy('lastMessageTime', 'desc'));
      getDocs(privateQ).then(privSnapshot => {
        const privateRooms = privSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatRoom));
        const combined = [...rooms, ...privateRooms].sort((a, b) => {
          const timeA = a.lastMessageTime?.toMillis() || 0;
          const timeB = b.lastMessageTime?.toMillis() || 0;
          return timeB - timeA;
        });
        // Remove duplicates if any
        const unique = combined.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
        callback(unique);
      });
    } else {
      callback(rooms);
    }
  });
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
export const sendMessage = async (message: Omit<ChatMessage, 'id' | 'timestamp' | 'readBy'>) => {
  try {
    console.log("Sending Message to Room:", message.roomId, message.text);
    
    // Sanitize message to remove undefined fields which Firestore doesn't like
    const sanitizedMessage = Object.fromEntries(
      Object.entries(message).filter(([_, v]) => v !== undefined)
    );

    const docRef = await addDoc(collection(db, MESSAGES_COLLECTION), {
      ...sanitizedMessage,
      readBy: [message.senderId.replace(/[^0-9]/g, '')], // Normalize sender
      timestamp: serverTimestamp()
    });
    
    // Update last message in room
    const roomRef = doc(db, ROOMS_COLLECTION, message.roomId);
    await updateDoc(roomRef, {
      lastMessage: message.type === 'text' ? message.text : `[${message.type}]`,
      lastMessageTime: serverTimestamp()
    });
    
    console.log("Message Sent Successfully:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error in sendMessage:", error);
    throw error;
  }
};

// Mark message as read
export const markMessageAsRead = async (messageId: string, userPhone: string) => {
  try {
    const messageRef = doc(db, MESSAGES_COLLECTION, messageId);
    const cleanPhone = userPhone.replace(/[^0-9]/g, '');
    await updateDoc(messageRef, {
      readBy: arrayUnion(cleanPhone)
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
      // Remove reaction if same emoji
      const newReactions = { ...currentReactions };
      delete newReactions[cleanPhone];
      await updateDoc(messageRef, { reactions: newReactions });
    } else {
      // Add or Change reaction
      await updateDoc(messageRef, {
        [`reactions.${cleanPhone}`]: emoji
      });
    }
  } catch (error) {
    console.error("Error toggling reaction:", error);
  }
};

// Admin: Create room
export const createChatRoom = async (room: Omit<ChatRoom, 'id' | 'createdAt'>) => {
  const docRef = await addDoc(collection(db, ROOMS_COLLECTION), {
    ...room,
    createdAt: serverTimestamp(),
    lastMessageTime: serverTimestamp()
  });
  return docRef.id;
};

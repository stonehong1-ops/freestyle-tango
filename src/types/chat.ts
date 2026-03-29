import { Timestamp } from 'firebase/firestore';

export type ChatRoomType = 'public' | 'notice' | 'private' | 'support';
export type ChatMessageType = 'text' | 'image' | 'video' | 'youtube';

export interface ChatRoom {
  id: string;
  name: string;
  type: ChatRoomType;
  lastMessage?: string;
  lastMessageTime?: Timestamp;
  participants?: string[]; // Phone numbers (for private/support)
  createdBy: string;
  createdAt: Timestamp;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string; // Phone number
  senderName: string;
  text: string;
  type: ChatMessageType;
  mediaUrl?: string;
  youtubeId?: string;
  replyTo?: string; // ID of the message being replied to
  readBy?: string[]; // Phone numbers of users who have read the message
  reactions?: { [userId: string]: string };
  timestamp: Timestamp;
}

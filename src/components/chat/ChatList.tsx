import React, { useEffect, useState } from 'react';
import styles from './ChatList.module.css';
import { subscribeRooms } from '@/lib/chat';
import { ChatRoom } from '@/types/chat';

interface ChatListProps {
  userPhone: string;
  isAdmin: boolean;
  onSelectRoom: (roomId: string) => void;
}

export default function ChatList({ userPhone, isAdmin, onSelectRoom }: ChatListProps) {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeRooms(userPhone, isAdmin, (updatedRooms) => {
      setRooms(updatedRooms);
    });
    return () => unsubscribe();
  }, [userPhone, isAdmin]);

  const formatTime = (timestamp?: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className={styles.container}>
      <div className={styles.roomList}>
        {rooms.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#8b95a1' }}>
            활성화된 채팅방이 없습니다.
          </div>
        ) : (
          rooms.map((room) => (
            <button 
              key={room.id} 
              className={styles.roomItem}
              onClick={() => onSelectRoom(room.id)}
              data-room-id={room.id}
              data-room-name={room.name}
            >
              <div className={styles.avatar}>
                {room.name.substring(0, 1)}
              </div>
              <div className={styles.roomInfo}>
                <div className={styles.roomTop}>
                  <div className={styles.roomName}>
                    {room.name}
                    <span className={`${styles.typeBadge} ${styles[room.type]}`}>
                      {room.type === 'public' ? '모두공개' : room.type === 'notice' ? '공지' : room.type === 'private' ? '그룹' : '상담'}
                    </span>
                  </div>
                  <div className={styles.time}>{formatTime(room.lastMessageTime)}</div>
                </div>
                <div className={styles.lastMessage}>
                  {room.lastMessage || '새 채팅방이 개설되었습니다.'}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect, useMemo } from 'react';
import { 
  subscribeRooms, 
  searchUsers, 
  getOrCreatePrivateRoom, 
  getParticipantsInfo,
  COMMUNITY_ROOM_ID,
  NOTICE_ROOM_ID,
  initializeSystemRooms,
  maskPhoneNumber,
  resetUnreadCount,
  leaveChatRoom,
  updateChatRoom
} from '@/lib/chat';
import { useLanguage } from '@/contexts/LanguageContext';
import { Language } from '@/locales';
import { formatRelativeTime } from '@/lib/utils';
import useLongPress from '@/hooks/useLongPress';
import FullscreenModal from '@/components/common/FullscreenModal';
import styles from './ChatList.module.css';
import { ChatRoom } from '@/types/chat';

interface ChatListProps {
  userPhone: string;
  isAdmin?: boolean;
  onSelectRoom: (roomId: string, roomName: string, participants?: string[]) => void;
  selectedRoomId?: string;
}

// Split Avatar Component
const SplitAvatar = ({ photos, names, type }: { photos: string[], names: string[], type: string }) => {
  if (type === 'notice') {
    return (
      <div className={styles.avatar}>
        <div className={`${styles.systemIcon} ${styles.notice}`}>📢</div>
      </div>
    );
  }
  if (type === 'public') {
    return (
      <div className={styles.avatar}>
        <div className={`${styles.systemIcon} ${styles.openChat}`}>💬</div>
      </div>
    );
  }

  const validPhotos = photos.filter(p => !!p);
  const displayCount = Math.min(photos.length, 4);

  if (displayCount <= 1) {
    return (
      <div className={styles.avatar}>
        {validPhotos[0] ? (
          <img src={validPhotos[0]} alt="Avatar" />
        ) : (
          <span>{(names[0] || '?')[0]}</span>
        )}
      </div>
    );
  }

  return (
    <div className={styles.avatar}>
      <div className={`${styles.splitAvatar} ${styles['split' + displayCount]}`}>
        {photos.slice(0, 4).map((url, i) => (
          url ? (
            <img key={i} src={url} className={styles.splitAvatarImg} alt="" />
          ) : (
            <div key={i} className={styles.splitAvatarImg} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', color: '#8b95a1' }}>
              {(names[i] || '?')[0]}
            </div>
          )
        ))}
      </div>
    </div>
  );
};

export default function ChatList({ userPhone, isAdmin, onSelectRoom, selectedRoomId }: ChatListProps) {
  const { language } = useLanguage();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<{ nickname: string; phone: string; photoURL?: string; role?: string }[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<{ nickname: string; phone: string }[]>([]);
  const [customRoomName, setCustomRoomName] = useState('');
  const [participantCache, setParticipantCache] = useState<{ [phone: string]: { nickname: string, photoURL?: string } }>({});
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  const cleanUserPhone = userPhone.replace(/[^0-9]/g, '');

  useEffect(() => {
    if (!cleanUserPhone) return;
    initializeSystemRooms();
    const unsubscribe = subscribeRooms(cleanUserPhone, !!isAdmin, (updatedRooms) => {
      setRooms(updatedRooms);
      
      // Fetch missing participant info for cache
      const allParticipants = Array.from(new Set(updatedRooms.flatMap(r => r.participants || [])));
      const missing = allParticipants.filter(p => !participantCache[p]);
      if (missing.length > 0) {
        getParticipantsInfo(missing).then(info => {
          setParticipantCache(prev => ({ ...prev, ...info }));
        });
      }
    });
    return () => unsubscribe();
  }, [cleanUserPhone, isAdmin, participantCache]);

  // Load Search Results
  useEffect(() => {
    if (searchTerm.trim().length > 0) {
      setIsSearching(true);
      searchUsers(searchTerm).then(setSearchResults);
    } else {
      setIsSearching(false);
      setSearchResults([]);
    }
  }, [searchTerm]);

  const toggleUserSelection = (user: { nickname: string; phone: string }) => {
    const isSelected = selectedUsers.some(u => u.phone === user.phone);
    if (isSelected) {
      setSelectedUsers(selectedUsers.filter(u => u.phone !== user.phone));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleCreateRoom = async () => {
    if (selectedUsers.length === 0) return;
    
    const savedUser = JSON.parse(localStorage.getItem('ft_user') || '{}');
    const participants = [
      { nickname: savedUser.nickname || '나', phone: cleanUserPhone },
      ...selectedUsers
    ];

    const roomId = await getOrCreatePrivateRoom(participants, cleanUserPhone, customRoomName);
    const roomName = customRoomName || participants.map(p => p.nickname).join(', ').slice(0, 50);
    onSelectRoom(roomId, roomName, participants.map(p => p.phone));
    setSearchTerm('');
    setSelectedUsers([]);
    setCustomRoomName('');
    setIsSearching(false);
    setIsSearchModalOpen(false);
  };

  const sortedRooms = useMemo(() => {
    const notice = rooms.find(r => r.id === NOTICE_ROOM_ID);
    const open = rooms.find(r => r.id === COMMUNITY_ROOM_ID);
    const others = rooms.filter(r => r.id !== NOTICE_ROOM_ID && r.id !== COMMUNITY_ROOM_ID);
    
    const result: ChatRoom[] = [];
    if (notice) result.push(notice);
    if (open) result.push(open);
    
    // Sort others by time
    const sortedOthers = others.sort((a, b) => {
      const timeA = a.lastMessageTime?.toMillis() || 0;
      const timeB = b.lastMessageTime?.toMillis() || 0;
      return timeB - timeA;
    });
    
    return [...result, ...sortedOthers];
  }, [rooms]);

  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  return (
    <div className={styles.container}>
      <div className={styles.roomList}>
        {sortedRooms.map(room => (
          <RoomItem 
            key={room.id}
            room={room}
            cleanUserPhone={cleanUserPhone}
            selectedRoomId={selectedRoomId}
            language={language}
            participantCache={participantCache}
            onSelectRoom={onSelectRoom}
            activeMenuId={activeMenuId}
            setActiveMenuId={setActiveMenuId}
          />
        ))}
        {sortedRooms.length === 0 && (
          <div className={styles.emptyState}>
            {language === 'ko' ? '진행 중인 채팅이 없습니다.' : 'No active chats.'}
          </div>
        )}
      </div>

      <button 
        className={styles.fab} 
        onClick={() => {
          setIsSearchModalOpen(true);
          setSearchTerm('');
          setIsSearching(true);
          searchUsers('').then(setSearchResults);
        }}
        aria-label="New Chat"
      >
        <span className={styles.fabIcon}>+</span>
      </button>

      <FullscreenModal
        isOpen={isSearchModalOpen}
        onClose={() => {
          setIsSearchModalOpen(false);
          setSearchTerm('');
          setSelectedUsers([]);
        }}
        title={language === 'ko' ? '새로운 대화' : 'New Chat'}
        isBottomSheet={true}
        noPadding={true}
      >
        <div className={styles.searchModalContent}>
          <div className={styles.modalSearchHeader}>
            <div className={styles.searchBarWrapper}>
              <span className={styles.searchIcon}>🔍</span>
              <input 
                className={styles.modalSearchInput}
                placeholder={language === 'ko' ? '대화할 사람 검색...' : 'Search people...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
            </div>

            {selectedUsers.length > 0 && (
              <div className={styles.selectedChips}>
                {selectedUsers.map(user => (
                  <div key={user.phone} className={styles.chip} onClick={() => toggleUserSelection(user)}>
                    <span className={styles.chipText}>{user.nickname}</span>
                    <span className={styles.chipClose}>✕</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className={styles.modalSearchResults}>
            {searchResults.map(user => (
              <div 
                key={user.phone} 
                className={`${styles.searchResultItem} ${selectedUsers.some(u => u.phone === user.phone) ? styles.selected : ''}`}
                onClick={() => toggleUserSelection(user)}
              >
                <div className={styles.checkbox}>
                  {selectedUsers.some(u => u.phone === user.phone) && <span className={styles.checkIcon}>✓</span>}
                </div>
                
                <div className={styles.searchAvatar}>
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="" />
                  ) : (
                    <span>{user.nickname[0]}</span>
                  )}
                </div>

                <div className={styles.searchInfo}>
                  <span className={styles.searchNickname}>{user.nickname}</span>
                  <div className={styles.searchMeta}>
                    <span className={styles.searchRole}>
                      {user.role === 'leader' ? '리더' : (user.role === 'follower' ? '팔로어' : user.role || '회원')}
                    </span>
                    <span className={styles.maskedPhone}>{maskPhoneNumber(user.phone)}</span>
                  </div>
                </div>
              </div>
            ))}
            {searchResults.length === 0 && (
              <div className={styles.noResults}>
                {language === 'ko' ? '검색 결과가 없습니다.' : 'No results found.'}
              </div>
            )}
          </div>

          {(selectedUsers.length > 0) && (
            <div className={styles.modalFooter}>
              {selectedUsers.length >= 2 && (
                <div className={styles.modalGroupSettings}>
                  <input 
                    className={styles.modalRoomNameInput}
                    placeholder={language === 'ko' ? '채팅방 이름 (선택사항)' : 'Room Name (optional)'}
                    value={customRoomName}
                    onChange={(e) => setCustomRoomName(e.target.value)}
                  />
                </div>
              )}
              <button className={styles.modalCreateBtn} onClick={handleCreateRoom}>
                {language === 'ko' ? `${selectedUsers.length}명과 대화 시작` : `Start Chat with ${selectedUsers.length}`}
              </button>
            </div>
          )}
        </div>
      </FullscreenModal>
    </div>
  );
}

// Sub-component to follow Rules of Hooks
interface RoomItemProps {
  room: ChatRoom;
  cleanUserPhone: string;
  selectedRoomId?: string;
  language: Language;
  participantCache: { [phone: string]: { nickname: string, photoURL?: string } };
  onSelectRoom: (roomId: string, roomName: string, participants?: string[]) => void;
  activeMenuId: string | null;
  setActiveMenuId: (id: string | null) => void;
}

const RoomItem = ({ 
  room, 
  cleanUserPhone, 
  selectedRoomId, 
  language, 
  participantCache, 
  onSelectRoom,
  activeMenuId,
  setActiveMenuId
}: RoomItemProps) => {
  const isNotice = room.id === NOTICE_ROOM_ID;
  const isPublic = room.id === COMMUNITY_ROOM_ID;
  
  const unread = room.lastMessageTime && 
                 room.lastMessageSenderId !== cleanUserPhone && 
                 !room.lastMessageReadBy?.includes(cleanUserPhone);
                 
  const timeStr = room.lastMessageTime ? formatRelativeTime(room.lastMessageTime.toDate(), language) : '';
  
  const others = (room.participants || []).filter(p => p !== cleanUserPhone);
  const pInfo = others.map(p => participantCache[p] || { nickname: p, photoURL: undefined });
  const photos = pInfo.map(i => i.photoURL || '');
  const names = pInfo.map(i => i.nickname);

  let displayName = room.customName || room.name;
  if (!room.customName && room.type === 'private' && others.length > 0) {
    displayName = names.join(', ');
  }

  const handleRoomClick = () => {
    if (activeMenuId) {
      setActiveMenuId(null);
      return;
    }
    onSelectRoom(room.id, displayName, room.participants);
    resetUnreadCount(room.id, cleanUserPhone);
  };

  const handleLongPress = () => {
    if (!isNotice && !isPublic) {
      setActiveMenuId(room.id);
      if (window.navigator.vibrate) window.navigator.vibrate(50);
    }
  };

  const longPressProps = useLongPress({
    onLongPress: handleLongPress,
    onClick: handleRoomClick,
    threshold: 500
  });

  return (
    <div key={room.id} className={styles.roomItemWrapper}>
      <button 
        className={`${styles.roomItem} ${selectedRoomId === room.id ? styles.activeRoom : ''}`}
        {...longPressProps}
      >
        <SplitAvatar photos={photos} names={names} type={room.type} />
        
        <div className={styles.roomInfo}>
          <div className={styles.roomTop}>
            <span className={styles.roomName}>
              {displayName}
              {isNotice && <span className={styles.noticeBadge}>NOTICE</span>}
            </span>
            <span className={styles.time}>{timeStr}</span>
          </div>
          <div className={styles.roomBottom}>
             <div className={styles.lastMessage}>
               {room.lastMessageSenderId && room.lastMessageSenderId !== cleanUserPhone && (
                 <span className={styles.lastSenderName}>
                   {participantCache[room.lastMessageSenderId]?.nickname || '...'} : 
                 </span>
               )}
               {room.lastMessage?.startsWith('[REPLY]') ? '↩️ ' : ''}
               {room.lastMessage?.replace('[REPLY]', '')}
             </div>
             {room.unreadCounts?.[cleanUserPhone] ? (
               <div className={styles.unreadBadge}>{room.unreadCounts[cleanUserPhone]}</div>
             ) : (
               unread && <div className={styles.unreadBadge}>N</div>
             )}
          </div>
        </div>
      </button>

      {activeMenuId === room.id && (
        <div className={styles.contextMenuOverlay} onClick={() => setActiveMenuId(null)}>
          <div className={styles.contextMenu} onClick={e => e.stopPropagation()}>
            <div className={styles.menuHeader}>{displayName}</div>
            <button 
              className={styles.menuItem}
              onClick={() => {
                const newName = prompt(language === 'ko' ? '방 이름 변경:' : 'Rename Room:', displayName);
                if (newName) updateChatRoom(room.id, { customName: newName });
                setActiveMenuId(null);
              }}
            >
              ✏️ {language === 'ko' ? '이름 변경' : 'Rename'}
            </button>
            <button 
              className={`${styles.menuItem} ${styles.danger}`}
              onClick={() => {
                if (confirm(language === 'ko' ? '방을 나가시겠습니까?' : 'Leave Room?')) {
                  leaveChatRoom(room.id, cleanUserPhone);
                }
                setActiveMenuId(null);
              }}
            >
              🚪 {language === 'ko' ? '대화방 나가기' : 'Leave Room'}
            </button>
            <button className={styles.menuClose} onClick={() => setActiveMenuId(null)}>
              {language === 'ko' ? '닫기' : 'Close'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

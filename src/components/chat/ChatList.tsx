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
import { getClasses, getRegistrations, TangoClass, Registration, toggleUserPinnedRoom } from '@/lib/db';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { useLanguage } from '@/contexts/LanguageContext';
import { Language } from '@/locales';
import { formatRelativeTime } from '@/lib/utils';
import { hasRole } from '@/utils/auth';
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
  const [classes, setClasses] = useState<TangoClass[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [pinnedRoomIds, setPinnedRoomIds] = useState<string[]>([]);

  const cleanUserPhone = userPhone.replace(/[^0-9]/g, '');

  useEffect(() => {
    if (!cleanUserPhone) return;
    const userRef = doc(db, 'users', cleanUserPhone);
    const unsubUser = onSnapshot(userRef, (snap) => {
      if (snap.exists()) {
        const userData = snap.data();
        setPinnedRoomIds(userData.settings?.pinnedRooms || []);
      }
    });
    return () => unsubUser();
  }, [cleanUserPhone]);

  useEffect(() => {
    if (!cleanUserPhone) return;
    initializeSystemRooms();
    const unsubscribe = subscribeRooms(cleanUserPhone, !!isAdmin, pinnedRoomIds, (updatedRooms) => {
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
  }, [cleanUserPhone, isAdmin, pinnedRoomIds]);

  useEffect(() => {
    if (isAdmin) {
      getClasses().then(setClasses);
      getRegistrations().then(setRegistrations);
    }
  }, [isAdmin]);

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
    const suda = rooms.find(r => r.id === COMMUNITY_ROOM_ID);
    const others = rooms.filter(r => r.id !== NOTICE_ROOM_ID && r.id !== COMMUNITY_ROOM_ID);
    
    // Split others into pinned and unpinned, then sort by time
    const pinned = others.filter(r => pinnedRoomIds.includes(r.id));
    const unpinned = others.filter(r => !pinnedRoomIds.includes(r.id));

    const result: ChatRoom[] = [];
    if (notice) result.push(notice);
    if (suda) result.push(suda);
    
    // Sort subgroups by time
    const sortByTime = (a: ChatRoom, b: ChatRoom) => (b.lastMessageTime?.toMillis() || 0) - (a.lastMessageTime?.toMillis() || 0);

    return [...result, ...pinned.sort(sortByTime), ...unpinned.sort(sortByTime)];
  }, [rooms, pinnedRoomIds]);

  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const isRoomPinned = (id: string) => pinnedRoomIds.includes(id);

  return (
    <div className={styles.container}>


      <div className={styles.roomList}>
        {sortedRooms.map((room) => (
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
            isPinned={isRoomPinned(room.id)}
          />
        ))}
      </div>

      {activeMenuId && (
        <RoomMenu 
          roomId={activeMenuId} 
          rooms={rooms}
          cleanUserPhone={cleanUserPhone} 
          language={language}
          setActiveMenuId={setActiveMenuId}
          pinnedRoomIds={pinnedRoomIds}
        />
      )}
        {sortedRooms.length === 0 && (
          <div className={styles.emptyState}>
            {language === 'ko' ? '진행 중인 채팅이 없습니다.' : 'No active chats.'}
          </div>
        )}

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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className={styles.searchNickname}>{user.nickname}</span>
                    {hasRole(user, 'instructor') && (
                      <span style={{ 
                        border: '1px solid #b2dfdb'
                      }}>INSTRUCTOR</span>
                    )}
                    {hasRole(user, 'staff') && (
                      <span style={{ 
                        padding: '1px 6px', borderRadius: '4px', fontSize: '0.6rem', 
                        background: '#e8f3ff', color: '#3182f6', fontWeight: 800,
                        border: '1px solid #cce5ff'
                      }}>STAFF</span>
                    )}
                  </div>
                  <div className={styles.searchMeta}>
                    <div className={styles.searchUserLabels}>
                      {hasRole(user, 'instructor') ? (
                        <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 text-[10px] font-bold rounded ring-1 ring-inset ring-orange-200">
                          INSTRUCTOR
                        </span>
                      ) : hasRole(user, 'staff') ? (
                        <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded ring-1 ring-inset ring-blue-200">
                          STAFF
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-gray-400">
                          {user.role === 'leader' ? 'LEADER' : (user.role === 'follower' ? 'FOLLOWER' : '')}
                        </span>
                      )}
                    </div>
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
  isAdmin?: boolean;
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
  setActiveMenuId,
  isPinned
}: RoomItemProps & { isPinned: boolean }) => {
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
    <div 
      className={`${styles.roomItem} ${selectedRoomId === room.id ? styles.activeRoom : ''}`}
      {...longPressProps}
    >
        <SplitAvatar photos={photos} names={names} type={room.type} />
        
        <div className={styles.roomInfo}>
          <div className={styles.roomTop}>
            <span className={styles.roomName}>
              {displayName}
              {isNotice && <span className={styles.noticeBadge}>NOTICE</span>}
              {isPinned && <span className={styles.pinnedIcon} title="고정됨">📌</span>}
            </span>
            <span className={styles.time}>{timeStr}</span>
          </div>
          <div className={styles.roomBottom}>
             <div className={styles.lastMessageContainer}>
               <div className={styles.lastMessage}>
                 {room.lastMessageSenderId && room.lastMessageSenderId !== cleanUserPhone && (
                   <span className={styles.lastSenderName}>
                     {participantCache[room.lastMessageSenderId]?.nickname || '...'} : 
                   </span>
                 )}
                 {room.lastMessage?.startsWith('[REPLY]') ? '↩️ ' : ''}
                 {room.lastMessage?.replace('[REPLY]', '')}
               </div>
             </div>
             <div className={styles.badgeContainer}>
               {room.unreadCounts?.[cleanUserPhone] ? (
                 <div className={styles.unreadBadge}>{room.unreadCounts[cleanUserPhone]}</div>
               ) : (
                 unread && <div className={styles.unreadBadge}>N</div>
               )}
               {!isNotice && !isPublic && (
                  <div 
                    className={styles.moreButton} 
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuId(room.id);
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    onMouseUp={(e) => e.stopPropagation()}
                    onTouchEnd={(e) => e.stopPropagation()}
                  >
                    ⋮
                  </div>
               )}
             </div>
          </div>
        </div>
    </div>
  );
};

const RoomMenu = ({ roomId, rooms, cleanUserPhone, language, setActiveMenuId, pinnedRoomIds }: { 
  roomId: string, 
  rooms: ChatRoom[], 
  cleanUserPhone: string, 
  language: Language,
  setActiveMenuId: (id: string | null) => void,
  pinnedRoomIds: string[]
}) => {
  const room = rooms.find(r => r.id === roomId);
  const isPinned = pinnedRoomIds.includes(roomId);
  if (!room) return null;

  const displayName = room.customName || room.name;

  return (
    <>
      <div className={styles.menuOverlay} onClick={() => setActiveMenuId(null)} />
      <div className={styles.bottomSheet} onClick={e => e.stopPropagation()}>
        <div className={styles.sheetHandle} />
        <div className={styles.menuHeader}>{displayName}</div>
        
        <div className={styles.menuActionList}>
          <button 
            className={styles.menuItem}
            onClick={async () => {
              await toggleUserPinnedRoom(cleanUserPhone, room.id, !isPinned);
              setActiveMenuId(null);
            }}
          >
            <div className={styles.menuIconWrapper}>
              {isPinned ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
               ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
               )}
            </div>
            {isPinned 
              ? (language === 'ko' ? '최상위 고정 해제' : 'Unpin from Top') 
              : (language === 'ko' ? '최상위 고정' : 'Pin to Top')}
          </button>

          <button 
            className={styles.menuItem}
            onClick={() => {
              const newName = prompt(language === 'ko' ? '방 이름 변경:' : 'Rename Room:', displayName);
              if (newName) updateChatRoom(room.id, { customName: newName });
              setActiveMenuId(null);
            }}
          >
            <div className={styles.menuIconWrapper}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </div>
            {language === 'ko' ? '방 이름 변경' : 'Rename Room'}
          </button>
          
          <button 
            className={`${styles.menuItem} ${styles.dangerItem}`}
            onClick={() => {
              if (confirm(language === 'ko' ? '방을 나가시겠습니까?' : 'Leave Room?')) {
                leaveChatRoom(room.id, cleanUserPhone);
              }
              setActiveMenuId(null);
            }}
          >
            <div className={styles.menuIconWrapper}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </div>
            {language === 'ko' ? '대화방 나가기' : 'Leave Room'}
          </button>
        </div>
        
        <button 
          className={styles.menuClose} 
          onClick={() => setActiveMenuId(null)} 
          style={{ marginTop: '12px', background: '#f2f4f6', border: 'none', borderRadius: '12px', padding: '14px', fontWeight: '600', color: '#8b95a1', width: '100%' }}
        >
          {language === 'ko' ? '닫기' : 'Close'}
        </button>
      </div>
    </>
  );
};

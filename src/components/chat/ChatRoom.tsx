import React, { useEffect, useState, useRef } from 'react';
import { 
  subscribeMessages, 
  sendMessage, 
  markMessageAsRead,
  toggleReaction,
  getParticipantsInfo,
  subscribeParticipantsInfo,
  inviteUserToChatRoom,
  searchUsers,
  maskPhoneNumber,
  COMMUNITY_ROOM_ID,
  NOTICE_ROOM_ID
} from '@/lib/chat';
import { formatRelativeTime } from '@/lib/utils';
import { ChatMessage, ChatMessageType } from '@/types/chat';
import { useLanguage } from '@/contexts/LanguageContext';
import { uploadFile } from '@/lib/storage';
import styles from './ChatRoom.module.css';
import { useModalHistory } from '@/hooks/useModalHistory';
import VoiceBubble from './VoiceBubble';
import ImageViewer from '@/components/common/ImageViewer';

interface ChatRoomProps {
  roomId: string;
  roomName: string;
  user: {
    nickname: string;
    phone: string;
    photoURL?: string;
  };
  participants?: string[];
  isAdmin?: boolean;
  onBack: () => void;
  hideHeader?: boolean;
  onImageClick?: (src: string) => void;
}

export default function ChatRoom({ roomId, roomName, user, participants, isAdmin, onBack, hideHeader, onImageClick }: ChatRoomProps) {
  const { language } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [menuMsgId, setMenuMsgId] = useState<string | null>(null);
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editText, setEditText] = useState('');
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [selectedViewerImage, setSelectedViewerImage] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showMembers, setShowMembers] = useState(false);
  const [memberInfo, setMemberInfo] = useState<Record<string, any>>({});
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentParticipants, setCurrentParticipants] = useState<string[]>(participants || []);
  
  // Invitation states
  const [isInviting, setIsInviting] = useState(false);
  const [inviteSearchTerm, setInviteSearchTerm] = useState('');
  const [inviteSearchResults, setInviteSearchResults] = useState<{ nickname: string; phone: string; photoURL?: string }[]>([]);

  
  // Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const cleanUserPhone = user.phone.replace(/[^0-9]/g, '');
  const REACTION_EMOJIS = ['👍', '❤️', '🥰', '😂', '😮', '😢', '😡'];
  const isSystemRoom = roomId === COMMUNITY_ROOM_ID || roomId === NOTICE_ROOM_ID;
  const isPublicRoom = roomId === COMMUNITY_ROOM_ID || roomId === NOTICE_ROOM_ID; // Added for read count logic

  // Long-press detection
  const pressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartPosRef = useRef<{ x: number, y: number } | null>(null);

  const handlePressStart = (msgId: string, e?: React.TouchEvent | React.MouseEvent) => {
    if (e && 'touches' in e) {
      touchStartPosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    pressTimerRef.current = setTimeout(() => {
      setMenuMsgId(msgId);
    }, 500); // 0.5s for long press
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartPosRef.current || !pressTimerRef.current) return;
    const touch = e.touches[0];
    const dx = Math.abs(touch.clientX - touchStartPosRef.current.x);
    const dy = Math.abs(touch.clientY - touchStartPosRef.current.y);
    if (dx > 10 || dy > 10) {
      if (pressTimerRef.current) {
        clearTimeout(pressTimerRef.current);
        pressTimerRef.current = null;
      }
    }
  }

  const handlePressEnd = () => {
    touchStartPosRef.current = null;
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
  };

  useEffect(() => {
    if (participants) {
      setCurrentParticipants(participants);
    }
  }, [participants]);

  useEffect(() => {
    const unsubscribe = subscribeMessages(roomId, (newMessages) => {
      setMessages(newMessages);
      
      // Batch update messages as read
      const unreadMsgIds = newMessages
        .filter(msg => !msg.readBy?.includes(cleanUserPhone))
        .map(msg => msg.id);

      if (unreadMsgIds.length > 0) {
        unreadMsgIds.forEach(id => {
          markMessageAsRead(roomId, id, cleanUserPhone);
        });
      }
    });

    // Subscribe to participant info for real-time status and photos
    let unsubscribeParticipants = () => {};
    if (currentParticipants && currentParticipants.length > 0) {
      unsubscribeParticipants = subscribeParticipantsInfo(currentParticipants, (info) => {
        setMemberInfo(info);
      });
    }

    // Timer to refresh relative times
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => {
      unsubscribe();
      unsubscribeParticipants();
      clearInterval(timer);
    };
  }, [roomId, cleanUserPhone, currentParticipants]);

  // Search users for invitation
  useEffect(() => {
    if (inviteSearchTerm.trim()) {
      searchUsers(inviteSearchTerm).then(results => {
        // Filter out already participants
        const filtered = results.filter(u => !currentParticipants.map(p => p.replace(/[^0-9]/g, '')).includes(u.phone));
        setInviteSearchResults(filtered);
      });
    } else {
      setInviteSearchResults([]);
    }
  }, [inviteSearchTerm, currentParticipants]);
  
  useEffect(() => {
    const handleOpenMembersEvent = () => setShowMembers(true);
    window.addEventListener('open_chat_members', handleOpenMembersEvent);
    return () => window.removeEventListener('open_chat_members', handleOpenMembersEvent);
  }, []);

  useModalHistory(showMembers, () => setShowMembers(false), 'members');
  useModalHistory(menuMsgId !== null, () => setMenuMsgId(null), 'message-menu');
  useModalHistory(showEditModal, () => setShowEditModal(false), 'edit-message');
  useModalHistory(selectedViewerImage !== null, () => setSelectedViewerImage(null), 'image-viewer');

  const handleOpenMembers = () => {
    setShowMembers(true);
  };

  const handleCloseMembers = () => {
    setShowMembers(false);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const scrollToMessage = (msgId: string) => {
    const element = document.getElementById(`msg-${msgId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Add temporary highlight
      element.classList.add(styles.highlight);
      setTimeout(() => {
        element.classList.remove(styles.highlight);
      }, 2000);
    }
  };

  const isConsecutive = (idx: number) => {
    if (idx === 0) return false;
    const prev = messages[idx - 1];
    const curr = messages[idx];
    return prev.senderId === curr.senderId && 
           (curr.timestamp?.toMillis() - prev.timestamp?.toMillis() < 300000);
  };

  const isLastInGroup = (idx: number) => {
    if (idx === messages.length - 1) return true;
    const curr = messages[idx];
    const next = messages[idx + 1];
    return curr.senderId !== next.senderId ||
           (next.timestamp?.toMillis() - curr.timestamp?.toMillis() > 300000);
  };

  const shouldShowDate = (idx: number) => {
    if (idx === 0) return true;
    const prevDate = messages[idx - 1].timestamp?.toDate().toDateString();
    const currDate = messages[idx].timestamp?.toDate().toDateString();
    return prevDate !== currDate;
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    if (roomId === NOTICE_ROOM_ID && !isAdmin) {
      alert(language === 'ko' ? '공지방에는 관리자만 메시지를 보낼 수 있습니다.' : 'Only admins can send messages in the notice room.');
      return;
    }

    const text = inputText;
    setInputText('');
    await sendMessage({
      roomId,
      senderId: cleanUserPhone,
      senderName: user.nickname || 'Guest',
      text,
      type: 'text',
      replyTo: replyTo?.id
    }, { name: roomName, participants });
    setReplyTo(null);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        if (audioBlob.size < 100) return; // Too short

        setIsUploading(true);
        try {
          const fileName = `voice_${Date.now()}.webm`;
          const path = `chat/${roomId}/voice/${fileName}`;
          const url = await uploadFile(audioBlob, path);

          await sendMessage({
            roomId,
            senderId: cleanUserPhone,
            senderName: user.nickname || 'Guest',
            text: 'Sent a voice message',
            type: 'voice',
            mediaUrl: url,
            replyTo: replyTo?.id
          }, { name: roomName, participants });
          setReplyTo(null);
        } catch (err) {
          console.error("Voice Upload Error:", err);
        } finally {
          setIsUploading(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Mic Error:", err);
      alert(language === 'ko' ? '마이크 권한이 필요합니다.' : 'Microphone permission is required.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleFileClick = () => fileInputRef.current?.click();

  const uploadAndSendMedia = async (file: File | Blob, customFileName?: string) => {
    if (roomId === NOTICE_ROOM_ID && !isAdmin) {
      alert(language === 'ko' ? '공지방에는 관리자만 파일을 업로드할 수 있습니다.' : 'Only admins can upload files in the notice room.');
      return;
    }

    setIsUploading(true);
    try {
      const fileType: ChatMessageType = file.type.startsWith('video/') ? 'video' : 'image';
      const fileName = customFileName || (file instanceof File ? file.name : `${Date.now()}.png`);
      const path = `chat/${roomId}/${Date.now()}_${fileName}`;
      
      const url = await uploadFile(file, path);

      await sendMessage({
        roomId,
        senderId: cleanUserPhone,
        senderName: user.nickname || 'Guest',
        text: fileType === 'image' ? (language === 'ko' ? '사진을 보냈습니다' : 'Sent a photo') : (language === 'ko' ? '동영상을 보냈습니다' : 'Sent a video'),
        type: fileType,
        mediaUrl: url,
        replyTo: replyTo?.id
      }, { name: roomName, participants });
      setReplyTo(null);
    } catch (err: any) {
      console.error("Upload Error:", err);
      alert(err.message || (language === 'ko' ? '업로드 실패' : 'Upload failed'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadAndSendMedia(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        if (blob) {
          e.preventDefault();
          await uploadAndSendMedia(blob, `pasted_image_${Date.now()}.png`);
        }
      }
    }
  };

  const handleReaction = (msgId: string, emoji: string) => {
    toggleReaction(msgId, cleanUserPhone, emoji);
    setMenuMsgId(null);
  };

  const handleReply = (msg: ChatMessage) => {
    setReplyTo(msg);
    setMenuMsgId(null);
  };

  const handleDownload = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `ft_media_${Date.now()}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      // Fallback: Open in new tab if blob failed
      window.open(url, '_blank');
    }
    setMenuMsgId(null);
  };

  const handleShare = async (msg: ChatMessage) => {
    const shareData = {
      title: 'Freestyle Tango Chat',
      text: msg.text || 'Check out this media from Freestyle Tango',
      url: msg.mediaUrl || window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log("Share failed:", err);
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(msg.mediaUrl || msg.text || '');
      alert(language === 'ko' ? '링크가 클립보드에 복사되었습니다.' : 'Link copied to clipboard.');
    }
    setMenuMsgId(null);
  };

  const handleEdit = (msg: ChatMessage) => {
    setEditingMsgId(msg.id);
    setEditText(msg.text);
    setShowEditModal(true);
    setMenuMsgId(null);
  };

  const handleSaveEdit = async () => {
    if (!editingMsgId || !editText.trim()) return;
    try {
      const { updateChatMessage } = await import('@/lib/chat');
      await updateChatMessage(editingMsgId, { text: editText });
      setEditingMsgId(null);
      setShowEditModal(false);
      setEditText('');
    } catch (err) {
      console.error("Failed to edit message:", err);
    }
  };

  const handleDelete = async (messageId: string) => {
    if (!window.confirm(language === 'ko' ? '메시지를 삭제하시겠습니까?' : 'Delete message?')) return;
    try {
      const { updateChatMessage } = await import('@/lib/chat');
      await updateChatMessage(messageId, { 
        text: '삭제된 메세지입니다',
        isDeleted: true,
        mediaUrl: '',
        type: 'text'
      });
      setMenuMsgId(null);
    } catch (err) {
      console.error("Failed to delete message:", err);
    }
  };

  const handleInvite = async (targetUser: { nickname: string; phone: string }) => {
    try {
      await inviteUserToChatRoom(roomId, targetUser, user.nickname);
      setCurrentParticipants(prev => [...prev, targetUser.phone.replace(/[^0-9]/g, '')]);
      setIsInviting(false);
      setInviteSearchTerm('');
      alert(language === 'ko' ? `${targetUser.nickname}님을 초대했습니다.` : `Invited ${targetUser.nickname}`);
    } catch (err) {
      alert(language === 'ko' ? '초대에 실패했습니다.' : 'Failed to invite');
    }
  };

  const getPlaceholderColor = (name: string) => {
    const colors = [
      styles.placeholderColor1, styles.placeholderColor2, styles.placeholderColor3,
      styles.placeholderColor4, styles.placeholderColor5, styles.placeholderColor6,
      styles.placeholderColor7, styles.placeholderColor8
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const renderMessageText = (text: string) => {
    if (!text) return null;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    
    return parts.map((part, i) => {
      if (part.match(urlRegex)) {
        return (
          <a 
            key={i} 
            href={part} 
            target="_blank" 
            rel="noopener noreferrer" 
            className={styles.chatLink}
            onClick={(e) => e.stopPropagation()}
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  return (
    <div className={styles.container}>
      {!hideHeader && (
        <div className={styles.header}>
          <button className={styles.backBtn} onClick={onBack}>
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          
          <div className={styles.headerInfo}>
            {participants && participants.length === 2 ? (
              // 1:1 Direct Message Header
              (() => {
                const otherPhone = participants.find(p => p.replace(/[^0-9]/g, '') !== cleanUserPhone);
                const other = otherPhone ? memberInfo[otherPhone.replace(/[^0-9]/g, '')] : null;
                const name = other?.nickname || roomName;
                return (
                  <>
                    <div className={styles.avatarWrapper}>
                      {other?.photoURL ? (
                        <img 
                          src={other.photoURL} 
                          alt="Profile" 
                          className={styles.headerAvatar} 
                          onClick={() => setSelectedViewerImage(other.photoURL!)}
                          style={{ cursor: 'pointer' }}
                        />
                      ) : (
                        <div className={`${styles.headerAvatarPlaceholder} ${getPlaceholderColor(name)}`}>
                          {name.charAt(0)}
                        </div>
                      )}
                      <div className={styles.statusDot} />
                    </div>
                    <div className={styles.headerText}>
                      <div className={styles.headerName}>
                        {name}
                      </div>
                      <div className={styles.headerStatus}>
                        {other?.lastVisit ? (
                          `${language === 'ko' ? '활동 ' : 'Active '}${formatRelativeTime(other.lastVisit.toDate(), language)}`
                        ) : (
                          language === 'ko' ? '오프라인' : 'Offline'
                        )}
                      </div>
                    </div>
                  </>
                );
              })()
            ) : (
              // Group/Public Chat Header
              <>
                {roomId === NOTICE_ROOM_ID ? (
                  <div className={`${styles.systemIconHeader} ${styles.notice}`}>📢</div>
                ) : roomId === COMMUNITY_ROOM_ID ? (
                  <div className={`${styles.systemIconHeader} ${styles.openChat}`}>💬</div>
                ) : (
                  <div className={styles.stackedAvatars}>
                    {participants && participants.length > 0 ? (
                      participants.slice(0, 3).map((phone, idx) => {
                        const info = memberInfo[phone.replace(/[^0-9]/g, '')];
                        const name = info?.nickname || '?';
                        return info?.photoURL ? (
                          <img 
                            key={phone} 
                            src={info.photoURL} 
                            alt={name}
                            className={styles.stackedAvatar}
                            style={{ zIndex: 3 - idx, left: `${idx * 16}px` }}
                          />
                        ) : (
                          <div 
                            key={phone}
                            className={`${styles.stackedAvatarPlaceholder} ${getPlaceholderColor(name)}`}
                            style={{ zIndex: 3 - idx, left: `${idx * 16}px` }}
                          >
                            {name.charAt(0)}
                          </div>
                        );
                      })
                    ) : (
                      <div className={`${styles.stackedAvatarPlaceholder} ${styles.placeholderColor8}`}>
                        {roomName.charAt(0)}
                      </div>
                    )}
                    {participants && participants.length > 3 && (
                      <div className={styles.avatarCount}>+{participants.length - 3}</div>
                    )}
                  </div>
                )}
                <div className={styles.headerText}>
                  <div className={styles.headerName}>
                    {roomName}
                    {roomId === NOTICE_ROOM_ID && <span className={styles.officialBadge}>OFFICIAL</span>}
                  </div>
                  <div className={styles.headerStatus}>
                    {roomId === NOTICE_ROOM_ID ? (language === 'ko' ? '공식 공지 채널' : 'Official Notice') : 
                     roomId === COMMUNITY_ROOM_ID ? (language === 'ko' ? '오픈 채팅' : 'Public Chat') : 
                     `${participants?.length || 0} members`}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className={styles.headerActions}>
            {participants && participants.length === 2 && participants.find(p => p !== cleanUserPhone) && (
              <a 
                href={`tel:${participants.find(p => p !== cleanUserPhone)}`} 
                className={styles.actionBtn}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
              </a>
            )}
            {(!participants || participants.length > 2) && (
              <button className={styles.actionBtn} onClick={handleOpenMembers}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </button>
            )}
          </div>
        </div>
      )}

      <div className={styles.messageList} ref={scrollRef}>
        {messages.map((msg, idx) => {
          const isOwn = msg.senderId === cleanUserPhone;
          const showAvatar = !isOwn && !isConsecutive(idx);
          const showSender = !isOwn && !isConsecutive(idx);
          const showTime = isLastInGroup(idx);
          const showDate = shouldShowDate(idx);

          if (msg.type === 'system') {
            return (
              <div key={msg.id} className={styles.systemMessage}>
                {msg.text}
              </div>
            );
          }

          return (
            <React.Fragment key={msg.id}>
              {showDate && (
                <div className={styles.dateSeparator}>
                  <span>{msg.timestamp?.toDate().toLocaleDateString(language === 'ko' ? 'ko-KR' : 'en-US', {
                    year: 'numeric', month: 'long', day: 'numeric', weekday: 'short'
                  })}</span>
                </div>
              )}
              <div className={`${styles.messageWrapper} ${isOwn ? styles.own : styles.other} ${isConsecutive(idx) ? styles.consecutive : ''}`}>
                {!isOwn && (
                  <div className={styles.avatarImgWrapper}>
                    {memberInfo[msg.senderId.replace(/[^0-9]/g, '')]?.photoURL ? (
                      <img 
                        src={memberInfo[msg.senderId.replace(/[^0-9]/g, '')].photoURL} 
                        className={styles.msgAvatar} 
                        alt="" 
                        onClick={() => setSelectedViewerImage(memberInfo[msg.senderId.replace(/[^0-9]/g, '')].photoURL)}
                        style={{ cursor: 'pointer' }}
                      />
                    ) : (
                      <div className={styles.msgAvatarPlaceholder}>
                        {msg.senderName[0]}
                      </div>
                    )}
                  </div>
                )}
                <div className={styles.messageContent}>
                  {showSender && <div className={styles.senderName}>{msg.senderName}</div>}
                  <div className={styles.bubbleRow}>
                    <div 
                      id={`msg-${msg.id}`}
                      className={styles.bubble} 
                      onContextMenu={(e) => {
                        e.preventDefault();
                        setMenuMsgId(msg.id);
                      }}
                      onMouseDown={() => handlePressStart(msg.id)}
                      onMouseUp={handlePressEnd}
                      onMouseLeave={handlePressEnd}
                      onTouchStart={(e) => handlePressStart(msg.id, e)}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handlePressEnd}
                    >
                      {msg.replyTo && (
                        <div 
                          className={styles.replyPreview}
                          onClick={(e) => {
                            e.stopPropagation();
                            scrollToMessage(msg.replyTo!);
                          }}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className={styles.replySender}>
                            {messages.find(m => m.id === msg.replyTo)?.senderName}
                          </div>
                          <div className={styles.replyText}>
                            {renderMessageText(messages.find(m => m.id === msg.replyTo)?.text || '')}
                          </div>
                        </div>
                      )}
                      
                      {msg.type === 'image' ? (
                        <div className={styles.mediaMessage}>
                          <img 
                            src={msg.mediaUrl} 
                            className={styles.chatImage}
                            alt="chat" 
                            onClick={() => setSelectedViewerImage(msg.mediaUrl!)}
                            style={{ cursor: 'pointer' }}
                          />
                        </div>
                      ) : msg.type === 'video' ? (
                        <div className={styles.mediaMessage}>
                          <video src={msg.mediaUrl} controls />
                        </div>
                      ) : msg.type === 'voice' ? (
                        <VoiceBubble 
                          url={msg.mediaUrl!} 
                          isOwn={isOwn} 
                          timestamp={formatTime(msg.timestamp)}
                        />
                      ) : (
                          <p className={msg.isDeleted ? styles.deletedMsg : ''}>
                            {renderMessageText(msg.text)}
                          </p>
                      )}

                      {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                        <div className={styles.reactionPills}>
                          {Object.entries(
                            Object.values(msg.reactions).reduce((acc: any, emoji: string) => {
                              acc[emoji] = (acc[emoji] || 0) + 1;
                              return acc;
                            }, {})
                          ).map(([emoji, count]: [any, any]) => (
                            <span key={emoji} className={styles.reactionPill}>
                              {emoji} {count > 1 && <span className={styles.reactionCount}>{count}</span>}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className={styles.msgStatus}>
                      {!isPublicRoom && currentParticipants.length > 0 && (currentParticipants.length - (msg.readBy?.length || 0)) > 0 && (
                        <span className={styles.unreadCount}>{currentParticipants.length - (msg.readBy?.length || 0)}</span>
                      )}
                      {showTime && <span className={styles.time}>{formatTime(msg.timestamp)}</span>}
                    </div>
                  </div>

                  {menuMsgId === msg.id && (
                    <>
                      <div className={styles.menuOverlay} onClick={() => setMenuMsgId(null)} />
                      <div className={styles.bottomSheet}>
                        <div className={styles.sheetHandle} />
                        <div className={styles.reactionHeader}>
                          {REACTION_EMOJIS.map(emoji => (
                            <button 
                              key={emoji} 
                              className={styles.emojiBtn} 
                              onClick={() => handleReaction(msg.id, emoji)}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                        
                        <div className={styles.menuActionList}>
                          {!msg.isDeleted && (
                            <button className={styles.menuItem} onClick={() => handleReply(msg)}>
                              <span className={styles.menuIcon}>↩️</span>
                              {language === 'ko' ? '답장' : 'Reply'}
                            </button>
                          )}
                          
                          {isOwn && !msg.isDeleted && (
                            <>
                              {msg.type === 'text' && (
                                <button className={styles.menuItem} onClick={() => handleEdit(msg)}>
                                  <span className={styles.menuIcon}>📝</span>
                                  {language === 'ko' ? '수정' : 'Edit'}
                                </button>
                              )}
                              <button className={`${styles.menuItem} ${styles.deleteItem}`} onClick={() => handleDelete(msg.id)}>
                                <span className={styles.menuIcon}>🗑️</span>
                                {language === 'ko' ? '삭제' : 'Delete'}
                              </button>
                            </>
                          )}

                          {!msg.isDeleted && (msg.type === 'image' || msg.type === 'video') && (
                            <>
                              <button className={styles.menuItem} onClick={() => handleDownload(msg.mediaUrl!)}>
                                <span className={styles.menuIcon}>📥</span>
                                {language === 'ko' ? '저장' : 'Save'}
                              </button>
                              <button className={styles.menuItem} onClick={() => handleShare(msg)}>
                                <span className={styles.menuIcon}>🔗</span>
                                {language === 'ko' ? '공유' : 'Share'}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {replyTo && (
        <div className={styles.replyBar}>
          <div className={styles.replyInfo}>
            <div className={styles.replySender}>{replyTo.senderName}</div>
            <div className={styles.replyText}>{renderMessageText(replyTo.text)}</div>
          </div>
          <button onClick={() => setReplyTo(null)}>×</button>
        </div>
      )}

      {(!isAdmin && roomId === NOTICE_ROOM_ID) ? (
        <div className={styles.noticeOnlyBar}>
          {language === 'ko' ? '📢 공지사항 전용 채널입니다.' : '📢 Notice-only channel.'}
        </div>
      ) : (
        <div className={styles.inputContainer}>
          {isRecording ? (
            <div className={styles.recordingBar}>
              <div className={styles.recordingStatus}>
                <div className={styles.recordingDot} />
                <span className={styles.recordingTime}>{formatDuration(recordingDuration)}</span>
              </div>
              <div className={styles.recordingWaveform}>
                <div className={styles.mockWave} />
                <div className={styles.mockWave} />
                <div className={styles.mockWave} />
              </div>
              <div className={styles.recordingActions}>
                <button className={styles.cancelBtn} onClick={cancelRecording}>
                  {language === 'ko' ? '취소' : 'Cancel'}
                </button>
                <button className={styles.stopBtn} onClick={stopRecording}>
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="white">
                    <path d="M2.35 1.1L.9 2.55 9.21 10.86a7.39 7.39 0 0 0-.21 1.64c0 3.28 2.31 6.03 5.4 6.81V22h2v-2.73c.59-.06 1.16-.23 1.7-.5l4.27 4.27 1.45-1.45L2.35 1.1zM10 12.5c0-.14.02-.28.05-.42L12.92 15c-.14.03-.28.05-.42.05-1.38 0-2.5-1.12-2.5-2.5zM19 12.5a6.48 6.48 0 0 1-1.3 3.8l1.45 1.45c.87-1.4 1.35-3.1 1.35-4.85h-1.5zm-4-4V5c0-1.38-1.12-2.5-2.5-2.5S10 3.62 10 5v2.19l1.5 1.5V5c0-.55.45-1 1-1s1 .45 1 1v3.5h1.5zm1.5 1.5l1.5 1.5V12.5h-1.5V10z" />
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.inputBar}>
              <button type="button" className={styles.iconBtn} onClick={handleFileClick} disabled={isUploading}>
                {isUploading ? <div className={styles.loader} /> : <span className={styles.plusIcon}>+</span>}
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                accept="image/*,video/*"
                onChange={handleFileChange}
              />
              <div className={styles.inputWrapper}>
                <textarea 
                  ref={textareaRef}
                  className={styles.inputField}
                  placeholder={language === 'ko' ? '메시지를 입력하세요...' : 'Type message...'}
                  value={inputText}
                  onPaste={handlePaste}
                  onChange={(e) => {
                    setInputText(e.target.value);
                    if (textareaRef.current) {
                      textareaRef.current.style.height = 'auto';
                      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      // Just newline, don't send (buttons only for send as per user requirement)
                      return;
                    }
                  }}
                  rows={1}
                />
              </div>
              
              {!inputText.trim() ? (
                <button type="button" className={`${styles.micBtn} ${isRecording ? styles.recording : ''}`} onClick={startRecording}>
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="white">
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                  </svg>
                </button>
              ) : (
                <button type="button" className={styles.sendBtn} onClick={() => handleSend()} disabled={isUploading}>
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="white">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {showMembers && (
        <div className={styles.membersModal} onClick={handleCloseMembers}>
          <div className={styles.modalInner} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitleArea}>
                <h4>{language === 'ko' ? '대화 참여자' : 'Participants'} ({currentParticipants.length})</h4>
                {!isSystemRoom && (
                  <button className={styles.inviteAddBtn} onClick={() => setIsInviting(!isInviting)}>
                    {isInviting ? (language === 'ko' ? '취소' : 'Cancel') : '+ ' + (language === 'ko' ? '초대' : 'Invite')}
                  </button>
                )}
              </div>
              <button className={styles.modalCloseBtn} onClick={handleCloseMembers}>✕</button>
            </div>
            
            {isInviting && (
              <div className={styles.inviteSearchBox}>
                <input 
                  autoFocus
                  className={styles.inviteSearchInput}
                  placeholder={language === 'ko' ? '이름 또는 전화번호 검색...' : 'Search Name or Phone...'}
                  value={inviteSearchTerm}
                  onChange={(e) => setInviteSearchTerm(e.target.value)}
                />
                
                {inviteSearchTerm.trim() && (
                  <div className={styles.inviteResults}>
                    {inviteSearchResults.length > 0 ? (
                      inviteSearchResults.map(u => (
                        <div key={u.phone} className={styles.inviteItem} onClick={() => handleInvite(u)}>
                          <div className={styles.inviteAvatar}>
                            {u.photoURL ? <img src={u.photoURL} alt="" /> : <span>{u.nickname[0]}</span>}
                          </div>
                          <div className={styles.inviteInfo}>
                            <div className={styles.inviteName}>{u.nickname}</div>
                            <div className={styles.invitePhone}>{maskPhoneNumber(u.phone)}</div>
                          </div>
                          <button className={styles.inviteBtn}>{language === 'ko' ? '초대' : 'Invite'}</button>
                        </div>
                      ))
                    ) : (
                      <div className={styles.noResults} style={{ padding: '20px', textAlign: 'center', color: '#8b95a1', fontSize: '0.9rem' }}>
                        {language === 'ko' ? '검색 결과가 없습니다.' : 'No results found.'}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className={styles.memberGrid}>
              {currentParticipants.map((p: string) => {
                const cleanPhone = p.replace(/[^0-9]/g, '');
                const info = memberInfo[cleanPhone];
                return (
                  <div key={p} className={styles.memberItem}>
                    <div className={styles.memberAvatarWrapper} onClick={() => info?.photoURL && setSelectedViewerImage(info.photoURL)}>
                      {info?.photoURL ? (
                        <img src={info.photoURL} className={styles.memberAvatar} alt="" style={{ cursor: 'pointer' }} />
                      ) : (
                        <div className={styles.memberAvatarPlaceholder}>{info?.nickname?.[0] || '?' }</div>
                      )}
                    </div>
                    <span className={styles.memberNickname}>{info?.nickname || p}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      {showEditModal && (
        <div className={styles.editModal} onClick={() => setShowEditModal(false)}>
          <div className={styles.editModalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h4>{language === 'ko' ? '메시지 수정' : 'Edit Message'}</h4>
              <button className={styles.modalCloseBtn} onClick={() => setShowEditModal(false)}>✕</button>
            </div>
            <div className={styles.editArea}>
              <textarea 
                className={styles.editField}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                autoFocus
              />
            </div>
            <div className={styles.editModalActions}>
              <button className={styles.cancelEditBtn} onClick={() => setShowEditModal(false)}>
                {language === 'ko' ? '취소' : 'Cancel'}
              </button>
              <button className={styles.saveEditBtn} onClick={handleSaveEdit}>
                {language === 'ko' ? '저장' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
      <ImageViewer src={selectedViewerImage} onClose={() => setSelectedViewerImage(null)} />
    </div>
  );
}

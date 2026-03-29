import React, { useState, useEffect, useRef } from 'react';
import styles from './ChatRoom.module.css';
import { subscribeMessages, sendMessage, markMessageAsRead, toggleReaction } from '@/lib/chat';
import { ChatMessage } from '@/types/chat';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';

interface ChatRoomProps {
  roomId: string;
  roomName: string;
  user: { nickname: string, phone: string };
  onBack: () => void;
}

export default function ChatRoom({ roomId, roomName, user, onBack }: ChatRoomProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [menuMsgId, setMenuMsgId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsubscribe = subscribeMessages(roomId, (newMessages) => {
      setMessages(newMessages);
      
      const cleanPhone = user.phone.replace(/[^0-9]/g, '');
      newMessages.forEach(msg => {
        if (!msg.readBy?.includes(cleanPhone)) {
          markMessageAsRead(msg.id, cleanPhone);
        }
      });

      setTimeout(scrollToBottom, 500);
    });
    return () => unsubscribe();
  }, [roomId, user.phone]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    // Detection for YouTube
    let type: any = 'text';
    let youtubeId = '';
    const ytMatch = inputText.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)/);
    if (ytMatch) {
      type = 'youtube';
      youtubeId = ytMatch[1].split('&')[0];
    }

    const senderId = user.phone.replace(/[^0-9]/g, '');

    const messageData: any = {
      roomId,
      senderId,
      senderName: user.nickname,
      text: inputText,
      type,
      readBy: [senderId], // Initial sender
    };

    if (youtubeId) messageData.youtubeId = youtubeId;
    if (replyTo) messageData.replyTo = replyTo.id;

    await sendMessage(messageData);

    setInputText('');
    setReplyTo(null);
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const type: any = file.type.startsWith('image/') ? 'image' : 'video';
      const fileRef = ref(storage, `chat_media/${roomId}/${Date.now()}_${file.name}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);

      const senderId = user.phone.replace(/[^0-9]/g, '');

      await sendMessage({
        roomId,
        senderId,
        senderName: user.nickname,
        text: type === 'image' ? '📷 사진을 보냈습니다.' : '🎥 동영상을 보냈습니다.',
        type,
        mediaUrl: url,
        replyTo: replyTo?.id
      });
    } catch (err) {
      console.error('Upload Error:', err);
      alert('파일 업로드에 실패했습니다.');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const formatTime = (ts: any) => {
    if (!ts) return '';
    return ts.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😥', '😡'];

  const handleReaction = (msgId: string, emoji: string) => {
    toggleReaction(msgId, user.phone, emoji);
    setMenuMsgId(null);
  };

  const handleReply = (msg: ChatMessage) => {
    setReplyTo(msg);
    setMenuMsgId(null);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={onBack}>←</button>
        <span className={styles.roomName}>{roomName}</span>
      </header>

      <div className={styles.messageList} ref={scrollRef}>
        {messages.map((msg) => {
          const cleanMyPhone = user.phone.replace(/[^0-9]/g, '');
          const isMine = msg.senderId === cleanMyPhone;
          const parentMsg = msg.replyTo ? messages.find(m => m.id === msg.replyTo) : null;

          return (
            <div 
              key={msg.id} 
              className={`${styles.messageWrapper} ${isMine ? styles.myMessage : styles.otherMessage}`}
            >
              {!isMine && <div className={styles.senderName}>{msg.senderName}</div>}
              
              {parentMsg && (
                <div className={styles.replyPreview}>
                  ↳ {parentMsg.senderName}: {parentMsg.text.substring(0, 30)}...
                </div>
              )}

              <div className={styles.bubble} onClick={() => setMenuMsgId(menuMsgId === msg.id ? null : msg.id)}>
                {msg.type === 'image' && msg.mediaUrl && (
                  <div className={styles.mediaMessage}>
                    <img src={msg.mediaUrl} alt="chat" />
                  </div>
                )}
                {msg.type === 'video' && msg.mediaUrl && (
                  <div className={styles.mediaMessage}>
                    <video src={msg.mediaUrl} controls />
                  </div>
                )}
                {msg.text}
                
                {msg.type === 'youtube' && msg.youtubeId && (
                  <a 
                    href={`https://youtube.com/watch?v=${msg.youtubeId}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={styles.youtubeCard}
                  >
                    <div 
                      className={styles.youtubeThumb} 
                      style={{ backgroundImage: `url(https://img.youtube.com/vi/${msg.youtubeId}/mqdefault.jpg)` }}
                    >
                      <div className={styles.youtubePlay}>▶</div>
                    </div>
                    <div className={styles.youtubeInfo}>
                      <div className={styles.youtubeTitle}>YouTube Video</div>
                    </div>
                  </a>
                )}

                {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                  <div className={styles.reactionList}>
                    {Object.entries(
                      Object.values(msg.reactions).reduce((acc: any, emoji) => {
                        acc[emoji] = (acc[emoji] || 0) + 1;
                        return acc;
                      }, {} as any)
                    ).map(([emoji, count]: any) => (
                      <span key={emoji} className={styles.reactionBadge}>
                        {emoji} {count > 1 ? count : ''}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {menuMsgId === msg.id && (
                <div className={styles.messageMenu} onClick={(e) => e.stopPropagation()}>
                  <div className={styles.emojiRow}>
                    {REACTION_EMOJIS.map(emoji => (
                      <button key={emoji} onClick={() => handleReaction(msg.id, emoji)} className={styles.emojiBtn}>
                        {emoji}
                      </button>
                    ))}
                  </div>
                  <button className={styles.menuItem} onClick={() => handleReply(msg)}>답장하기</button>
                </div>
              )}
              <div className={styles.msgFooter}>
                {msg.readBy && msg.readBy.length > 0 && (
                  <span className={styles.readCount}>{msg.readBy.length}명 읽음</span>
                )}
                <div className={styles.timestamp}>{formatTime(msg.timestamp)}</div>
              </div>
            </div>
          );
        })}
      </div>

      {replyTo && (
        <div style={{ padding: '0.5rem 1rem', background: '#e8f3ff', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between' }}>
          <span>답장 진행 중: {replyTo.text.substring(0, 20)}...</span>
          <button onClick={() => setReplyTo(null)} style={{ border: 'none', background: 'transparent' }}>✕</button>
        </div>
      )}

      {isUploading && (
        <div style={{ padding: '0.5rem 1rem', background: '#f2f4f6', fontSize: '0.8rem', textAlign: 'center' }}>
          미디어 업로드 중...
        </div>
      )}

      <div className={styles.inputBar}>
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          accept="image/*,video/*"
          onChange={handleFileChange}
        />
        <button className={styles.iconBtn} onClick={handleFileClick} disabled={isUploading}>+</button>
        <input 
          className={styles.inputField}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="메시지를 입력하세요..."
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        />
        <button 
          className={styles.sendBtn} 
          onClick={handleSend}
          disabled={!inputText.trim()}
        >
          ▲
        </button>
      </div>
    </div>
  );
}

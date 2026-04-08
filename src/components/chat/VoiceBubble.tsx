import React, { useState, useRef, useEffect } from 'react';
import styles from './VoiceBubble.module.css';

interface VoiceBubbleProps {
  url: string;
  duration?: number;
  timestamp?: string;
  isOwn?: boolean;
}

export default function VoiceBubble({ url, duration, timestamp, isOwn }: VoiceBubbleProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      const p = (audio.currentTime / audio.duration) * 100;
      setProgress(p || 0);
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Generate static waveform bars for "premium" look
  const barCount = 30;
  const bars = Array.from({ length: barCount }, (_, i) => {
    const height = 15 + Math.sin(i * 0.5) * 10 + Math.random() * 5;
    return height;
  });

  return (
    <div className={`${styles.voiceContainer} ${isOwn ? styles.own : ''}`}>
      <audio ref={audioRef} src={url} preload="metadata" />
      
      <button className={styles.playBtn} onClick={togglePlay}>
        {isPlaying ? (
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      <div className={styles.waveformWrapper}>
        <div className={styles.waveform}>
          {bars.map((h, i) => (
            <div 
              key={i} 
              className={styles.bar} 
              style={{ 
                height: `${h}px`,
                backgroundColor: i / barCount * 100 < progress ? (isOwn ? '#fff' : '#3182f6') : (isOwn ? 'rgba(255,255,255,0.3)' : 'rgba(49,130,246,0.2)')
              }} 
            />
          ))}
        </div>
        <div className={styles.infoRow}>
          <span className={styles.duration}>
            {isPlaying ? formatDuration(currentTime) : (duration ? formatDuration(duration) : '0:00')}
          </span>
          {timestamp && <span className={styles.timestamp}>{timestamp}</span>}
        </div>
      </div>
    </div>
  );
}

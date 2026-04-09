import { useCallback, useRef, useState } from 'react';

interface LongPressOptions {
  threshold?: number;
  onLongPress?: (event: any) => void;
  onClick?: (event: any) => void;
}

export default function useLongPress({
  threshold = 500,
  onLongPress,
  onClick,
}: LongPressOptions) {
  const timeoutRef = useRef<NodeJS.Timeout>(undefined);
  const isLongPressActive = useRef(false);
  const isPressed = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });

  const start = useCallback(
    (event: any) => {
      const x = event.touches ? event.touches[0].clientX : event.clientX;
      const y = event.touches ? event.touches[0].clientY : event.clientY;
      startPos.current = { x, y };
      
      isPressed.current = true;
      isLongPressActive.current = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      
      timeoutRef.current = setTimeout(() => {
        isLongPressActive.current = true;
        if (onLongPress) onLongPress(event);
        timeoutRef.current = undefined; // Mark as long press completed
      }, threshold);
    },
    [onLongPress, threshold]
  );

  const move = useCallback(
    (event: any) => {
      if (!isPressed.current) return;
      
      const x = event.touches ? event.touches[0].clientX : event.clientX;
      const y = event.touches ? event.touches[0].clientY : event.clientY;
      
      const dx = Math.abs(x - startPos.current.x);
      const dy = Math.abs(y - startPos.current.y);
      
      // If moved more than 10px, it's a scroll/move, cancel both click and long press
      if (dx > 10 || dy > 10) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = undefined;
        }
        isPressed.current = false;
      }
    },
    []
  );

  const clear = useCallback(
    (event: any, shouldTriggerClick = true) => {
      // If start wasn't called OR interaction already cancelled by move, do nothing
      if (!isPressed.current) return;

      const wasQuickClick = !!timeoutRef.current;
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = undefined;
      }

      // Only trigger click if:
      // 1. shouldTriggerClick is true
      // 2. Interaction wasn't a long press (wasQuickClick is true)
      // 3. it wasn't a scroll (isPressed was still true, covered by the guard above)
      if (shouldTriggerClick && wasQuickClick && !isLongPressActive.current && onClick) {
        onClick(event);
      }
      
      isPressed.current = false;
      isLongPressActive.current = false;
    },
    [onClick]
  );

  return {
    onMouseDown: (e: any) => start(e),
    onMouseUp: (e: any) => clear(e),
    onMouseMove: (e: any) => move(e),
    onMouseLeave: (e: any) => clear(e, false),
    onTouchStart: (e: any) => start(e),
    onTouchMove: (e: any) => move(e),
    onTouchEnd: (e: any) => clear(e),
  };
}

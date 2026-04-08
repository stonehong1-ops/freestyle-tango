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

  const start = useCallback(
    (event: any) => {
      // Prevent context menu from appearing on mobile if needed
      // event.persist(); 
      isLongPressActive.current = false;
      timeoutRef.current = setTimeout(() => {
        isLongPressActive.current = true;
        if (onLongPress) onLongPress(event);
      }, threshold);
    },
    [onLongPress, threshold]
  );

  const clear = useCallback(
    (event: any, shouldTriggerClick = true) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (shouldTriggerClick && !isLongPressActive.current && onClick) {
        onClick(event);
      }
      isLongPressActive.current = false;
    },
    [onClick]
  );

  return {
    onMouseDown: (e: any) => start(e),
    onMouseUp: (e: any) => clear(e),
    onMouseLeave: (e: any) => clear(e, false),
    onTouchStart: (e: any) => start(e),
    onTouchEnd: (e: any) => clear(e),
  };
}

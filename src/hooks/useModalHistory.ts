import { useEffect, useRef } from 'react';

/**
 * Custom hook to handle modal closing via browser back button and sync manual close.
 * 
 * @param isOpen - Current open state of the modal
 * @param onClose - Function to call when the modal should be closed
 * @param modalId - Unique identifier for this modal in the history state
 */
export function useModalHistory(isOpen: boolean, onClose: () => void, modalId: string) {
  // Use a ref to track if the closing is happening because of back button
  // to avoid redundant history.back() calls when the effect runs after closure
  const isClosingViaBack = useRef(false);

  useEffect(() => {
    if (isOpen) {
      // 1. Push state when modal opens (if not already in this state)
      if (window.history.state?.modal !== modalId) {
        window.history.pushState({ modal: modalId }, '', '');
      }

      const handlePopState = (e: PopStateEvent) => {
        // If the new state's modal identifier doesn't match our modalId,
        // it means we've gone backwards in history.
        if (e.state?.modal !== modalId) {
          isClosingViaBack.current = true;
          onClose();
        }
      };

      window.addEventListener('popstate', handlePopState);
      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    } else {
      // 2. Clear history state if closed manually ('X', overlay, ESC, etc.)
      const currentState = window.history.state;
      if (currentState?.modal === modalId && !isClosingViaBack.current) {
        window.history.back();
      }
      // Reset ref for next time
      isClosingViaBack.current = false;
    }
  }, [isOpen, modalId, onClose]);
}

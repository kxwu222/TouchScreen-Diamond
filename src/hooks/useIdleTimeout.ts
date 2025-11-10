import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const IDLE_TIMEOUT = 3 * 60 * 1000; // 3 minutes in milliseconds

export const useIdleTimeout = () => {
  const navigate = useNavigate();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimeout = () => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout to redirect to home
    timeoutRef.current = setTimeout(() => {
      navigate('/home', { replace: true });
    }, IDLE_TIMEOUT);
  };

  useEffect(() => {
    // Set initial timeout
    resetTimeout();

    // Events that indicate user activity
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
      'keydown',
    ];

    // Add event listeners
    events.forEach((event) => {
      window.addEventListener(event, resetTimeout, { passive: true });
    });

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach((event) => {
        window.removeEventListener(event, resetTimeout);
      });
    };
  }, [navigate]);
};


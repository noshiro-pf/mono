import { useCallback, useEffect, useRef } from 'react';

export const useTimerRef = (): [
  React.MutableRefObject<number | undefined>,
  () => void
] => {
  const timerRef = useRef<number | undefined>(undefined);

  const clearTimer = useCallback(() => {
    clearTimeout(timerRef.current);
  }, []);

  useEffect(() => clearTimer, [clearTimer]);

  return [timerRef, clearTimer];
};

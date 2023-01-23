import { useCallback, useEffect, useRef, type MutableRefObject } from 'react';

export const useTimerRef = (): readonly [
  MutableRefObject<number | undefined>,
  () => void
] => {
  const timerRef = useRef<number | undefined>(undefined);

  const clearTimer = useCallback(() => {
    clearTimeout(timerRef.current);
  }, []);

  useEffect(() => clearTimer, [clearTimer]);

  return [timerRef, clearTimer];
};

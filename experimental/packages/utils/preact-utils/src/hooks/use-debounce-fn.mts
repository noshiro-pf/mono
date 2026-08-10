import { useCallback, useEffect, useRef } from 'preact/hooks';

export const useTimerRef = (): [preact.Ref<number | undefined>, () => void] => {
  const timerRef = useRef<number | undefined>(undefined);

  const clearTimer = useCallback(() => {
    clearTimeout(timerRef.current);
  }, []);

  useEffect(() => clearTimer, [clearTimer]);

  return [timerRef, clearTimer];
};

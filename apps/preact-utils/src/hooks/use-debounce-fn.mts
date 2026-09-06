import * as Preact from 'preact/hooks';

export const useTimerRef = (): readonly [
  preact.Ref<number | undefined>,
  () => void,
] => {
  // The type argument is unavoidable — there is nothing to infer it from.
  const timerRef = Preact.useRef<number | undefined>(undefined);

  const clearTimer = Preact.useCallback(() => {
    clearTimeout(timerRef.current);
  }, []);

  Preact.useEffect(() => clearTimer, [clearTimer]);

  return [timerRef, clearTimer];
};

import * as Preact from 'preact/hooks';

export const useTimerRef = (): readonly [
  preact.Ref<number | undefined>,
  () => void,
] => {
  // The type argument is unavoidable — there is nothing to infer it from —
  // and the React Compiler rule reads a hook call that carries one as a
  // reference to the hook rather than a call to it.
  // eslint-disable-next-line react-hooks/hooks
  const timerRef = Preact.useRef<number | undefined>(undefined);

  const clearTimer = Preact.useCallback(() => {
    clearTimeout(timerRef.current);
  }, []);

  Preact.useEffect(() => clearTimer, [clearTimer]);

  return [timerRef, clearTimer];
};

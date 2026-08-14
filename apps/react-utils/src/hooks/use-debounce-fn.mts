import * as React from 'react';

export const useTimerRef = (): readonly [
  React.RefObject<number | undefined>,
  () => void,
] => {
  const timerRef = React.useRef<number | undefined>(undefined);

  const clearTimer = React.useCallback(() => {
    clearTimeout(timerRef.current);
  }, []);

  React.useEffect(() => clearTimer, [clearTimer]);

  return [timerRef, clearTimer];
};

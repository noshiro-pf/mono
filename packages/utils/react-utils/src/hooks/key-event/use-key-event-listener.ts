import { useEffect } from 'react';

export const useKeyEventListener = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  onKeyDown: (ev: KeyboardEvent) => void,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  onKeyUp: (ev: KeyboardEvent) => void
): void => {
  useEffect(() => {
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [onKeyDown, onKeyUp]);
};

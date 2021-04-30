import { useEffect } from 'react';

export const useKeyEventListener = (
  onKeyDown: (ev: Readonly<KeyboardEvent>) => void,
  onKeyUp: (ev: Readonly<KeyboardEvent>) => void
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

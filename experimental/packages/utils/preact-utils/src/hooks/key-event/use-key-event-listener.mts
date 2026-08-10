import { useEffect } from 'react';

export const useKeyEventListener = (
  onKeyDown: (ev: KeyboardEvent) => void,
  onKeyUp: (ev: KeyboardEvent) => void,
): void => {
  useEffect(() => {
    globalThis.addEventListener('keydown', onKeyDown);
    globalThis.addEventListener('keyup', onKeyUp);
    return () => {
      globalThis.removeEventListener('keydown', onKeyDown);
      globalThis.removeEventListener('keyup', onKeyUp);
    };
  }, [onKeyDown, onKeyUp]);
};

import * as Preact from 'preact/hooks';

export const useKeyEventListener = (
  onKeyDown: (ev: KeyboardEvent) => void,
  onKeyUp: (ev: KeyboardEvent) => void,
): void => {
  Preact.useEffect(() => {
    addEventListener('keydown', onKeyDown);

    addEventListener('keyup', onKeyUp);

    return () => {
      removeEventListener('keydown', onKeyDown);

      removeEventListener('keyup', onKeyUp);
    };
  }, [onKeyDown, onKeyUp]);
};

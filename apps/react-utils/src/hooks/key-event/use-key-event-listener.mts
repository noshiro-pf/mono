import * as React from 'react';

export const useKeyEventListener = (
  onKeyDown: (ev: KeyboardEvent) => void,
  onKeyUp: (ev: KeyboardEvent) => void,
): void => {
  React.useEffect(() => {
    addEventListener('keydown', onKeyDown);

    addEventListener('keyup', onKeyUp);

    return () => {
      removeEventListener('keydown', onKeyDown);

      removeEventListener('keyup', onKeyUp);
    };
  }, [onKeyDown, onKeyUp]);
};

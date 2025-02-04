// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import * as React from 'react';

export const useState = <T,>(
  initialState: T,
): readonly [
  state: T,
  setState: (next: T) => void,
  Readonly<{
    updateState: (updateFn: (v: T) => T) => void;
    resetState: () => void;
  }>,
] => {
  const [state, setState] = React.useState<T>(initialState);

  const resetState = React.useCallback(() => {
    setState(() => initialState);
  }, [initialState]);

  const updateState = React.useCallback((updateFn: (v: T) => T) => {
    setState(updateFn);
  }, []);

  return [state, setState, { updateState, resetState }];
};

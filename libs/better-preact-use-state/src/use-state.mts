import * as Preact from 'preact/hooks';

export const useState = <T,>(
  initialState: T,
): readonly [
  state: T,
  setState: (next: T) => void,
  setters: Readonly<{
    updateState: (updateFn: (v: T) => T) => void;
    resetState: () => void;
  }>,
] => {
  const [state, setState] = Preact.useState<T>(initialState);

  // The value the state was created with, read once as `useState` reads it, so
  // that `resetState` neither follows a later argument nor changes identity
  // when one is passed (an object literal is a new one on every render).
  const [initial] = Preact.useState<T>(initialState);

  const resetState = Preact.useCallback(() => {
    setState(() => initial);
  }, [initial]);

  const updateState = Preact.useCallback((updateFn: (v: T) => T) => {
    setState(updateFn);
  }, []);

  return [state, setState, { updateState, resetState }];
};

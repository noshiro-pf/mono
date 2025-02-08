// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import * as Preact from 'preact/hooks';

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
  const [state, setState] = Preact.useState<T>(initialState);

  const resetState = Preact.useCallback(() => {
    setState(() => initialState);
  }, [initialState]);

  const updateState = Preact.useCallback((updateFn: (v: T) => T) => {
    setState(updateFn);
  }, []);

  return [state, setState, { updateState, resetState }];
};

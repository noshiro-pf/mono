import { useState } from 'better-react-use-state';

export const useExample = <T,>(initialState: T): void => {
  // embed-sample-code-ignore-above
  const [state, setState, { updateState, resetState }] = useState(initialState);
  // embed-sample-code-ignore-below

  state satisfies T;

  setState satisfies (next: T) => void;

  updateState satisfies (updateFn: (v: T) => T) => void;

  resetState satisfies () => void;
};

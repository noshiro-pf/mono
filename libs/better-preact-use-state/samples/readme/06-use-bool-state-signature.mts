import { useBoolState } from 'better-preact-use-state';

export const useExample = (initialState: boolean): void => {
  // embed-sample-code-ignore-above
  const [
    state,
    { setState, setTrue, setFalse, resetState, toggleState, updateState },
  ] = useBoolState(initialState);
  // embed-sample-code-ignore-below

  state satisfies boolean;

  setState satisfies (next: boolean) => void;

  setTrue satisfies () => void;

  setFalse satisfies () => void;

  resetState satisfies () => void;

  toggleState satisfies () => void;

  updateState satisfies (updateFn: (v: boolean) => boolean) => void;
};

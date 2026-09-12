import { type useBoolState } from 'better-preact-use-state';

export type Setters = Readonly<{
  // embed-sample-code-ignore-above
  setFalse: () => void;
  // embed-sample-code-ignore-below
}>;

declare const setters: ReturnType<typeof useBoolState>[1];

setters satisfies Setters;

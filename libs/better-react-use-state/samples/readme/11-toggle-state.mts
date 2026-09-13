import { type useBoolState } from 'better-react-use-state';

export type Setters = Readonly<{
  // embed-sample-code-ignore-above
  toggleState: () => void;
  // embed-sample-code-ignore-below
}>;

declare const setters: ReturnType<typeof useBoolState>[1];

setters satisfies Setters;

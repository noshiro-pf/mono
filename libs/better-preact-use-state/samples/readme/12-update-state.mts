import { type useBoolState } from 'better-preact-use-state';

export type Setters = Readonly<{
  // embed-sample-code-ignore-above
  updateState: (updateFn: (v: boolean) => boolean) => void;
  // embed-sample-code-ignore-below
}>;

declare const setters: ReturnType<typeof useBoolState>[1];

setters satisfies Setters;

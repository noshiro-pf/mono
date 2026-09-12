import { type useState } from 'better-preact-use-state';

export type Setters = Readonly<{
  // embed-sample-code-ignore-above
  resetState: () => void;
  // embed-sample-code-ignore-below
}>;

declare const setters: ReturnType<typeof useState<number>>[2];

setters satisfies Setters;

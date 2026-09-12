import { type useState } from 'better-preact-use-state';

export type Setters<T> = Readonly<{
  // embed-sample-code-ignore-above
  updateState: (updateFn: (v: T) => T) => void;
  // embed-sample-code-ignore-below
}>;

declare const setters: ReturnType<typeof useState<number>>[2];

setters satisfies Setters<number>;

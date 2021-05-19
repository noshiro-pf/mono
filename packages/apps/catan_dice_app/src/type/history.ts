import type { uint32 } from '@noshiro/ts-utils';

export type HistoryState = Readonly<{
  index: uint32 | -1;
  history: readonly (readonly [number, number])[];
}>;

export const defaultHistoryState: HistoryState = {
  index: -1,
  history: [],
} as const;

export type HistoryState = Readonly<{
  index: number;
  history: readonly (readonly [number, number])[];
}>;

export const defaultHistoryState: HistoryState = {
  index: -1,
  history: [],
} as const;

export type HistoryState = DeepReadonly<{
  index: number;
  history: [number, number][];
}>;

export const defaultHistoryState: HistoryState = {
  index: -1,
  history: [],
} as const;

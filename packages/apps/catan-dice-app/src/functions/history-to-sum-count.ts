import type { HistoryState } from '../type';

export const historyToSumCount = (
  hist: HistoryState
): ArrayOfLength<11, number> => {
  const mut_count: MutableArrayOfLength<11, number> = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ];
  const historyFiltered = Arr.take(hist.history, hist.index + 1);
  for (const [a, b] of historyFiltered) {
    mut_count[a + b - 2] += 1;
  }
  return mut_count;
};

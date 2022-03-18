import { IList } from '@noshiro/ts-utils';
import type { HistoryState } from '../type';

export const historyToSumCount = (
  hist: HistoryState
): ReadonlyArrayOfLength<11, number> => {
  const mut_count: ArrayOfLength<11, number> = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ];
  const historyFiltered = IList.take(hist.history, hist.index + 1);
  historyFiltered.forEach(([a, b]) => {
    mut_count[a + b - 2] += 1;
  });
  return mut_count;
};

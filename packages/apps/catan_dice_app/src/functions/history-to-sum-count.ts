import type { ArrayOfLength, ReadonlyArrayOfLength } from '@noshiro/ts-utils';
import { IList } from '@noshiro/ts-utils';
import type { HistoryState } from '../type';

export const historyToSumCount = (
  hist: HistoryState
): ReadonlyArrayOfLength<11, number> => {
  const count: ArrayOfLength<11, number> = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  const historyFiltered = IList.take(hist.history, hist.index + 1);
  historyFiltered.forEach(([a, b]) => {
    count[a + b - 2] += 1;
  });
  return count;
};

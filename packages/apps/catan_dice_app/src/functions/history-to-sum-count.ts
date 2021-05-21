import type {
  ArrayOfLength,
  ReadonlyArrayOfLength,
  uint32,
} from '@noshiro/ts-utils';
import { take } from '@noshiro/ts-utils';
import type { HistoryState } from '../type';

export const historyToSumCount = (
  hist: HistoryState
): ReadonlyArrayOfLength<11, number> => {
  const count: ArrayOfLength<11, number> = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  const historyFiltered = take(
    hist.history,
    ((hist.index as number) + 1) as uint32
  );
  historyFiltered.forEach(([a, b]) => {
    count[a + b - 2] += 1;
  });
  return count;
};

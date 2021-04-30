import { uint32, zeros } from '@noshiro/ts-utils';
import { IList } from '../immutable';
import { THistoryState } from '../type/history';

// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
export const historyToSumCount = (history: THistoryState): IList<number> => {
  const count = zeros(11 as uint32);
  const historyFiltered = history.history.take(history.index + 1);
  historyFiltered.forEach(([a, b]) => {
    count[a + b - 2] += 1;
  });
  return IList<number>(count);
};

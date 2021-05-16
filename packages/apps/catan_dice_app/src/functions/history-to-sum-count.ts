import type { uint32 } from '@noshiro/ts-utils';
import { zeros } from '@noshiro/ts-utils';
import { IList } from '../immutable';
import type { THistoryState } from '../type/history';

// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
export const historyToSumCount = (hist: THistoryState): IList<number> => {
  const count = zeros(11 as uint32);
  const historyFiltered = hist.history.take(hist.index + 1);
  historyFiltered.forEach(([a, b]) => {
    count[a + b - 2] += 1;
  });
  return IList<number>(count);
};

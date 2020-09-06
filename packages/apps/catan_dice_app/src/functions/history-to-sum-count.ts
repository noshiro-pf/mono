import { IList } from '../immutable';
import { THistoryState } from '../type/history';

export const historyToSumCount = (history: THistoryState): IList<number> => {
  const count = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  const historyFiltered = history.history.take(history.index + 1);
  historyFiltered.forEach(([a, b]) => {
    count[a + b - 2] += 1;
  });
  return IList<number>(count);
};

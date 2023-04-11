import { add1, type HistoryState } from '../type';

export const historyToSumCount = (
  hist: HistoryState
): ArrayOfLength<11, SafeUint> => {
  const mut_count: MutableArrayOfLength<11, SafeUint> = Arr.asMut(
    Tpl.map([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], toSafeUint)
  );

  const historyFiltered = Arr.take(hist.history, add1(hist.index));
  for (const [a, b] of historyFiltered) {
    mut_count[a + b - 2] = SafeUint.add(mut_count[a + b - 2] ?? 0, 1);
  }
  return mut_count;
};

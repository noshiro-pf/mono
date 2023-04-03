import { incrementHistoryIndex, type HistoryState } from '../type';

export const historyToSumCount = (
  hist: HistoryState
): ArrayOfLength<11, Uint32> => {
  const mut_count: MutableArrayOfLength<11, Uint32> = Arr.asMut(
    Arr.map([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], toUint32)
  );

  const historyFiltered = Arr.take(
    hist.history,
    incrementHistoryIndex(hist.index, Arr.length(hist.history))
  );
  for (const [a, b] of historyFiltered) {
    mut_count[a + b - 2] = Uint32.add(mut_count[a + b - 2] ?? 0, 1);
  }
  return mut_count;
};

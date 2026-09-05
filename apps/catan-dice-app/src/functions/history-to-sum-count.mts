import { Arr, SafeUint, asSafeUint, castMutable } from 'ts-data-forge';
import { type FixedLengthTuple, type Mutable } from 'ts-type-forge';
import { add1, type HistoryState } from '../type/index.mjs';

export const historyToSumCount = (
  hist: HistoryState,
): FixedLengthTuple<11, SafeUint> => {
  const mut_count: Mutable<FixedLengthTuple<11, SafeUint>> = castMutable(
    Arr.map([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], asSafeUint),
  );

  const historyFiltered = Arr.take(hist.history, add1(hist.index));

  for (const [a, b] of historyFiltered) {
    mut_count[a + b - 2] = SafeUint.add(mut_count[a + b - 2] ?? 0, 1);
  }

  return mut_count;
};

import {
  Arr,
  asNonNegativeFiniteNumber,
  NonNegativeFiniteNumber,
  Num,
  Optional,
} from 'ts-data-forge';
import { type NonEmptyArray } from 'ts-type-forge';

export const normalizeList = (
  list: NonEmptyArray<NonNegativeFiniteNumber>,
): NonEmptyArray<NonNegativeFiniteNumber> => {
  // `Arr.max` returns `Optional`. `list` is non-empty so it is always `Some`;
  // the fallback is unreachable, and 0 is what the guard below rejects anyway.
  const maxValueInList = Optional.unwrapOr(
    Arr.max(list),
    asNonNegativeFiniteNumber(0),
  );

  if (Num.isNonZero(maxValueInList)) {
    return Arr.map(list, (l) => NonNegativeFiniteNumber.div(l, maxValueInList));
  }

  return list;
};

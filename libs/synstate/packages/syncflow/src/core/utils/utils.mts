import { Arr, asSafeInt, asUint32, SafeInt } from 'ts-data-forge';

export const halfInt = (x: SafeInt): SafeInt =>
  x % 2 === 0
    ? SafeInt.div(x, 2)
    : x > 0
      ? SafeInt.div(SafeInt.sub(x, 1), 2) // (x-1) / 2. e.g. 3 -> 1, 5 -> 2
      : SafeInt.div(SafeInt.add(x, 1), 2); // (x+1) / 2. e.g. -3 -> -1, -5 -> -2

/** Returns the position where x should be inserted in a sorted array. */
export const binarySearch = <N extends number>(
  sortedArray: readonly N[],
  x: N,
): NegativeInt32 | Uint32 => {
  const uint32Result = asUint32(0);

  if (Arr.isArrayOfLength(sortedArray, 0)) {
    return uint32Result;
  }

  const left0 = asSafeInt(0);

  let mut_left: SafeInt = left0;

  let mut_right: SafeInt = SafeInt.sub(Arr.length(sortedArray), 1);

  let mut_mid: SafeInt = SafeInt.add(
    mut_left,
    halfInt(SafeInt.sub(mut_right, mut_left)),
  );

  // loop while x is in the range of [left, right)
  while (mut_left <= mut_right) {
    const curr = sortedArray[mut_mid];

    if (x === curr) break;

    if (curr === undefined) break;

    if (curr > x) {
      mut_right = SafeInt.sub(mut_mid, 1);
    } else {
      mut_left = SafeInt.add(mut_mid, 1);
    }

    mut_mid = SafeInt.add(mut_left, halfInt(SafeInt.sub(mut_right, mut_left)));
  }

  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  return mut_mid as NegativeInt32 | Uint32;
};

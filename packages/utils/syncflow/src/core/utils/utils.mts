import { Arr, SafeInt, toSafeInt, toUint32 } from '@noshiro/ts-utils';

export const halfInt = (x: SafeInt): SafeInt =>
  x % 2 === 0
    ? SafeInt.div(x, 2)
    : x > 0
      ? SafeInt.div(SafeInt.sub(x, 1), 2) // (x-1) / 2. 例: 3 -> 1, 5 -> 2
      : SafeInt.div(SafeInt.add(x, 1), 2); // (x+1) / 2. 例: -3 -> -1, -5 -> -2

/** ソート済み配列に対して x が挿入される位置を返す。 */
export const binarySearch = <N extends number>(
  sortedArray: readonly N[],
  x: N,
): NegativeInt32 | Uint32 => {
  if (sortedArray.length === 0) return toUint32(0);
  let mut_left: SafeInt = toSafeInt(0);
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
  // eslint-disable-next-line no-restricted-syntax
  return mut_mid as NegativeInt32 | Uint32;
};

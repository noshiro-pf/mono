import { Arr, Int32, toInt32 } from '@noshiro/ts-utils';

export const halfInt = (x: Int32): Int32 =>
  x % 2 === 0
    ? Int32.div(x, 2)
    : x > 0
    ? Int32.div(Int32.sub(x, 1), 2) // (x-1) / 2. 例: 3 -> 1, 5 -> 2
    : Int32.div(Int32.add(x, 1), 2); // (x+1) / 2. 例: -3 -> -1, -5 -> -2

/**
 * ソート済み配列に対して x が挿入される位置を返す。
 */
export const binarySearch = <N extends number>(
  sortedArray: readonly N[],
  x: N
): Int32 => {
  if (sortedArray.length === 0) return toInt32(0);
  let mut_left: Int32 = toInt32(0);
  let mut_right: Int32 = Int32.sub(Arr.length(sortedArray), 1);
  let mut_mid: Int32 = Int32.add(
    mut_left,
    toInt32(halfInt(Int32.sub(mut_right, mut_left)))
  );

  // loop while x is in the range of [left, right)
  while (mut_left <= mut_right) {
    const curr = sortedArray[mut_mid];
    if (x === curr) break;
    if (curr === undefined) break;
    if (curr > x) {
      mut_right = Int32.sub(mut_mid, 1);
    } else {
      mut_left = Int32.add(mut_mid, 1);
    }
    mut_mid = Int32.add(
      mut_left,
      toInt32(halfInt(Int32.sub(mut_right, mut_left)))
    );
  }
  return mut_mid;
};

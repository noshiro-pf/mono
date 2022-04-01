export const halfInt = (x: number): number =>
  x % 2 === 0
    ? x / 2
    : x % 2 === 1
    ? x > 0
      ? (x - 1) / 2
      : (x + 1) / 2
    : x > 0
    ? Math.floor(x / 2)
    : Math.ceil(x / 2);

export const binarySearch = (
  sortedArray: readonly number[],
  x: number
): number => {
  if (sortedArray.length === 0) return 0;
  let mut_left = 0;
  let mut_right = sortedArray.length - 1;
  let mut_mid = mut_left + halfInt(mut_right - mut_left);
  // loop while x is in the range of [left, right)
  while (mut_left <= mut_right) {
    const curr = sortedArray[mut_mid];
    if (x === curr) break;
    if (curr === undefined) break;
    if (curr > x) {
      mut_right = mut_mid - 1;
    } else {
      mut_left = mut_mid + 1;
    }
    mut_mid = mut_left + halfInt(mut_right - mut_left);
  }
  return mut_mid;
};

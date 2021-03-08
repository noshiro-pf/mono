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

export const binarySearch = (sortedArray: number[], x: number): number => {
  if (sortedArray.length === 0) return 0;
  let left = 0;
  let right = sortedArray.length - 1;
  let mid = left + halfInt(right - left);
  // loop while x is in the range of [left, right)
  while (left <= right) {
    const curr = sortedArray[mid];
    if (x === curr) break;
    if (curr === undefined) break;
    if (curr > x) {
      right = mid - 1;
    } else {
      left = mid + 1;
    }
    mid = left + halfInt(right - left);
  }
  return mid;
};

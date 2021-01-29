/* eslint-disable @typescript-eslint/no-non-null-assertion */
export const arraySetDifference = (
  sortedArray1: readonly number[],
  sortedArray2: readonly number[]
): number[] => {
  const result: number[] = [];
  let it1 = 0; // iterator for sortedArray1
  let it2 = 0; // iterator for sortedArray2
  let val1: number = sortedArray1[it1]!;
  let val2: number = sortedArray2[it2]!;
  while (it1 < sortedArray1.length && it2 < sortedArray2.length) {
    if (val1 === val2) {
      it1 += 1;
      it2 += 1;
      val1 = sortedArray1[it1]!;
      val2 = sortedArray2[it2]!;
    } else if (val1 < val2) {
      result.push(val1);
      it1 += 1;
      val1 = sortedArray1[it1]!;
    } else {
      it2 += 1;
      val2 = sortedArray2[it2]!;
    }
  }
  for (; it1 < sortedArray1.length; it1 += 1) {
    result.push(sortedArray1[it1]!);
  }
  return result;
};

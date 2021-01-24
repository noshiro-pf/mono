export const arraySetDifference = (
  sortedArray1: readonly number[],
  sortedArray2: readonly number[]
): number[] => {
  const result: number[] = [];
  let it1 = 0; // iterator for sortedArray1
  let it2 = 0; // iterator for sortedArray2
  let val1: number = sortedArray1[it1] as number;
  let val2: number = sortedArray2[it2] as number;
  while (it1 < sortedArray1.length && it2 < sortedArray2.length) {
    if (val1 === val2) {
      val1 = sortedArray1[++it1] as number;
      val2 = sortedArray2[++it2] as number;
    } else if (val1 < val2) {
      result.push(val1);
      val1 = sortedArray1[++it1] as number;
    } else {
      val2 = sortedArray2[++it2] as number;
    }
  }
  for (; it1 < sortedArray1.length; ++it1) {
    result.push(sortedArray1[it1] as number);
  }
  return result;
};

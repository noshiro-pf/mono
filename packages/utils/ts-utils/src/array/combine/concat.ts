export const concat = <A, B>(
  arr1: readonly A[],
  arr2: readonly B[]
): (A | B)[] => ([] as (A | B)[]).concat(arr1, arr2);

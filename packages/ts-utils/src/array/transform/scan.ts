/** @internal */
export const scan = <T, R>(
  array: readonly T[],
  reducer: (acc: R, curr: T) => R,
  init: R
): R[] => {
  const n = array.length;
  const result: R[] = new Array<R>(n + 1).fill(init);

  let acc = init;
  for (const [index, value] of array.entries()) {
    acc = reducer(acc, value);
    result[index + 1] = acc;
  }

  return result;
};

/**
 * @desc copy and return unique array
 * @param arr target array
 * @param mapFn perform identity check after mapping by the map function
 */
export const uniq = <T>(arr: readonly T[]): T[] => Array.from(new Set(arr));

export const uniqBy = <T, S>(
  arr: readonly T[],
  mapFn: (value: T) => S
): T[] => {
  const mappedValues = new Set();
  return arr.filter((val) => {
    const mappedValue = mapFn(val);
    if (mappedValues.has(mappedValue)) return false;
    mappedValues.add(mappedValue);
    return true;
  });
};

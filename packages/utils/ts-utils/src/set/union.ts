export const setUnion = <T>(
  setA: ReadonlySet<T>,
  setB: ReadonlySet<T>
): Set<T> => {
  const _union = new Set<T>(setA);
  for (const e of setB) {
    _union.add(e);
  }
  return _union;
};

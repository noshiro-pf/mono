export const union = <T>(setA: Set<T>, setB: Set<T>): Set<T> => {
  const _union = new Set<T>(setA);
  for (const e of setB) {
    _union.add(e);
  }
  return _union;
};

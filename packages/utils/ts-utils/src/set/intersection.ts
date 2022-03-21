export const setIntersection = <T>(
  setA: ReadonlySet<T>,
  setB: ReadonlySet<T>
): Set<T> => {
  const _intersection = new Set<T>();

  for (const e of setB) {
    if (setA.has(e)) {
      _intersection.add(e);
    }
  }

  return _intersection;
};

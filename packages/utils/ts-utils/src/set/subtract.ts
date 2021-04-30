export const setSubtract = <T>(
  setA: ReadonlySet<T>,
  setB: ReadonlySet<T>
): Set<T> => {
  const _subtract = new Set<T>(setA);
  for (const e of setB) {
    if (setA.has(e)) {
      _subtract.delete(e);
    }
  }
  return _subtract;
};

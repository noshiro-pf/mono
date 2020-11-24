export const setSubtract = <T>(setA: Set<T>, setB: Set<T>): Set<T> => {
  const _subtract = new Set<T>(setA);
  for (const e of setB) {
    if (setA.has(e)) {
      _subtract.delete(e);
    }
  }
  return _subtract;
};

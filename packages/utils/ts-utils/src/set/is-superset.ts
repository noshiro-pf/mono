export const setIsSuperset = <T>(
  maybeSuperset: Set<T>,
  maybeSubset: Set<T>
): boolean => {
  for (const e of maybeSubset) {
    if (!maybeSuperset.has(e)) return false;
  }
  return true;
};

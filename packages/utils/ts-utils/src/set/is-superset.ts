export const setIsSuperset = <T>(
  maybeSuperset: ReadonlySet<T>,
  maybeSubset: ReadonlySet<T>
): boolean => {
  for (const e of maybeSubset) {
    if (!maybeSuperset.has(e)) return false;
  }
  return true;
};

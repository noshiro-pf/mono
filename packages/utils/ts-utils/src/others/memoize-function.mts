export const memoizeFunction = <A extends readonly unknown[], R, K>(
  fn: (...args: A) => R,
  argsToCacheKey: (...args: A) => K,
): ((...args: A) => R) => {
  // eslint-disable-next-line no-restricted-globals
  const mut_cache = new Map<K, R>();

  return (...args: A): R => {
    const key = argsToCacheKey(...args);
    const cachedValue = mut_cache.get(key);

    if (cachedValue !== undefined) {
      return cachedValue;
    } else {
      const result = fn(...args);

      mut_cache.set(key, result);

      return result;
    }
  };
};

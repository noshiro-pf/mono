export const memoizeFunction = <A extends unknown[], R, K>(
  fn: (...args: A) => R,
  argsToCacheKey: (...args: A) => K
): ((...args: A) => R) => {
  const cache = new Map<K, R>();

  return (...args: A): R => {
    const key = argsToCacheKey(...args);
    const cachedValue = cache.get(key);

    if (cachedValue !== undefined) {
      return cachedValue;
    } else {
      const result = fn(...args);

      cache.set(key, result);

      return result;
    }
  };
};

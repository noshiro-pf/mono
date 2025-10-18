/**
 * Creates a memoized version of a function that caches results based on input
 * arguments.
 *
 * The memoized function stores results in an internal Map and returns cached
 * values for repeated calls with the same arguments. This can significantly
 * improve performance for expensive computations or I/O operations.
 *
 * **Important considerations:**
 *
 * - The cache grows unbounded - consider memory implications for long-running
 *   applications
 * - Cache keys must be primitives (string, number, boolean, symbol, null,
 *   undefined, bigint)
 * - Object arguments require careful key generation to ensure uniqueness
 * - Pure functions only - memoizing functions with side effects can lead to bugs
 *
 * @template A - The tuple type of the function arguments
 * @template R - The return type of the function
 * @template K - The primitive type used as the cache key (must be valid Map
 *   key)
 * @param fn - The pure function to memoize
 * @param argsToCacheKey - Function that converts arguments to a unique cache
 *   key
 * @returns A memoized version of the input function with the same signature
 *
 * @see https://en.wikipedia.org/wiki/Memoization
 */
export const memoizeFunction = <
  const A extends readonly unknown[],
  R,
  K extends Primitive,
>(
  fn: (...args: A) => R,
  argsToCacheKey: (...args: A) => K,
): ((...args: A) => R) => {
  const mut_cache = new Map<K, R>();

  return (...args: A): R => {
    const key = argsToCacheKey(...args);

    if (mut_cache.has(key)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return mut_cache.get(key)!;
    } else {
      const result = fn(...args);

      mut_cache.set(key, result);

      return result;
    }
  };
};

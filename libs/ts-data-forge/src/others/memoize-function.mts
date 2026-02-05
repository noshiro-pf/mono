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
 *   key. Optional for zero-argument functions.
 * @returns A memoized version of the input function with the same signature
 *
 * @see https://en.wikipedia.org/wiki/Memoization
 */
export function memoizeFunction<R>(fn: () => R): () => R;

export function memoizeFunction<
  Arg0,
  const RestArgs extends readonly unknown[],
  R,
  K extends Primitive,
>(
  fn: (arg0: Arg0, ...args: RestArgs) => R,
  argsToCacheKey: (arg0: Arg0, ...args: RestArgs) => K,
): (arg0: Arg0, ...args: RestArgs) => R;

export function memoizeFunction<
  const Args extends readonly unknown[],
  R,
  K extends Primitive,
>(
  fn: (...args: Args) => R,
  argsToCacheKey?: (...args: Args) => K,
): (...args: Args) => R {
  type CacheEntry = Readonly<{ value: R }>;

  const mut_cache = new Map<K | symbol, CacheEntry>();

  const defaultKey = Symbol('memoize-default-key');

  return (...args: Args): R => {
    const key: K | symbol =
      argsToCacheKey === undefined ? defaultKey : argsToCacheKey(...args);

    const cached = mut_cache.get(key);

    if (cached !== undefined) {
      return cached.value;
    }

    const result = fn(...args);

    mut_cache.set(key, { value: result });

    return result;
  };
}

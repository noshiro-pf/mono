/**
 * Creates a memoized version of a function that caches results based on input arguments.
 *
 * The memoized function stores results in an internal Map and returns cached values
 * for repeated calls with the same arguments. This can significantly improve performance
 * for expensive computations or I/O operations.
 *
 * **Important considerations:**
 * - The cache grows unbounded - consider memory implications for long-running applications
 * - Cache keys must be primitives (string, number, boolean, symbol, null, undefined, bigint)
 * - Object arguments require careful key generation to ensure uniqueness
 * - Pure functions only - memoizing functions with side effects can lead to bugs
 *
 * @template A - The tuple type of the function arguments
 * @template R - The return type of the function
 * @template K - The primitive type used as the cache key (must be valid Map key)
 * @param fn - The pure function to memoize
 * @param argsToCacheKey - Function that converts arguments to a unique cache key
 * @returns A memoized version of the input function with the same signature
 *
 * @example Basic memoization for expensive calculations
 * ```typescript
 * // Fibonacci calculation (exponential time complexity)
 * const fibonacci = (n: number): number => {
 *   console.log(`Computing fib(${n})`);
 *   if (n <= 1) return n;
 *   return fibonacci(n - 1) + fibonacci(n - 2);
 * };
 *
 * const memoizedFib = memoizeFunction(
 *   fibonacci,
 *   (n) => n // Number itself as key
 * );
 *
 * memoizedFib(40); // Much faster than unmemoized version
 * memoizedFib(40); // Returns instantly from cache
 * ```
 *
 * @example Multi-argument functions with composite keys
 * ```typescript
 * // Grid calculation with x,y coordinates
 * const calculateGridValue = (x: number, y: number, scale: number): number => {
 *   console.log(`Computing grid(${x},${y},${scale})`);
 *   // Expensive computation...
 *   return Math.sin(x * scale) * Math.cos(y * scale);
 * };
 *
 * const memoizedGrid = memoizeFunction(
 *   calculateGridValue,
 *   (x, y, scale) => `${x},${y},${scale}` // String concatenation for composite key
 * );
 *
 * // Alternative: Using bit manipulation for integer coordinates
 * const memoizedGrid2 = memoizeFunction(
 *   calculateGridValue,
 *   (x, y, scale) => (x << 20) | (y << 10) | scale // Assuming small positive integers
 * );
 * ```
 *
 * @example Object arguments with selective memoization
 * ```typescript
 * interface User {
 *   id: number;
 *   name: string;
 *   email: string;
 *   metadata?: Record<string, unknown>;
 * }
 *
 * const fetchUserPermissions = async (user: User): Promise<string[]> => {
 *   console.log(`Fetching permissions for user ${user.id}`);
 *   const response = await api.get(`/permissions/${user.id}`);
 *   return response.data;
 * };
 *
 * // Memoize based only on user ID, ignoring other fields
 * const memoizedFetchPermissions = memoizeFunction(
 *   fetchUserPermissions,
 *   (user) => user.id // Only cache by ID
 * );
 *
 * // For multiple identifying fields
 * const processUserData = (user: User, orgId: number): ProcessedData => {
 *   // Complex processing...
 * };
 *
 * const memoizedProcess = memoizeFunction(
 *   processUserData,
 *   (user, orgId) => `${user.id}:${orgId}` // Composite key with separator
 * );
 * ```
 *
 * @example Memoizing recursive functions
 * ```typescript
 * // Recursive path finding
 * const findPaths = (start: string, end: string, visited: Set<string> = new Set()): string[][] => {
 *   if (start === end) return [[end]];
 *   // ... complex recursive logic
 * };
 *
 * // Use sorted, serialized visited set for consistent keys
 * const memoizedFindPaths = memoizeFunction(
 *   findPaths,
 *   (start, end, visited = new Set()) =>
 *     `${start}->${end}:[${[...visited].sort().join(',')}]`
 * );
 * ```
 *
 * @example Cache key strategies
 * ```typescript
 * // 1. Simple primitive argument
 * memoizeFunction(fn, (x: number) => x);
 *
 * // 2. Multiple arguments with separator
 * memoizeFunction(fn, (a: string, b: number) => `${a}|${b}`);
 *
 * // 3. Object with specific fields
 * memoizeFunction(fn, (obj: { id: number; version: number }) =>
 *   `${obj.id}:v${obj.version}`
 * );
 *
 * // 4. Array argument with JSON serialization
 * memoizeFunction(fn, (arr: number[]) => JSON.stringify(arr));
 *
 * // 5. Boolean flags as bit field
 * memoizeFunction(fn, (a: boolean, b: boolean, c: boolean) =>
 *   (a ? 4 : 0) | (b ? 2 : 0) | (c ? 1 : 0)
 * );
 * ```
 *
 * @example Memory-conscious memoization with weak references
 * ```typescript
 * // For object keys, consider using WeakMap externally
 * const cache = new WeakMap<object, Result>();
 *
 * function memoizeWithWeakMap<T extends object, R>(
 *   fn: (obj: T) => R
 * ): (obj: T) => R {
 *   return (obj: T): R => {
 *     if (cache.has(obj)) {
 *       return cache.get(obj)!;
 *     }
 *     const result = fn(obj);
 *     cache.set(obj, result);
 *     return result;
 *   };
 * }
 * ```
 *
 * @example Anti-patterns to avoid
 * ```typescript
 * // ❌ Bad: Memoizing impure functions
 * const memoizedRandom = memoizeFunction(
 *   () => Math.random(),
 *   () => 'key' // Always returns cached random value!
 * );
 *
 * // ❌ Bad: Memoizing functions with side effects
 * const memoizedLog = memoizeFunction(
 *   (msg: string) => { console.log(msg); return msg; },
 *   (msg) => msg // Logs only on first call!
 * );
 *
 * // ❌ Bad: Non-unique cache keys
 * const memoizedProcess = memoizeFunction(
 *   (user: User) => processUser(user),
 *   (user) => user.name // Multiple users can have same name!
 * );
 * ```
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

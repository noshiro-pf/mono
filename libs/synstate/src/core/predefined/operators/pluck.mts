import { map } from '../../operators/index.mjs';
import { type KeepInitialValueOperator } from '../../types/index.mjs';

/**
 * Extracts a property value from each emitted object by key.
 * Equivalent to `map(value => value[key])`.
 *
 * @template A - The type of the emitted object
 * @template K - The key to extract
 * @param key - The property key to pluck
 * @returns An operator that emits the property value
 *
 * @example
 * ```ts
 * //  Timeline:
 * //
 * //  user$   { name: "Alice", age: 25 }   { name: "Bob", age: 30 }
 * //  name$   "Alice"                       "Bob"
 * //
 * //  Explanation:
 * //  - getKey extracts a property value from each emitted object
 * //  - Equivalent to map(value => value[key])
 *
 * const user$ = source<Readonly<{ name: string; age: number }>>();
 *
 * const name$ = user$.pipe(getKey('name'));
 *
 * const valueHistory: string[] = [];
 *
 * name$.subscribe((n) => {
 *   valueHistory.push(n);
 * });
 *
 * user$.next({ name: 'Alice', age: 25 });
 *
 * assert.deepStrictEqual(valueHistory, ['Alice']);
 *
 * user$.next({ name: 'Bob', age: 30 });
 *
 * assert.deepStrictEqual(valueHistory, ['Alice', 'Bob']);
 * ```
 */
export const pluck = <A, K extends keyof A>(
  key: K,
): KeepInitialValueOperator<A, A[K]> => map((a) => a[key]);

/**
 * Alias for `pluck`.
 * @see pluck
 */
export const getKey = pluck;

import { asUint32 } from '../../number/index.mjs';

/**
 * Returns an iterator of `[index, value]` pairs for an array.
 *
 * @example
 *
 * ```ts
 * const tags = ['alpha', 'beta', 'gamma'] as const;
 *
 * const entryList = Array.from(
 *   Arr.entries(tags),
 *   ([index, tag]) => [Number(index), tag] as const,
 * );
 *
 * assert.deepStrictEqual(
 *   entryList,
 *   Array.from([
 *     [0, 'alpha'],
 *     [1, 'beta'],
 *     [2, 'gamma'],
 *   ]),
 * );
 * ```
 */
export const entries = function* <E>(
  array: readonly E[],
): ArrayIterator<readonly [SizeType.Arr, E]> {
  for (const [index, value] of array.entries()) {
    yield [asUint32(index), value] as const;
  }
};

/**
 * Returns an iterator of values for an array.
 *
 * @example
 *
 * ```ts
 * const players = ['Ada', 'Grace', 'Alan'] as readonly string[];
 *
 * const valueList = Array.from(Arr.values(players));
 *
 * assert.deepStrictEqual(valueList, players);
 * ```
 */
export const values = function* <E>(array: readonly E[]): ArrayIterator<E> {
  for (const value of array.values()) {
    yield value;
  }
};

/**
 * Returns an iterator of indices for an array.
 *
 * @example
 *
 * ```ts
 * const items = ['zero', 'one', 'two'] as const;
 *
 * const indexList = Array.from(Arr.indices(items));
 *
 * assert.deepStrictEqual(indexList, [0, 1, 2]);
 * ```
 */
export const indices = function* <E>(
  array: readonly E[],
): ArrayIterator<SizeType.Arr> {
  for (const key of array.keys()) {
    yield asUint32(key);
  }
};

/**
 * Alias for `indices`.
 *
 * @see {@link indices}
 */
export const keys = indices;

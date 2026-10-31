import type { MutableRecord, UnknownRecord } from 'ts-type-forge';
import { hasKey, isRecord } from '../guard/index.mjs';
import { fastDeepEqual } from './fast-deep-equal.mjs';

/**
 * Returns `next` with every part deeply equal to the same part of `current`
 * replaced by that part of `current` (structural sharing). When the whole of
 * `next` is deeply equal to `current`, `current` itself is returned, so an
 * `Object.is` comparison of the result with `current` tells whether anything
 * changed, and a reader that compares by reference sees a new object only where
 * the value really changed.
 *
 * Only plain objects and arrays are walked into. Anything else — a `Map`, a
 * `Set`, a `Date`, a class instance — is compared whole with
 * {@link fastDeepEqual} and kept or replaced whole.
 *
 * Array items are matched by index. Give `key` to match them by key instead:
 * an item for which it returns something other than `undefined` is matched with
 * the item of `current` it returns the same key for, and an item it returns
 * `undefined` for is still matched by index. The one `key` is used for the
 * arrays at every depth.
 *
 * Neither argument is changed. The result shares objects with both, so it
 * relies on neither being changed afterwards.
 *
 * Call it where the new value is written over the one held, so that nothing
 * downstream has a new object it must compare again.
 *
 * @param current - The value held now
 * @param next - The value to write over it
 * @param options - {@link ReplaceEqualDeepOptions}
 * @returns `current` when `next` is deeply equal to it; otherwise a value
 *   deeply equal to `next` that reuses the equal parts of `current`
 *
 * @example
 * ```ts
 * type PullReport = DeepReadonly<{
 *   summary: { open: number };
 *   pulls: { number: number; title: string }[];
 * }>;
 *
 * const held: PullReport = {
 *   summary: { open: 2 },
 *   pulls: [
 *     { number: 1, title: 'one' },
 *     { number: 2, title: 'two' },
 *   ],
 * } as const;
 *
 * // A server answers with the whole report every time.
 * const answer: PullReport = {
 *   summary: { open: 2 },
 *   pulls: [
 *     { number: 1, title: 'one' },
 *     { number: 2, title: 'two (edited)' },
 *   ],
 * } as const;
 *
 * const written = replaceEqualDeep(held, answer);
 *
 * assert.deepStrictEqual(written, answer);
 *
 * // What did not change is the object already held,
 * assert.strictEqual(written.summary, held.summary);
 *
 * assert.strictEqual(written.pulls[0], held.pulls[0]);
 *
 * // and what changed is new.
 * assert.notStrictEqual(written.pulls[1], held.pulls[1]);
 *
 * // An answer that changes nothing gives back the value held.
 * assert.strictEqual(replaceEqualDeep(held, structuredClone(held)), held);
 *
 * // Match array items by key rather than by index.
 * const opened = replaceEqualDeep(
 *   held.pulls,
 *   [{ number: 0, title: 'zero' }, ...structuredClone(held.pulls)],
 *   {
 *     key: (item) =>
 *       isRecord(item) && hasKey(item, 'number') ? item.number : undefined,
 *   },
 * );
 *
 * assert.strictEqual(opened[1], held.pulls[0]);
 *
 * assert.strictEqual(opened[2], held.pulls[1]);
 * ```
 */
export const replaceEqualDeep = <T,>(
  current: T,
  next: T,
  options?: ReplaceEqualDeepOptions,
): T =>
  // The walk sees `unknown`; what it returns is `current`, `next`, or a copy of
  // `next`'s shape whose parts are parts of either, so it is a `T`.
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  replace(current, next, options?.key) as T;

/** Options of {@link replaceEqualDeep}. */
export type ReplaceEqualDeepOptions = Readonly<{
  /**
   * The key an array item is matched by. Items it returns `undefined` for are
   * matched by index. Keys are compared with `SameValueZero`, as `Map` compares
   * them.
   */
  key?: (item: unknown) => unknown;
}>;

type Key = (item: unknown) => unknown;

const isPlainArray = (value: unknown): value is readonly unknown[] =>
  Array.isArray(value) && Object.getPrototypeOf(value) === Array.prototype;

const isPlainObject = (value: unknown): value is UnknownRecord =>
  isRecord(value) && Object.getPrototypeOf(value) === Object.prototype;

const replace = (
  current: unknown,
  next: unknown,
  key: Key | undefined,
): unknown =>
  Object.is(current, next)
    ? current
    : isPlainArray(current) && isPlainArray(next)
      ? replaceArray(current, next, key)
      : isPlainObject(current) && isPlainObject(next)
        ? replaceObject(current, next, key)
        : fastDeepEqual(current, next)
          ? current
          : next;

const indexByKey = (
  items: readonly unknown[],
  key: Key,
): ReadonlyMap<unknown, unknown> => {
  const mut_byKey = new Map<unknown, unknown>();

  for (const item of items) {
    const itemKey = key(item);

    if (itemKey !== undefined && !mut_byKey.has(itemKey)) {
      mut_byKey.set(itemKey, item);
    }
  }

  return mut_byKey;
};

// Each walk returns `current` when every part of the result is the same part of
// `current`, `next` when every part is the same part of `next` (nothing was
// reused, so no copy is needed), and the copy otherwise.

const replaceArray = (
  current: readonly unknown[],
  next: readonly unknown[],
  key: Key | undefined,
): readonly unknown[] => {
  const byKey = key === undefined ? undefined : indexByKey(current, key);

  let mut_isCurrent = current.length === next.length;

  let mut_isNext = true;

  const mut_shared: unknown[] = [];

  for (let mut_index = 0; mut_index < next.length; mut_index += 1) {
    const index = mut_index;

    const item = next[index];

    const itemKey = key?.(item);

    const before =
      itemKey === undefined || byKey === undefined
        ? index < current.length
          ? current[index]
          : absent
        : byKey.has(itemKey)
          ? byKey.get(itemKey)
          : absent;

    const result = before === absent ? item : replace(before, item, key);

    mut_isCurrent &&= Object.is(result, current[index]);

    mut_isNext &&= Object.is(result, item);

    mut_shared.push(result);
  }

  return mut_isCurrent ? current : mut_isNext ? next : mut_shared;
};

const replaceObject = (
  current: UnknownRecord,
  next: UnknownRecord,
  key: Key | undefined,
): UnknownRecord => {
  const nextKeys = Object.keys(next);

  let mut_isCurrent = Object.keys(current).length === nextKeys.length;

  let mut_isNext = true;

  const mut_shared: MutableRecord<string, unknown> = {};

  for (const k of nextKeys) {
    const value = next[k];

    const has = hasKey(current, k);

    const result = has ? replace(current[k], value, key) : value;

    mut_isCurrent &&= has && Object.is(result, current[k]);

    mut_isNext &&= Object.is(result, value);

    mut_shared[k] = result;
  }

  return mut_isCurrent ? current : mut_isNext ? next : mut_shared;
};

// What an item of `next` is matched with when nothing of `current` is.
const absent: unique symbol = Symbol('absent');

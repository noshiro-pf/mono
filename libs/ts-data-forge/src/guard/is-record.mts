import { isNonNullObject } from './is-non-null-object.mjs';

/**
 * Type guard that checks if a value is a plain object (record) - a non-null
 * object that is not an array.
 *
 * This function is useful for identifying "plain" JavaScript objects (also
 * called records or dictionaries) - objects that are typically used as
 * key-value collections. It excludes arrays, functions, and special object
 * types like Date, RegExp, etc., focusing on objects that can be safely treated
 * as property collections.
 *
 * **Type Narrowing Behavior:**
 *
 * - Narrows `unknown` to `UnknownRecord` (equivalent to `Record<PropertyKey,
 *   unknown>`)
 * - Excludes `null`, `undefined`, primitives, arrays, and functions
 * - Returns `true` for plain objects `{}`, object literals, and objects created
 *   with `Object.create()`
 * - Returns `false` for arrays, even though they are technically objects
 *
 * **Implementation:** Uses `isNonNullObject()` to check for objects, then
 * `Array.isArray()` to exclude arrays.
 *
 * @example
 *
 * ```ts
 * const entries: readonly unknown[] = [{ id: 1 }, 'str', 0, null];
 *
 * const records = entries.filter(isRecord);
 *
 * assert.deepStrictEqual(records, [{ id: 1 }]);
 * ```
 *
 * @param u - The value to check
 * @returns `true` if `u` is a non-null object and not an array, `false`
 *   otherwise. When `true`, TypeScript narrows the type to `UnknownRecord`.
 * @see {@link isNonNullObject} - For checking any object type (includes arrays)
 * @see {@link hasKey} - For checking if a record has specific keys
 */
export const isRecord = (u: unknown): u is UnknownRecord => isNonNullObject(u);

/**
 * Type guard that checks if a value is a mutable record (an object with mutable string keys).
 *
 * This function is an alias for {@link isRecord}, but narrows the type to
 * `MutableRecord<string, unknown>`, which is useful when you need to ensure
 * that the object can be safely mutated (i.e., its properties can be added or changed).
 *
 * **Type Narrowing Behavior:**
 *
 * - Narrows `unknown` to `MutableRecord<string, unknown>`
 * - Excludes `null`, `undefined`, primitives, arrays, and functions
 * - Returns `true` for plain objects with mutable string keys
 * - Returns `false` for arrays and other non-record types
 *
 * **Implementation:** This is a type alias for {@link isRecord}.
 *
 * @example
 * ```ts
 * const obj: unknown = { foo: 1 };
 *
 * if (isMutableRecord(obj)) {
 *   obj['bar'] = 2; // Safe: obj is now known to be a mutable record
 * }
 * ```
 *
 * @param u - The value to check
 * @returns `true` if `u` is a mutable record (plain object with string keys), `false` otherwise.
 *   When `true`, TypeScript narrows the type to `MutableRecord<string, unknown>`.
 * @see {@link isRecord} - For the underlying implementation and more details
 */
export const isMutableRecord: (
  u: unknown,
) => u is MutableRecord<string, unknown> = isRecord;

import { type MutableRecord, type UnknownRecord } from 'ts-type-forge';
import { isNonNullObject } from './is-non-null-object.mjs';

/**
 * Type guard that checks if a value is a record — a non-null, non-array
 * object — and narrows it to `UnknownRecord` (= `ReadonlyRecord<string,
 * unknown>`).
 *
 * This function is designed to be combined with {@link hasKey} to probe
 * values of type `unknown` (e.g. parsed JSON, caught errors, external data)
 * in a type-safe way: `if (isRecord(u) && hasKey(u, 'some-key')) { ... }`.
 *
 * **Type Narrowing Behavior:**
 *
 * - Narrows `unknown` to `UnknownRecord` (= `ReadonlyRecord<string, unknown>`)
 * - Excludes `null`, `undefined`, primitives, and functions
 * - Excludes arrays: arrays have no string index signature, so they are not
 *   assignable to `UnknownRecord`; admitting them at runtime would be
 *   inconsistent with the narrowed type
 * - Returns `true` for every other non-null object, including dictionary
 *   objects created with `Object.create(null)` and instances such as `Date`,
 *   `RegExp`, `Map`, `Set`, `Error`, and user-defined classes
 *
 * **Why non-plain objects are included:** since every property of
 * `UnknownRecord` is typed `unknown`, reading properties from any object
 * through this narrowing is type-safe, and `hasKey` (backed by
 * `Object.hasOwn`) answers own-property questions correctly on any object
 * (e.g. `Map` entries are not own properties, so `hasKey` correctly returns
 * `false` for them). Restricting the guard to plain objects would require
 * prototype checks that misjudge cross-realm objects and would prevent
 * probing useful instances such as `Error` subclasses.
 *
 * **Implementation:** `isNonNullObject(u) && !Array.isArray(u)`.
 *
 * @example
 *
 * ```ts
 * const entries: readonly unknown[] = [
 *   { id: 1 },
 *   [1, 2],
 *   'str',
 *   0,
 *   null,
 * ] as const;
 *
 * const records = entries.filter(isRecord);
 *
 * assert.deepStrictEqual(records, [{ id: 1 }]);
 * ```
 *
 * @param u - The value to check
 * @returns `true` if `u` is a non-null, non-array object, `false` otherwise.
 *   When `true`, TypeScript narrows the type to `UnknownRecord`.
 * @see {@link isNonNullObject} - For checking any non-null object (includes arrays)
 * @see {@link hasKey} - For checking if a record has specific keys
 */
export const isRecord = (u: unknown): u is UnknownRecord =>
  isNonNullObject(u) && !Array.isArray(u);

/**
 * Type guard that checks if a value is a mutable record.
 *
 * This function has the same runtime behavior as {@link isRecord} (non-null,
 * non-array object check), but narrows the type to `MutableRecord<string,
 * unknown>`, which is useful when you need to add or overwrite properties on
 * the narrowed object.
 *
 * **Type Narrowing Behavior:**
 *
 * - Narrows `unknown` to `MutableRecord<string, unknown>`
 * - Excludes `null`, `undefined`, primitives, functions, and arrays
 * - Returns `true` for every other non-null object (see {@link isRecord} for
 *   details on non-plain objects such as `Date`, `Map`, and `Set`)
 *
 * **Implementation:** This is a type alias for {@link isRecord}.
 *
 * @example
 *
 * ```ts
 * const obj: unknown = { foo: 1 } as const;
 *
 * if (isMutableRecord(obj)) {
 *   obj['bar'] = 2; // Safe: obj is now known to be a mutable record
 * }
 * ```
 *
 * @param u - The value to check
 * @returns `true` if `u` is a non-null, non-array object, `false` otherwise.
 *   When `true`, TypeScript narrows the type to `MutableRecord<string,
 *   unknown>`.
 * @see {@link isRecord} - For the underlying implementation and more details
 */
export const isMutableRecord: (
  u: unknown,
) => u is MutableRecord<string, unknown> = isRecord;

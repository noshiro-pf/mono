import { expectType } from '../expect-type.mjs';

/**
 * Type guard that checks if a value is a primitive type.
 *
 * This function identifies JavaScript primitive types, which are immutable data
 * types that are not objects. The primitive types are: `string`, `number`,
 * `boolean`, `undefined`, `symbol`, `bigint`, and `null`.
 *
 * **Important Note:** Although `null` has `typeof null === "object"` due to a
 * historical JavaScript quirk, this function correctly identifies `null` as a
 * primitive value.
 *
 * **Type Narrowing Behavior:**
 *
 * - Narrows the input type to `Primitive` (union of all primitive types)
 * - Excludes object types, arrays, functions, and other non-primitive values
 * - Includes `null` despite its misleading `typeof` result
 *
 * @example
 *
 * ```ts
 * const values: readonly unknown[] = [42, 'Ada', null, { id: 1 }] as const;
 *
 * const primitives = values.filter(isPrimitive);
 *
 * assert.deepStrictEqual(primitives, [42, 'Ada', null]);
 * ```
 *
 * @param u - The value to check
 * @returns `true` if `u` is a primitive type, `false` otherwise. When `true`,
 *   TypeScript narrows the type to `Primitive`.
 */
export const isPrimitive = (u: unknown): u is Primitive => {
  switch (typeof u) {
    case 'string':
    case 'number':
    case 'boolean':
    case 'undefined':
    case 'symbol':
    case 'bigint':
      return true;
    case 'function':
    case 'object':
      return u === null;
  }
};

expectType<
  bigint | boolean | number | string | symbol | undefined | null,
  Primitive
>('=');

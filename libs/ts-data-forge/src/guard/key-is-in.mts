/**
 * Type guard that checks if a key exists as an own property in an object.
 *
 * This function is similar to `hasKey()` but with reversed parameter order and
 * different type narrowing behavior. While `hasKey()` narrows the object type,
 * `keyIsIn()` narrows the key type to be a valid key of the given object.
 *
 * **Type Narrowing Behavior:**
 *
 * - Narrows the key type to be a key that exists in the object (`K & keyof R`)
 * - Useful when you have a dynamic key and want to ensure it's valid for a
 *   specific object
 * - The object type remains unchanged
 *
 * **Implementation:** Uses `Object.hasOwn()` to check for own properties (not
 * inherited).
 *
 * @example
 *
 * ```ts
 * const user = { id: 1, name: 'Ada' } as const;
 * const maybeKey: string = 'name';
 *
 * if (keyIsIn(maybeKey, user)) {
 *   assert(user[maybeKey] === 'Ada');
 * } else {
 *   assert.fail('Expected a known key.');
 * }
 * ```
 *
 * @template K - The type of the key to check, must extend PropertyKey (string |
 *   number | symbol)
 * @template R - The type of the record (object), must extend UnknownRecord
 * @param key - The key to check for
 * @param obj - The object to check within
 * @returns `true` if `key` is an own property of `obj`, `false` otherwise. When
 *   `true`, TypeScript narrows the key type to be a valid key of the object.
 * @see {@link hasKey} - Similar function that narrows the object type instead of the key type
 */
export const keyIsIn = <
  const K extends PropertyKey,
  const R extends UnknownRecord,
>(
  key: K,
  obj: R,
): key is K & keyof typeof obj => Object.hasOwn(obj, key);

/**
 * Type guard function that checks if an object has a specific key as its own
 * property.
 *
 * This function uses `Object.hasOwn()` to check if the given object has the
 * specified key as its own property (not inherited). It acts as a type guard
 * that narrows the type of the object to guarantee the key exists, enabling
 * type-safe property access.
 *
 * **Type Narrowing Behavior:**
 *
 * - When the guard returns `true`, TypeScript narrows the object type to include
 *   the checked key
 * - For union types, only union members that contain the key are preserved
 * - The key's value type is preserved from the original object type when possible
 *
 * @example
 *
 * ```ts
 * const maybeUser: { id?: number; name?: string } = { id: 42 };
 *
 * if (hasKey(maybeUser, 'id')) {
 *   // `maybeUser` is now known to have an `id` property.
 *   assert.isTrue(maybeUser.id === 42);
 * } else {
 *   assert.fail();
 * }
 * ```
 *
 * @template R - The type of the input object, must extend UnknownRecord
 * @template K - The type of the key to check for, must extend PropertyKey
 *   (string | number | symbol)
 * @param obj - The object to check for the presence of the key
 * @param key - The key to check for in the object
 * @returns `true` if the object has the specified key as its own property,
 *   `false` otherwise. When `true`, TypeScript narrows the object type to
 *   guarantee the key exists.
 * @see {@link keyIsIn} - Similar function that narrows the key type instead of the object type
 */
export const hasKey = <
  const R extends UnknownRecord,
  const K extends PropertyKey,
>(
  obj: R,
  key: K,
): obj is HasKeyReturnType<R, K> => Object.hasOwn(obj, key);

/**
 * @internal
 * When R is a union type (including the case with only one element), if any element in the union
 * contains K as a key, returns a type that narrows the union to only those elements that contain K as a key.
 * If none of the elements in the union contain K as a key, returns `ReadonlyRecord<K, unknown>`.
 * The result is made readonly.
 */
export type HasKeyReturnType<
  R extends UnknownRecord,
  K extends PropertyKey,
> = R extends R // union distribution
  ? K extends keyof R
    ? string extends keyof R
      ? ReadonlyRecord<K, R[keyof R]> & R
      : number extends keyof R
        ? ReadonlyRecord<K, R[keyof R]> & R
        : symbol extends keyof R
          ? ReadonlyRecord<K, R[keyof R]> & R
          : R
    : never // omit union member that does not have key K
  : never; // dummy case for union distribution

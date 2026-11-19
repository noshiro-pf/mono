import type { ReadonlyRecord, UnknownRecord } from 'ts-type-forge';

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
 * - Where the guard returns `true`, the object type gains the checked key, typed
 *   as the object type declares it, or `unknown`.
 * - Where it returns `false`, the object type is left as it is. `false` says only
 *   that there is no *own* property `key`; a type does not tell an own property
 *   from an inherited one, and a value may have properties its type does not
 *   name, so no member of a union can be ruled out.
 * - It narrows only for one literal key that no member of the object type
 *   declares as required. For a required key, a union of keys, a key typed
 *   `string`, or a union of shapes told apart by a key, it narrows nothing either
 *   way: tell such a union apart with a discriminant property. Failing one, a
 *   type guard written for the union, such as
 *   `(r: A | B): r is B => hasKey(r, 'b')`, is its author's claim that no `A`
 *   holds an own `b`.
 *
 * **Own properties only:** a property inherited from the prototype chain is not
 * seen, and that includes an accessor declared in a class (`get partial() {…}`),
 * which lives on the class's prototype rather than on its instances. Read such
 * a property through the prototype chain instead, with `Reflect.get(obj, key)`.
 *
 * @example
 *
 * ```ts
 * const maybeUser: Readonly<{ id?: number; name?: string }> = {
 *   id: 42,
 * } as const;
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
 *   guarantee the key exists, as described above.
 * @see {@link keyIsIn} - Similar function that narrows the key type instead of the object type
 */
export function hasKey<
  const R extends UnknownRecord,
  const K extends PropertyKey,
>(obj: R, key: K & HasKeyNarrowableKey<R, K>): obj is HasKeyReturnType<R, K>;

/**
 * Checks if an object has a specific key as its own property, without
 * narrowing: the overload for any call the one above does not take, which is a
 * key that is not one literal (`string`, `number`, `symbol`, a template literal
 * pattern or a union of keys), a key some member of the object's type declares
 * as required, and an object of a generic type.
 *
 * @param obj - The object to check for the presence of the key
 * @param key - The key to check for in the object
 * @returns `true` if the object has the specified key as its own property,
 *   `false` otherwise.
 * @see {@link keyIsIn} - Narrows a key typed `string` instead, before `obj[key]`
 */
export function hasKey(obj: UnknownRecord, key: PropertyKey): boolean;

export function hasKey(obj: UnknownRecord, key: PropertyKey): boolean {
  return Object.hasOwn(obj, key);
}

/**
 * What {@link hasKey} narrows an `obj` of type `R` to where it returns `true`:
 * each member of `R` with the property `K` added, typed as that member declares
 * it, or `unknown` where it declares no such property.
 */
export type HasKeyReturnType<
  R extends UnknownRecord,
  K extends PropertyKey,
> = R extends unknown // union distribution
  ? R & Readonly<{ [P in K]: P extends keyof R ? R[P] : unknown }>
  : never;

/**
 * `K` where {@link hasKey} may narrow an `obj` of type `R`, and `never`
 * otherwise, which leaves the call to the overload that returns `boolean`.
 *
 * A type predicate narrows both ways, but `hasKey` returning `false` says only
 * that `obj` has no own property `key`. No member of `R` may be removed there,
 * which holds when none is assignable to the narrowed type: `K` must be one
 * literal key that no member of `R` declares as required.
 *
 * @internal A step of {@link hasKey}'s signature; a consumer spells `hasKey`.
 */
type HasKeyNarrowableKey<R, K extends PropertyKey> =
  IsOneKey<K> extends true
    ? // A property is optional in the first and required in the second only
      // where `K` is a literal. Where `K` is `string`, `number`, `symbol`, a
      // template literal pattern or `never`, both are the same index signature,
      // or no property at all.
      Partial<ReadonlyRecord<K, unknown>> extends ReadonlyRecord<K, unknown>
      ? never
      : // `& UnknownRecord` keeps it from being compared with a member of `R` that
        // spells the same alias, `ReadonlyRecord<string, …>`, by the alias's
        // type arguments, which would take the index signature for `K`.
        true extends (
            R extends ReadonlyRecord<K, unknown> & UnknownRecord ? true : false
          )
        ? never
        : K
    : never;

/**
 * `true` when `K` is not a union.
 *
 * @internal A step of {@link HasKeyNarrowableKey}.
 */
type IsOneKey<
  K extends PropertyKey,
  K0 extends PropertyKey = K,
> = K extends unknown ? ([K0] extends [K] ? true : false) : never;

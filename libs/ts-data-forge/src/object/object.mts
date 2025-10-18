/**
 * A collection of type-safe object utility functions providing functional
 * programming patterns for object manipulation, including pick, omit, shallow
 * equality checks, and more.
 *
 * All functions maintain TypeScript type safety and support both direct and
 * curried usage patterns for better composition with pipe operations.
 */
export namespace Obj {
  /**
   * Performs a shallow equality check on two records using a configurable
   * equality function. Verifies that both records have the same number of
   * entries and that for every key in the first record, the corresponding value
   * passes the equality test with the value in the second record.
   *
   * @example
   *
   * ```ts
   * const obj1 = { name: 'Alice', age: 30 };
   * const obj2 = { name: 'Alice', age: 30 };
   * const obj3 = { name: 'Alice', age: 31 };
   *
   * assert.ok(Obj.shallowEq(obj1, obj2));
   * assert.notOk(Obj.shallowEq(obj1, obj3));
   *
   * // Custom equality function
   * const obj4 = { value: 1 };
   * const obj5 = { value: 1.00001 };
   *
   * const closeEnough = (a: unknown, b: unknown): boolean => {
   *   if (typeof a === 'number' && typeof b === 'number') {
   *     return Math.abs(a - b) < 0.001;
   *   }
   *   return Object.is(a, b);
   * };
   *
   * assert.ok(Obj.shallowEq(obj4, obj5, closeEnough));
   * ```
   *
   * @param a - The first record to compare
   * @param b - The second record to compare
   * @param eq - Optional equality function (defaults to Object.is for strict
   *   equality)
   * @returns `true` if the records are shallowly equal according to the
   *   equality function, `false` otherwise
   */
  export const shallowEq = (
    a: UnknownRecord,
    b: UnknownRecord,
    eq: (x: unknown, y: unknown) => boolean = Object.is,
  ): boolean => {
    const aEntries = Object.entries(a);
    const bEntries = Object.entries(b);

    if (aEntries.length !== bEntries.length) return false;

    return aEntries.every(([k, v]) => eq(b[k], v));
  };

  /**
   * Creates a new record that contains only the specified keys from the source
   * record. This function supports both direct usage and curried form for
   * functional composition.
   *
   * **Type Safety**: Only keys that exist in the source record type are
   * allowed, preventing runtime errors from accessing non-existent properties.
   *
   * @example
   *
   * ```ts
   * const user = {
   *   id: 1,
   *   name: 'Bob',
   *   email: 'bob@example.com',
   *   password: 'secret',
   *   role: 'admin',
   * };
   *
   * // Direct usage
   * const publicInfo = Obj.pick(user, ['id', 'name', 'role']);
   * assert.deepStrictEqual(publicInfo, {
   *   id: 1,
   *   name: 'Bob',
   *   role: 'admin',
   * });
   *
   * // Curried usage with pipe
   * const nameAndEmail = pipe(user).map(Obj.pick(['name', 'email'])).value;
   *
   * assert.deepStrictEqual(nameAndEmail, {
   *   name: 'Bob',
   *   email: 'bob@example.com',
   * });
   * ```
   *
   * @template R - The type of the input record
   * @template Keys - The readonly array type of keys to pick from the record
   * @param record - The source record to pick properties from
   * @param keys - A readonly array of keys to include in the result
   * @returns A new record containing only the specified keys and their values
   */
  export function pick<
    const R extends UnknownRecord,
    const Keys extends readonly (keyof R)[],
  >(record: R, keys: Keys): Pick<R, ArrayElement<Keys>>;

  // Curried version
  export function pick<const Keys extends readonly PropertyKey[]>(
    keys: Keys,
  ): <const R extends UnknownRecord>(
    record: R,
  ) => RelaxedPick<R, ArrayElement<Keys>>;

  export function pick<
    const R extends UnknownRecord,
    const Keys extends readonly (keyof R)[],
  >(
    ...args: readonly [record: R, keys: Keys] | readonly [keys: Keys]
  ):
    | Pick<R, ArrayElement<Keys>>
    | ((record: R) => RelaxedPick<R, ArrayElement<Keys>>) {
    switch (args.length) {
      case 2: {
        const [record, keys] = args;
        const keysSet = new Set<keyof R>(keys);

        return (
          // eslint-disable-next-line total-functions/no-unsafe-type-assertion
          Object.fromEntries(
            Object.entries(record).filter(([k, _v]) => keysSet.has(k)),
          ) as never
        );
      }

      case 1: {
        const [keys] = args;
        return (record: R) => pick(record, keys);
      }
    }
  }

  /**
   * Creates a new record that excludes the specified keys from the source
   * record. This function supports both direct usage and curried form for
   * functional composition.
   *
   * **Type Safety**: Only keys that exist in the source record type are
   * allowed, and the return type precisely reflects which properties remain
   * after omission.
   *
   * @example
   *
   * ```ts
   * const user = {
   *   id: 1,
   *   name: 'Charlie',
   *   email: 'charlie@example.com',
   *   password: 'secret123',
   *   internalNote: 'VIP customer',
   * };
   *
   * // Direct usage - remove sensitive fields
   * const safeUser = Obj.omit(user, ['password', 'internalNote']);
   * assert.deepStrictEqual(safeUser, {
   *   id: 1,
   *   name: 'Charlie',
   *   email: 'charlie@example.com',
   * });
   *
   * // Curried usage with pipe
   * const withoutEmail = pipe(user).map(Obj.omit(['email', 'password'])).value;
   *
   * assert.deepStrictEqual(withoutEmail, {
   *   id: 1,
   *   name: 'Charlie',
   *   internalNote: 'VIP customer',
   * });
   * ```
   *
   * @template R - The type of the input record
   * @template Keys - The readonly array type of keys to omit from the record
   * @param record - The source record to omit properties from
   * @param keys - A readonly array of keys to exclude from the result
   * @returns A new record containing all properties except the specified keys
   */
  export function omit<
    const R extends UnknownRecord,
    const Keys extends readonly (keyof R)[],
  >(record: R, keys: Keys): Omit<R, ArrayElement<Keys>>;

  // Curried version
  export function omit<const Keys extends readonly PropertyKey[]>(
    keys: Keys,
  ): <const R extends UnknownRecord>(record: R) => Omit<R, ArrayElement<Keys>>;

  export function omit<
    const R extends UnknownRecord,
    const Keys extends readonly (keyof R)[],
  >(
    ...args:
      | readonly [record: R, keys: Keys]
      | readonly [keys: readonly PropertyKey[]]
  ):
    | Omit<R, ArrayElement<Keys>>
    | ((record: R) => Omit<R, ArrayElement<Keys>>) {
    switch (args.length) {
      case 2: {
        const [record, keys] = args;
        const keysSet = new Set<keyof R>(keys);

        return (
          // eslint-disable-next-line total-functions/no-unsafe-type-assertion
          Object.fromEntries(
            Object.entries(record).filter(([k, _v]) => !keysSet.has(k)),
          ) as never
        );
      }

      case 1: {
        const [keys] = args;
        return <R2 extends UnknownRecord>(record: R2) => {
          // eslint-disable-next-line total-functions/no-unsafe-type-assertion
          const result = omit(record, keys as readonly (keyof R2)[]) as Omit<
            R2,
            ArrayElement<Keys>
          >;
          return result;
        };
      }
    }
  }

  /**
   * Creates an object from an array of key-value pairs with precise TypeScript
   * typing. This is a type-safe wrapper around `Object.fromEntries` that
   * provides better type inference and compile-time guarantees about the
   * resulting object structure.
   *
   * **Type Behavior**:
   *
   * - When entries is a fixed-length tuple, the exact object type is inferred
   * - When entries has dynamic length with union key types, `Partial` is applied
   *   to prevent incorrect assumptions about which keys will be present
   *
   * @example
   *
   * ```ts
   * // Fixed-length tuple - exact type inferred
   * const entries1 = [
   *   ['name', 'David'],
   *   ['age', 25],
   *   ['active', true],
   * ] as const;
   *
   * const obj1 = Obj.fromEntries(entries1);
   * assert.deepStrictEqual(obj1, {
   *   name: 'David',
   *   age: 25,
   *   active: true,
   * });
   *
   * // Dynamic length array - Partial type applied
   * const dynamicEntries: (readonly ['x' | 'y', number])[] = [
   *   ['x', 10],
   *   ['y', 20],
   * ];
   *
   * const obj2 = Obj.fromEntries(dynamicEntries);
   * assert.deepStrictEqual(obj2, { x: 10, y: 20 });
   * ```
   *
   * @template Entries - The readonly array type of key-value entry tuples
   * @param entries - An array of readonly key-value entry tuples `[key, value]`
   * @returns An object created from the entries with precise typing
   */
  export const fromEntries = <
    const Entries extends readonly (readonly [PropertyKey, unknown])[],
  >(
    entries: Entries,
  ): IsFixedLengthList<Entries> extends true
    ? TsDataForgeInternals.EntriesToObject<Entries>
    : TsDataForgeInternals.PartialIfKeyIsUnion<
        TsDataForgeInternals.KeysOfEntries<Entries>,
        ReadonlyRecord<
          TsDataForgeInternals.KeysOfEntries<Entries>,
          TsDataForgeInternals.ValuesOfEntries<Entries>
        >
      > =>
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    Object.fromEntries(entries) as never;

  /**
   * @internal
   * Internal type utilities for the Obj module.
   */
  declare namespace TsDataForgeInternals {
    type RecursionLimit = 20;

    /** - `[['x', 1], ['y', 3]]` -> `{ x: 1, y: 3 }` */
    export type EntriesToObject<
      Entries extends readonly (readonly [PropertyKey, unknown])[],
      // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    > = Readonly<EntriesToObjectImpl<{}, Entries>>;

    /** @internal */
    type EntriesToObjectImpl<
      R,
      Entries extends readonly (readonly [PropertyKey, unknown])[],
    > =
      TypeEq<Entries['length'], 0> extends true
        ? R
        : EntriesToObjectImpl<
            R & Readonly<Record<Entries[0][0], Entries[0][1]>>,
            List.Tail<Entries>
          >;

    /**
     * - `['x' | 'y' | 'z', number][]]` -> `'x' | 'y' | 'z'`
     * - `[['a' | 'b' | 'c', number], ...['x' | 'y' | 'z', number][]]` -> `'a' |
     *   'b' | 'c' | 'x' | 'y' | 'z'`
     *
     * @note To handle the second example above, recursion needs to be performed on infinite-length Entries,
     * but since the timing to stop cannot be determined, a recursion limit is set.
     */
    export type KeysOfEntries<
      Entries extends readonly (readonly [PropertyKey, unknown])[],
    > = KeysOfEntriesImpl<never, Entries, RecursionLimit>;

    type KeysOfEntriesImpl<
      K,
      Entries extends readonly (readonly [PropertyKey, unknown])[],
      RemainingNumRecursions extends number,
    > =
      TypeEq<RemainingNumRecursions, 0> extends true
        ? K
        : TypeEq<Entries['length'], 0> extends true
          ? K
          : KeysOfEntriesImpl<
              K | Entries[0][0],
              List.Tail<Entries>,
              Decrement<RemainingNumRecursions>
            >;

    export type ValuesOfEntries<
      Entries extends readonly (readonly [PropertyKey, unknown])[],
    > = ValuesOfEntriesImpl<never, Entries, RecursionLimit>;

    type ValuesOfEntriesImpl<
      K,
      Entries extends readonly (readonly [PropertyKey, unknown])[],
      RemainingNumRecursions extends number,
    > =
      TypeEq<RemainingNumRecursions, 0> extends true
        ? K
        : TypeEq<Entries['length'], 0> extends true
          ? K
          : ValuesOfEntriesImpl<
              K | Entries[0][1],
              List.Tail<Entries>,
              Decrement<RemainingNumRecursions>
            >;

    export type PartialIfKeyIsUnion<K, T> =
      IsUnion<K> extends true ? Partial<T> : T;
  }
}

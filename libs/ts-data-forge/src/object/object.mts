/* eslint-disable @typescript-eslint/no-unsafe-type-assertion */
/**
 * A collection of type-safe object utility functions providing functional programming patterns
 * for object manipulation, including pick, omit, shallow equality checks, and more.
 *
 * All functions maintain TypeScript type safety and support both direct and curried usage patterns
 * for better composition with pipe operations.
 */
export namespace Obj {
  /**
   * Performs a shallow equality check on two records using a configurable equality function.
   * Verifies that both records have the same number of entries and that for every key in the first record,
   * the corresponding value passes the equality test with the value in the second record.
   *
   * @param a - The first record to compare
   * @param b - The second record to compare
   * @param eq - Optional equality function (defaults to Object.is for strict equality)
   * @returns `true` if the records are shallowly equal according to the equality function, `false` otherwise
   *
   * @example
   * ```typescript
   * // Basic usage with default Object.is equality
   * Obj.shallowEq({ x: 1, y: 2 }, { x: 1, y: 2 }); // true
   * Obj.shallowEq({ x: 1 }, { x: 1, y: 2 }); // false (different number of keys)
   * Obj.shallowEq({ x: 1 }, { x: 2 }); // false (different values)
   * Obj.shallowEq({}, {}); // true (both empty)
   *
   * // String comparisons
   * Obj.shallowEq({ a: "hello" }, { a: "hello" }); // true
   * Obj.shallowEq({ a: "hello" }, { a: "world" }); // false
   *
   * // Using custom equality function
   * const caseInsensitiveEq = (a: unknown, b: unknown) =>
   *   typeof a === 'string' && typeof b === 'string'
   *     ? a.toLowerCase() === b.toLowerCase()
   *     : a === b;
   *
   * Obj.shallowEq({ name: "ALICE" }, { name: "alice" }, caseInsensitiveEq); // true
   *
   * // Handling special values
   * Obj.shallowEq({ x: NaN }, { x: NaN }); // true (Object.is treats NaN === NaN)
   * Obj.shallowEq({ x: +0 }, { x: -0 }); // false (Object.is distinguishes +0 and -0)
   * ```
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
   * Creates a new record that contains only the specified keys from the source record.
   * This function supports both direct usage and curried form for functional composition.
   *
   * **Type Safety**: Only keys that exist in the source record type are allowed,
   * preventing runtime errors from accessing non-existent properties.
   *
   * @template R - The type of the input record
   * @template Keys - The readonly array type of keys to pick from the record
   *
   * @param record - The source record to pick properties from
   * @param keys - A readonly array of keys to include in the result
   * @returns A new record containing only the specified keys and their values
   *
   * @example
   * ```typescript
   * // Direct usage
   * const original = { a: 1, b: 2, c: 3, d: 4 };
   * Obj.pick(original, ['a', 'c']); // { a: 1, c: 3 }
   * Obj.pick(original, ['b']); // { b: 2 }
   * Obj.pick(original, []); // {} (empty result)
   *
   * // Real-world example with user data
   * const user = {
   *   id: 1,
   *   name: "Alice",
   *   email: "alice@example.com",
   *   password: "secret123",
   *   age: 30
   * };
   *
   * // Extract public user information
   * const publicUser = Obj.pick(user, ['id', 'name', 'email']);
   * // Result: { id: 1, name: "Alice", email: "alice@example.com" }
   *
   * // Curried usage for functional composition
   * const pickIdAndName = Obj.pick(['id', 'name'] as const);
   * const users = [user, { id: 2, name: "Bob", email: "bob@example.com", age: 25 }];
   * const publicUsers = users.map(pickIdAndName);
   * // Result: [{ id: 1, name: "Alice" }, { id: 2, name: "Bob" }]
   *
   * // Using with pipe for data transformation
   * import { pipe } from '../functional/pipe.mjs';
   * const result = pipe(user)
   *   .map(Obj.pick(['id', 'name']))
   *   .map(u => ({ ...u, displayName: u.name.toUpperCase() }))
   *   .value;
   * // Result: { id: 1, name: "Alice", displayName: "ALICE" }
   *
   * // Type safety prevents invalid keys
   * // Obj.pick(user, ['invalidKey']); // ❌ TypeScript error
   * // Obj.pick(user, ['id', 'nonExistentField']); // ❌ TypeScript error
   *
   * // Partial key selection (when some keys might not exist)
   * const partialUser = { id: 1, name: "Alice" } as const;
   * const pickVisible = Obj.pick(['name', 'age']); // age might not exist
   * const visible = pickVisible(partialUser); // { name: "Alice" } (age omitted)
   * ```
   */
  export const pick: PickFnOverload = (<
    const R extends UnknownRecord,
    const Keys extends readonly (keyof R)[],
  >(
    ...args:
      | readonly [record: R, keys: Keys]
      | readonly [keys: readonly PropertyKey[]]
  ):
    | Pick<R, ArrayElement<Keys>>
    | ((record: R) => RelaxedPick<R, ArrayElement<Keys>>) => {
    switch (args.length) {
      case 2: {
        const [record, keys] = args;
        const keysSet = new Set<keyof R>(keys);

        return Object.fromEntries(
          Object.entries(record).filter(([k, _v]) => keysSet.has(k)),
        ) as never;
      }

      case 1: {
        const [keys] = args;
        return <R2 extends UnknownRecord>(record: R2) =>
          pick(record, keys as readonly (keyof R2)[]);
      }
    }
  }) as PickFnOverload;

  type PickFnOverload = {
    <const R extends UnknownRecord, const Keys extends readonly (keyof R)[]>(
      record: R,
      keys: Keys,
    ): Pick<R, ArrayElement<Keys>>;

    // Curried version
    <const Keys extends readonly PropertyKey[]>(
      keys: Keys,
    ): <const R extends UnknownRecord>(
      record: R,
    ) => RelaxedPick<R, ArrayElement<Keys>>;
  };

  /**
   * Creates a new record that excludes the specified keys from the source record.
   * This function supports both direct usage and curried form for functional composition.
   *
   * **Type Safety**: Only keys that exist in the source record type are allowed,
   * and the return type precisely reflects which properties remain after omission.
   *
   * @template R - The type of the input record
   * @template Keys - The readonly array type of keys to omit from the record
   *
   * @param record - The source record to omit properties from
   * @param keys - A readonly array of keys to exclude from the result
   * @returns A new record containing all properties except the specified keys
   *
   * @example
   * ```typescript
   * // Direct usage
   * const original = { a: 1, b: 2, c: 3, d: 4 };
   * Obj.omit(original, ['a', 'c']); // { b: 2, d: 4 }
   * Obj.omit(original, ['b']); // { a: 1, c: 3, d: 4 }
   * Obj.omit(original, []); // { a: 1, b: 2, c: 3, d: 4 } (no keys omitted)
   *
   * // Real-world example: removing sensitive data
   * const user = {
   *   id: 1,
   *   name: "Alice",
   *   email: "alice@example.com",
   *   password: "secret123",
   *   apiKey: "abc-def-ghi",
   *   lastLogin: new Date()
   * };
   *
   * // Create safe user object for client-side
   * const safeUser = Obj.omit(user, ['password', 'apiKey']);
   * // Result: { id: 1, name: "Alice", email: "alice@example.com", lastLogin: Date }
   *
   * // Curried usage for data processing pipelines
   * const removeSensitive = Obj.omit(['password', 'apiKey', 'ssn'] as const);
   * const users = [user]; // array of user objects
   * const safeUsers = users.map(removeSensitive);
   *
   * // Using with pipe for complex transformations
   * import { pipe } from '../functional/pipe.mjs';
   * const publicProfile = pipe(user)
   *   .map(Obj.omit(['password', 'apiKey']))
   *   .map(u => ({ ...u, displayName: u.name.toUpperCase() }))
   *   .value;
   * // Result: { id: 1, name: "Alice", email: "...", lastLogin: Date, displayName: "ALICE" }
   *
   * // Database queries: exclude computed fields
   * const dbUser = {
   *   id: 1,
   *   name: "Alice",
   *   email: "alice@example.com",
   *   createdAt: new Date(),
   *   updatedAt: new Date(),
   *   fullName: "Alice Johnson", // computed field
   *   isActive: true // computed field
   * };
   *
   * const storableData = Obj.omit(dbUser, ['fullName', 'isActive']);
   * // Only data that should be persisted to database
   *
   * // Type safety prevents invalid operations
   * // Obj.omit(user, ['invalidKey']); // ❌ TypeScript error
   * // Obj.omit(user, ['id', 'nonExistentField']); // ❌ TypeScript error
   *
   * // Handling partial omission (when some keys might not exist)
   * const partialUser = { id: 1, name: "Alice", password: "secret" } as const;
   * const omitCredentials = Obj.omit(['password', 'apiKey']); // apiKey might not exist
   * const cleaned = omitCredentials(partialUser); // { id: 1, name: "Alice" }
   * ```
   */
  export const omit: OmitFnOverload = (<
    const R extends UnknownRecord,
    const Keys extends readonly (keyof R)[],
  >(
    ...args:
      | readonly [record: R, keys: Keys]
      | readonly [keys: readonly PropertyKey[]]
  ):
    | Omit<R, ArrayElement<Keys>>
    | ((record: R) => Omit<R, ArrayElement<Keys>>) => {
    switch (args.length) {
      case 2: {
        const [record, keys] = args;
        const keysSet = new Set<keyof R>(keys);

        return Object.fromEntries(
          Object.entries(record).filter(([k, _v]) => !keysSet.has(k)),
        ) as never;
      }

      case 1: {
        const [keys] = args;
        return <R2 extends UnknownRecord>(record: R2) =>
          omit(record, keys as readonly (keyof R2)[]) as Omit<
            R2,
            ArrayElement<Keys>
          >;
      }
    }
  }) as OmitFnOverload;

  type OmitFnOverload = {
    <const R extends UnknownRecord, const Keys extends readonly (keyof R)[]>(
      record: R,
      keys: Keys,
    ): Omit<R, ArrayElement<Keys>>;

    // Curried version
    <const Keys extends readonly PropertyKey[]>(
      keys: Keys,
    ): <const R extends UnknownRecord>(
      record: R,
    ) => Omit<R, ArrayElement<Keys>>;
  };

  /**
   * Creates an object from an array of key-value pairs with precise TypeScript typing.
   * This is a type-safe wrapper around `Object.fromEntries` that provides better type inference
   * and compile-time guarantees about the resulting object structure.
   *
   * **Type Behavior**:
   * - When entries is a fixed-length tuple, the exact object type is inferred
   * - When entries has dynamic length with union key types, `Partial` is applied to prevent
   *   incorrect assumptions about which keys will be present
   *
   * @template Entries - The readonly array type of key-value entry tuples
   * @param entries - An array of readonly key-value entry tuples `[key, value]`
   * @returns An object created from the entries with precise typing
   *
   * @example
   * ```typescript
   * // Fixed entries with precise typing
   * const fixedEntries = [
   *   ['name', 'Alice'],
   *   ['age', 30],
   *   ['active', true]
   * ] as const;
   *
   * const user = Obj.fromEntries(fixedEntries);
   * // Type: { readonly name: "Alice"; readonly age: 30; readonly active: true }
   * // Value: { name: "Alice", age: 30, active: true }
   *
   * // Simple coordinate example
   * const coordEntries = [['x', 1], ['y', 3]] as const;
   * const point = Obj.fromEntries(coordEntries);
   * // Type: { readonly x: 1; readonly y: 3 }
   * // Value: { x: 1, y: 3 }
   *
   * // Dynamic entries with union keys
   * const dynamicEntries: Array<['name' | 'email', string]> = [
   *   ['name', 'Alice']
   *   // email might or might not be present
   * ];
   * const partialUser = Obj.fromEntries(dynamicEntries);
   * // Type: Partial<{ name: string; email: string }>
   * // This prevents assuming both 'name' and 'email' are always present
   *
   * // Creating configuration objects
   * const configEntries = [
   *   ['apiUrl', 'https://api.example.com'],
   *   ['timeout', 5000],
   *   ['retries', 3],
   *   ['debug', false]
   * ] as const;
   * const config = Obj.fromEntries(configEntries);
   * // Precise types for each configuration value
   *
   * // Converting Maps to objects
   * const settingsMap = new Map([
   *   ['theme', 'dark'],
   *   ['language', 'en'],
   *   ['notifications', true]
   * ] as const);
   * const settings = Obj.fromEntries([...settingsMap]);
   *
   * // Building objects from computed entries
   * const keys = ['a', 'b', 'c'] as const;
   * const values = [1, 2, 3] as const;
   * const computedEntries = keys.map((k, i) => [k, values[i]] as const);
   * const computed = Obj.fromEntries(computedEntries);
   * // Type reflects the specific key-value associations
   *
   * // Error handling with validation
   * function createUserFromEntries(entries: ReadonlyArray<readonly [string, unknown]>) {
   *   const user = Obj.fromEntries(entries);
   *   // Type is Partial<Record<string, unknown>> - safe for dynamic data
   *
   *   if ('name' in user && typeof user.name === 'string') {
   *     // Type narrowing works correctly
   *     return { name: user.name, ...user };
   *   }
   *   throw new Error('Invalid user data');
   * }
   * ```
   */
  export const fromEntries = <
    const Entries extends readonly (readonly [PropertyKey, unknown])[],
  >(
    entries: Entries,
  ): IsFixedLengthList<Entries> extends true
    ? TsDataForgeInternals.EntriesToObject<Entries>
    : TsDataForgeInternals.PartialIfKeyIsUnion<
        TsDataForgeInternals.KeysOfEntries<Entries>,
        Record<
          TsDataForgeInternals.KeysOfEntries<Entries>,
          TsDataForgeInternals.ValuesOfEntries<Entries>
        >
      > => Object.fromEntries(entries) as never;

  /**
   * @internal
   * Internal type utilities for the Obj module.
   */
  declare namespace TsDataForgeInternals {
    type RecursionLimit = 20;

    /**
     * - `[['x', 1], ['y', 3]]` -> `{ x: 1, y: 3 }`
     */
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
     * - `[['a' | 'b' | 'c', number], ...['x' | 'y' | 'z', number][]]` -> `'a' | 'b' |
     *   'c' | 'x' | 'y' | 'z'`
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

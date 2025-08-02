/**
 * Extracts from union type `T` those types that are assignable to `U`.
 * This is a stricter version of the built-in `Extract` that requires `U` to extend `T`.
 *
 * @template T - The union type to extract from.
 * @template U - The type to extract, must extend `T`.
 * @returns The intersection of `T` and `U`.
 *
 * @example
 * ```ts
 * type Union = 'a' | 'b' | 'c';
 * type Extracted = StrictExtract<Union, 'a' | 'b'>; // 'a' | 'b'
 * // type Invalid = StrictExtract<Union, 'a' | 'd'>; // Error: 'd' is not assignable to Union
 * ```
 */
type StrictExtract<T, U extends T> = T extends U ? T : never;

/**
 * Extracts from union type `T` those types that are assignable to `U`.
 * This is a relaxed version that doesn't require `U` to extend `T`.
 *
 * @template T - The union type to extract from.
 * @template U - The type to extract.
 * @returns The intersection of `T` and `U`.
 *
 * @example
 * ```ts
 * type Union = 'a' | 'b' | 'c';
 * type Extracted = RelaxedExtract<Union, 'a' | 'd'>; // 'a'
 * type Numbers = RelaxedExtract<string | number | boolean, number>; // number
 * ```
 */
type RelaxedExtract<T, U> = T extends U ? T : never;

/**
 * Creates a type by picking a set of properties from `T` whose keys are in union `K`.
 * This is a stricter version that requires `K` to extend `keyof T`.
 *
 * @template T - The object type to pick from.
 * @template K - The union of keys to pick, must extend `keyof T`.
 * @returns An object type with only the specified properties.
 *
 * @example
 * ```ts
 * type Person = { name: string; age: number; email: string };
 * type BasicInfo = StrictPick<Person, 'name' | 'age'>; // { name: string; age: number }
 * // type Invalid = StrictPick<Person, 'name' | 'invalid'>; // Error: 'invalid' is not a key of Person
 * ```
 */
type StrictPick<T, K extends keyof T> = {
  [P in K]: T[P];
};

/**
 * Creates a type by picking a set of properties from `T` whose keys are in union `K`.
 * This is a relaxed version that filters out invalid keys automatically.
 *
 * @template T - The object type to pick from.
 * @template K - The union of keys to pick.
 * @returns An object type with only the valid specified properties.
 *
 * @example
 * ```ts
 * type Person = { name: string; age: number; email: string };
 * type BasicInfo = RelaxedPick<Person, 'name' | 'age' | 'invalid'>; // { name: string; age: number }
 * type Empty = RelaxedPick<Person, 'nonexistent'>; // {}
 * ```
 */
type RelaxedPick<T, K> = Pick<T, RelaxedExtract<keyof T, K>>;

/**
 * Excludes from union type `T` those types that are assignable to `U`.
 * This is a stricter version that requires `U` to extend `T`.
 *
 * @template T - The union type to exclude from.
 * @template U - The type to exclude, must extend `T`.
 * @returns The union `T` minus `U`.
 *
 * @example
 * ```ts
 * type Union = 'a' | 'b' | 'c';
 * type Remaining = StrictExclude<Union, 'a' | 'b'>; // 'c'
 * // type Invalid = StrictExclude<Union, 'a' | 'd'>; // Error: 'd' is not assignable to Union
 * ```
 */
type StrictExclude<T, U extends T> = T extends U ? never : T;

/**
 * Excludes from union type `T` those types that are assignable to `U`.
 * This is a relaxed version that doesn't require `U` to extend `T`.
 *
 * @template T - The union type to exclude from.
 * @template U - The type to exclude.
 * @returns The union `T` minus any types assignable to `U`.
 *
 * @example
 * ```ts
 * type Union = 'a' | 'b' | 'c';
 * type Remaining = RelaxedExclude<Union, 'a' | 'd'>; // 'b' | 'c'
 * type NonStrings = RelaxedExclude<string | number | boolean, string>; // number | boolean
 * ```
 */
type RelaxedExclude<T, U> = T extends U ? never : T;

/**
 * Creates a type with all properties of `T` except for those in union `K`.
 * This is a stricter version that requires `K` to extend `keyof T`.
 *
 * @template T - The object type to omit from.
 * @template K - The union of keys to omit, must extend `keyof T`.
 * @returns An object type without the specified properties.
 *
 * @example
 * ```ts
 * type Person = { name: string; age: number; email: string };
 * type PublicInfo = StrictOmit<Person, 'email'>; // { name: string; age: number }
 * // type Invalid = StrictOmit<Person, 'email' | 'invalid'>; // Error: 'invalid' is not a key of Person
 * ```
 */
type StrictOmit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

/**
 * Creates a type with all properties of `T` except for those in union `K`.
 * This is a relaxed version that ignores invalid keys automatically.
 *
 * @template T - The object type to omit from.
 * @template K - The union of keys to omit.
 * @returns An object type without the valid specified properties.
 *
 * @example
 * ```ts
 * type Person = { name: string; age: number; email: string };
 * type PublicInfo = RelaxedOmit<Person, 'email' | 'invalid'>; // { name: string; age: number }
 * type Same = RelaxedOmit<Person, 'nonexistent'>; // { name: string; age: number; email: string }
 * ```
 */
type RelaxedOmit<T, K> = Pick<T, RelaxedExclude<keyof T, K>>;

/**
 * Creates a readonly record type with keys of type `K` and values of type `T`.
 * All properties are readonly and cannot be modified after creation.
 *
 * @template K - The type of keys, must extend `PropertyKey` (string | number | symbol).
 * @template T - The type of values.
 * @returns A readonly record type.
 *
 * @example
 * ```ts
 * type Config = ReadonlyRecord<string, string | number>;
 * const settings: Config = { host: 'localhost', port: 3000 };
 * // settings.host = 'new-host'; // Error: Cannot assign to 'host' because it is a read-only property
 * ```
 */
// eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
type ReadonlyRecord<K extends PropertyKey, T> = {
  readonly [P in K]: T;
};

/**
 * Creates a mutable record type with keys of type `K` and values of type `T`.
 * All properties are mutable and can be modified after creation.
 *
 * @template K - The type of keys, must extend `PropertyKey` (string | number | symbol).
 * @template T - The type of values.
 * @returns A mutable record type.
 *
 * @example
 * ```ts
 * type Config = MutableRecord<string, string | number>;
 * const settings: Config = { host: 'localhost', port: 3000 };
 * settings.host = 'new-host'; // OK
 * settings.timeout = 5000; // OK
 * ```
 */
// eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
type MutableRecord<K extends PropertyKey, T> = {
  [P in K]: T;
};

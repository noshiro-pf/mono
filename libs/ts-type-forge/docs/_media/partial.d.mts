/**
 * Creates a type where specified keys `K` of `T` are made optional.
 * The resulting type is a merged intersection for better readability.
 * @template T - The original type.
 * @template K - The keys to make optional.
 * @returns A new type with keys `K` made optional.
 * @example
 * type Data = { a: number; b: string; c: boolean };
 * type PartiallyPartialData = PartiallyPartial<Data, 'a' | 'b'>;
 * // Result: { a?: number; b?: string; c: boolean }
 */
type PartiallyPartial<T, K extends keyof T> = MergeIntersection<
  Omit<T, K> & Partial<Pick<T, K>>
>;

/**
 * Alias for `PartiallyPartial`. Creates a type where specified keys `K` of `T` are made optional.
 * @template T - The original type.
 * @template K - The keys to make optional.
 * @returns A new type with keys `K` made optional.
 * @example
 * type Data = { a: number; b: string; c: boolean };
 * type PartiallyOptionalData = PartiallyOptional<Data, 'a' | 'b'>;
 * // Result: { a?: number; b?: string; c: boolean }
 */
type PartiallyOptional<T, K extends keyof T> = PartiallyPartial<T, K>;

/**
 * Creates a type where specified keys `K` of `T` are made nullable (i.e., `| undefined` is added to their type).
 * The resulting type is a merged intersection for better readability.
 * @template T - The original type.
 * @template K - The keys to make nullable.
 * @returns A new type with keys `K` made nullable.
 * @example
 * type Data = { a: number; b: string; c: boolean };
 * type PartiallyNullableData = PartiallyNullable<Data, 'a' | 'b'>;
 * // Result: { a: number | undefined; b: string | undefined; c: boolean }
 */
type PartiallyNullable<T, K extends keyof T> = MergeIntersection<
  Omit<T, K> & { [P in K]: T[P] | undefined }
>;

/**
 * Creates a type where specified keys `K` of `T` are made required (removing the optional `?` modifier).
 * The resulting type is a merged intersection for better readability.
 * @template T - The original type (can have optional properties).
 * @template K - The keys to make required.
 * @returns A new type with keys `K` made required.
 * @example
 * type Data = { a?: number; b?: string; c?: boolean };
 * type PartiallyRequiredData = PartiallyRequired<Data, 'a' | 'b'>;
 * // Result: { a: number; b: string; c?: boolean }
 */
type PartiallyRequired<T, K extends keyof T> = MergeIntersection<
  Omit<T, K> & Required<Pick<T, K>>
>;

/**
 * @internal
 * Helper type to extract keys from a record `R` whose property types include `undefined`.
 * It checks if `undefined` is assignable to the property type `R[K]`.
 * The `-?` removes optionality before checking.
 * @template R - The record type.
 * @returns A union of keys whose types include `undefined`.
 */
type PickUndefined<R extends UnknownRecord> = {
  [K in keyof R]-?: undefined extends R[K] ? K : never;
}[keyof R];

/**
 * @internal
 * Helper type that maps all property values of a record `R` to `never`.
 * Used in `OptionalKeys` to isolate the check for the `?` modifier.
 * @template R - The record type.
 * @returns A new record type with the same keys as `R` but all values as `never`.
 */
type MapToNever<R extends UnknownRecord> = {
  [K in keyof R]: never;
};

/**
 * Extracts keys from a record `R` that are explicitly marked as optional using the `?` modifier.
 * It works by creating a mapped type where all values are `never` and then using `PickUndefined`
 * to find keys where `undefined` is assignable (which is true only for optional properties in this context).
 *
 * @template R - The record type.
 * @returns A union of keys that are optional in `R`.
 * @example
 * type K = OptionalKeys<{
 *   a?: 0; // optional
 *   b?: 0 | undefined; // optional
 *   c?: undefined; // optional
 *   d: 0; // required
 *   e: undefined; // required, value is undefined
 *   f: 0 | undefined; // required, value includes undefined
 * }>; // 'a' | 'b' | 'c'
 */
type OptionalKeys<R extends UnknownRecord> = PickUndefined<MapToNever<R>>;

/**
 * Extracts keys from a record `R` that are *not* explicitly marked as optional using the `?` modifier.
 * It calculates this by taking all keys of `R` and excluding the optional keys identified by `OptionalKeys<R>`.
 *
 * @template R - The record type.
 * @returns A union of keys that are required (not optional) in `R`.
 * @example
 * type K = RequiredKeys<{
 *   a?: 0; // optional
 *   b?: 0 | undefined; // optional
 *   c?: undefined; // optional
 *   d: 0; // required
 *   e: undefined; // required, value is undefined
 *   f: 0 | undefined; // required, value includes undefined
 * }>; // 'd' | 'e' | 'f'
 */
type RequiredKeys<R extends UnknownRecord> = Exclude<keyof R, OptionalKeys<R>>;

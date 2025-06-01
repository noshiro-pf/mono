/**
 * Base type for all branded types. Represents a brand with unknown value type and no keys.
 *
 * @example
 * ```ts
 * type MyBrand = Brand<string, 'validated', never>;
 * ```
 */
type UnknownBrand = Brand<unknown, never, never>;

/** @internal */
declare namespace TSTypeForgeInternals {
  // const brand_: unique symbol;

  /**
   * Distinguish types to avoid conflicts with branded types created outside of `ts-type-utils`.
   *
   * MEMO: [gcanti/io-ts](https://github.com/gcanti/io-ts) uses unique symbol,
   * but ts-type-utils doesn't use it to maintain independence as a type library.
   *
   * @internal
   */
  type BrandEncapsulated<B> = B &
    Readonly<{
      'TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3': unknown;
    }>;

  type ExtractTrueKeys<B extends UnknownBrand> = ExtractBooleanKeysImpl<
    B,
    keyof B,
    true
  >;

  type ExtractFalseKeys<B extends UnknownBrand> = ExtractBooleanKeysImpl<
    B,
    keyof B,
    false
  >;

  type ExtractBooleanKeys<B extends UnknownBrand> = ExtractBooleanKeysImpl<
    B,
    keyof B,
    boolean
  >;

  type ExtractBooleanKeysImpl<
    B extends UnknownBrand,
    K extends keyof B,
    Target extends boolean,
  > = K extends K ? (TypeEq<B[K], Target> extends true ? K : never) : never;
}

/**
 * Creates a branded type (nominal type) to distinguish values at the type level.
 * Branded types prevent accidental type compatibility even when the underlying types are the same.
 *
 * @template T - The underlying value type to be branded
 * @template TrueKeys - String literal keys that will be marked as `true` in the brand
 * @template FalseKeys - String literal keys that will be marked as `false` in the brand (defaults to `never`)
 *
 * @example
 * ```ts
 * // Create distinct ID types
 * type UserId = Brand<string, 'UserId'>;
 * type PostId = Brand<string, 'PostId'>;
 *
 * // These are incompatible even though both are strings
 * const userId: UserId = "user123" as UserId;
 * const postId: PostId = "post456" as PostId;
 * // const wrongAssignment: UserId = postId; // Error!
 *
 * // Create validated types
 * type NonZeroInt = Brand<number, 'integer', 'zero'>;
 * ```
 */
type Brand<T, TrueKeys extends string, FalseKeys extends string = never> = T &
  TSTypeForgeInternals.BrandEncapsulated<{
    readonly [key in FalseKeys | TrueKeys]: key extends TrueKeys ? true : false;
  }>;

/**
 * Extracts all keys marked as `true` from a branded type.
 *
 * @template B - The branded type to extract keys from
 * @returns Union of string literal keys that are marked as `true`
 *
 * @example
 * ```ts
 * type NonZeroInt = Brand<number, 'integer', 'zero'>;
 * type TrueKeys = UnwrapBrandTrueKeys<NonZeroInt>; // 'integer'
 * ```
 */
type UnwrapBrandTrueKeys<B extends UnknownBrand> =
  TSTypeForgeInternals.ExtractTrueKeys<B>;

/**
 * Extracts all keys marked as `false` from a branded type.
 *
 * @template B - The branded type to extract keys from
 * @returns Union of string literal keys that are marked as `false`
 *
 * @example
 * ```ts
 * type NonZeroInt = Brand<number, 'integer', 'zero'>;
 * type FalseKeys = UnwrapBrandFalseKeys<NonZeroInt>; // 'zero'
 * ```
 */
type UnwrapBrandFalseKeys<B extends UnknownBrand> =
  TSTypeForgeInternals.ExtractFalseKeys<B>;

/**
 * Extracts all keys that have boolean values (not specifically true or false) from a branded type.
 * This occurs when a brand union normalizes and a key becomes `true | false`.
 *
 * @template B - The branded type to extract keys from
 * @returns Union of string literal keys that have boolean values
 *
 * @example
 * ```ts
 * type Brand1 = Brand<number, 'key1', never>;
 * type Brand2 = Brand<number, never, 'key1'>;
 * type UnionBrand = Brand1 | Brand2;
 * type BooleanKeys = UnwrapBrandBooleanKeys<UnionBrand>; // 'key1' (since it's true | false)
 * ```
 */
type UnwrapBrandBooleanKeys<B extends UnknownBrand> =
  TSTypeForgeInternals.ExtractBooleanKeys<B>;

/**
 * Extracts all brand keys (true, false, and boolean) from a branded type.
 *
 * @template B - The branded type to extract keys from
 * @returns Union of all string literal keys in the brand
 *
 * @example
 * ```ts
 * type MyBrand = Brand<string, 'validated' | 'normalized', 'empty'>;
 * type AllKeys = UnwrapBrandKeys<MyBrand>; // 'validated' | 'normalized' | 'empty'
 * ```
 */
type UnwrapBrandKeys<B extends UnknownBrand> =
  | UnwrapBrandBooleanKeys<B>
  | UnwrapBrandFalseKeys<B>
  | UnwrapBrandTrueKeys<B>;

/**
 * Extracts only the brand keys part of a branded type (without the underlying value).
 *
 * @template B - The branded type to extract from
 * @returns Object type containing only the brand keys and their boolean values
 *
 * @example
 * ```ts
 * type MyBrand = Brand<string, 'validated'>;
 * type KeysPart = GetBrandKeysPart<MyBrand>; // { validated: true }
 * ```
 */
type GetBrandKeysPart<B extends UnknownBrand> = Pick<B, UnwrapBrandKeys<B>>;

/**
 * Extracts the underlying value type from a branded type.
 *
 * @template B - The branded type to extract from
 * @returns The underlying value type T that was branded
 *
 * @example
 * ```ts
 * type UserId = Brand<string, 'UserId'>;
 * type UserIdValue = GetBrandValuePart<UserId>; // string
 *
 * type Age = Brand<number, 'Age' | 'positive'>;
 * type AgeValue = GetBrandValuePart<Age>; // number
 * ```
 */
type GetBrandValuePart<B extends UnknownBrand> =
  B extends Brand<
    infer T,
    UnwrapBrandTrueKeys<B> & string,
    UnwrapBrandFalseKeys<B> & string
  >
    ? T
    : never;

/**
 * Extends an existing brand with additional true/false keys.
 * Fails if the same key would be marked as both true and false.
 *
 * @template B - The base brand to extend
 * @template T - Additional keys to mark as true
 * @template F - Additional keys to mark as false (defaults to never)
 * @returns Extended brand type, or never if T and F have common keys
 *
 * @example
 * ```ts
 * type Email = Brand<string, 'email'>;
 * type ValidatedEmail = ExtendBrand<Email, 'validated'>;
 * // ValidatedEmail has both 'email' and 'validated' as true
 *
 * type OptionalEmail = ExtendBrand<Email, 'optional', 'required'>;
 * // Has 'email' and 'optional' as true, 'required' as false
 *
 * // This would return never (conflicting keys):
 * // type Invalid = ExtendBrand<Email, 'verified', 'verified'>;
 * ```
 */
type ExtendBrand<
  B extends UnknownBrand,
  T extends string,
  F extends string = never,
> =
  IsNever<F & T> extends true // T and F shouldn't have intersection
    ? Brand<
        GetBrandValuePart<B>,
        T | (UnwrapBrandTrueKeys<B> & string),
        F | (UnwrapBrandFalseKeys<B> & string)
      >
    : never;

/**
 * Changes the underlying value type of a brand while preserving all brand keys.
 *
 * @template B - The brand whose keys to preserve
 * @template T - The new underlying value type
 * @returns Brand with same keys but different underlying type
 *
 * @example
 * ```ts
 * type UserId = Brand<string, 'UserId' | 'validated'>;
 * type NumericUserId = ChangeBaseBrand<UserId, number>;
 * // NumericUserId is Brand<number, 'UserId' | 'validated'>
 *
 * // Useful for type conversions
 * type SerializedData = Brand<string, 'json' | 'validated'>;
 * type ParsedData = ChangeBaseBrand<SerializedData, object>;
 * ```
 */
type ChangeBaseBrand<B extends UnknownBrand, T> = Brand<
  T,
  UnwrapBrandTrueKeys<B> & string,
  UnwrapBrandFalseKeys<B> & string
>;

/**
 * Creates an intersection of two branded types.
 * The result has the intersection of value types and the union of all keys.
 *
 * @template B1 - First brand to intersect
 * @template B2 - Second brand to intersect
 * @returns Brand with intersected value types and combined keys
 *
 * @example
 * ```ts
 * type PositiveNumber = Brand<number, 'positive'>;
 * type IntegerNumber = Brand<number, 'integer'>;
 * type PositiveInteger = IntersectBrand<PositiveNumber, IntegerNumber>;
 * // Brand<number, 'positive' | 'integer'>
 *
 * type Named = Brand<{ name: string }, 'named'>;
 * type Aged = Brand<{ age: number }, 'aged'>;
 * type Person = IntersectBrand<Named, Aged>;
 * // Brand<{ name: string } & { age: number }, 'named' | 'aged'>
 * ```
 */
type IntersectBrand<B1 extends UnknownBrand, B2 extends UnknownBrand> = Brand<
  GetBrandValuePart<B1> & GetBrandValuePart<B2>,
  string & (UnwrapBrandTrueKeys<B1> | UnwrapBrandTrueKeys<B2>),
  string & (UnwrapBrandFalseKeys<B1> | UnwrapBrandFalseKeys<B2>)
>;

/**
 * Normalizes a union of branded types by removing keys that have become `true | false`.
 * This happens when different brands in a union have the same key with different boolean values.
 *
 * @template B - The brand union to normalize
 * @returns Normalized brand with boolean keys removed
 *
 * @example
 * ```ts
 * type Brand1 = Brand<number, 'validated', 'empty'>;
 * type Brand2 = Brand<number, 'empty', 'validated'>;
 * type UnionBrand = Brand1 | Brand2;
 * type Normalized = NormalizeBrandUnion<UnionBrand>;
 * // Both 'validated' and 'empty' are removed since they're true | false
 * ```
 */
type NormalizeBrandUnion<B extends UnknownBrand> = GetBrandValuePart<B> &
  TSTypeForgeInternals.BrandEncapsulated<{
    readonly [key in Exclude<
      UnwrapBrandKeys<B>,
      UnwrapBrandBooleanKeys<B>
    >]: B[key];
  }>;

[**Documentation**](../README.md)

---

[Documentation](../README.md) / branded-types/brand

# branded-types/brand

## Type Aliases

### Brand\<T, TrueKeys, FalseKeys\>

> **Brand**\<`T`, `TrueKeys`, `FalseKeys`\> = `T` & `TSTypeForgeInternals.BrandEncapsulated`\<\{ readonly \[key in FalseKeys \| TrueKeys\]: key extends TrueKeys ? true : false \}\>

Defined in: [branded-types/brand.d.mts:76](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/brand.d.mts#L76)

Creates a branded type (nominal type) to distinguish values at the type level.
Branded types prevent accidental type compatibility even when the underlying types are the same.

#### Type Parameters

##### T

`T`

The underlying value type to be branded

##### TrueKeys

`TrueKeys` _extends_ `string`

String literal keys that will be marked as `true` in the brand

##### FalseKeys

`FalseKeys` _extends_ `string` = `never`

String literal keys that will be marked as `false` in the brand (defaults to `never`)

#### Example

```ts
// Create distinct ID types
type UserId = Brand<string, 'UserId'>;
type PostId = Brand<string, 'PostId'>;

// These are incompatible even though both are strings
const userId: UserId = 'user123' as UserId;
const postId: PostId = 'post456' as PostId;
// const wrongAssignment: UserId = postId; // Error!

// Create validated types
type NonZeroInt = Brand<number, 'integer', 'zero'>;
```

---

### ChangeBaseBrand\<B, T\>

> **ChangeBaseBrand**\<`B`, `T`\> = [`Brand`](#brand)\<`T`, [`UnwrapBrandTrueKeys`](#unwrapbrandtruekeys)\<`B`\> & `string`, [`UnwrapBrandFalseKeys`](#unwrapbrandfalsekeys)\<`B`\> & `string`\>

Defined in: [branded-types/brand.d.mts:237](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/brand.d.mts#L237)

Changes the underlying value type of a brand while preserving all brand keys.

#### Type Parameters

##### B

`B` _extends_ [`UnknownBrand`](#unknownbrand)

The brand whose keys to preserve

##### T

`T`

The new underlying value type

#### Returns

Brand with same keys but different underlying type

#### Example

```ts
type UserId = Brand<string, 'UserId' | 'validated'>;
type NumericUserId = ChangeBaseBrand<UserId, number>;
// NumericUserId is Brand<number, 'UserId' | 'validated'>

// Useful for type conversions
type SerializedData = Brand<string, 'json' | 'validated'>;
type ParsedData = ChangeBaseBrand<SerializedData, object>;
```

---

### ExtendBrand\<B, T, F\>

> **ExtendBrand**\<`B`, `T`, `F`\> = [`IsNever`](../condition/is-never.md#isnever)\<`F` & `T`\> _extends_ `true` ? [`Brand`](#brand)\<[`GetBrandValuePart`](#getbrandvaluepart)\<`B`\>, `T` \| [`UnwrapBrandTrueKeys`](#unwrapbrandtruekeys)\<`B`\> & `string`, `F` \| [`UnwrapBrandFalseKeys`](#unwrapbrandfalsekeys)\<`B`\> & `string`\> : `never`

Defined in: [branded-types/brand.d.mts:206](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/brand.d.mts#L206)

Extends an existing brand with additional true/false keys.
Fails if the same key would be marked as both true and false.

#### Type Parameters

##### B

`B` _extends_ [`UnknownBrand`](#unknownbrand)

The base brand to extend

##### T

`T` _extends_ `string`

Additional keys to mark as true

##### F

`F` _extends_ `string` = `never`

Additional keys to mark as false (defaults to never)

#### Returns

Extended brand type, or never if T and F have common keys

#### Example

```ts
type Email = Brand<string, 'email'>;
type ValidatedEmail = ExtendBrand<Email, 'validated'>;
// ValidatedEmail has both 'email' and 'validated' as true

type OptionalEmail = ExtendBrand<Email, 'optional', 'required'>;
// Has 'email' and 'optional' as true, 'required' as false

// This would return never (conflicting keys):
// type Invalid = ExtendBrand<Email, 'verified', 'verified'>;
```

---

### GetBrandKeysPart\<B\>

> **GetBrandKeysPart**\<`B`\> = `Pick`\<`B`, [`UnwrapBrandKeys`](#unwrapbrandkeys)\<`B`\>\>

Defined in: [branded-types/brand.d.mts:158](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/brand.d.mts#L158)

Extracts only the brand keys part of a branded type (without the underlying value).

#### Type Parameters

##### B

`B` _extends_ [`UnknownBrand`](#unknownbrand)

The branded type to extract from

#### Returns

Object type containing only the brand keys and their boolean values

#### Example

```ts
type MyBrand = Brand<string, 'validated'>;
type KeysPart = GetBrandKeysPart<MyBrand>; // { validated: true }
```

---

### GetBrandValuePart\<B\>

> **GetBrandValuePart**\<`B`\> = `B` _extends_ [`Brand`](#brand)\<infer T, [`UnwrapBrandTrueKeys`](#unwrapbrandtruekeys)\<`B`\> & `string`, [`UnwrapBrandFalseKeys`](#unwrapbrandfalsekeys)\<`B`\> & `string`\> ? `T` : `never`

Defined in: [branded-types/brand.d.mts:175](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/brand.d.mts#L175)

Extracts the underlying value type from a branded type.

#### Type Parameters

##### B

`B` _extends_ [`UnknownBrand`](#unknownbrand)

The branded type to extract from

#### Returns

The underlying value type T that was branded

#### Example

```ts
type UserId = Brand<string, 'UserId'>;
type UserIdValue = GetBrandValuePart<UserId>; // string

type Age = Brand<number, 'Age' | 'positive'>;
type AgeValue = GetBrandValuePart<Age>; // number
```

---

### IntersectBrand\<B1, B2\>

> **IntersectBrand**\<`B1`, `B2`\> = [`Brand`](#brand)\<[`GetBrandValuePart`](#getbrandvaluepart)\<`B1`\> & [`GetBrandValuePart`](#getbrandvaluepart)\<`B2`\>, `string` & [`UnwrapBrandTrueKeys`](#unwrapbrandtruekeys)\<`B1`\> \| [`UnwrapBrandTrueKeys`](#unwrapbrandtruekeys)\<`B2`\>, `string` & [`UnwrapBrandFalseKeys`](#unwrapbrandfalsekeys)\<`B1`\> \| [`UnwrapBrandFalseKeys`](#unwrapbrandfalsekeys)\<`B2`\>\>

Defined in: [branded-types/brand.d.mts:264](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/brand.d.mts#L264)

Creates an intersection of two branded types.
The result has the intersection of value types and the union of all keys.

#### Type Parameters

##### B1

`B1` _extends_ [`UnknownBrand`](#unknownbrand)

First brand to intersect

##### B2

`B2` _extends_ [`UnknownBrand`](#unknownbrand)

Second brand to intersect

#### Returns

Brand with intersected value types and combined keys

#### Example

```ts
type PositiveNumber = Brand<number, 'positive'>;
type IntegerNumber = Brand<number, 'integer'>;
type PositiveInteger = IntersectBrand<PositiveNumber, IntegerNumber>;
// Brand<number, 'positive' | 'integer'>

type Named = Brand<{ name: string }, 'named'>;
type Aged = Brand<{ age: number }, 'aged'>;
type Person = IntersectBrand<Named, Aged>;
// Brand<{ name: string } & { age: number }, 'named' | 'aged'>
```

---

### NormalizeBrandUnion\<B\>

> **NormalizeBrandUnion**\<`B`\> = [`GetBrandValuePart`](#getbrandvaluepart)\<`B`\> & `TSTypeForgeInternals.BrandEncapsulated`\<`{ readonly [key in Exclude<UnwrapBrandKeys<B>, UnwrapBrandBooleanKeys<B>>]: B[key] }`\>

Defined in: [branded-types/brand.d.mts:286](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/brand.d.mts#L286)

Normalizes a union of branded types by removing keys that have become `true | false`.
This happens when different brands in a union have the same key with different boolean values.

#### Type Parameters

##### B

`B` _extends_ [`UnknownBrand`](#unknownbrand)

The brand union to normalize

#### Returns

Normalized brand with boolean keys removed

#### Example

```ts
type Brand1 = Brand<number, 'validated', 'empty'>;
type Brand2 = Brand<number, 'empty', 'validated'>;
type UnionBrand = Brand1 | Brand2;
type Normalized = NormalizeBrandUnion<UnionBrand>;
// Both 'validated' and 'empty' are removed since they're true | false
```

---

### UnknownBrand

> **UnknownBrand** = [`Brand`](#brand)\<`unknown`, `never`, `never`\>

Defined in: [branded-types/brand.d.mts:9](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/brand.d.mts#L9)

Base type for all branded types. Represents a brand with unknown value type and no keys.

#### Example

```ts
type MyBrand = Brand<string, 'validated', never>;
```

---

### UnwrapBrandBooleanKeys\<B\>

> **UnwrapBrandBooleanKeys**\<`B`\> = `TSTypeForgeInternals.ExtractBooleanKeys`\<`B`\>

Defined in: [branded-types/brand.d.mts:126](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/brand.d.mts#L126)

Extracts all keys that have boolean values (not specifically true or false) from a branded type.
This occurs when a brand union normalizes and a key becomes `true | false`.

#### Type Parameters

##### B

`B` _extends_ [`UnknownBrand`](#unknownbrand)

The branded type to extract keys from

#### Returns

Union of string literal keys that have boolean values

#### Example

```ts
type Brand1 = Brand<number, 'key1', never>;
type Brand2 = Brand<number, never, 'key1'>;
type UnionBrand = Brand1 | Brand2;
type BooleanKeys = UnwrapBrandBooleanKeys<UnionBrand>; // 'key1' (since it's true | false)
```

---

### UnwrapBrandFalseKeys\<B\>

> **UnwrapBrandFalseKeys**\<`B`\> = `TSTypeForgeInternals.ExtractFalseKeys`\<`B`\>

Defined in: [branded-types/brand.d.mts:108](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/brand.d.mts#L108)

Extracts all keys marked as `false` from a branded type.

#### Type Parameters

##### B

`B` _extends_ [`UnknownBrand`](#unknownbrand)

The branded type to extract keys from

#### Returns

Union of string literal keys that are marked as `false`

#### Example

```ts
type NonZeroInt = Brand<number, 'integer', 'zero'>;
type FalseKeys = UnwrapBrandFalseKeys<NonZeroInt>; // 'zero'
```

---

### UnwrapBrandKeys\<B\>

> **UnwrapBrandKeys**\<`B`\> = [`UnwrapBrandBooleanKeys`](#unwrapbrandbooleankeys)\<`B`\> \| [`UnwrapBrandFalseKeys`](#unwrapbrandfalsekeys)\<`B`\> \| [`UnwrapBrandTrueKeys`](#unwrapbrandtruekeys)\<`B`\>

Defined in: [branded-types/brand.d.mts:141](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/brand.d.mts#L141)

Extracts all brand keys (true, false, and boolean) from a branded type.

#### Type Parameters

##### B

`B` _extends_ [`UnknownBrand`](#unknownbrand)

The branded type to extract keys from

#### Returns

Union of all string literal keys in the brand

#### Example

```ts
type MyBrand = Brand<string, 'validated' | 'normalized', 'empty'>;
type AllKeys = UnwrapBrandKeys<MyBrand>; // 'validated' | 'normalized' | 'empty'
```

---

### UnwrapBrandTrueKeys\<B\>

> **UnwrapBrandTrueKeys**\<`B`\> = `TSTypeForgeInternals.ExtractTrueKeys`\<`B`\>

Defined in: [branded-types/brand.d.mts:93](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/brand.d.mts#L93)

Extracts all keys marked as `true` from a branded type.

#### Type Parameters

##### B

`B` _extends_ [`UnknownBrand`](#unknownbrand)

The branded type to extract keys from

#### Returns

Union of string literal keys that are marked as `true`

#### Example

```ts
type NonZeroInt = Brand<number, 'integer', 'zero'>;
type TrueKeys = UnwrapBrandTrueKeys<NonZeroInt>; // 'integer'
```

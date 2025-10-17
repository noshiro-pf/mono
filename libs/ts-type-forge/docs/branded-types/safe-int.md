[**ts-type-forge**](../README.md)

***

[ts-type-forge](../README.md) / branded-types/safe-int

# branded-types/safe-int

## Type Aliases

### SafeInt

> **SafeInt** = [`ExtendNumberBrand`](brand/namespaces/TSTypeForgeInternals/README.md#extendnumberbrand)\<[`Int`](int.md#int), `"SafeInt"`\>

Defined in: [src/branded-types/safe-int.d.mts:17](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/safe-int.d.mts#L17)

Branded numeric type for safe integers.
Represents integers that can be exactly represented in JavaScript (±2^53 - 1).

#### Example

```ts
const isSafeInt = (x: number): x is SafeInt => Number.isSafeInteger(x);

const safeMath = {
  add: (a: SafeInt, b: SafeInt): SafeInt | undefined => {
    const result = a + b;
    return isSafeInt(result) ? result : undefined;
  }
};
```

***

### NonZeroSafeInt

> **NonZeroSafeInt** = [`IntersectBrand`](brand/README.md#intersectbrand)\<[`SafeInt`](#safeint), [`NonZeroNumber`](core.md#nonzeronumber)\>

Defined in: [src/branded-types/safe-int.d.mts:32](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/safe-int.d.mts#L32)

Branded numeric type for non-zero safe integers.
Represents safe integers that are not equal to zero.

#### Example

```ts
const isNonZeroSafeInt = (x: number): x is NonZeroSafeInt =>
  Number.isSafeInteger(x) && x !== 0;

const step = (current: SafeInt, increment: NonZeroSafeInt): SafeInt =>
  (current + increment) as SafeInt;
```

***

### SafeUint

> **SafeUint** = [`IntersectBrand`](brand/README.md#intersectbrand)\<[`SafeInt`](#safeint), [`NonNegativeNumber`](core.md#nonnegativenumber)\>

Defined in: [src/branded-types/safe-int.d.mts:47](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/safe-int.d.mts#L47)

Branded numeric type for safe unsigned integers.
Represents non-negative integers within the safe integer range.

#### Example

```ts
const isSafeUint = (x: number): x is SafeUint =>
  Number.isSafeInteger(x) && x >= 0;

const fileSize = (bytes: SafeUint) => ({ bytes });
const timestamp = (): SafeUint => Date.now() as SafeUint;
```

***

### PositiveSafeInt

> **PositiveSafeInt** = [`IntersectBrand`](brand/README.md#intersectbrand)\<[`SafeInt`](#safeint), [`PositiveNumber`](core.md#positivenumber)\>

Defined in: [src/branded-types/safe-int.d.mts:62](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/safe-int.d.mts#L62)

Branded numeric type for positive safe integers.
Represents positive integers within the safe integer range.

#### Example

```ts
const isPositiveSafeInt = (x: number): x is PositiveSafeInt =>
  Number.isSafeInteger(x) && x > 0;

const userId = (id: PositiveSafeInt) => ({ userId: id });
const port = (num: PositiveSafeInt & Uint16) => ({ port: num });
```

***

### NegativeSafeInt

> **NegativeSafeInt** = [`IntersectBrand`](brand/README.md#intersectbrand)\<[`SafeInt`](#safeint), [`NegativeNumber`](core.md#negativenumber)\>

Defined in: [src/branded-types/safe-int.d.mts:76](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/safe-int.d.mts#L76)

Branded numeric type for negative safe integers.
Represents negative integers within the safe integer range.

#### Example

```ts
const isNegativeSafeInt = (x: number): x is NegativeSafeInt =>
  Number.isSafeInteger(x) && x < 0;

const priority = (level: NegativeSafeInt) => ({ priority: -level });
```

***

### NonNegativeSafeInt

> **NonNegativeSafeInt** = [`SafeUint`](#safeuint)

Defined in: [src/branded-types/safe-int.d.mts:83](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/safe-int.d.mts#L83)

Alias for `SafeUint`.
Branded numeric type for non-negative safe integers.
Represents non-negative integers within the safe integer range.

***

### SafeIntWithSmallInt

> **SafeIntWithSmallInt** = [`WithSmallInt`](small-int.md#withsmallint)\<[`SafeInt`](#safeint)\>

Defined in: [src/branded-types/safe-int.d.mts:89](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/safe-int.d.mts#L89)

Safe integer type with small literal values included.
Type: `-40 | -39 | ... | 39 | SafeInt`

***

### NonZeroSafeIntWithSmallInt

> **NonZeroSafeIntWithSmallInt** = [`WithSmallInt`](small-int.md#withsmallint)\<[`NonZeroSafeInt`](#nonzerosafeint)\>

Defined in: [src/branded-types/safe-int.d.mts:95](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/safe-int.d.mts#L95)

Non-zero safe integer type with small literal values included.
Type: `-40 | ... | -1 | 1 | ... | 39 | NonZeroSafeInt`

***

### NonNegativeSafeIntWithSmallInt

> **NonNegativeSafeIntWithSmallInt** = [`WithSmallInt`](small-int.md#withsmallint)\<[`NonNegativeSafeInt`](#nonnegativesafeint)\>

Defined in: [src/branded-types/safe-int.d.mts:101](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/safe-int.d.mts#L101)

Non-negative safe integer type with small literal values included.
Type: `0 | 1 | ... | 39 | NonNegativeSafeInt`

***

### SafeUintWithSmallInt

> **SafeUintWithSmallInt** = [`WithSmallInt`](small-int.md#withsmallint)\<[`SafeUint`](#safeuint)\>

Defined in: [src/branded-types/safe-int.d.mts:108](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/safe-int.d.mts#L108)

Alias for `NonNegativeSafeIntWithSmallInt`.
Safe unsigned integer type with small literal values included.
Type: `0 | 1 | ... | 39 | SafeUint`

***

### PositiveSafeIntWithSmallInt

> **PositiveSafeIntWithSmallInt** = [`WithSmallInt`](small-int.md#withsmallint)\<[`PositiveSafeInt`](#positivesafeint)\>

Defined in: [src/branded-types/safe-int.d.mts:114](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/safe-int.d.mts#L114)

Positive safe integer type with small literal values included.
Type: `1 | 2 | ... | 39 | PositiveSafeInt`

***

### NegativeSafeIntWithSmallInt

> **NegativeSafeIntWithSmallInt** = [`WithSmallInt`](small-int.md#withsmallint)\<[`NegativeSafeInt`](#negativesafeint)\>

Defined in: [src/branded-types/safe-int.d.mts:120](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/safe-int.d.mts#L120)

Negative safe integer type with small literal values included.
Type: `-40 | -39 | ... | -1 | NegativeSafeInt`

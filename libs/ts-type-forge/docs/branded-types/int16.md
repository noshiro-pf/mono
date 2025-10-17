[**ts-type-forge**](../README.md)

***

[ts-type-forge](../README.md) / branded-types/int16

# branded-types/int16

## Type Aliases

### Int16

> **Int16** = [`ExtendNumberBrand`](brand/namespaces/TSTypeForgeInternals/README.md#extendnumberbrand)\<[`Int32`](int32.md#int32), `"< 2^15"` \| `"< 2^16"` \| `"> -2^16"` \| `">= -2^15"`\>

Defined in: [src/branded-types/int16.d.mts:14](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/int16.d.mts#L14)

Branded numeric type for 16-bit signed integers.
Range: [-2^15, 2^15 - 1] or [-32,768, 32,767]

#### Example

```ts
const isInt16 = (x: number): x is Int16 =>
  Number.isSafeInteger(x) && x >= -(2**15) && x <= 2**15 - 1;

const audioSample = (value: Int16) => ({ sample: value });
const temperature = (celsius: Int16) => ({ celsius });
```

***

### NonZeroInt16

> **NonZeroInt16** = [`IntersectBrand`](brand/README.md#intersectbrand)\<[`Int16`](#int16), [`NonZeroNumber`](core.md#nonzeronumber)\>

Defined in: [src/branded-types/int16.d.mts:31](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/int16.d.mts#L31)

Branded numeric type for non-zero 16-bit signed integers.
Range: [-2^15, -1] ∪ [1, 2^15 - 1]

#### Example

```ts
const isNonZeroInt16 = (x: number): x is NonZeroInt16 =>
  Number.isSafeInteger(x) && x !== 0 && x >= -(2**15) && x <= 2**15 - 1;

const offset = (value: NonZeroInt16) => ({ offset: value });
```

***

### NonNegativeInt16

> **NonNegativeInt16** = [`IntersectBrand`](brand/README.md#intersectbrand)\<[`Int16`](#int16), [`NonNegativeNumber`](core.md#nonnegativenumber)\>

Defined in: [src/branded-types/int16.d.mts:45](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/int16.d.mts#L45)

Branded numeric type for non-negative 16-bit signed integers.
Range: [0, 2^15 - 1] or [0, 32,767]

#### Example

```ts
const isNonNegativeInt16 = (x: number): x is NonNegativeInt16 =>
  Number.isSafeInteger(x) && x >= 0 && x <= 2**15 - 1;

const altitude = (meters: NonNegativeInt16) => ({ altitude: meters });
```

***

### PositiveInt16

> **PositiveInt16** = [`IntersectBrand`](brand/README.md#intersectbrand)\<[`Int16`](#int16), [`PositiveNumber`](core.md#positivenumber)\>

Defined in: [src/branded-types/int16.d.mts:59](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/int16.d.mts#L59)

Branded numeric type for positive 16-bit signed integers.
Range: [1, 2^15 - 1] or [1, 32,767]

#### Example

```ts
const isPositiveInt16 = (x: number): x is PositiveInt16 =>
  Number.isSafeInteger(x) && x > 0 && x <= 2**15 - 1;

const year = (value: PositiveInt16) => ({ year: value });
```

***

### NegativeInt16

> **NegativeInt16** = [`IntersectBrand`](brand/README.md#intersectbrand)\<[`Int16`](#int16), [`NegativeNumber`](core.md#negativenumber)\>

Defined in: [src/branded-types/int16.d.mts:73](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/int16.d.mts#L73)

Branded numeric type for negative 16-bit integers.
Range: [-2^15, -1] or [-32,768, -1]

#### Example

```ts
const isNegativeInt16 = (x: number): x is NegativeInt16 =>
  Number.isSafeInteger(x) && x < 0 && x >= -(2**15);

const relativePosition = (offset: NegativeInt16) => ({ x: offset });
```

***

### Int16WithSmallInt

> **Int16WithSmallInt** = [`WithSmallInt`](small-int.md#withsmallint)\<[`Int16`](#int16)\>

Defined in: [src/branded-types/int16.d.mts:79](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/int16.d.mts#L79)

16-bit integer type with small literal values included.
Type: `-40 | -39 | ... | 39 | Int16`

***

### NonZeroInt16WithSmallInt

> **NonZeroInt16WithSmallInt** = [`WithSmallInt`](small-int.md#withsmallint)\<[`NonZeroInt16`](#nonzeroint16)\>

Defined in: [src/branded-types/int16.d.mts:85](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/int16.d.mts#L85)

Non-zero 16-bit integer type with small literal values included.
Type: `-40 | ... | -1 | 1 | ... | 39 | NonZeroInt16`

***

### NonNegativeInt16WithSmallInt

> **NonNegativeInt16WithSmallInt** = [`WithSmallInt`](small-int.md#withsmallint)\<[`NonNegativeInt16`](#nonnegativeint16)\>

Defined in: [src/branded-types/int16.d.mts:91](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/int16.d.mts#L91)

Non-negative 16-bit integer type with small literal values included.
Type: `0 | 1 | ... | 39 | NonNegativeInt16`

***

### PositiveInt16WithSmallInt

> **PositiveInt16WithSmallInt** = [`WithSmallInt`](small-int.md#withsmallint)\<[`PositiveInt16`](#positiveint16)\>

Defined in: [src/branded-types/int16.d.mts:97](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/int16.d.mts#L97)

Positive 16-bit integer type with small literal values included.
Type: `1 | 2 | ... | 39 | PositiveInt16`

***

### NegativeInt16WithSmallInt

> **NegativeInt16WithSmallInt** = [`WithSmallInt`](small-int.md#withsmallint)\<[`NegativeInt16`](#negativeint16)\>

Defined in: [src/branded-types/int16.d.mts:103](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/int16.d.mts#L103)

Negative 16-bit integer type with small literal values included.
Type: `-40 | -39 | ... | -1 | NegativeInt16`

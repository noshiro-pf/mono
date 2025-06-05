[**Documentation**](../README.md)

---

[Documentation](../README.md) / branded-types/int32

# branded-types/int32

## Type Aliases

### Int32

> **Int32** = [`ExtendNumberBrand`](brand/namespaces/TSTypeForgeInternals/README.md#extendnumberbrand)\<[`SafeInt`](safe-int.md#safeint), `"< 2^31"` \| `"< 2^32"` \| `"> -2^32"` \| `">= -2^31"`\>

Defined in: [branded-types/int32.d.mts:18](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/int32.d.mts#L18)

Branded numeric type for 32-bit signed integers.
Range: [-2^31, 2^31 - 1] or [-2,147,483,648, 2,147,483,647]

#### Example

```ts
const isInt32 = (x: number): x is Int32 =>
    Number.isSafeInteger(x) && x >= -(2 ** 31) && x <= 2 ** 31 - 1;

const toInt32 = (x: number): Int32 => {
    // Simulate 32-bit integer overflow
    return (x | 0) as Int32;
};

const bitwiseOr = (a: Int32, b: Int32): Int32 => (a | b) as Int32;
```

---

### Int32WithSmallInt

> **Int32WithSmallInt** = [`WithSmallInt`](small-int.md#withsmallint)\<[`Int32`](#int32)\>

Defined in: [branded-types/int32.d.mts:83](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/int32.d.mts#L83)

32-bit integer type with small literal values included.
Type: `-40 | -39 | ... | 39 | Int32`

---

### NegativeInt32

> **NegativeInt32** = [`IntersectBrand`](brand/README.md#intersectbrand)\<[`Int32`](#int32), [`NegativeNumber`](core.md#negativenumber)\>

Defined in: [branded-types/int32.d.mts:77](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/int32.d.mts#L77)

Branded numeric type for negative 32-bit integers.
Range: [-2^31, -1] or [-2,147,483,648, -1]

#### Example

```ts
const isNegativeInt32 = (x: number): x is NegativeInt32 =>
    Number.isSafeInteger(x) && x < 0 && x >= -(2 ** 31);

const offset = (value: NegativeInt32) => ({ offset: value });
```

---

### NegativeInt32WithSmallInt

> **NegativeInt32WithSmallInt** = [`WithSmallInt`](small-int.md#withsmallint)\<[`NegativeInt32`](#negativeint32)\>

Defined in: [branded-types/int32.d.mts:107](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/int32.d.mts#L107)

Negative 32-bit integer type with small literal values included.
Type: `-40 | -39 | ... | -1 | NegativeInt32`

---

### NonNegativeInt32

> **NonNegativeInt32** = [`IntersectBrand`](brand/README.md#intersectbrand)\<[`Int32`](#int32), [`NonNegativeNumber`](core.md#nonnegativenumber)\>

Defined in: [branded-types/int32.d.mts:49](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/int32.d.mts#L49)

Branded numeric type for non-negative 32-bit signed integers.
Range: [0, 2^31 - 1] or [0, 2,147,483,647]

#### Example

```ts
const isNonNegativeInt32 = (x: number): x is NonNegativeInt32 =>
    Number.isSafeInteger(x) && x >= 0 && x <= 2 ** 31 - 1;

const score = (points: NonNegativeInt32) => ({ score: points });
```

---

### NonNegativeInt32WithSmallInt

> **NonNegativeInt32WithSmallInt** = [`WithSmallInt`](small-int.md#withsmallint)\<[`NonNegativeInt32`](#nonnegativeint32)\>

Defined in: [branded-types/int32.d.mts:95](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/int32.d.mts#L95)

Non-negative 32-bit integer type with small literal values included.
Type: `0 | 1 | ... | 39 | NonNegativeInt32`

---

### NonZeroInt32

> **NonZeroInt32** = [`IntersectBrand`](brand/README.md#intersectbrand)\<[`Int32`](#int32), [`NonZeroNumber`](core.md#nonzeronumber)\>

Defined in: [branded-types/int32.d.mts:35](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/int32.d.mts#L35)

Branded numeric type for non-zero 32-bit signed integers.
Range: [-2^31, -1] ∪ [1, 2^31 - 1]

#### Example

```ts
const isNonZeroInt32 = (x: number): x is NonZeroInt32 =>
    Number.isSafeInteger(x) && x !== 0 && x >= -(2 ** 31) && x <= 2 ** 31 - 1;

const delta = (change: NonZeroInt32) => ({ delta: change });
```

---

### NonZeroInt32WithSmallInt

> **NonZeroInt32WithSmallInt** = [`WithSmallInt`](small-int.md#withsmallint)\<[`NonZeroInt32`](#nonzeroint32)\>

Defined in: [branded-types/int32.d.mts:89](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/int32.d.mts#L89)

Non-zero 32-bit integer type with small literal values included.
Type: `-40 | ... | -1 | 1 | ... | 39 | NonZeroInt32`

---

### PositiveInt32

> **PositiveInt32** = [`IntersectBrand`](brand/README.md#intersectbrand)\<[`Int32`](#int32), [`PositiveNumber`](core.md#positivenumber)\>

Defined in: [branded-types/int32.d.mts:63](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/int32.d.mts#L63)

Branded numeric type for positive 32-bit signed integers.
Range: [1, 2^31 - 1] or [1, 2,147,483,647]

#### Example

```ts
const isPositiveInt32 = (x: number): x is PositiveInt32 =>
    Number.isSafeInteger(x) && x > 0 && x <= 2 ** 31 - 1;

const userId = (id: PositiveInt32) => ({ userId: id });
```

---

### PositiveInt32WithSmallInt

> **PositiveInt32WithSmallInt** = [`WithSmallInt`](small-int.md#withsmallint)\<[`PositiveInt32`](#positiveint32)\>

Defined in: [branded-types/int32.d.mts:101](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/int32.d.mts#L101)

Positive 32-bit integer type with small literal values included.
Type: `1 | 2 | ... | 39 | PositiveInt32`

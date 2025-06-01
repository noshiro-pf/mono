[**Documentation**](../README.md)

---

[Documentation](../README.md) / branded-types/branded-number-types

# branded-types/branded-number-types

## Type Aliases

### BigInt64

> **BigInt64** = [`ExtendBrand`](brand.md#extendbrand)\<[`ChangeBaseBrand`](brand.md#changebasebrand)\<[`Int`](#int), `bigint`\>, `"BigInt64"`\>

Defined in: [branded-types/branded-number-types.d.mts:714](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/branded-number-types.d.mts#L714)

Branded bigint type for 64-bit signed integers.
Represents values that can be stored in a BigInt64Array.

#### Example

```ts
const toBigInt64 = (x: bigint): BigInt64 => {
    const min = -(2n ** 63n);
    const max = 2n ** 63n - 1n;
    if (x >= min && x <= max) return x as BigInt64;
    throw new Error('Out of BigInt64 range');
};
```

---

### BigUint64

> **BigUint64** = [`ExtendBrand`](brand.md#extendbrand)\<[`ChangeBaseBrand`](brand.md#changebasebrand)\<[`Int`](#int), `bigint`\>, `"BigUint64"`\>

Defined in: [branded-types/branded-number-types.d.mts:729](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/branded-number-types.d.mts#L729)

Branded bigint type for 64-bit unsigned integers.
Represents values that can be stored in a BigUint64Array.

#### Example

```ts
const toBigUint64 = (x: bigint): BigUint64 => {
    const max = 2n ** 64n - 1n;
    if (x >= 0n && x <= max) return x as BigUint64;
    throw new Error('Out of BigUint64 range');
};
```

---

### CastToInt\<T\>

> **CastToInt**\<`T`\> = `T` _extends_ [`Int`](#int) ? `T` : `never`

Defined in: [branded-types/branded-number-types.d.mts:801](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/branded-number-types.d.mts#L801)

Utility type that filters only integer branded types.
Returns the input type if it extends Int, otherwise returns never.

#### Type Parameters

##### T

`T`

Type to check and cast

#### Returns

T if T extends Int, otherwise never

#### Example

```ts
type A = CastToInt<Int>; // Int
type B = CastToInt<FiniteNumber>; // never
type C = CastToInt<SafeInt>; // SafeInt (since SafeInt extends Int)
```

---

### FiniteNumber

> **FiniteNumber** = `TSTypeForgeInternals.ExtendNumberBrand`\<[`ValidNumber`](#validnumber), `"Finite"`\>

Defined in: [branded-types/branded-number-types.d.mts:191](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/branded-number-types.d.mts#L191)

Branded numeric type for finite numbers.
Represents values that pass `Number.isFinite(x)` check.
Excludes `NaN`, `Infinity`, and `-Infinity`.

#### Example

```ts
const isFinite = (x: number): x is FiniteNumber => Number.isFinite(x);

const safeDivide = (
    a: FiniteNumber,
    b: FiniteNumber,
): FiniteNumber | InfiniteNumber => {
    const result = a / b;
    return isFinite(result) ? result : (result as InfiniteNumber);
};
```

---

### Float32

> **Float32** = `TSTypeForgeInternals.ExtendNumberBrand`\<`TSTypeForgeInternals.BrandedNumberBaseType`, `"Float32"`\>

Defined in: [branded-types/branded-number-types.d.mts:677](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/branded-number-types.d.mts#L677)

Branded numeric type for 32-bit floating point numbers.
Represents values that can be stored in a Float32Array.

#### Example

```ts
const toFloat32 = (x: number): Float32 => {
    const arr = new Float32Array([x]);
    return arr[0] as Float32;
};

const shader = (vertices: Float32[]) => {
    // WebGL shader processing
};
```

---

### Float64

> **Float64** = `TSTypeForgeInternals.ExtendNumberBrand`\<`TSTypeForgeInternals.BrandedNumberBaseType`, `"Float64"`\>

Defined in: [branded-types/branded-number-types.d.mts:695](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/branded-number-types.d.mts#L695)

Branded numeric type for 64-bit floating point numbers.
Represents values that can be stored in a Float64Array (standard JS number precision).

#### Example

```ts
const toFloat64 = (x: number): Float64 => x as Float64;

const scientificData = (measurements: Float64[]) => {
    // High-precision calculations
};
```

---

### InfiniteNumber

> **InfiniteNumber** = `TSTypeForgeInternals.ExtendNumberBrand`\<[`ValidNumber`](#validnumber), `"!=0"`, `"Finite"` \| `"Int"` \| `"SafeInt"`\>

Defined in: [branded-types/branded-number-types.d.mts:211](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/branded-number-types.d.mts#L211)

Branded numeric type for infinite values (`Infinity` or `-Infinity`).
Represents values that are valid numbers but not finite.

#### Example

```ts
const isInfinite = (x: number): x is InfiniteNumber =>
    !Number.isNaN(x) && !Number.isFinite(x);

const checkOverflow = (x: number): FiniteNumber | InfiniteNumber => {
    if (isInfinite(x)) return x;
    return x as FiniteNumber;
};
```

---

### Int

> **Int** = `TSTypeForgeInternals.ExtendNumberBrand`\<[`FiniteNumber`](#finitenumber), `"Int"`\>

Defined in: [branded-types/branded-number-types.d.mts:405](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/branded-number-types.d.mts#L405)

Branded numeric type for integers.
Represents values that pass `Number.isInteger(x)` check.

#### Example

```ts
const isInt = (x: number): x is Int => Number.isInteger(x);

const getArrayElement = <T>(
    arr: readonly T[],
    index: Int & NonNegativeNumber,
) => arr[index];

const factorial = (n: Int & NonNegativeNumber): Int =>
    n === 0
        ? (1 as Int)
        : ((n * factorial((n - 1) as Int & NonNegativeNumber)) as Int);
```

---

### Int16

> **Int16** = `TSTypeForgeInternals.ExtendNumberBrand`\<[`Int32`](#int32), `"< 2^15"` \| `"< 2^16"` \| `"> -2^16"` \| `">= -2^15"`\>

Defined in: [branded-types/branded-number-types.d.mts:586](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/branded-number-types.d.mts#L586)

Branded numeric type for 16-bit signed integers.
Range: [-2^15, 2^15 - 1] or [-32,768, 32,767]

#### Example

```ts
const isInt16 = (x: number): x is Int16 =>
    Number.isSafeInteger(x) && x >= -(2 ** 15) && x <= 2 ** 15 - 1;

const audioSample = (value: Int16) => ({ sample: value });
const temperature = (celsius: Int16) => ({ celsius });
```

---

### Int16WithSmallInt

> **Int16WithSmallInt** = [`WithSmallInt`](#withsmallint)\<[`Int16`](#int16)\>

Defined in: [branded-types/branded-number-types.d.mts:908](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/branded-number-types.d.mts#L908)

16-bit integer type with small literal values included.
Type: `-40 | -39 | ... | 39 | Int16`

---

### Int32

> **Int32** = `TSTypeForgeInternals.ExtendNumberBrand`\<[`SafeInt`](#safeint), `"< 2^31"` \| `"< 2^32"` \| `"> -2^32"` \| `">= -2^31"`\>

Defined in: [branded-types/branded-number-types.d.mts:568](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/branded-number-types.d.mts#L568)

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

> **Int32WithSmallInt** = [`WithSmallInt`](#withsmallint)\<[`Int32`](#int32)\>

Defined in: [branded-types/branded-number-types.d.mts:902](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/branded-number-types.d.mts#L902)

32-bit integer type with small literal values included.
Type: `-40 | -39 | ... | 39 | Int32`

---

### IntWithSmallInt

> **IntWithSmallInt** = [`WithSmallInt`](#withsmallint)\<[`Int`](#int)\>

Defined in: [branded-types/branded-number-types.d.mts:842](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/branded-number-types.d.mts#L842)

Integer type with small literal values included.
Type: `-40 | -39 | ... | 39 | Int`

---

### NaNType

> **NaNType** = `TSTypeForgeInternals.ExtendNumberBrand`\<`TSTypeForgeInternals.BrandedNumberBaseType`, `"!=0"` \| `"NaNValue"`, `TSTypeForgeInternals.IntRangeKeys` \| `">=0"` \| `"Finite"` \| `"Int"` \| `"SafeInt"`\>

Defined in: [branded-types/branded-number-types.d.mts:150](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/branded-number-types.d.mts#L150)

Branded numeric type representing the `NaN` value.
This type is branded to ensure type safety when handling NaN values.

#### Example

```ts
const checkNaN = (x: number): x is NaNType => Number.isNaN(x);

const value: number = parseFloat('invalid');
if (checkNaN(value)) {
    const nan: NaNType = value;
    // Handle NaN case specifically
}
```

---

### NEGATIVE_INFINITY

> **NEGATIVE_INFINITY** = `TSTypeForgeInternals.ExtendNumberBrand`\<[`IntersectBrand`](brand.md#intersectbrand)\<[`InfiniteNumber`](#infinitenumber), [`NegativeNumber`](#negativenumber)\>, `never`, `"> -2^16"` \| `"> -2^32"` \| `">= -2^15"` \| `">= -2^31"`\>

Defined in: [branded-types/branded-number-types.d.mts:322](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/branded-number-types.d.mts#L322)

Branded numeric type specifically for `Number.NEGATIVE_INFINITY`.

#### Example

```ts
const isNegInfinity = (x: number): x is NEGATIVE_INFINITY =>
    x === Number.NEGATIVE_INFINITY;

const handleUnderflow = (x: number): FiniteNumber | NEGATIVE_INFINITY => {
    if (x < -Number.MAX_VALUE)
        return Number.NEGATIVE_INFINITY as NEGATIVE_INFINITY;
    return x as FiniteNumber;
};
```

---

### NegativeFiniteNumber

> **NegativeFiniteNumber** = [`IntersectBrand`](brand.md#intersectbrand)\<[`NegativeNumber`](#negativenumber), [`FiniteNumber`](#finitenumber)\>

Defined in: [branded-types/branded-number-types.d.mts:386](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/branded-number-types.d.mts#L386)

Branded numeric type for finite negative numbers.
Represents finite values strictly less than zero.

#### Example

```ts
const isNegativeFinite = (x: number): x is NegativeFiniteNumber =>
    Number.isFinite(x) && x < 0;

const temperature = (celsius: NegativeFiniteNumber) => ({
    celsius,
    freezing: true,
});
```

---

### NegativeInt

> **NegativeInt** = [`IntersectBrand`](brand.md#intersectbrand)\<[`Int`](#int), [`NegativeNumber`](#negativenumber)\>

Defined in: [branded-types/branded-number-types.d.mts:454](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/branded-number-types.d.mts#L454)

Branded numeric type for negative integers.
Represents integers strictly less than zero.

#### Example

```ts
const isNegativeInt = (x: number): x is NegativeInt =>
    Number.isInteger(x) && x < 0;

const offset = (value: NegativeInt) => ({ offset: value });
const depth = (level: NegativeInt) => ({ belowGround: -level });
```

---

### NegativeInt16

> **NegativeInt16** = `TSTypeForgeInternals.ExtendNumberBrand`\<[`NegativeInt32`](#negativeint32), `"> -2^16"` \| `">= -2^31"`\>

Defined in: [branded-types/branded-number-types.d.mts:656](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/branded-number-types.d.mts#L656)

Branded numeric type for negative 16-bit integers.
Range: [-2^16 + 1, -1] or [-65,535, -1]

#### Example

```ts
const isNegativeInt16 = (x: number): x is NegativeInt16 =>
    Number.isSafeInteger(x) && x < 0 && x > -(2 ** 16);

const relativePosition = (offset: NegativeInt16) => ({ x: offset });
```

---

### NegativeInt16WithSmallInt

> **NegativeInt16WithSmallInt** = [`WithSmallInt`](#withsmallint)\<[`NegativeInt16`](#negativeint16)\>

Defined in: [branded-types/branded-number-types.d.mts:932](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/branded-number-types.d.mts#L932)

Negative 16-bit integer type with small literal values included.
Type: `-40 | -39 | ... | -1 | NegativeInt16`

---

### NegativeInt32

> **NegativeInt32** = `TSTypeForgeInternals.ExtendNumberBrand`\<[`IntersectBrand`](brand.md#intersectbrand)\<[`SafeInt`](#safeint), [`NegativeNumber`](#negativenumber)\>, `"> -2^32"`\>

Defined in: [branded-types/branded-number-types.d.mts:639](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/branded-number-types.d.mts#L639)

Branded numeric type for negative 32-bit integers.
Range: [-2^32 + 1, -1] or [-4,294,967,295, -1]

#### Example

```ts
const isNegativeInt32 = (x: number): x is NegativeInt32 =>
    Number.isSafeInteger(x) && x < 0 && x > -(2 ** 32);

const offset = (value: NegativeInt32) => ({ offset: value });
```

---

### NegativeInt32WithSmallInt

> **NegativeInt32WithSmallInt** = [`WithSmallInt`](#withsmallint)\<[`NegativeInt32`](#negativeint32)\>

Defined in: [branded-types/branded-number-types.d.mts:926](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/branded-number-types.d.mts#L926)

Negative 32-bit integer type with small literal values included.
Type: `-40 | -39 | ... | -1 | NegativeInt32`

---

### NegativeIntWithSmallInt

> **NegativeIntWithSmallInt** = [`WithSmallInt`](#withsmallint)\<[`NegativeInt`](#negativeint)\>

Defined in: [branded-types/branded-number-types.d.mts:878](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/branded-number-types.d.mts#L878)

Negative integer type with small literal values included.
Type: `-40 | -39 | ... | -1 | NegativeInt`

---

### NegativeNumber

> **NegativeNumber** = `TSTypeForgeInternals.ExtendNumberBrand`\<[`NonZeroNumber`](#nonzeronumber), `"< 2^15"` \| `"< 2^16"` \| `"< 2^31"` \| `"< 2^32"`, `">=0"`\>

Defined in: [branded-types/branded-number-types.d.mts:282](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/branded-number-types.d.mts#L282)

Branded numeric type for negative numbers (x < 0).
Excludes zero, includes only strictly negative values.

#### Example

```ts
const isNegative = (x: number): x is NegativeNumber => x < 0;

const absoluteValue = (x: NegativeNumber): PositiveNumber =>
    Math.abs(x) as PositiveNumber;

const debt = (amount: NegativeNumber) => ({ type: 'debt', amount });
```

---

### NegativeSafeInt

> **NegativeSafeInt** = [`IntersectBrand`](brand.md#intersectbrand)\<[`SafeInt`](#safeint), [`NegativeNumber`](#negativenumber)\>

Defined in: [branded-types/branded-number-types.d.mts:534](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/branded-number-types.d.mts#L534)

Branded numeric type for negative safe integers.
Represents negative integers within the safe integer range.

#### Example

```ts
const isNegativeSafeInt = (x: number): x is NegativeSafeInt =>
    Number.isSafeInteger(x) && x < 0;

const priority = (level: NegativeSafeInt) => ({ priority: -level });
```

---

### NegativeSafeIntWithSmallInt

> **NegativeSafeIntWithSmallInt** = [`WithSmallInt`](#withsmallint)\<[`NegativeSafeInt`](#negativesafeint)\>

Defined in: [branded-types/branded-number-types.d.mts:884](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/branded-number-types.d.mts#L884)

Negative safe integer type with small literal values included.
Type: `-40 | -39 | ... | -1 | NegativeSafeInt`

---

### NonNegativeFiniteNumber

> **NonNegativeFiniteNumber** = [`IntersectBrand`](brand.md#intersectbrand)\<[`NonNegativeNumber`](#nonnegativenumber), [`FiniteNumber`](#finitenumber)\>

Defined in: [branded-types/branded-number-types.d.mts:356](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/branded-number-types.d.mts#L356)

Branded numeric type for finite non-negative numbers.
Represents finite values greater than or equal to zero.

#### Example

```ts
const isNonNegativeFinite = (x: number): x is NonNegativeFiniteNumber =>
    Number.isFinite(x) && x >= 0;

const distance = (x: NonNegativeFiniteNumber) => ({ meters: x });
const age = (years: NonNegativeFiniteNumber & Int) => ({ years });
```

---

### NonNegativeNumber

> **NonNegativeNumber** = `TSTypeForgeInternals.ExtendNumberBrand`\<[`ValidNumber`](#validnumber), `"> -2^16"` \| `"> -2^32"` \| `">= -2^15"` \| `">= -2^31"` \| `">=0"`\>

Defined in: [branded-types/branded-number-types.d.mts:247](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/branded-number-types.d.mts#L247)

Branded numeric type for non-negative numbers (x >= 0).
Includes zero and all positive numbers.

#### Example

```ts
const isNonNegative = (x: number): x is NonNegativeNumber => x >= 0;

const sqrt = (x: NonNegativeNumber) => Math.sqrt(x);
// Safe square root without negative input

const arrayIndex = (arr: readonly unknown[], i: NonNegativeNumber & Int) =>
    arr[i];
```

---

### NonZeroFiniteNumber

> **NonZeroFiniteNumber** = [`IntersectBrand`](brand.md#intersectbrand)\<[`NonZeroNumber`](#nonzeronumber), [`FiniteNumber`](#finitenumber)\>

Defined in: [branded-types/branded-number-types.d.mts:341](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/branded-number-types.d.mts#L341)

Branded numeric type for finite non-zero numbers.
Combines the constraints of being finite and non-zero.

#### Example

```ts
const isNonZeroFinite = (x: number): x is NonZeroFiniteNumber =>
    Number.isFinite(x) && x !== 0;

const rate = (distance: FiniteNumber, time: NonZeroFiniteNumber) =>
    distance / time; // Safe division, finite result
```

---

### NonZeroInt

> **NonZeroInt** = [`IntersectBrand`](brand.md#intersectbrand)\<[`Int`](#int), [`NonZeroNumber`](#nonzeronumber)\>

Defined in: [branded-types/branded-number-types.d.mts:472](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/branded-number-types.d.mts#L472)

Branded numeric type for non-zero integers.
Represents integers that are not equal to zero.

#### Example

```ts
const isNonZeroInt = (x: number): x is NonZeroInt =>
    Number.isInteger(x) && x !== 0;

const modulo = (a: Int, b: NonZeroInt) => a % b;
const gcd = (a: NonZeroInt, b: NonZeroInt): NonZeroInt => {
    // Euclidean algorithm implementation
    return (b === 0 ? a : gcd(b, (a % b) as NonZeroInt)) as NonZeroInt;
};
```

---

### NonZeroIntWithSmallInt

> **NonZeroIntWithSmallInt** = [`WithSmallInt`](#withsmallint)\<[`NonZeroInt`](#nonzeroint)\>

Defined in: [branded-types/branded-number-types.d.mts:890](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/branded-number-types.d.mts#L890)

Non-zero integer type with small literal values included.
Type: `-40 | ... | -1 | 1 | ... | 39 | NonZeroInt`

---

### NonZeroNumber

> **NonZeroNumber** = `TSTypeForgeInternals.ExtendNumberBrand`\<[`ValidNumber`](#validnumber), `"!=0"`\>

Defined in: [branded-types/branded-number-types.d.mts:231](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/branded-number-types.d.mts#L231)

Branded numeric type for non-zero numbers.
Represents values that are not equal to zero (including -0).

#### Example

```ts
const isNonZero = (x: number): x is NonZeroNumber => x !== 0;

const safeDivide = (a: number, b: NonZeroNumber) => a / b;
// No division by zero possible

const reciprocal = (x: NonZeroNumber) => 1 / x;
```

---

### NonZeroSafeInt

> **NonZeroSafeInt** = [`IntersectBrand`](brand.md#intersectbrand)\<[`SafeInt`](#safeint), [`NonZeroNumber`](#nonzeronumber)\>

Defined in: [branded-types/branded-number-types.d.mts:549](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/branded-number-types.d.mts#L549)

Branded numeric type for non-zero safe integers.
Represents safe integers that are not equal to zero.

#### Example

```ts
const isNonZeroSafeInt = (x: number): x is NonZeroSafeInt =>
    Number.isSafeInteger(x) && x !== 0;

const step = (current: SafeInt, increment: NonZeroSafeInt): SafeInt =>
    (current + increment) as SafeInt;
```

---

### NonZeroSafeIntWithSmallInt

> **NonZeroSafeIntWithSmallInt** = [`WithSmallInt`](#withsmallint)\<[`NonZeroSafeInt`](#nonzerosafeint)\>

Defined in: [branded-types/branded-number-types.d.mts:896](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/branded-number-types.d.mts#L896)

Non-zero safe integer type with small literal values included.
Type: `-40 | ... | -1 | 1 | ... | 39 | NonZeroSafeInt`

---

### POSITIVE_INFINITY

> **POSITIVE_INFINITY** = `TSTypeForgeInternals.ExtendNumberBrand`\<[`IntersectBrand`](brand.md#intersectbrand)\<[`InfiniteNumber`](#infinitenumber), [`PositiveNumber`](#positivenumber)\>, `never`, `"< 2^15"` \| `"< 2^16"` \| `"< 2^31"` \| `"< 2^32"`\>

Defined in: [branded-types/branded-number-types.d.mts:302](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/branded-number-types.d.mts#L302)

Branded numeric type specifically for `Number.POSITIVE_INFINITY`.

#### Example

```ts
const isPosInfinity = (x: number): x is POSITIVE_INFINITY =>
    x === Number.POSITIVE_INFINITY;

const handleLimit = (x: number): FiniteNumber | POSITIVE_INFINITY => {
    if (x > Number.MAX_VALUE)
        return Number.POSITIVE_INFINITY as POSITIVE_INFINITY;
    return x as FiniteNumber;
};
```

---

### PositiveFiniteNumber

> **PositiveFiniteNumber** = [`IntersectBrand`](brand.md#intersectbrand)\<[`PositiveNumber`](#positivenumber), [`FiniteNumber`](#finitenumber)\>

Defined in: [branded-types/branded-number-types.d.mts:371](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/branded-number-types.d.mts#L371)

Branded numeric type for finite positive numbers.
Represents finite values strictly greater than zero.

#### Example

```ts
const isPositiveFinite = (x: number): x is PositiveFiniteNumber =>
    Number.isFinite(x) && x > 0;

const price = (amount: PositiveFiniteNumber) => ({ USD: amount });
const weight = (kg: PositiveFiniteNumber) => ({ kilograms: kg });
```

---

### PositiveInt

> **PositiveInt** = [`IntersectBrand`](brand.md#intersectbrand)\<[`Int`](#int), [`PositiveNumber`](#positivenumber)\>

Defined in: [branded-types/branded-number-types.d.mts:439](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/branded-number-types.d.mts#L439)

Branded numeric type for positive integers.
Represents integers strictly greater than zero.

#### Example

```ts
const isPositiveInt = (x: number): x is PositiveInt =>
    Number.isInteger(x) && x > 0;

const take = <T>(arr: readonly T[], n: PositiveInt): T[] => arr.slice(0, n);

const id = (value: PositiveInt) => ({ id: value });
```

---

### PositiveIntWithSmallInt

> **PositiveIntWithSmallInt** = [`WithSmallInt`](#withsmallint)\<[`PositiveInt`](#positiveint)\>

Defined in: [branded-types/branded-number-types.d.mts:866](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/branded-number-types.d.mts#L866)

Positive integer type with small literal values included.
Type: `1 | 2 | ... | 39 | PositiveInt`

---

### PositiveNumber

> **PositiveNumber** = [`IntersectBrand`](brand.md#intersectbrand)\<[`NonZeroNumber`](#nonzeronumber), [`NonNegativeNumber`](#nonnegativenumber)\>

Defined in: [branded-types/branded-number-types.d.mts:266](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/branded-number-types.d.mts#L266)

Branded numeric type for positive numbers (x > 0).
Excludes zero, includes only strictly positive values.

#### Example

```ts
const isPositive = (x: number): x is PositiveNumber => x > 0;

const log = (x: PositiveNumber) => Math.log(x);
// Safe logarithm without non-positive input

const scale = (value: number, factor: PositiveNumber) => value * factor;
```

---

### PositiveSafeInt

> **PositiveSafeInt** = [`IntersectBrand`](brand.md#intersectbrand)\<[`SafeInt`](#safeint), [`PositiveNumber`](#positivenumber)\>

Defined in: [branded-types/branded-number-types.d.mts:520](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/branded-number-types.d.mts#L520)

Branded numeric type for positive safe integers.
Represents positive integers within the safe integer range.

#### Example

```ts
const isPositiveSafeInt = (x: number): x is PositiveSafeInt =>
    Number.isSafeInteger(x) && x > 0;

const userId = (id: PositiveSafeInt) => ({ userId: id });
const port = (num: PositiveSafeInt & Uint16) => ({ port: num });
```

---

### PositiveSafeIntWithSmallInt

> **PositiveSafeIntWithSmallInt** = [`WithSmallInt`](#withsmallint)\<[`PositiveSafeInt`](#positivesafeint)\>

Defined in: [branded-types/branded-number-types.d.mts:872](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/branded-number-types.d.mts#L872)

Positive safe integer type with small literal values included.
Type: `1 | 2 | ... | 39 | PositiveSafeInt`

---

### RemoveSmallInt\<N, MaxIndex\>

> **RemoveSmallInt**\<`N`, `MaxIndex`\> = [`RelaxedExclude`](../record/std.md#relaxedexclude)\<`N`, [`SmallInt`](#smallint)\<`""`, `MaxIndex`\>\>

Defined in: [branded-types/branded-number-types.d.mts:955](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/branded-number-types.d.mts#L955)

Removes small integer literals from an integer type enhanced with WithSmallInt.
Useful for converting back to pure branded types.

#### Type Parameters

##### N

`N` _extends_ [`IntWithSmallInt`](#intwithsmallint)

Integer type with small literals to remove from

##### MaxIndex

`MaxIndex` _extends_ `number` = `TSTypeForgeInternals.SmallIntIndexMax`

Maximum absolute value of literals to remove (default: 40)

#### Returns

The branded type without literal values

#### Example

```ts
type Count = WithSmallInt<Uint>; // 0 | 1 | ... | 39 | Uint
type PureCount = RemoveSmallInt<Count>; // Uint

const toLargeCount = (n: Count): RemoveSmallInt<Count> => {
    if (typeof n === 'number') {
        return (n + 1000) as Uint; // Convert small to large
    }
    return n;
};
```

---

### SafeInt

> **SafeInt** = `TSTypeForgeInternals.ExtendNumberBrand`\<[`Int`](#int), `"SafeInt"`\>

Defined in: [branded-types/branded-number-types.d.mts:490](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/branded-number-types.d.mts#L490)

Branded numeric type for safe integers.
Represents integers that can be exactly represented in JavaScript (±2^53 - 1).

#### Example

```ts
const isSafeInt = (x: number): x is SafeInt => Number.isSafeInteger(x);

const safeMath = {
    add: (a: SafeInt, b: SafeInt): SafeInt | undefined => {
        const result = a + b;
        return isSafeInt(result) ? result : undefined;
    },
};
```

---

### SafeIntWithSmallInt

> **SafeIntWithSmallInt** = [`WithSmallInt`](#withsmallint)\<[`SafeInt`](#safeint)\>

Defined in: [branded-types/branded-number-types.d.mts:848](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/branded-number-types.d.mts#L848)

Safe integer type with small literal values included.
Type: `-40 | -39 | ... | 39 | SafeInt`

---

### SafeUint

> **SafeUint** = [`IntersectBrand`](brand.md#intersectbrand)\<[`SafeInt`](#safeint), [`NonNegativeNumber`](#nonnegativenumber)\>

Defined in: [branded-types/branded-number-types.d.mts:505](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/branded-number-types.d.mts#L505)

Branded numeric type for safe unsigned integers.
Represents non-negative integers within the safe integer range.

#### Example

```ts
const isSafeUint = (x: number): x is SafeUint =>
    Number.isSafeInteger(x) && x >= 0;

const fileSize = (bytes: SafeUint) => ({ bytes });
const timestamp = (): SafeUint => Date.now() as SafeUint;
```

---

### SafeUintWithSmallInt

> **SafeUintWithSmallInt** = [`WithSmallInt`](#withsmallint)\<[`SafeUint`](#safeuint)\>

Defined in: [branded-types/branded-number-types.d.mts:860](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/branded-number-types.d.mts#L860)

Safe unsigned integer type with small literal values included.
Type: `0 | 1 | ... | 39 | SafeUint`

---

### SmallInt\<T, MaxIndex\>

> **SmallInt**\<`T`, `MaxIndex`\> = [`TypeEq`](../condition/eq.md#typeeq)\<`T`, `"<=0"`\> _extends_ `true` ? `TSTypeForgeInternals.SmallNegativeInt`\<`MaxIndex`\> \| `0` : [`TypeEq`](../condition/eq.md#typeeq)\<`T`, `"<0"`\> _extends_ `true` ? `TSTypeForgeInternals.SmallNegativeInt`\<`MaxIndex`\> : [`TypeEq`](../condition/eq.md#typeeq)\<`T`, `">=0"`\> _extends_ `true` ? `TSTypeForgeInternals.SmallPositiveInt`\<`MaxIndex`\> \| `0` : [`TypeEq`](../condition/eq.md#typeeq)\<`T`, `">0"`\> _extends_ `true` ? `TSTypeForgeInternals.SmallPositiveInt`\<`MaxIndex`\> : [`TypeEq`](../condition/eq.md#typeeq)\<`T`, `"!=0"`\> _extends_ `true` ? `TSTypeForgeInternals.SmallNegativeInt`\<`MaxIndex`\> \| `TSTypeForgeInternals.SmallPositiveInt`\<`MaxIndex`\> : [`TypeEq`](../condition/eq.md#typeeq)\<`T`, `""`\> _extends_ `true` ? `TSTypeForgeInternals.SmallNegativeInt`\<`MaxIndex`\> \| `TSTypeForgeInternals.SmallPositiveInt`\<`MaxIndex`\> \| `0` : `never`

Defined in: [branded-types/branded-number-types.d.mts:752](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/branded-number-types.d.mts#L752)

Union type of small integer literals for type-level operations.
Provides literal integer types within a small range for precise typing.

#### Type Parameters

##### T

`T` _extends_ `"!=0"` \| `""` \| `"<=0"` \| `"<0"` \| `">=0"` \| `">0"` = `""`

Constraint specifying which integers to include:

- `''` : All integers in `[-MaxIndex, MaxIndex - 1]`
- `'!=0'` : All integers except 0
- `'<0'` : Negative integers only `[-MaxIndex, -1]`
- `'<=0'` : Non-positive integers `[-MaxIndex, 0]`
- `'>0'` : Positive integers only `[1, MaxIndex - 1]`
- `'>=0'` : Non-negative integers `[0, MaxIndex - 1]`

##### MaxIndex

`MaxIndex` _extends_ `number` = `TSTypeForgeInternals.SmallIntIndexMax`

Maximum absolute value for the range (default: 40)

#### Example

```ts
type DiceValue = SmallInt<'>0', 7>; // 1 | 2 | 3 | 4 | 5 | 6
type Temperature = SmallInt<'', 101>; // -100 to 100
type Countdown = SmallInt<'>=0', 11>; // 0 | 1 | 2 | ... | 10
type Offset = SmallInt<'!=0', 6>; // -5 | -4 | -3 | -2 | -1 | 1 | 2 | 3 | 4 | 5
```

---

### SmallUint

> **SmallUint** = [`SmallInt`](#smallint)\<`">=0"`\>

Defined in: [branded-types/branded-number-types.d.mts:785](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/branded-number-types.d.mts#L785)

Union type of small non-negative integer literals.
Convenience type for `SmallInt<'>=0'>`.

#### Example

```ts
type Index = SmallUint; // 0 | 1 | 2 | ... | 39
const getItem = <T>(arr: readonly T[], i: Index) => arr[i];
```

---

### Uint

> **Uint** = [`IntersectBrand`](brand.md#intersectbrand)\<[`Int`](#int), [`NonNegativeNumber`](#nonnegativenumber)\>

Defined in: [branded-types/branded-number-types.d.mts:422](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/branded-number-types.d.mts#L422)

Branded numeric type for unsigned integers (non-negative integers).
Represents integers greater than or equal to zero.

#### Example

```ts
const isUint = (x: number): x is Uint => Number.isInteger(x) && x >= 0;

const arrayLength = (arr: readonly unknown[]): Uint => arr.length as Uint;

const repeat = (str: string, count: Uint) => str.repeat(count);
```

---

### Uint16

> **Uint16** = `TSTypeForgeInternals.ExtendNumberBrand`\<[`Uint32`](#uint32), `"< 2^16"` \| `"< 2^31"`\>

Defined in: [branded-types/branded-number-types.d.mts:622](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/branded-number-types.d.mts#L622)

Branded numeric type for 16-bit unsigned integers.
Range: [0, 2^16 - 1] or [0, 65,535]

#### Example

```ts
const isUint16 = (x: number): x is Uint16 =>
    Number.isSafeInteger(x) && x >= 0 && x <= 2 ** 16 - 1;

const port = (num: Uint16) => ({ port: num });
const characterCode = (code: Uint16) => String.fromCharCode(code);
```

---

### Uint16WithSmallInt

> **Uint16WithSmallInt** = [`WithSmallInt`](#withsmallint)\<[`Uint16`](#uint16)\>

Defined in: [branded-types/branded-number-types.d.mts:920](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/branded-number-types.d.mts#L920)

16-bit unsigned integer type with small literal values included.
Type: `0 | 1 | ... | 39 | Uint16`

---

### Uint32

> **Uint32** = `TSTypeForgeInternals.ExtendNumberBrand`\<[`SafeUint`](#safeuint), `"< 2^32"`\>

Defined in: [branded-types/branded-number-types.d.mts:607](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/branded-number-types.d.mts#L607)

Branded numeric type for 32-bit unsigned integers.
Range: [0, 2^32 - 1] or [0, 4,294,967,295]

#### Example

```ts
const isUint32 = (x: number): x is Uint32 =>
    Number.isSafeInteger(x) && x >= 0 && x <= 2 ** 32 - 1;

const color = (rgba: Uint32) => ({ rgba });
const ipAddress = (ip: Uint32) => {
    // Convert to dotted decimal notation
    return `${ip >>> 24}.${(ip >>> 16) & 0xff}.${(ip >>> 8) & 0xff}.${ip & 0xff}`;
};
```

---

### Uint32WithSmallInt

> **Uint32WithSmallInt** = [`WithSmallInt`](#withsmallint)\<[`Uint32`](#uint32)\>

Defined in: [branded-types/branded-number-types.d.mts:914](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/branded-number-types.d.mts#L914)

32-bit unsigned integer type with small literal values included.
Type: `0 | 1 | ... | 39 | Uint32`

---

### UintWithSmallInt

> **UintWithSmallInt** = [`WithSmallInt`](#withsmallint)\<[`Uint`](#uint)\>

Defined in: [branded-types/branded-number-types.d.mts:854](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/branded-number-types.d.mts#L854)

Unsigned integer type with small literal values included.
Type: `0 | 1 | ... | 39 | Uint`

---

### ValidNumber

> **ValidNumber** = `TSTypeForgeInternals.ExtendNumberBrand`\<`TSTypeForgeInternals.BrandedNumberBaseType`, `never`, `"NaNValue"`\>

Defined in: [branded-types/branded-number-types.d.mts:170](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/branded-number-types.d.mts#L170)

Branded numeric type for all valid numbers (excluding `NaN`).
This is the base type for most numeric brands.

#### Example

```ts
const isValidNumber = (x: number): x is ValidNumber => !Number.isNaN(x);

const process = (n: ValidNumber) => {
    // Can safely perform arithmetic without NaN checks
    return n * 2 + 1;
};
```

---

### WithSmallInt\<N, MaxIndex\>

> **WithSmallInt**\<`N`, `MaxIndex`\> = `TSTypeForgeInternals.WithSmallIntImpl`\<[`CastToInt`](#casttoint)\<[`NormalizeBrandUnion`](brand.md#normalizebrandunion)\<`N`\>\>, `MaxIndex`\>

Defined in: [branded-types/branded-number-types.d.mts:830](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/branded-number-types.d.mts#L830)

Enhances an integer brand type with literal values for small integers.
This enables more precise typing for small integer values while maintaining
the brand for larger values.

#### Type Parameters

##### N

`N` _extends_ [`Int`](#int)

The integer brand type to enhance

##### MaxIndex

`MaxIndex` _extends_ `number` = `TSTypeForgeInternals.SmallIntIndexMax`

Maximum absolute value for literals (default: 40)

#### Returns

Union of literal integers and the branded type

#### Example

```ts
type Count = WithSmallInt<Uint>;
// Count is 0 | 1 | 2 | ... | 39 | Uint

const increment = (n: Count): Count => {
    if (typeof n === 'number' && n < 39) {
        return (n + 1) as Count; // Type narrowing works with literals
    }
    return ((n as number) + 1) as Count;
};

// Common patterns:
type SmallInt = WithSmallInt<Int>; // -40 to 39 | Int
type SmallUint = WithSmallInt<Uint>; // 0 to 39 | Uint
type SmallPositiveInt = WithSmallInt<PositiveInt>; // 1 to 39 | PositiveInt
```

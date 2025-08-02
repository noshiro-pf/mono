[**ts-type-forge**](../README.md)

---

[ts-type-forge](../README.md) / branded-types/core

# branded-types/core

## Type Aliases

### NaNType

> **NaNType** = [`ExtendNumberBrand`](brand/namespaces/TSTypeForgeInternals/README.md#extendnumberbrand)\<[`BrandedNumberBaseType`](brand/namespaces/TSTypeForgeInternals/README.md#brandednumberbasetype), `"!=0"` \| `"NaNValue"`, [`IntRangeKeys`](brand/namespaces/TSTypeForgeInternals/README.md#intrangekeys) \| `"Finite"` \| `"Int"` \| `"SafeInt"` \| `"Float32"` \| `"Float64"`\>

Defined in: [src/branded-types/core.d.mts:76](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/core.d.mts#L76)

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

### ValidNumber

> **ValidNumber** = [`ExtendNumberBrand`](brand/namespaces/TSTypeForgeInternals/README.md#extendnumberbrand)\<[`BrandedNumberBaseType`](brand/namespaces/TSTypeForgeInternals/README.md#brandednumberbasetype), `never`, `"NaNValue"`\>

Defined in: [src/branded-types/core.d.mts:101](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/core.d.mts#L101)

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

### NonZeroNumber

> **NonZeroNumber** = [`ExtendNumberBrand`](brand/namespaces/TSTypeForgeInternals/README.md#extendnumberbrand)\<[`ValidNumber`](#validnumber), `"!=0"`\>

Defined in: [src/branded-types/core.d.mts:121](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/core.d.mts#L121)

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

### NonNegativeNumber

> **NonNegativeNumber** = [`ExtendNumberBrand`](brand/namespaces/TSTypeForgeInternals/README.md#extendnumberbrand)\<[`ValidNumber`](#validnumber), `"> -2^16"` \| `"> -2^32"` \| `">= -2^15"` \| `">= -2^31"` \| `">=0"`\>

Defined in: [src/branded-types/core.d.mts:137](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/core.d.mts#L137)

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

### PositiveNumber

> **PositiveNumber** = [`IntersectBrand`](brand/README.md#intersectbrand)\<[`NonZeroNumber`](#nonzeronumber), [`NonNegativeNumber`](#nonnegativenumber)\>

Defined in: [src/branded-types/core.d.mts:156](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/core.d.mts#L156)

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

### NegativeNumber

> **NegativeNumber** = [`ExtendNumberBrand`](brand/namespaces/TSTypeForgeInternals/README.md#extendnumberbrand)\<[`NonZeroNumber`](#nonzeronumber), `"< 2^15"` \| `"< 2^16"` \| `"< 2^31"` \| `"< 2^32"`, `">=0"`\>

Defined in: [src/branded-types/core.d.mts:172](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/core.d.mts#L172)

Branded numeric type for negative numbers (x < 0).
Excludes zero, includes only strictly negative values.

#### Example

```ts
const isNegative = (x: number): x is NegativeNumber => x < 0;

const absoluteValue = (x: NegativeNumber): PositiveNumber =>
    Math.abs(x) as PositiveNumber;

const debt = (amount: NegativeNumber) => ({ type: 'debt', amount });
```

## References

### TSTypeForgeInternals

Re-exports [TSTypeForgeInternals](brand/namespaces/TSTypeForgeInternals/README.md)

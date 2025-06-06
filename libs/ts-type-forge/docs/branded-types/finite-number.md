[**Documentation**](../README.md)

---

[Documentation](../README.md) / branded-types/finite-number

# branded-types/finite-number

## Type Aliases

### FiniteNumber

> **FiniteNumber** = [`ExtendNumberBrand`](brand/namespaces/TSTypeForgeInternals/README.md#extendnumberbrand)\<[`ValidNumber`](core.md#validnumber), `"Finite"`\>

Defined in: [branded-types/finite-number.d.mts:16](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/finite-number.d.mts#L16)

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

### InfiniteNumber

> **InfiniteNumber** = [`ExtendNumberBrand`](brand/namespaces/TSTypeForgeInternals/README.md#extendnumberbrand)\<[`ValidNumber`](core.md#validnumber), `"!=0"`, `"Finite"` \| `"Int"` \| `"SafeInt"`\>

Defined in: [branded-types/finite-number.d.mts:36](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/finite-number.d.mts#L36)

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

### POSITIVE_INFINITY

> **POSITIVE_INFINITY** = [`ExtendNumberBrand`](brand/namespaces/TSTypeForgeInternals/README.md#extendnumberbrand)\<[`IntersectBrand`](brand/README.md#intersectbrand)\<[`InfiniteNumber`](#infinitenumber), [`PositiveNumber`](core.md#positivenumber)\>, `never`, `"< 2^15"` \| `"< 2^16"` \| `"< 2^31"` \| `"< 2^32"`\>

Defined in: [branded-types/finite-number.d.mts:56](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/finite-number.d.mts#L56)

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

### NEGATIVE_INFINITY

> **NEGATIVE_INFINITY** = [`ExtendNumberBrand`](brand/namespaces/TSTypeForgeInternals/README.md#extendnumberbrand)\<[`IntersectBrand`](brand/README.md#intersectbrand)\<[`InfiniteNumber`](#infinitenumber), [`NegativeNumber`](core.md#negativenumber)\>, `never`, `"> -2^16"` \| `"> -2^32"` \| `">= -2^15"` \| `">= -2^31"`\>

Defined in: [branded-types/finite-number.d.mts:76](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/finite-number.d.mts#L76)

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

### NonNegativeFiniteNumber

> **NonNegativeFiniteNumber** = [`IntersectBrand`](brand/README.md#intersectbrand)\<[`NonNegativeNumber`](core.md#nonnegativenumber), [`FiniteNumber`](#finitenumber)\>

Defined in: [branded-types/finite-number.d.mts:95](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/finite-number.d.mts#L95)

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

### PositiveFiniteNumber

> **PositiveFiniteNumber** = [`IntersectBrand`](brand/README.md#intersectbrand)\<[`PositiveNumber`](core.md#positivenumber), [`FiniteNumber`](#finitenumber)\>

Defined in: [branded-types/finite-number.d.mts:110](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/finite-number.d.mts#L110)

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

### NegativeFiniteNumber

> **NegativeFiniteNumber** = [`IntersectBrand`](brand/README.md#intersectbrand)\<[`NegativeNumber`](core.md#negativenumber), [`FiniteNumber`](#finitenumber)\>

Defined in: [branded-types/finite-number.d.mts:125](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/finite-number.d.mts#L125)

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

### NonZeroFiniteNumber

> **NonZeroFiniteNumber** = [`IntersectBrand`](brand/README.md#intersectbrand)\<[`NonZeroNumber`](core.md#nonzeronumber), [`FiniteNumber`](#finitenumber)\>

Defined in: [branded-types/finite-number.d.mts:140](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/finite-number.d.mts#L140)

Branded numeric type for finite non-zero numbers.
Combines the constraints of being finite and non-zero.

#### Example

```ts
const isNonZeroFinite = (x: number): x is NonZeroFiniteNumber =>
    Number.isFinite(x) && x !== 0;

const rate = (distance: FiniteNumber, time: NonZeroFiniteNumber) =>
    distance / time; // Safe division, finite result
```

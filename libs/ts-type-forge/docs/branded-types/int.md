[**Documentation**](../README.md)

---

[Documentation](../README.md) / branded-types/int

# branded-types/int

## Type Aliases

### Int

> **Int** = [`ExtendNumberBrand`](brand/namespaces/TSTypeForgeInternals/README.md#extendnumberbrand)\<[`FiniteNumber`](finite-number.md#finitenumber), `"Int"`\>

Defined in: [branded-types/int.d.mts:16](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/int.d.mts#L16)

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

### NonZeroInt

> **NonZeroInt** = [`IntersectBrand`](brand/README.md#intersectbrand)\<[`Int`](#int), [`NonZeroNumber`](core.md#nonzeronumber)\>

Defined in: [branded-types/int.d.mts:34](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/int.d.mts#L34)

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

### NonNegativeInt

> **NonNegativeInt** = [`IntersectBrand`](brand/README.md#intersectbrand)\<[`Int`](#int), [`NonNegativeNumber`](core.md#nonnegativenumber)\>

Defined in: [branded-types/int.d.mts:49](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/int.d.mts#L49)

Branded numeric type for non-negative integers.
Represents integers greater than or equal to zero.

#### Example

```ts
const isNonNegativeInt = (x: number): x is NonNegativeInt =>
    Number.isInteger(x) && x >= 0;

const arrayIndex = (arr: readonly unknown[], i: NonNegativeInt) => arr[i];
const count = (items: NonNegativeInt) => ({ count: items });
```

---

### Uint

> **Uint** = [`NonNegativeInt`](#nonnegativeint)

Defined in: [branded-types/int.d.mts:67](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/int.d.mts#L67)

Alias for `NonNegativeInt`.
Branded numeric type for unsigned integers (non-negative integers).
Represents integers greater than or equal to zero.

#### Example

```ts
const isUint = (x: number): x is Uint => Number.isInteger(x) && x >= 0;

const arrayLength = (arr: readonly unknown[]): Uint => arr.length as Uint;

const repeat = (str: string, count: Uint) => str.repeat(count);
```

---

### PositiveInt

> **PositiveInt** = [`IntersectBrand`](brand/README.md#intersectbrand)\<[`Int`](#int), [`PositiveNumber`](core.md#positivenumber)\>

Defined in: [branded-types/int.d.mts:84](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/int.d.mts#L84)

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

### NegativeInt

> **NegativeInt** = [`IntersectBrand`](brand/README.md#intersectbrand)\<[`Int`](#int), [`NegativeNumber`](core.md#negativenumber)\>

Defined in: [branded-types/int.d.mts:99](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/int.d.mts#L99)

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

### IntWithSmallInt

> **IntWithSmallInt** = [`WithSmallInt`](small-int.md#withsmallint)\<[`Int`](#int)\>

Defined in: [branded-types/int.d.mts:105](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/int.d.mts#L105)

Integer type with small literal values included.
Type: `-40 | -39 | ... | 39 | Int`

---

### NonZeroIntWithSmallInt

> **NonZeroIntWithSmallInt** = [`WithSmallInt`](small-int.md#withsmallint)\<[`NonZeroInt`](#nonzeroint)\>

Defined in: [branded-types/int.d.mts:111](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/int.d.mts#L111)

Non-zero integer type with small literal values included.
Type: `-40 | ... | -1 | 1 | ... | 39 | NonZeroInt`

---

### NonNegativeIntWithSmallInt

> **NonNegativeIntWithSmallInt** = [`WithSmallInt`](small-int.md#withsmallint)\<[`NonNegativeInt`](#nonnegativeint)\>

Defined in: [branded-types/int.d.mts:117](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/int.d.mts#L117)

Non-negative integer type with small literal values included.
Type: `0 | 1 | ... | 39 | NonNegativeInt`

---

### UintWithSmallInt

> **UintWithSmallInt** = [`NonNegativeIntWithSmallInt`](#nonnegativeintwithsmallint)

Defined in: [branded-types/int.d.mts:124](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/int.d.mts#L124)

Alias for `NonNegativeIntWithSmallInt`.
Unsigned integer type with small literal values included.
Type: `0 | 1 | ... | 39 | Uint`

---

### PositiveIntWithSmallInt

> **PositiveIntWithSmallInt** = [`WithSmallInt`](small-int.md#withsmallint)\<[`PositiveInt`](#positiveint)\>

Defined in: [branded-types/int.d.mts:130](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/int.d.mts#L130)

Positive integer type with small literal values included.
Type: `1 | 2 | ... | 39 | PositiveInt`

---

### NegativeIntWithSmallInt

> **NegativeIntWithSmallInt** = [`WithSmallInt`](small-int.md#withsmallint)\<[`NegativeInt`](#negativeint)\>

Defined in: [branded-types/int.d.mts:136](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/int.d.mts#L136)

Negative integer type with small literal values included.
Type: `-40 | -39 | ... | -1 | NegativeInt`

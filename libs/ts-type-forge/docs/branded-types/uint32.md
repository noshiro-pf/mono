[**Documentation**](../README.md)

---

[Documentation](../README.md) / branded-types/uint32

# branded-types/uint32

## Type Aliases

### Uint32

> **Uint32** = [`ExtendNumberBrand`](brand/namespaces/TSTypeForgeInternals/README.md#extendnumberbrand)\<[`SafeUint`](safe-int.md#safeuint), `"< 2^32"`\>

Defined in: [branded-types/uint32.d.mts:17](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/uint32.d.mts#L17)

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

### PositiveUint32

> **PositiveUint32** = [`IntersectBrand`](brand/README.md#intersectbrand)\<[`Uint32`](#uint32), [`PositiveNumber`](core.md#positivenumber)\>

Defined in: [branded-types/uint32.d.mts:31](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/uint32.d.mts#L31)

Branded numeric type for positive 32-bit unsigned integers.
Range: [1, 2^32 - 1] or [1, 4,294,967,295]

#### Example

```ts
const isPositiveUint32 = (x: number): x is PositiveUint32 =>
    Number.isSafeInteger(x) && x > 0 && x <= 2 ** 32 - 1;

const id = (value: PositiveUint32) => ({ id: value });
```

---

### NonZeroUint32

> **NonZeroUint32** = [`PositiveUint32`](#positiveuint32)

Defined in: [branded-types/uint32.d.mts:46](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/uint32.d.mts#L46)

Alias for `PositiveUint32`.
Branded numeric type for non-zero 32-bit unsigned integers.
Range: [1, 2^32 - 1] or [1, 4,294,967,295]

#### Example

```ts
const isNonZeroUint32 = (x: number): x is NonZeroUint32 =>
    Number.isSafeInteger(x) && x > 0 && x <= 2 ** 32 - 1;

const divisor = (value: NonZeroUint32) => 1000000 / value;
```

---

### Uint32WithSmallInt

> **Uint32WithSmallInt** = [`WithSmallInt`](small-int.md#withsmallint)\<[`Uint32`](#uint32)\>

Defined in: [branded-types/uint32.d.mts:52](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/uint32.d.mts#L52)

32-bit unsigned integer type with small literal values included.
Type: `0 | 1 | ... | 39 | Uint32`

---

### PositiveUint32WithSmallInt

> **PositiveUint32WithSmallInt** = [`WithSmallInt`](small-int.md#withsmallint)\<[`PositiveUint32`](#positiveuint32)\>

Defined in: [branded-types/uint32.d.mts:58](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/uint32.d.mts#L58)

Positive 32-bit unsigned integer type with small literal values included.
Type: `1 | 2 | ... | 39 | PositiveUint32`

---

### NonZeroUint32WithSmallInt

> **NonZeroUint32WithSmallInt** = [`PositiveUint32WithSmallInt`](#positiveuint32withsmallint)

Defined in: [branded-types/uint32.d.mts:65](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/uint32.d.mts#L65)

Alias for `PositiveUint32WithSmallInt`.
Non-zero 32-bit unsigned integer type with small literal values included.
Type: `1 | 2 | ... | 39 | NonZeroUint32`

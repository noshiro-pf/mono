[**ts-type-forge**](../README.md)

---

[ts-type-forge](../README.md) / branded-types/uint16

# branded-types/uint16

## Type Aliases

### Uint16

> **Uint16** = [`ExtendNumberBrand`](brand/namespaces/TSTypeForgeInternals/README.md#extendnumberbrand)\<[`Uint32`](uint32.md#uint32), `"< 2^16"` \| `"< 2^31"`\>

Defined in: [branded-types/uint16.d.mts:14](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/uint16.d.mts#L14)

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

### PositiveUint16

> **PositiveUint16** = [`IntersectBrand`](brand/README.md#intersectbrand)\<[`Uint16`](#uint16), [`PositiveNumber`](core.md#positivenumber)\>

Defined in: [branded-types/uint16.d.mts:31](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/uint16.d.mts#L31)

Branded numeric type for positive 16-bit unsigned integers.
Range: [1, 2^16 - 1] or [1, 65,535]

#### Example

```ts
const isPositiveUint16 = (x: number): x is PositiveUint16 =>
    Number.isSafeInteger(x) && x > 0 && x <= 2 ** 16 - 1;

const tcpPort = (port: PositiveUint16) => ({ port });
```

---

### NonZeroUint16

> **NonZeroUint16** = [`PositiveUint16`](#positiveuint16)

Defined in: [branded-types/uint16.d.mts:46](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/uint16.d.mts#L46)

Alias for `PositiveUint16`.
Branded numeric type for non-zero 16-bit unsigned integers.
Range: [1, 2^16 - 1] or [1, 65,535]

#### Example

```ts
const isNonZeroUint16 = (x: number): x is NonZeroUint16 =>
    Number.isSafeInteger(x) && x > 0 && x <= 2 ** 16 - 1;

const networkId = (id: NonZeroUint16) => ({ networkId: id });
```

---

### Uint16WithSmallInt

> **Uint16WithSmallInt** = [`WithSmallInt`](small-int.md#withsmallint)\<[`Uint16`](#uint16)\>

Defined in: [branded-types/uint16.d.mts:52](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/uint16.d.mts#L52)

16-bit unsigned integer type with small literal values included.
Type: `0 | 1 | ... | 39 | Uint16`

---

### PositiveUint16WithSmallInt

> **PositiveUint16WithSmallInt** = [`WithSmallInt`](small-int.md#withsmallint)\<[`PositiveUint16`](#positiveuint16)\>

Defined in: [branded-types/uint16.d.mts:58](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/uint16.d.mts#L58)

Positive 16-bit unsigned integer type with small literal values included.
Type: `1 | 2 | ... | 39 | PositiveUint16`

---

### NonZeroUint16WithSmallInt

> **NonZeroUint16WithSmallInt** = [`PositiveUint16WithSmallInt`](#positiveuint16withsmallint)

Defined in: [branded-types/uint16.d.mts:65](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/uint16.d.mts#L65)

Alias for `PositiveUint16WithSmallInt`.
Non-zero 16-bit unsigned integer type with small literal values included.
Type: `1 | 2 | ... | 39 | NonZeroUint16`

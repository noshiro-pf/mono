[**Documentation**](../README.md)

---

[Documentation](../README.md) / branded-types/bigint

# branded-types/bigint

## Type Aliases

### BigInt64

> **BigInt64** = [`ExtendBrand`](brand/README.md#extendbrand)\<[`ChangeBaseBrand`](brand/README.md#changebasebrand)\<[`Int`](int.md#int), `bigint`\>, `"BigInt64"`\>

Defined in: [branded-types/bigint.d.mts:15](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/bigint.d.mts#L15)

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

> **BigUint64** = [`ExtendBrand`](brand/README.md#extendbrand)\<[`ChangeBaseBrand`](brand/README.md#changebasebrand)\<[`Int`](int.md#int), `bigint`\>, `"BigUint64"`\>

Defined in: [branded-types/bigint.d.mts:30](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/bigint.d.mts#L30)

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

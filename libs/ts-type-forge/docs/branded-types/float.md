[**ts-type-forge**](../README.md)

***

[ts-type-forge](../README.md) / branded-types/float

# branded-types/float

## Type Aliases

### Float32

> **Float32** = [`ExtendNumberBrand`](brand/namespaces/TSTypeForgeInternals/README.md#extendnumberbrand)\<[`BrandedNumberBaseType`](brand/namespaces/TSTypeForgeInternals/README.md#brandednumberbasetype), `"Float32"`\>

Defined in: [src/branded-types/float.d.mts:17](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/float.d.mts#L17)

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

***

### Float64

> **Float64** = [`ExtendNumberBrand`](brand/namespaces/TSTypeForgeInternals/README.md#extendnumberbrand)\<[`BrandedNumberBaseType`](brand/namespaces/TSTypeForgeInternals/README.md#brandednumberbasetype), `"Float64"`\>

Defined in: [src/branded-types/float.d.mts:35](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/float.d.mts#L35)

Branded numeric type for 64-bit floating point numbers.
Represents values that can be stored in a Float64Array (standard JS number precision).

#### Example

```ts
const toFloat64 = (x: number): Float64 => x as Float64;

const scientificData = (measurements: Float64[]) => {
  // High-precision calculations
};
```

[**ts-type-forge**](../README.md)

---

[ts-type-forge](../README.md) / type-level-integer/max

# type-level-integer/max

## Type Aliases

### Max\<N\>

> **Max**\<`N`\> = `TSTypeForgeInternals.MaxImpl`\<`N`, \[\]\>

Defined in: [src/type-level-integer/max.d.mts:13](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/type-level-integer/max.d.mts#L13)

Calculates the smallest integer `M` such that all numbers in the union `N` (which must extend `Uint10`) are less than `M`.
Effectively, this calculates `max(N)`.

#### Type Parameters

##### N

`N` _extends_ [`Uint10`](../constants/int-enum.md#uint10)

A union of non-negative integer literals up to 1023 (`Uint10`).

#### Returns

The smallest integer literal greater than all numbers in `N`.

#### Example

```ts
type U2 = 0 | 1 | 2;
type Result = Max<U2>; // 2
type ResultSingle = Max<5>; // 5
// type ResultFull = Max<Uint10>; // 1023
```

## References

### TSTypeForgeInternals

Re-exports [TSTypeForgeInternals](../branded-types/brand/namespaces/TSTypeForgeInternals/README.md)

[**ts-type-forge**](../README.md)

---

[ts-type-forge](../README.md) / type-level-integer/min

# type-level-integer/min

## Type Aliases

### Min\<N\>

> **Min**\<`N`\> = `TSTypeForgeInternals.MinImpl`\<`N`, \[\]\>

Defined in: [type-level-integer/min.d.mts:12](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/type-level-integer/min.d.mts#L12)

Calculates the minimum value within a union of non-negative integer literals `N` (which must extend `Uint10`).

#### Type Parameters

##### N

`N` _extends_ [`Uint10`](../constants/int-enum.md#uint10)

A union of non-negative integer literals up to 1023 (`Uint10`).

#### Returns

The smallest integer literal present in the union `N`.

#### Example

```ts
type U = 2 | 5 | 1;
type Result = Min<U>; // 1
type ResultSingle = Min<5>; // 5
type ResultZero = Min<0 | 10>; // 0
```

## References

### TSTypeForgeInternals

Re-exports [TSTypeForgeInternals](../branded-types/brand/namespaces/TSTypeForgeInternals/README.md)

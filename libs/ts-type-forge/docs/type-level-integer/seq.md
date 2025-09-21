[**ts-type-forge**](../README.md)

---

[ts-type-forge](../README.md) / type-level-integer/seq

# type-level-integer/seq

## Type Aliases

### Seq

> **Seq**\<`N`\> = `TSTypeForgeInternals.SeqImpl`\<[`MakeTuple`](../tuple-and-list/make-tuple.md#maketuple)\<`unknown`, `N`\>\>

Defined in: [src/type-level-integer/seq.d.mts:12](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/type-level-integer/seq.d.mts#L12)

Creates a readonly tuple containing a sequence of number literals from 0 up to (but not including) `N`.
Requires `N` to be a non-negative integer literal for which `MakeTuple<unknown, N>` can be computed.

#### Type Parameters

##### N

`N` _extends_ `number`

The upper bound (exclusive) of the sequence. Must be a non-negative integer literal.

#### Returns

A readonly tuple type `readonly [0, 1, ..., N-1]`.

#### Example

```ts
type S3 = Seq<3>; // readonly [0, 1, 2]
type S0 = Seq<0>; // readonly []
type S1 = Seq<1>; // readonly [0]
```

## References

### TSTypeForgeInternals

Re-exports [TSTypeForgeInternals](../branded-types/brand/namespaces/TSTypeForgeInternals/README.md)

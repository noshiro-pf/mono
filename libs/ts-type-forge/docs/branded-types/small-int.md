[**ts-type-forge**](../README.md)

***

[ts-type-forge](../README.md) / branded-types/small-int

# branded-types/small-int

## Type Aliases

### SmallInt

> **SmallInt**\<`T`, `MaxIndex`\> = [`TypeEq`](../condition/eq.md#typeeq)\<`T`, `"<=0"`\> *extends* `true` ? [`SmallNegativeInt`](brand/namespaces/TSTypeForgeInternals/README.md#smallnegativeint)\<`MaxIndex`\> \| `0` : [`TypeEq`](../condition/eq.md#typeeq)\<`T`, `"<0"`\> *extends* `true` ? [`SmallNegativeInt`](brand/namespaces/TSTypeForgeInternals/README.md#smallnegativeint)\<`MaxIndex`\> : [`TypeEq`](../condition/eq.md#typeeq)\<`T`, `">=0"`\> *extends* `true` ? [`SmallPositiveInt`](brand/namespaces/TSTypeForgeInternals/README.md#smallpositiveint)\<`MaxIndex`\> \| `0` : [`TypeEq`](../condition/eq.md#typeeq)\<`T`, `">0"`\> *extends* `true` ? [`SmallPositiveInt`](brand/namespaces/TSTypeForgeInternals/README.md#smallpositiveint)\<`MaxIndex`\> : [`TypeEq`](../condition/eq.md#typeeq)\<`T`, `"!=0"`\> *extends* `true` ? [`SmallNegativeInt`](brand/namespaces/TSTypeForgeInternals/README.md#smallnegativeint)\<`MaxIndex`\> \| [`SmallPositiveInt`](brand/namespaces/TSTypeForgeInternals/README.md#smallpositiveint)\<`MaxIndex`\> : [`TypeEq`](../condition/eq.md#typeeq)\<`T`, `""`\> *extends* `true` ? [`SmallNegativeInt`](brand/namespaces/TSTypeForgeInternals/README.md#smallnegativeint)\<`MaxIndex`\> \| [`SmallPositiveInt`](brand/namespaces/TSTypeForgeInternals/README.md#smallpositiveint)\<`MaxIndex`\> \| `0` : `never`

Defined in: [src/branded-types/small-int.d.mts:22](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/small-int.d.mts#L22)

Union type of small integer literals for type-level operations.
Provides literal integer types within a small range for precise typing.

#### Type Parameters

##### T

`T` *extends* `"!=0"` \| `""` \| `"<=0"` \| `"<0"` \| `">=0"` \| `">0"` = `""`

Constraint specifying which integers to include:
  - `''`    : All integers in `[-MaxIndex, MaxIndex - 1]`
  - `'!=0'` : All integers except 0
  - `'<0'`  : Negative integers only `[-MaxIndex, -1]`
  - `'<=0'` : Non-positive integers `[-MaxIndex, 0]`
  - `'>0'`  : Positive integers only `[1, MaxIndex - 1]`
  - `'>=0'` : Non-negative integers `[0, MaxIndex - 1]`

##### MaxIndex

`MaxIndex` *extends* `number` = [`SmallIntIndexMax`](brand/namespaces/TSTypeForgeInternals/README.md#smallintindexmax)

Maximum absolute value for the range (default: 40)

#### Example

```ts
type DiceValue = SmallInt<'>0', 7>; // 1 | 2 | 3 | 4 | 5 | 6
type Temperature = SmallInt<'', 101>; // -100 to 100
type Countdown = SmallInt<'>=0', 11>; // 0 | 1 | 2 | ... | 10
type Offset = SmallInt<'!=0', 6>; // -5 | -4 | -3 | -2 | -1 | 1 | 2 | 3 | 4 | 5
```

***

### SmallUint

> **SmallUint** = [`SmallInt`](#smallint)\<`">=0"`\>

Defined in: [src/branded-types/small-int.d.mts:55](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/small-int.d.mts#L55)

Union type of small non-negative integer literals.
Convenience type for `SmallInt<'>=0'>`.

#### Example

```ts
type Index = SmallUint; // 0 | 1 | 2 | ... | 39
const getItem = <T>(arr: readonly T[], i: Index) => arr[i];
```

***

### WithSmallInt

> **WithSmallInt**\<`N`, `MaxIndex`\> = [`WithSmallIntImpl`](brand/namespaces/TSTypeForgeInternals/README.md#withsmallintimpl)\<[`CastToInt`](brand/namespaces/TSTypeForgeInternals/README.md#casttoint)\<[`NormalizeBrandUnion`](brand/README.md#normalizebrandunion)\<`N`\>\>, `MaxIndex`\>

Defined in: [src/branded-types/small-int.d.mts:84](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/small-int.d.mts#L84)

Enhances an integer brand type with literal values for small integers.
This enables more precise typing for small integer values while maintaining
the brand for larger values.

#### Type Parameters

##### N

`N` *extends* [`Int`](int.md#int)

The integer brand type to enhance

##### MaxIndex

`MaxIndex` *extends* `number` = [`SmallIntIndexMax`](brand/namespaces/TSTypeForgeInternals/README.md#smallintindexmax)

Maximum absolute value for literals (default: 40)

#### Returns

Union of literal integers and the branded type

#### Example

```ts
type Count = WithSmallInt<Uint>;
// Count is 0 | 1 | 2 | ... | 39 | Uint

const increment = (n: Count): Count => {
  if (typeof n === 'number' && n < 39) {
    return (n + 1) as Count; // Type narrowing works with literals
  }
  return (n as number + 1) as Count;
};

// Common patterns:
type SmallInt = WithSmallInt<Int>;              // -40 to 39 | Int
type SmallUint = WithSmallInt<Uint>;            // 0 to 39 | Uint
type SmallPositiveInt = WithSmallInt<PositiveInt>; // 1 to 39 | PositiveInt
```

***

### ExcludeSmallInt

> **ExcludeSmallInt**\<`N`, `MaxIndex`\> = [`RelaxedExclude`](../record/std.md#relaxedexclude)\<`N`, [`SmallInt`](#smallint)\<`""`, `MaxIndex`\>\>

Defined in: [src/branded-types/small-int.d.mts:113](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/small-int.d.mts#L113)

Removes small integer literals from an integer type enhanced with WithSmallInt.
Useful for converting back to pure branded types.

#### Type Parameters

##### N

`N` *extends* [`IntWithSmallInt`](int.md#intwithsmallint)

Integer type with small literals to remove from

##### MaxIndex

`MaxIndex` *extends* `number` = [`SmallIntIndexMax`](brand/namespaces/TSTypeForgeInternals/README.md#smallintindexmax)

Maximum absolute value of literals to remove (default: 40)

#### Returns

The branded type without literal values

#### Example

```ts
type Count = WithSmallInt<Uint>; // 0 | 1 | ... | 39 | Uint
type PureCount = RemoveSmallInt<Count>; // Uint

const toLargeCount = (n: Count): RemoveSmallInt<Count> => {
  if (typeof n === 'number') {
    return (n + 1000) as Uint; // Convert small to large
  }
  return n;
};
```

## References

### TSTypeForgeInternals

Re-exports [TSTypeForgeInternals](brand/namespaces/TSTypeForgeInternals/README.md)

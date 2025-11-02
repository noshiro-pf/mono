[**ts-type-forge**](../../../../README.md)

***

[ts-type-forge](../../../../README.md) / [branded-types/brand](../../README.md) / TSTypeForgeInternals

# TSTypeForgeInternals

## Namespaces

- [MakeTupleInternals](namespaces/MakeTupleInternals.md)

## Type Aliases

### ExtractTrueKeys

> **ExtractTrueKeys**\<`B`\> = [`ExtractBooleanKeysImpl`](#extractbooleankeysimpl)\<`B`, keyof `B`, `true`\>

Defined in: [src/branded-types/brand.d.mts:27](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/brand.d.mts#L27)

#### Type Parameters

##### B

`B` *extends* [`UnknownBrand`](../../README.md#unknownbrand)

***

### ExtractFalseKeys

> **ExtractFalseKeys**\<`B`\> = [`ExtractBooleanKeysImpl`](#extractbooleankeysimpl)\<`B`, keyof `B`, `false`\>

Defined in: [src/branded-types/brand.d.mts:33](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/brand.d.mts#L33)

#### Type Parameters

##### B

`B` *extends* [`UnknownBrand`](../../README.md#unknownbrand)

***

### ExtractBooleanKeys

> **ExtractBooleanKeys**\<`B`\> = [`ExtractBooleanKeysImpl`](#extractbooleankeysimpl)\<`B`, keyof `B`, `boolean`\>

Defined in: [src/branded-types/brand.d.mts:39](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/brand.d.mts#L39)

#### Type Parameters

##### B

`B` *extends* [`UnknownBrand`](../../README.md#unknownbrand)

***

### ExtractBooleanKeysImpl

> **ExtractBooleanKeysImpl**\<`B`, `K`, `Target`\> = `K` *extends* `K` ? [`TypeEq`](../../../../condition/eq.md#typeeq)\<`B`\[`K`\], `Target`\> *extends* `true` ? `K` : `never` : `never`

Defined in: [src/branded-types/brand.d.mts:45](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/brand.d.mts#L45)

#### Type Parameters

##### B

`B` *extends* [`UnknownBrand`](../../README.md#unknownbrand)

##### K

`K` *extends* keyof `B`

##### Target

`Target` *extends* `boolean`

***

### IntRangeKeys

> **IntRangeKeys** = `"< 2^15"` \| `"< 2^16"` \| `"< 2^31"` \| `"< 2^32"` \| `"> -2^16"` \| `"> -2^32"` \| `">= -2^15"` \| `">= -2^31"` \| `">=0"`

Defined in: [src/branded-types/core.d.mts:27](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/core.d.mts#L27)

***

### Keys\_

> **Keys\_** = `"NaNValue"` \| `"Finite"` \| `"Float64"` \| `"Float32"` \| `"Int"` \| `"SafeInt"` \| `"!=0"` \| [`IntRangeKeys`](#intrangekeys)

Defined in: [src/branded-types/core.d.mts:38](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/core.d.mts#L38)

***

### BrandedNumberBaseType

> **BrandedNumberBaseType** = [`Brand`](../../README.md#brand)\<`number`, `never`, `never`\>

Defined in: [src/branded-types/core.d.mts:48](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/core.d.mts#L48)

***

### ExtendNumberBrand

> **ExtendNumberBrand**\<`B`, `T`, `F`\> = [`Brand`](../../README.md#brand)\<[`GetBrandValuePart`](../../README.md#getbrandvaluepart)\<`B`\>, `T` \| [`UnwrapBrandTrueKeys`](../../README.md#unwrapbrandtruekeys)\<`B`\> & `string`, `F` \| [`UnwrapBrandFalseKeys`](../../README.md#unwrapbrandfalsekeys)\<`B`\> & `string`\>

Defined in: [src/branded-types/core.d.mts:50](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/core.d.mts#L50)

#### Type Parameters

##### B

`B` *extends* [`BrandedNumberBaseType`](#brandednumberbasetype)

##### T

`T` *extends* [`RelaxedExclude`](../../../../record/std.md#relaxedexclude)\<[`Keys_`](#keys_), [`UnwrapBrandTrueKeys`](../../README.md#unwrapbrandtruekeys)\<`B`\>\>

##### F

`F` *extends* [`RelaxedExclude`](../../../../record/std.md#relaxedexclude)\<[`Keys_`](#keys_), `T` \| [`UnwrapBrandFalseKeys`](../../README.md#unwrapbrandfalsekeys)\<`B`\>\> = `never`

***

### SmallIntIndexMax

> **SmallIntIndexMax** = `40`

Defined in: [src/branded-types/small-int.d.mts:119](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/small-int.d.mts#L119)

***

### SmallPositiveInt

> **SmallPositiveInt**\<`MaxIndex`\> = [`RelaxedExclude`](../../../../record/std.md#relaxedexclude)\<[`Index`](../../../../type-level-integer/index-type.md#index)\<`MaxIndex`\>, `0`\>

Defined in: [src/branded-types/small-int.d.mts:122](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/small-int.d.mts#L122)

Integers in `[1, MaxIndex - 1]`

#### Type Parameters

##### MaxIndex

`MaxIndex` *extends* `number` = [`SmallIntIndexMax`](#smallintindexmax)

***

### SmallNegativeInt

> **SmallNegativeInt**\<`MaxIndex`\> = [`NegativeIndex`](../../../../type-level-integer/index-type.md#negativeindex)\<`MaxIndex`\>

Defined in: [src/branded-types/small-int.d.mts:126](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/small-int.d.mts#L126)

Integers in `[-MaxIndex, -1]`

#### Type Parameters

##### MaxIndex

`MaxIndex` *extends* `number` = [`SmallIntIndexMax`](#smallintindexmax)

***

### WithSmallIntImpl

> **WithSmallIntImpl**\<`N`, `MaxIndex`\> = `Exclude`\<[`SmallInt`](../../../small-int.md#smallint)\<`""`, `MaxIndex`\>, `N` *extends* [`NegativeNumber`](../../../core.md#negativenumber) ? [`SmallInt`](../../../small-int.md#smallint)\<`">=0"`, `MaxIndex`\> : `never` \| `N` *extends* [`NonNegativeNumber`](../../../core.md#nonnegativenumber) ? [`SmallInt`](../../../small-int.md#smallint)\<`"<0"`, `MaxIndex`\> : `never` \| `N` *extends* [`NonZeroNumber`](../../../core.md#nonzeronumber) ? `0` : `never`\> \| `N`

Defined in: [src/branded-types/small-int.d.mts:129](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/small-int.d.mts#L129)

#### Type Parameters

##### N

`N` *extends* [`Int`](../../../int.md#int)

##### MaxIndex

`MaxIndex` *extends* `number`

***

### CastToInt

> **CastToInt**\<`T`\> = `T` *extends* [`Int`](../../../int.md#int) ? `T` : `never`

Defined in: [src/branded-types/small-int.d.mts:152](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/small-int.d.mts#L152)

Utility type that filters only integer branded types.
Returns the input type if it extends Int, otherwise returns never.

#### Type Parameters

##### T

`T`

Type to check and cast

#### Returns

T if T extends Int, otherwise never

#### Example

```ts
type A = CastToInt<Int>; // Int
type B = CastToInt<FiniteNumber>; // never
type C = CastToInt<SafeInt>; // SafeInt (since SafeInt extends Int)
```

***

### IntersectionImplSub

> **IntersectionImplSub**\<`Types`\> = `Types` *extends* readonly \[\] ? `unknown` : `Types` *extends* readonly \[infer Head, `...(infer Tail)`\] ? `Head` & [`IntersectionImplSub`](#intersectionimplsub)\<`Tail`\> : `never`

Defined in: [src/others/utils.d.mts:123](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/others/utils.d.mts#L123)

#### Type Parameters

##### Types

`Types` *extends* readonly `unknown`[]

***

### MergeIfRecords

> **MergeIfRecords**\<`R`\> = \[`R`\] *extends* \[[`UnknownRecord`](../../../../constants/record.md#unknownrecord)\] ? [`MergeIntersection`](../../../../others/utils.md#mergeintersection)\<`R`\> : `R`

Defined in: [src/others/utils.d.mts:130](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/others/utils.d.mts#L130)

#### Type Parameters

##### R

`R`

***

### RecordPathPrefixes

> **RecordPathPrefixes**\<`L`\> = `L` *extends* readonly \[infer Head, `...(infer Rest)`\] ? readonly \[\] \| readonly \[`Head`, `...RecordPathPrefixes<Rest>`\] : readonly \[\]

Defined in: [src/record/record-path.d.mts:38](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/record/record-path.d.mts#L38)

Generates a union of all prefixes of a given readonly tuple `L`, including the empty tuple `[]`.

#### Type Parameters

##### L

`L` *extends* readonly `unknown`[]

The readonly tuple type.

#### Returns

A union of readonly tuples, each representing a prefix of `L`.

#### Example

```ts
type P = Prefixes<[1, 'a', true]>;
// P = readonly [] | readonly [1] | readonly [1, 'a'] | readonly [1, 'a', true]
```

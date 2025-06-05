[**Documentation**](../../../../README.md)

---

[Documentation](../../../../README.md) / [branded-types/brand](../../README.md) / TSTypeForgeInternals

# TSTypeForgeInternals

## Namespaces

- [MakeTupleInternals](namespaces/MakeTupleInternals.md)

## Type Aliases

### BrandedNumberBaseType

> **BrandedNumberBaseType** = [`Brand`](../../README.md#brand)\<`number`, `never`, `never`\>

Defined in: [branded-types/core.d.mts:48](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/core.d.mts#L48)

---

### CastToInt\<T\>

> **CastToInt**\<`T`\> = `T` _extends_ [`Int`](../../../int.md#int) ? `T` : `never`

Defined in: [branded-types/small-int.d.mts:152](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/small-int.d.mts#L152)

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

---

### ExtendNumberBrand\<B, T, F\>

> **ExtendNumberBrand**\<`B`, `T`, `F`\> = [`Brand`](../../README.md#brand)\<[`GetBrandValuePart`](../../README.md#getbrandvaluepart)\<`B`\>, `T` \| [`UnwrapBrandTrueKeys`](../../README.md#unwrapbrandtruekeys)\<`B`\> & `string`, `F` \| [`UnwrapBrandFalseKeys`](../../README.md#unwrapbrandfalsekeys)\<`B`\> & `string`\>

Defined in: [branded-types/core.d.mts:50](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/core.d.mts#L50)

#### Type Parameters

##### B

`B` _extends_ [`BrandedNumberBaseType`](#brandednumberbasetype)

##### T

`T` _extends_ [`RelaxedExclude`](../../../../record/std.md#relaxedexclude)\<[`Keys_`](#keys_), [`UnwrapBrandTrueKeys`](../../README.md#unwrapbrandtruekeys)\<`B`\>\>

##### F

`F` _extends_ [`RelaxedExclude`](../../../../record/std.md#relaxedexclude)\<[`Keys_`](#keys_), `T` \| [`UnwrapBrandFalseKeys`](../../README.md#unwrapbrandfalsekeys)\<`B`\>\> = `never`

---

### ExtractBooleanKeys\<B\>

> **ExtractBooleanKeys**\<`B`\> = [`ExtractBooleanKeysImpl`](#extractbooleankeysimpl)\<`B`, keyof `B`, `boolean`\>

Defined in: [branded-types/brand.d.mts:39](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/brand.d.mts#L39)

#### Type Parameters

##### B

`B` _extends_ [`UnknownBrand`](../../README.md#unknownbrand)

---

### ExtractBooleanKeysImpl\<B, K, Target\>

> **ExtractBooleanKeysImpl**\<`B`, `K`, `Target`\> = `K` _extends_ `K` ? [`TypeEq`](../../../../condition/eq.md#typeeq)\<`B`\[`K`\], `Target`\> _extends_ `true` ? `K` : `never` : `never`

Defined in: [branded-types/brand.d.mts:45](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/brand.d.mts#L45)

#### Type Parameters

##### B

`B` _extends_ [`UnknownBrand`](../../README.md#unknownbrand)

##### K

`K` _extends_ keyof `B`

##### Target

`Target` _extends_ `boolean`

---

### ExtractFalseKeys\<B\>

> **ExtractFalseKeys**\<`B`\> = [`ExtractBooleanKeysImpl`](#extractbooleankeysimpl)\<`B`, keyof `B`, `false`\>

Defined in: [branded-types/brand.d.mts:33](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/brand.d.mts#L33)

#### Type Parameters

##### B

`B` _extends_ [`UnknownBrand`](../../README.md#unknownbrand)

---

### ExtractTrueKeys\<B\>

> **ExtractTrueKeys**\<`B`\> = [`ExtractBooleanKeysImpl`](#extractbooleankeysimpl)\<`B`, keyof `B`, `true`\>

Defined in: [branded-types/brand.d.mts:27](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/brand.d.mts#L27)

#### Type Parameters

##### B

`B` _extends_ [`UnknownBrand`](../../README.md#unknownbrand)

---

### IntRangeKeys

> **IntRangeKeys** = `"< 2^15"` \| `"< 2^16"` \| `"< 2^31"` \| `"< 2^32"` \| `"> -2^16"` \| `"> -2^32"` \| `">= -2^15"` \| `">= -2^31"` \| `">=0"`

Defined in: [branded-types/core.d.mts:27](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/core.d.mts#L27)

---

### Keys\_

> **Keys\_** = `"NaNValue"` \| `"Finite"` \| `"Float64"` \| `"Float32"` \| `"Int"` \| `"SafeInt"` \| `"!=0"` \| [`IntRangeKeys`](#intrangekeys)

Defined in: [branded-types/core.d.mts:38](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/core.d.mts#L38)

---

### RecordPathPrefixes\<L\>

> **RecordPathPrefixes**\<`L`\> = `L` _extends_ readonly \[infer Head, `...(infer Rest)`\] ? readonly \[\] \| readonly \[`Head`, `...RecordPathPrefixes<Rest>`\] : readonly \[\]

Defined in: [record/record-path.d.mts:38](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/record/record-path.d.mts#L38)

Generates a union of all prefixes of a given readonly tuple `L`, including the empty tuple `[]`.

#### Type Parameters

##### L

`L` _extends_ readonly `unknown`[]

The readonly tuple type.

#### Returns

A union of readonly tuples, each representing a prefix of `L`.

#### Example

```ts
type P = Prefixes<[1, 'a', true]>;
// P = readonly [] | readonly [1] | readonly [1, 'a'] | readonly [1, 'a', true]
```

---

### SmallIntIndexMax

> **SmallIntIndexMax** = `40`

Defined in: [branded-types/small-int.d.mts:119](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/small-int.d.mts#L119)

---

### SmallNegativeInt\<MaxIndex\>

> **SmallNegativeInt**\<`MaxIndex`\> = [`NegativeIndex`](../../../../type-level-integer/index-type.md#negativeindex)\<`MaxIndex`\>

Defined in: [branded-types/small-int.d.mts:126](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/small-int.d.mts#L126)

Integers in `[-MaxIndex, -1]`

#### Type Parameters

##### MaxIndex

`MaxIndex` _extends_ `number` = [`SmallIntIndexMax`](#smallintindexmax)

---

### SmallPositiveInt\<MaxIndex\>

> **SmallPositiveInt**\<`MaxIndex`\> = [`RelaxedExclude`](../../../../record/std.md#relaxedexclude)\<[`Index`](../../../../type-level-integer/index-type.md#index)\<`MaxIndex`\>, `0`\>

Defined in: [branded-types/small-int.d.mts:122](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/small-int.d.mts#L122)

Integers in `[1, MaxIndex - 1]`

#### Type Parameters

##### MaxIndex

`MaxIndex` _extends_ `number` = [`SmallIntIndexMax`](#smallintindexmax)

---

### WithSmallIntImpl\<N, MaxIndex\>

> **WithSmallIntImpl**\<`N`, `MaxIndex`\> = `Exclude`\<[`SmallInt`](../../../small-int.md#smallint)\<`""`, `MaxIndex`\>, `N` _extends_ [`NegativeNumber`](../../../core.md#negativenumber) ? [`SmallInt`](../../../small-int.md#smallint)\<`">=0"`, `MaxIndex`\> : `never` \| `N` _extends_ [`NonNegativeNumber`](../../../core.md#nonnegativenumber) ? [`SmallInt`](../../../small-int.md#smallint)\<`"<0"`, `MaxIndex`\> : `never` \| `N` _extends_ [`NonZeroNumber`](../../../core.md#nonzeronumber) ? `0` : `never`\> \| `N`

Defined in: [branded-types/small-int.d.mts:129](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/branded-types/small-int.d.mts#L129)

#### Type Parameters

##### N

`N` _extends_ [`Int`](../../../int.md#int)

##### MaxIndex

`MaxIndex` _extends_ `number`

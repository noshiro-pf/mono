[**ts-type-forge**](../README.md)

---

[ts-type-forge](../README.md) / type-level-integer/uint-range

# type-level-integer/uint-range

## Type Aliases

### UintRange\<Start, End\>

> **UintRange**\<`Start`, `End`\> = [`RelaxedExclude`](../record/std.md#relaxedexclude)\<[`Index`](index-type.md#index)\<`End`\>, [`Index`](index-type.md#index)\<`Start`\>\>

Defined in: [src/type-level-integer/uint-range.d.mts:13](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/type-level-integer/uint-range.d.mts#L13)

Creates a union of non-negative integer literals starting from `Start` (inclusive) up to `End` (exclusive).
Requires `Start` and `End` to be non-negative integer literals where `Start <= End`.

#### Type Parameters

##### Start

`Start` _extends_ `number`

The starting integer literal (inclusive).

##### End

`End` _extends_ `number`

The ending integer literal (exclusive).

#### Returns

A union type `Start | Start + 1 | ... | End - 1`.

#### Example

```ts
type R1 = UintRange<3, 7>; // 3 | 4 | 5 | 6
type R2 = UintRange<0, 4>; // 0 | 1 | 2 | 3
type R3 = UintRange<5, 5>; // never
```

---

### UintRangeInclusive\<MinValue, MaxValue\>

> **UintRangeInclusive**\<`MinValue`, `MaxValue`\> = [`RelaxedExclude`](../record/std.md#relaxedexclude)\<[`IndexInclusive`](index-type.md#indexinclusive)\<`MaxValue`\>, [`Index`](index-type.md#index)\<`MinValue`\>\>

Defined in: [src/type-level-integer/uint-range.d.mts:30](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/type-level-integer/uint-range.d.mts#L30)

Creates a union of non-negative integer literals starting from `MinValue` (inclusive) up to `MaxValue` (inclusive).
Requires `MinValue` and `MaxValue` to be non-negative integer literals where `MinValue <= MaxValue`.

#### Type Parameters

##### MinValue

`MinValue` _extends_ `number`

The starting integer literal (inclusive).

##### MaxValue

`MaxValue` _extends_ `number`

The ending integer literal (inclusive).

#### Returns

A union type `MinValue | MinValue + 1 | ... | MaxValue`.

#### Example

```ts
type RI1 = UintRangeInclusive<3, 7>; // 3 | 4 | 5 | 6 | 7
type RI2 = UintRangeInclusive<0, 4>; // 0 | 1 | 2 | 3 | 4
type RI3 = UintRangeInclusive<5, 5>; // 5
```

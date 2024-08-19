import { expectType } from '@tier4/ts-utils';

export type MaxSize = 8;

export type Hint<Size extends IndexInclusive<MaxSize>> = Readonly<{
  n: ArrayOfLength<Size, UintRangeInclusive<1, Size> | 0>;
  w: ArrayOfLength<Size, UintRangeInclusive<1, Size> | 0>;
  s: ArrayOfLength<Size, UintRangeInclusive<1, Size> | 0>;
  e: ArrayOfLength<Size, UintRangeInclusive<1, Size> | 0>;
}>;

export type Table<Size extends IndexInclusive<MaxSize>> = ArrayOfLength<
  Size,
  ArrayOfLength<Size, UintRangeInclusive<0, Size>>
>;

export type MutTable<Size extends IndexInclusive<MaxSize>> = ArrayOfLength<
  Size,
  MutableArrayOfLength<Size, UintRangeInclusive<0, Size>>
>;

if (import.meta.vitest !== undefined) {
  expectType<Table<1>, readonly [readonly [0 | 1]]>('=');

  expectType<
    Table<2>,
    readonly [readonly [0 | 1 | 2, 0 | 1 | 2], readonly [0 | 1 | 2, 0 | 1 | 2]]
  >('=');
}

export type Candidates<Size extends IndexInclusive<MaxSize>> = ArrayOfLength<
  Size,
  ArrayOfLength<Size, ReadonlySet<UintRangeInclusive<1, Size>>>
>;

export type MutCandidates<Size extends IndexInclusive<MaxSize>> = ArrayOfLength<
  Size,
  ArrayOfLength<Size, Set<UintRangeInclusive<1, Size>>>
>;

if (import.meta.vitest !== undefined) {
  expectType<MutCandidates<1>, readonly [readonly [Set<1>]]>('=');
  expectType<
    MutCandidates<2>,
    readonly [
      readonly [Set<2 | 1>, Set<2 | 1>],
      readonly [Set<2 | 1>, Set<2 | 1>],
    ]
  >('=');
}

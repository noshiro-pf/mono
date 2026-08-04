import {
  type BoundedLengthArray,
  type FixedLengthArray,
  type FixedLengthTuple,
  type MaxLengthArray,
  type MinLengthArray,
  type Seq,
} from 'ts-type-forge';
import { expectType } from '../../expect-type.mjs';
import { copy, create, seq, zeros } from './array-utils-creation.mjs';
import {
  asBoundedLengthArray,
  asFixedLengthArray,
  asMaxLengthArray,
  asMinLengthArray,
} from './array-utils-length-bounded-array-cast.mjs';
import {
  set,
  toFilled,
  toRangeFilled,
  toUpdated,
} from './array-utils-modification.mjs';
import {
  map,
  partition,
  toReversed,
  toSorted,
  toSortedBy,
} from './array-utils-transformation.mjs';

describe('map preserves length constraints', () => {
  test('a branded input keeps its constraint', () => {
    const input: MinLengthArray<3, number> = asMinLengthArray(3, [0, 1, 2, 3]);

    const result = map(input, (value) => `#${String(value)}`);

    expectType<typeof result, MinLengthArray<3, string>>('~=');

    // The structural prefix survives, so in-range access is not `undefined`.
    const first: string = result[0];

    assert.deepStrictEqual(first, '#0');

    assert.deepStrictEqual<readonly string[]>(result, ['#0', '#1', '#2', '#3']);
  });

  test('a fixed-length branded input keeps its exact length', () => {
    const input: FixedLengthArray<3, number> = asFixedLengthArray(
      3,
      [255, 128, 0],
    );

    const result = map(input, (value) => value / 255);

    expectType<typeof result, FixedLengthArray<3, number>>('~=');

    const length: 3 = result.length;

    assert.deepStrictEqual(length, 3);
  });

  test('a minimum above the structural prefix cap survives, clamped like MinLengthArray itself', () => {
    const input: MinLengthArray<12, number> = asMinLengthArray(
      12,
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    );

    const result = map(input, String);

    expectType<typeof result, MinLengthArray<12, string>>('~=');

    assert.deepStrictEqual<readonly string[]>(result, [
      '0',
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      '10',
      '11',
    ]);
  });

  test('a plain tuple still maps element-wise', () => {
    const result = map([1, 2, 3] as const, String);

    expectType<typeof result, readonly [string, string, string]>('=');

    assert.deepStrictEqual(result, ['1', '2', '3']);
  });

  test('a plain array still maps to a plain array', () => {
    const input: readonly number[] = [1, 2, 3] as const;

    const result = map(input, String);

    expectType<typeof result, readonly string[]>('=');

    assert.deepStrictEqual(result, ['1', '2', '3']);
  });

  test('an upper bound survives too', () => {
    const input: MaxLengthArray<5, number> = asMaxLengthArray(5, [1, 2]);

    const result = map(input, String);

    expectType<typeof result, MaxLengthArray<5, string>>('~=');

    assert.deepStrictEqual<readonly string[]>(result, ['1', '2']);
  });

  test('both bounds survive together', () => {
    const input: BoundedLengthArray<2, 5, number> = asBoundedLengthArray(
      2,
      5,
      [1, 2],
    );

    const result = map(input, String);

    expectType<typeof result, BoundedLengthArray<2, 5, string>>('~=');

    assert.deepStrictEqual<readonly string[]>(result, ['1', '2']);
  });
});

describe('other length-preserving utilities preserve length constraints', () => {
  test('toSorted keeps the brand', () => {
    const input: FixedLengthArray<3, number> = asFixedLengthArray(3, [3, 1, 2]);

    const result = toSorted(input, (x, y) => x - y);

    expectType<typeof result, FixedLengthArray<3, number>>('~=');

    assert.deepStrictEqual<readonly number[]>(result, [1, 2, 3]);
  });

  test('toSortedBy keeps the brand', () => {
    const input: MinLengthArray<3, number> = asMinLengthArray(3, [3, 1, 2]);

    const result = toSortedBy(input, (x) => x);

    expectType<typeof result, MinLengthArray<3, number>>('~=');

    assert.deepStrictEqual<readonly number[]>(result, [1, 2, 3]);
  });

  test('set keeps the brand and widens only the element type', () => {
    const input: MinLengthArray<3, number> = asMinLengthArray(3, [0, 1, 2]);

    const result = set(input, 1, 'x');

    expectType<typeof result, MinLengthArray<3, number | 'x'>>('~=');

    assert.deepStrictEqual<readonly (number | string)[]>(result, [0, 'x', 2]);
  });

  test('toUpdated keeps the brand and widens only the element type', () => {
    const input: MinLengthArray<3, number> = asMinLengthArray(3, [0, 1, 2]);

    const result = toUpdated(input, 1, (prev) => `#${String(prev)}`);

    expectType<typeof result, MinLengthArray<3, number | `#${string}`>>('~=');

    assert.deepStrictEqual<readonly (number | string)[]>(result, [0, '#1', 2]);
  });

  test('toRangeFilled keeps the brand', () => {
    const input: MinLengthArray<3, number> = asMinLengthArray(3, [0, 1, 2]);

    const result = toRangeFilled(input, 'x', [0, 2]);

    expectType<typeof result, MinLengthArray<3, number | 'x'>>('~=');

    assert.deepStrictEqual<readonly (number | string)[]>(result, ['x', 'x', 2]);
  });

  test('toFilled keeps the brand with the fill type', () => {
    const input: MinLengthArray<3, number> = asMinLengthArray(3, [0, 1, 2]);

    const result = toFilled(input, 'x');

    expectType<typeof result, MinLengthArray<3, 'x'>>('~=');

    assert.deepStrictEqual<readonly string[]>(result, ['x', 'x', 'x']);
  });

  test('toReversed keeps the brand', () => {
    const input: MinLengthArray<3, number> = asMinLengthArray(3, [1, 2, 3, 4]);

    const result = toReversed(input);

    expectType<typeof result, MinLengthArray<3, number>>('~=');

    // The structural prefix survives the reversal too.
    const first: number = result[0];

    assert.deepStrictEqual(first, 4);

    assert.deepStrictEqual<readonly number[]>(result, [4, 3, 2, 1]);
  });

  test('toReversed still reverses a plain tuple at the type level', () => {
    const result = toReversed([1, 'two', true] as const);

    expectType<typeof result, readonly [true, 'two', 1]>('=');

    assert.deepStrictEqual(result, [true, 'two', 1]);
  });

  test('copy keeps the brand, because it returns the input type', () => {
    const input: FixedLengthArray<3, number> = asFixedLengthArray(3, [1, 2, 3]);

    const result = copy(input);

    expectType<typeof result, FixedLengthArray<3, number>>('=');

    assert.deepStrictEqual<readonly number[]>(result, [1, 2, 3]);
  });
});

describe('partition reports the bounds of each chunk', () => {
  test('a chunk is non-empty and at most the chunk size long', () => {
    const result = partition([1, 2, 3, 4, 5] as const, 2);

    expectType<
      typeof result,
      readonly BoundedLengthArray<1, 2, 1 | 2 | 3 | 4 | 5>[]
    >('~=');

    // The lower bound is the point: the first element of a chunk is never
    // `undefined`, unlike with the plain `readonly E[]` this used to return.
    const [firstChunk] = result;

    // The outer array is unbounded, so this narrows away its `undefined`; the
    // chunk's own first element needs no such check.
    assert.isTrue(firstChunk !== undefined);

    const first: 1 | 2 | 3 | 4 | 5 = firstChunk[0];

    assert.deepStrictEqual(first, 1);

    assert.deepStrictEqual<readonly (readonly number[])[]>(result, [
      [1, 2],
      [3, 4],
      [5],
    ]);
  });
});

describe('creation utilities report an exact length past their tuple range', () => {
  const zeros12 = zeros(12);

  const seq12 = seq(12);

  test('create is branded with the exact length', () => {
    const result = create(12, 'x');

    expectType<typeof result, FixedLengthArray<12, 'x'>>('~=');

    assert.deepStrictEqual(result.length, 12);
  });

  test('a length still inside the tuple range keeps its exact tuple type', () => {
    const result = create(3, 'x');

    expectType<typeof result, readonly ['x', 'x', 'x']>('=');

    assert.deepStrictEqual(result, ['x', 'x', 'x']);
  });

  test('zeros and seq keep their tuple type across their whole literal range', () => {
    // `SizeType.ArgArr` only carries literals up to `SmallUint`, which these
    // two already expand into a tuple, so there is no branded case to add.
    expectType<typeof zeros12, FixedLengthTuple<12, 0>>('=');

    expectType<typeof seq12, Seq<12>>('=');

    assert.deepStrictEqual(zeros12.length, 12);

    assert.deepStrictEqual(seq12.length, 12);
  });
});

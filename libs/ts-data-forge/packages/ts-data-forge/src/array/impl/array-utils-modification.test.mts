import {
  type BoundedLengthArray,
  type FixedLengthArray,
  type FixedLengthTuple,
  type MinLengthArray,
  type NonEmptyArray,
} from 'ts-type-forge';
import { expectType } from '../../expect-type.mjs';
import { asUint32 } from '../../number/index.mjs';
import { type SizeType } from '../../types.mjs';
import {
  set,
  toFilled,
  toInserted,
  toPushed,
  toRangeFilled,
  toRemoved,
  toUnshifted,
  toUpdated,
} from './array-utils-modification.mjs';

describe('Arr modifications', () => {
  describe(toUpdated, () => {
    const xs = [1, 2, 3] as const;

    const result = toUpdated(xs, 1, (x) => x + 2);

    expectType<typeof result, readonly [1, number, 3]>('=');

    test('case 1', () => {
      assert.deepStrictEqual(result, [1, 4, 3]);
    });

    test('should work with curried version', () => {
      const updater = toUpdated(1, (x: number) => x * 2);

      const r = updater([10, 20, 30]);

      assert.deepStrictEqual(r, [10, 40, 30]);
    });
  });

  describe(toInserted, () => {
    const xs = [1, 2, 3] as const;

    test('case 1', () => {
      const result = toInserted(xs, 1, 5);

      expectType<typeof result, FixedLengthTuple<4, 1 | 2 | 3 | 5>>('=');

      assert.deepStrictEqual(result, [1, 5, 2, 3]);
    });

    test('case 2 (insert head)', () => {
      const result = toInserted(xs, 0, 5);

      expectType<typeof result, FixedLengthTuple<4, 1 | 2 | 3 | 5>>('=');

      assert.deepStrictEqual(result, [5, 1, 2, 3]);
    });

    test('case 3 (insert tail)', () => {
      const result = toInserted(
        ['a', 'b', 'c'] as readonly string[],
        asUint32(999),
        5,
      );

      expectType<typeof result, NonEmptyArray<string | 5>>('=');

      assert.deepStrictEqual<readonly (5 | string)[]>(result, [
        'a',
        'b',
        'c',
        5,
      ]);
    });

    test('should work with curried version', () => {
      const inserter = toInserted(2, 99);

      const result = inserter([1, 2, 3]);

      assert.deepStrictEqual(result, [1, 2, 99, 3]);
    });
  });

  describe(toRemoved, () => {
    test('case 1', () => {
      const xs = [1, 2, 3] as const;

      const result = toRemoved(xs, 1);

      expectType<typeof result, readonly (1 | 2 | 3)[]>('=');

      assert.deepStrictEqual(result, [1, 3]);
    });

    test('case 2 (remove head)', () => {
      const xs = [1, 2, 3] as const;

      const result = toRemoved(xs, 0);

      expectType<typeof result, readonly (1 | 2 | 3)[]>('=');

      assert.deepStrictEqual(result, [2, 3]);
    });

    test('case 3 (remove tail)', () => {
      const xs = [1, 2, 3] as const;

      const result = toRemoved(xs, 2);

      expectType<typeof result, readonly (1 | 2 | 3)[]>('=');

      assert.deepStrictEqual(result, [1, 2]);
    });

    test('case 4 (number[])', () => {
      const xs: readonly number[] = [1, 2, 3] as const;

      const result = toRemoved(xs, 5);

      expectType<typeof result, readonly number[]>('=');

      assert.deepStrictEqual(result, [1, 2, 3]);
    });

    test('should work with curried version', () => {
      const removeFirst = toRemoved(0);

      const result = removeFirst([10, 20, 30]);

      assert.deepStrictEqual(result, [20, 30]);
    });
  });

  describe(toPushed, () => {
    test('case 1', () => {
      const xs = [1, 2, 3] as const;

      const result = toPushed(xs, 4 as const);

      // The structural tuple is preserved, and the result is additionally
      // branded as non-empty so it is assignable to `NonEmptyArray`.
      expectType<
        typeof result,
        readonly [1, 2, 3, 4] & NonEmptyArray<1 | 2 | 3 | 4>
      >('=');

      expectType<typeof result, readonly [1, 2, 3, 4]>('<=');

      expectType<typeof result, NonEmptyArray<number>>('<=');

      assert.deepStrictEqual<readonly number[]>(result, [1, 2, 3, 4]);
    });

    test('case 2', () => {
      const xs: readonly number[] = [1, 2, 3] as const;

      const result = toPushed(xs, 4 as const);

      expectType<
        typeof result,
        readonly [...number[], 4] & NonEmptyArray<number>
      >('=');

      expectType<typeof result, NonEmptyArray<number>>('<=');

      assert.deepStrictEqual<readonly number[]>(result, [1, 2, 3, 4]);
    });

    test('should work with curried version', () => {
      const pushFive = toPushed(5);

      const result = pushFive([1, 2, 3]);

      expectType<typeof result, NonEmptyArray<number>>('<=');

      assert.deepStrictEqual<readonly number[]>(result, [1, 2, 3, 5]);
    });
  });

  describe(toUnshifted, () => {
    test('case 1', () => {
      const xs = [1, 2, 3] as const;

      const result = toUnshifted(xs, 4 as const);

      expectType<
        typeof result,
        readonly [4, 1, 2, 3] & NonEmptyArray<1 | 2 | 3 | 4>
      >('=');

      expectType<typeof result, readonly [4, 1, 2, 3]>('<=');

      expectType<typeof result, NonEmptyArray<number>>('<=');

      assert.deepStrictEqual<readonly number[]>(result, [4, 1, 2, 3]);
    });

    test('case 2', () => {
      const xs: readonly number[] = [1, 2, 3] as const;

      const result = toUnshifted(xs, 4 as const);

      expectType<
        typeof result,
        readonly [4, ...number[]] & NonEmptyArray<number>
      >('=');

      expectType<typeof result, NonEmptyArray<number>>('<=');

      assert.deepStrictEqual<readonly number[]>(result, [4, 1, 2, 3]);
    });

    test('should work with curried version', () => {
      const unshiftZero = toUnshifted(0);

      const result = unshiftZero([1, 2, 3]);

      expectType<typeof result, NonEmptyArray<number>>('<=');

      assert.deepStrictEqual<readonly number[]>(result, [0, 1, 2, 3]);
    });
  });

  describe(toFilled, () => {
    test('should fill entire array with value', () => {
      const arr = [1, 2, 3, 4, 5] as const;

      const result = toFilled(arr, 0);

      assert.deepStrictEqual(result, [0, 0, 0, 0, 0]);
    });

    test('should work with curried version', () => {
      const fillWithZero = toFilled(0);

      const arr = [1, 2, 3] as const;

      const result = fillWithZero(arr);

      assert.deepStrictEqual(result, [0, 0, 0]);
    });
  });

  describe(toRangeFilled, () => {
    test('should fill array with range', () => {
      const arr = [1, 2, 3, 4, 5] as const;

      const result = toRangeFilled(arr, 0, [1, 4]);

      assert.deepStrictEqual(result, [1, 0, 0, 0, 5]);
    });

    test('should fill with range starting from 0', () => {
      const arr = [1, 2, 3, 4, 5] as const;

      const result = toRangeFilled(arr, 9, [0, 3]);

      assert.deepStrictEqual(result, [9, 9, 9, 4, 5]);
    });

    test('should handle empty range', () => {
      const arr = [1, 2, 3] as const;

      const result = toRangeFilled(arr, 0, [2, 2]);

      assert.deepStrictEqual(result, [1, 2, 3]);
    });

    test('should clamp range to array bounds', () => {
      const arr = [1, 2, 3] as readonly number[];

      const result = toRangeFilled(arr, 0, [1, 10]);

      assert.deepStrictEqual(result, [1, 0, 0]);
    });

    test('should handle negative start (clamped to 0)', () => {
      const arr = [1, 2, 3] as readonly number[];

      const result = toRangeFilled(arr, 9, [-5, 2]);

      assert.deepStrictEqual(result, [9, 9, 3]);
    });

    test('should work with curried version', () => {
      const fillMiddle = toRangeFilled(7, [1, 3]);

      const result = fillMiddle([1, 2, 3, 4]);

      assert.deepStrictEqual(result, [1, 7, 7, 4]);
    });

    test('A non-integer starting value should result in a type error', () => {
      const arr = [1, 2, 3] as const;

      // @ts-expect-error start must be an integer
      assert.deepStrictEqual(toRangeFilled(arr, 0, [1.5, 3]), [1, 0, 0]);
    });

    test('A non-integer ending value should result in a type error', () => {
      const arr = [1, 2, 3] as const;

      // @ts-expect-error end must be an integer
      assert.deepStrictEqual(toRangeFilled(arr, 0, [1, 2.5]), [1, 0, 3]);
    });
  });

  describe(set, () => {
    const result = set([1, 2, 3], 1, 4);

    expectType<typeof result, readonly [1, 4, 3]>('=');

    test('case 1', () => {
      assert.deepStrictEqual(result, [1, 4, 3]);
    });

    test('should work with different value types', () => {
      const nums = [1, 2, 3] as const;

      const withString = set(nums, 1, 'two');

      expectType<typeof withString, readonly [1, 'two', 3]>('=');

      assert.deepStrictEqual(withString, [1, 'two', 3]);
    });

    test('should work at index 0', () => {
      const tuple = ['a', 'b', 'c'] as const;

      const updated = set(tuple, 0, 'A');

      assert.deepStrictEqual(updated, ['A', 'b', 'c']);
    });

    test('should work at last index', () => {
      const tuple = ['a', 'b', 'c'] as const;

      const updated = set(tuple, 2, 'C');

      assert.deepStrictEqual(updated, ['a', 'b', 'C']);
    });

    test('should work with curried version', () => {
      const setIndex1To99 = set(1, 99);

      const r = setIndex1To99([10, 20, 30]);

      assert.deepStrictEqual(r, [10, 99, 30]);
    });
  });
});

/* `Arr.set` / `Arr.toUpdated` across the input shapes the positional
   `ConstrainedList.SetAt` annotation has to cope with; the suite previously
   covered only the plain-tuple case. Written as an unexported-by-value function
   so the assertions get real overload resolution — it is never called, and the
   branded shapes have no runtime representation to build. */
export const setTypeChecks = (
  shapeTuple: readonly [1, 2, 3],
  shapeArray: readonly number[],
  shapeMutableArray: readonly number[],
  shapeBranded: MinLengthArray<3, string>,
  shapeBounded: BoundedLengthArray<2, 5, string>,
  shapeFixed: FixedLengthArray<3, string>,
  shapeBrandedTuple: MinLengthArray<3, number> & readonly [1, 2, 3, 4, 5],
  unionIndex: 0 | 2,
  widenedIndex: SizeType.ArgArr,
): void => {
  /* Plain tuple — the point of the positional form: only the touched position
     changes, the rest keep their literal types. */
  const _onTuple = set(shapeTuple, 1, 'x');

  expectType<typeof _onTuple, readonly [1, 'x', 3]>('=');

  // Plain array: no positions to pin, so the element type widens.
  const _onArray = set(shapeArray, widenedIndex, 'x');

  expectType<typeof _onArray, readonly (number | 'x')[]>('=');

  // A mutable array is not brand-carrying, and behaves like the readonly one.
  const _onMutable = set(shapeMutableArray, widenedIndex, 'x');

  expectType<typeof _onMutable, readonly (number | 'x')[]>('=');

  /* Branded with no exact tuple: the length constraint survives, and with no
     positions to pin the element type absorbs the new value. */
  const _onBranded = set(shapeBranded, 1, 'x');

  expectType<typeof _onBranded, MinLengthArray<3, string>>('<=');

  const _onBounded = set(shapeBounded, 1, 'x');

  expectType<typeof _onBounded, BoundedLengthArray<2, 5, string>>('<=');

  // Fixed length: brand *and* exact positions both survive.
  const _onFixed = set(shapeFixed, 1, 'x');

  expectType<
    typeof _onFixed,
    FixedLengthArray<3, string> & readonly [string, 'x', string]
  >('~=');

  /* Brand intersected with an exact tuple — the shape `Arr.isMinLengthArray`
     produces. All three survive: the brand, the exact length, and the
     positions, the last as a structural conjunct beside the widened one. */
  const _onBrandedTuple = set(shapeBrandedTuple, 1, 'x');

  expectType<(typeof _onBrandedTuple)[0], 1>('=');

  expectType<(typeof _onBrandedTuple)[1], 'x'>('=');

  expectType<(typeof _onBrandedTuple)[4], 5>('=');

  expectType<(typeof _onBrandedTuple)['length'], 5>('=');

  /* A union index must NOT be replaced positionally. The call sets one of the
     positions and never both, so `readonly ['x', 2, 'x']` — what the upstream
     `List.SetAt` used to answer for a union index — is a type that no possible
     result satisfies. ts-type-forge 9.1.1 widens the candidate positions
     instead, and only those: index 1 is not among `0 | 2`, so it stays `2`. */
  const _onUnionIndex = set(shapeTuple, unionIndex, 'x');

  expectType<typeof _onUnionIndex, readonly [1 | 'x', 2, 3 | 'x']>('=');

  // `toUpdated` follows `set`, with the updater's return as the value.
  const _updatedTuple = toUpdated(shapeTuple, 1, (x) => x + 1);

  expectType<typeof _updatedTuple, readonly [1, number, 3]>('=');

  const _updatedUnion = toUpdated(shapeTuple, unionIndex, (x) => x + 1);

  expectType<typeof _updatedUnion, readonly [number, 2, number]>('=');
};

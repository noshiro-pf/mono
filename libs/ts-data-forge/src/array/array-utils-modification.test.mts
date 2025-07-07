import { expectType } from '../expect-type.mjs';
import { asUint32 } from '../number/index.mjs';
import { Arr } from './array-utils.mjs';

describe('Arr modifications', () => {
  describe('toUpdated', () => {
    const xs = [1, 2, 3] as const;
    const result = Arr.toUpdated(xs, 1, (x) => x + 2);

    expectType<typeof result, ArrayOfLength<3, number>>('=');

    test('case 1', () => {
      expect(result).toStrictEqual([1, 4, 3]);
    });
  });

  describe('toInserted', () => {
    const xs = [1, 2, 3] as const;

    test('case 1', () => {
      const result = Arr.toInserted(xs, 1, 5);

      expectType<typeof result, ArrayOfLength<4, 1 | 2 | 3 | 5>>('=');

      expect(result).toStrictEqual([1, 5, 2, 3]);
    });

    test('case 2 (insert head)', () => {
      const result = Arr.toInserted(xs, 0, 5);

      expectType<typeof result, ArrayOfLength<4, 1 | 2 | 3 | 5>>('=');

      expect(result).toStrictEqual([5, 1, 2, 3]);
    });

    test('case 3 (insert tail)', () => {
      const result = Arr.toInserted(['a', 'b', 'c'], asUint32(999), 5);

      expectType<typeof result, NonEmptyArray<string | 5>>('=');

      expect(result).toStrictEqual(['a', 'b', 'c', 5]);
    });
  });

  describe('toRemoved', () => {
    test('case 1', () => {
      const xs = [1, 2, 3] as const;
      const result = Arr.toRemoved(xs, 1);

      expectType<typeof result, readonly (1 | 2 | 3)[]>('=');

      expect(result).toStrictEqual([1, 3]);
    });

    test('case 2 (remove head)', () => {
      const xs = [1, 2, 3] as const;
      const result = Arr.toRemoved(xs, 0);

      expectType<typeof result, readonly (1 | 2 | 3)[]>('=');

      expect(result).toStrictEqual([2, 3]);
    });

    test('case 3 (remove tail)', () => {
      const xs = [1, 2, 3] as const;
      const result = Arr.toRemoved(xs, 2);

      expectType<typeof result, readonly (1 | 2 | 3)[]>('=');

      expect(result).toStrictEqual([1, 2]);
    });

    test('case 4 (number[])', () => {
      const xs: number[] = [1, 2, 3];
      const result = Arr.toRemoved(xs, 5);

      expectType<typeof result, readonly number[]>('=');

      expect(result).toStrictEqual([1, 2, 3]);
    });
  });

  describe('toPushed', () => {
    test('case 1', () => {
      const xs = [1, 2, 3] as const;
      const result = Arr.toPushed(xs, 4 as const);

      expectType<typeof result, readonly [1, 2, 3, 4]>('=');

      expect(result).toStrictEqual([1, 2, 3, 4]);
    });

    test('case 2', () => {
      const xs: number[] = [1, 2, 3];
      const result = Arr.toPushed(xs, 4 as const);

      expectType<typeof result, readonly [...number[], 4]>('=');

      expect(result).toStrictEqual([1, 2, 3, 4]);
    });
  });

  describe('toUnshifted', () => {
    test('case 1', () => {
      const xs = [1, 2, 3] as const;

      const result = Arr.toUnshifted(xs, 4 as const);

      expectType<typeof result, readonly [4, 1, 2, 3]>('=');

      expect(result).toStrictEqual([4, 1, 2, 3]);
    });

    test('case 2', () => {
      const xs: number[] = [1, 2, 3];

      const result = Arr.toUnshifted(xs, 4 as const);

      expectType<typeof result, readonly [4, ...number[]]>('=');

      expect(result).toStrictEqual([4, 1, 2, 3]);
    });
  });

  describe('toFilled', () => {
    test('should fill entire array with value', () => {
      const arr = [1, 2, 3, 4, 5];
      const result = Arr.toFilled(arr, 0);

      expect(result).toStrictEqual([0, 0, 0, 0, 0]);
    });

    test('should work with curried version', () => {
      const fillWithZero = Arr.toFilled(0);
      const arr = [1, 2, 3];
      const result = fillWithZero(arr);

      expect(result).toStrictEqual([0, 0, 0]);
    });
  });

  describe('toRangeFilled', () => {
    test('should fill array with range', () => {
      const arr = [1, 2, 3, 4, 5];
      const result = Arr.toRangeFilled(arr, 0, [1, 4]);

      expect(result).toStrictEqual([1, 0, 0, 0, 5]);
    });

    test('should fill with range starting from 0', () => {
      const arr = [1, 2, 3, 4, 5];
      const result = Arr.toRangeFilled(arr, 9, [0, 3]);

      expect(result).toStrictEqual([9, 9, 9, 4, 5]);
    });

    test('should handle empty range', () => {
      const arr = [1, 2, 3];
      const result = Arr.toRangeFilled(arr, 0, [2, 2]);

      expect(result).toStrictEqual([1, 2, 3]);
    });

    test('should clamp range to array bounds', () => {
      const arr = [1, 2, 3];
      const result = Arr.toRangeFilled(arr, 0, [1, 10]);

      expect(result).toStrictEqual([1, 0, 0]);
    });

    test('should handle negative start (clamped to 0)', () => {
      const arr = [1, 2, 3];
      const result = Arr.toRangeFilled(arr, 9, [-5, 2]);

      expect(result).toStrictEqual([9, 9, 3]);
    });

    test('A non-integer starting value should result in a type error', () => {
      const arr = [1, 2, 3];

      // @ts-expect-error start must be an integer
      expect(Arr.toRangeFilled(arr, 0, [1.5, 3])).toStrictEqual([1, 0, 0]);
    });

    test('A non-integer ending value should result in a type error', () => {
      const arr = [1, 2, 3];

      // @ts-expect-error end must be an integer
      expect(Arr.toRangeFilled(arr, 0, [1, 2.5])).toStrictEqual([1, 0, 3]);
    });
  });

  describe('set', () => {
    const result = Arr.set([1, 2, 3], 1, 4);

    expectType<typeof result, readonly [1 | 4, 2 | 4, 3 | 4]>('=');

    test('case 1', () => {
      expect(result).toStrictEqual([1, 4, 3]);
    });

    test('should work with different value types', () => {
      const nums = [1, 2, 3] as const;
      const withString = Arr.set(nums, 1, 'two');
      expectType<typeof withString, readonly [1 | 'two', 2 | 'two', 3 | 'two']>(
        '=',
      );
      expect(withString).toStrictEqual([1, 'two', 3]);
    });

    test('should work at index 0', () => {
      const tuple = ['a', 'b', 'c'] as const;
      const updated = Arr.set(tuple, 0, 'A');
      expect(updated).toStrictEqual(['A', 'b', 'c']);
    });

    test('should work at last index', () => {
      const tuple = ['a', 'b', 'c'] as const;
      const updated = Arr.set(tuple, 2, 'C');
      expect(updated).toStrictEqual(['a', 'b', 'C']);
    });
  });
});

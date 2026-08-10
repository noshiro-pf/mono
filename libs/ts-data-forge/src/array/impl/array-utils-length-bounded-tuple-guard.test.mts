import {
  type BoundedLengthTuple,
  type FixedLengthTuple,
  type MaxLengthTuple,
  type MinLengthTuple,
} from 'ts-type-forge';
import { expectType } from '../../expect-type.mjs';
import {
  isBoundedLengthTuple,
  isEmptyTuple,
  isFixedLengthTuple,
  isMaxLengthTuple,
  isMinLengthTuple,
  isNonEmptyTuple,
} from './array-utils-length-bounded-tuple-guard.mjs';

describe('Arr structural tuple length guards', () => {
  describe(isFixedLengthTuple, () => {
    test('should return true if array has specified length', () => {
      const arr = [1, 2, 3] as const;

      assert.isTrue(isFixedLengthTuple(3, arr));

      if (isFixedLengthTuple(3, arr)) {
        expectType<typeof arr, readonly [1, 2, 3]>('=');
      }
    });

    test('should return false if array does not have specified length', () => {
      const arr = [1, 2, 3] as const;

      assert.isFalse(isFixedLengthTuple(2, arr));
    });

    test('should return true for empty array and length 0', () => {
      const arr = [] as const;

      assert.isTrue(isFixedLengthTuple(0, arr));

      if (isFixedLengthTuple(0, arr)) {
        expectType<typeof arr, readonly []>('=');
      }
    });

    test('should return false for non-empty array and length 0', () => {
      const arr = [1] as const;

      assert.isFalse(isFixedLengthTuple(0, arr));
    });

    test('should work with unknown array type', () => {
      const mut_arr: number[] = [1, 2];

      assert.isTrue(isFixedLengthTuple(2, mut_arr));

      if (isFixedLengthTuple(2, mut_arr)) {
        // transformer-ignore-next-line
        expectType<typeof mut_arr, number[] & FixedLengthTuple<2, number>>('=');
      }

      assert.isFalse(isFixedLengthTuple(3, mut_arr));
    });

    test('should work with unknown readonly array type', () => {
      const arr: readonly number[] = [1, 2] as const;

      assert.isTrue(isFixedLengthTuple(2, arr));

      if (isFixedLengthTuple(2, arr)) {
        expectType<typeof arr, FixedLengthTuple<2, number>>('=');
      }

      assert.isFalse(isFixedLengthTuple(3, arr));
    });

    test('should return true for arrays of exact length (additional)', () => {
      assert.isTrue(isFixedLengthTuple(3, [1, 2, 3]));

      assert.isTrue(isFixedLengthTuple(0, []));

      assert.isTrue(isFixedLengthTuple(1, ['a']));
    });

    test('should return false for arrays of different length (additional)', () => {
      assert.isFalse(isFixedLengthTuple(2, [1, 2, 3]));

      assert.isFalse(isFixedLengthTuple(4, [1, 2, 3]));

      assert.isFalse(isFixedLengthTuple(1, []));
    });

    test('should work as type guard with exact length (additional)', () => {
      const array: readonly number[] = [1, 2, 3] as const;

      if (isFixedLengthTuple(3, array)) {
        expectType<typeof array, FixedLengthTuple<3, number>>('=');

        expect(array).toHaveLength(3);
      }
    });
  });

  describe(isMinLengthTuple, () => {
    test('should return true if array length is greater than or equal to specified length', () => {
      const arr = [1, 2, 3] as const;

      assert.isTrue(isMinLengthTuple(3, arr));

      if (isMinLengthTuple(3, arr)) {
        expectType<typeof arr, readonly [1, 2, 3]>('=');
      }

      assert.isTrue(isMinLengthTuple(2, arr));

      if (isMinLengthTuple(2, arr)) {
        expectType<typeof arr, readonly [1, 2, 3]>('=');
      }
    });

    test('should return false if array length is less than specified length', () => {
      const arr = [1, 2, 3] as const;

      assert.isFalse(isMinLengthTuple(4, arr));
    });

    test('should return true for empty array and length 0', () => {
      const arr = [] as const;

      assert.isTrue(isMinLengthTuple(0, arr));

      if (isMinLengthTuple(0, arr)) {
        expectType<typeof arr, readonly []>('=');
      }
    });

    test('should return false for empty array and positive length', () => {
      const arr = [] as const;

      assert.isFalse(isMinLengthTuple(1, arr));
    });

    test('should work with unknown array type', () => {
      const mut_arr: number[] = [1, 2];

      assert.isTrue(isMinLengthTuple(2, mut_arr));

      // transformer-ignore-next-line
      expectType<typeof mut_arr, number[] & MinLengthTuple<2, number>>('=');

      assert.isFalse(isMinLengthTuple(3, mut_arr));
    });

    test('should work with unknown array type 2', () => {
      const mut_arr: number[] = [1, 2];

      assert.isTrue(isMinLengthTuple(1, mut_arr));

      // transformer-ignore-next-line
      expectType<typeof mut_arr, number[] & MinLengthTuple<1, number>>('=');

      assert.isFalse(isMinLengthTuple(3, mut_arr));
    });

    test('should return true for arrays of at least specified length (additional)', () => {
      assert.isTrue(isMinLengthTuple(3, [1, 2, 3]));

      assert.isTrue(isMinLengthTuple(2, [1, 2, 3]));

      assert.isTrue(isMinLengthTuple(1, [1, 2, 3]));

      assert.isTrue(isMinLengthTuple(0, [1, 2, 3]));
    });

    test('should return false for arrays shorter than specified length (additional)', () => {
      assert.isFalse(isMinLengthTuple(4, [1, 2, 3]));

      assert.isFalse(isMinLengthTuple(1, []));
    });

    test('should work as type guard for at least length (additional)', () => {
      const array: readonly number[] = [1, 2, 3] as const;

      if (isMinLengthTuple(2, array)) {
        expectType<typeof array, MinLengthTuple<2, number>>('=');

        expect(array.length).toBeGreaterThanOrEqual(2);
      }
    });
  });

  describe(isMaxLengthTuple, () => {
    test('should return true if array length is less than or equal to specified length', () => {
      const arr = [1, 2, 3] as const;

      assert.isTrue(isMaxLengthTuple(3, arr));

      if (isMaxLengthTuple(3, arr)) {
        expectType<typeof arr, readonly [1, 2, 3]>('=');
      }

      assert.isTrue(isMaxLengthTuple(4, arr));

      if (isMaxLengthTuple(4, arr)) {
        expectType<typeof arr, readonly [1, 2, 3]>('=');
      }
    });

    test('should return false if array length is greater than specified length', () => {
      const arr = [1, 2, 3] as const;

      assert.isFalse(isMaxLengthTuple(2, arr));
    });

    test('should return true for empty array and length 0', () => {
      const arr = [] as const;

      assert.isTrue(isMaxLengthTuple(0, arr));

      if (isMaxLengthTuple(0, arr)) {
        expectType<typeof arr, readonly []>('=');
      }
    });

    test('should return false for non-empty array and length 0', () => {
      const arr = [1] as const;

      assert.isFalse(isMaxLengthTuple(0, arr));
    });

    test('should work with unknown array type', () => {
      const mut_arr: number[] = [1, 2];

      assert.isTrue(isMaxLengthTuple(2, mut_arr));

      // transformer-ignore-next-line
      expectType<typeof mut_arr, number[] & MaxLengthTuple<2, number>>('=');

      assert.isFalse(isMaxLengthTuple(1, mut_arr));
    });

    test('should return true for arrays of at most specified length (additional)', () => {
      assert.isTrue(isMaxLengthTuple(3, [1, 2, 3]));

      assert.isTrue(isMaxLengthTuple(4, [1, 2, 3]));

      assert.isTrue(isMaxLengthTuple(0, []));
    });

    test('should return false for arrays longer than specified length (additional)', () => {
      assert.isFalse(isMaxLengthTuple(2, [1, 2, 3]));

      assert.isFalse(isMaxLengthTuple(0, [1, 2, 3]));
    });

    test('should work as type guard for at most length (additional)', () => {
      const array: readonly number[] = [1, 2] as const;

      if (isMaxLengthTuple(3, array)) {
        expectType<typeof array, MaxLengthTuple<3, number>>('=');

        expect(array.length).toBeLessThanOrEqual(3);
      }
    });
  });

  describe(isBoundedLengthTuple, () => {
    test('should return true if array length is within the specified range', () => {
      const arr = [1, 2, 3] as const;

      assert.isTrue(isBoundedLengthTuple(1, 3, arr));

      if (isBoundedLengthTuple(1, 3, arr)) {
        expectType<typeof arr, readonly [1, 2, 3]>('=');
      }

      assert.isTrue(isBoundedLengthTuple(3, 5, arr));

      if (isBoundedLengthTuple(3, 5, arr)) {
        expectType<typeof arr, readonly [1, 2, 3]>('=');
      }
    });

    test('should return false if array length is below the specified range', () => {
      const arr = [1, 2, 3] as const;

      assert.isFalse(isBoundedLengthTuple(4, 5, arr));
    });

    test('should return false if array length is above the specified range', () => {
      const arr = [1, 2, 3] as const;

      assert.isFalse(isBoundedLengthTuple(0, 2, arr));
    });

    test('should return true for empty array and range including 0', () => {
      const arr = [] as const;

      assert.isTrue(isBoundedLengthTuple(0, 2, arr));

      if (isBoundedLengthTuple(0, 2, arr)) {
        expectType<typeof arr, readonly []>('=');
      }
    });

    test('should work with unknown array type', () => {
      const mut_arr: number[] = [1, 2];

      assert.isTrue(isBoundedLengthTuple(1, 3, mut_arr));

      // transformer-ignore-next-line
      expectType<typeof mut_arr, number[] & BoundedLengthTuple<1, 3, number>>(
        '=',
      );

      assert.isFalse(isBoundedLengthTuple(3, 5, mut_arr));
    });

    test('should return true for arrays within specified range (additional)', () => {
      assert.isTrue(isBoundedLengthTuple(1, 3, [1, 2, 3]));

      assert.isTrue(isBoundedLengthTuple(3, 3, [1, 2, 3]));

      assert.isTrue(isBoundedLengthTuple(0, 0, []));
    });

    test('should return false for arrays outside specified range (additional)', () => {
      assert.isFalse(isBoundedLengthTuple(4, 5, [1, 2, 3]));

      assert.isFalse(isBoundedLengthTuple(0, 2, [1, 2, 3]));
    });

    test('should work as type guard for bounded length (additional)', () => {
      const array: readonly number[] = [1, 2] as const;

      if (isBoundedLengthTuple(1, 3, array)) {
        expectType<typeof array, BoundedLengthTuple<1, 3, number>>('=');

        expect(array.length).toBeGreaterThanOrEqual(1);

        expect(array.length).toBeLessThanOrEqual(3);
      }
    });
  });

  describe(isEmptyTuple, () => {
    test('narrows an empty array to the empty tuple', () => {
      const values: readonly number[] = [] as const;

      assert.isTrue(isEmptyTuple(values));

      if (isEmptyTuple(values)) {
        expectType<typeof values, readonly []>('=');
      }
    });

    test('rejects a non-empty array', () => {
      assert.isFalse(isEmptyTuple([1] as const));
    });
  });

  describe(isNonEmptyTuple, () => {
    test('narrows to the structural non-empty tuple', () => {
      const values: readonly number[] = [1, 2] as const;

      assert.isTrue(isNonEmptyTuple(values));

      if (isNonEmptyTuple(values)) {
        expectType<typeof values, MinLengthTuple<1, number>>('=');

        // The structural prefix makes the first element defined.
        const first: number = values[0];

        assert.deepStrictEqual(first, 1);
      }
    });

    test('rejects an empty array', () => {
      assert.isFalse(isNonEmptyTuple([] as const));
    });
  });
});

describe('curried tuple length guards', () => {
  test('isFixedLengthTuple narrows when applied later', () => {
    const isPair = isFixedLengthTuple(2);

    assert.isTrue(isPair([1, 2]));

    assert.isFalse(isPair([1, 2, 3]));

    const value: readonly number[] = [1, 2] as const;

    if (isPair(value)) {
      expectType<typeof value, FixedLengthTuple<2, number>>('=');
    }
  });

  test('isMinLengthTuple narrows when applied later', () => {
    const hasOne = isMinLengthTuple(1);

    assert.isTrue(hasOne(['task-1']));

    assert.isFalse(hasOne([]));

    const value: readonly string[] = ['task-1'] as const;

    if (hasOne(value)) {
      expectType<typeof value, MinLengthTuple<1, string>>('=');
    }
  });

  test('isMaxLengthTuple narrows when applied later', () => {
    const fitsInTwo = isMaxLengthTuple(2);

    assert.isTrue(fitsInTwo([1, 2]));

    assert.isFalse(fitsInTwo([1, 2, 3]));

    const value: readonly number[] = [1, 2] as const;

    if (fitsInTwo(value)) {
      expectType<typeof value, MaxLengthTuple<2, number>>('=');
    }
  });

  test('isBoundedLengthTuple narrows when applied later', () => {
    const isSmall = isBoundedLengthTuple(1, 3);

    assert.isTrue(isSmall([1, 2]));

    assert.isFalse(isSmall([]));

    assert.isFalse(isSmall([1, 2, 3, 4]));

    const value: readonly number[] = [1, 2] as const;

    if (isSmall(value)) {
      expectType<typeof value, BoundedLengthTuple<1, 3, number>>('=');
    }
  });
});

import {
  type BoundedLengthArray,
  type FixedLengthArray,
  type MaxLengthArray,
  type MinLengthArray,
} from 'ts-type-forge';
import { expectType } from '../expect-type.mjs';
import {
  isBoundedLengthArray,
  isFixedLengthArray,
  isMaxLengthArray,
  isMinLengthArray,
} from './is-length-bounded-array.mjs';

describe(isMinLengthArray, () => {
  test('should return true when the array is long enough', () => {
    assert.isTrue(isMinLengthArray([1, 2, 3], 3));

    assert.isTrue(isMinLengthArray([1, 2, 3], 2));

    assert.isTrue(isMinLengthArray([], 0));
  });

  test('should return false when the array is too short', () => {
    assert.isFalse(isMinLengthArray([1, 2], 3));

    assert.isFalse(isMinLengthArray([], 1));
  });

  test('should act as a type guard', () => {
    const value: readonly number[] = [0, 1, 2, 3] as const;

    if (isMinLengthArray(value, 3)) {
      expectType<typeof value, MinLengthArray<3, number>>('<=');

      expectType<typeof value, MinLengthArray<1, number>>('<='); // 3 >= 1

      expectType<typeof value, MinLengthArray<5, number>>('!<=');

      // indexed access below the minimum length does not include `undefined`
      // (even under `noUncheckedIndexedAccess`)
      const _first = value[0];

      expectType<typeof _first, number>('=');

      const _third = value[2];

      expectType<typeof _third, number>('=');

      const _fourth = value[3];

      expectType<typeof _fourth, number | undefined>('=');

      expect(value.length).toBeGreaterThanOrEqual(3);
    }
  });

  test('should preserve the original array type', () => {
    const tuple = [1, 2, 3] as const;

    if (isMinLengthArray(tuple, 2)) {
      expectType<typeof tuple, readonly [1, 2, 3]>('<=');

      expectType<typeof tuple, MinLengthArray<2, 1 | 2 | 3>>('<=');
    }
  });
});

describe(isMaxLengthArray, () => {
  test('should return true when the array is short enough', () => {
    assert.isTrue(isMaxLengthArray([1, 2, 3], 3));

    assert.isTrue(isMaxLengthArray([1, 2, 3], 4));

    assert.isTrue(isMaxLengthArray([], 0));
  });

  test('should return false when the array is too long', () => {
    assert.isFalse(isMaxLengthArray([1, 2, 3], 2));

    assert.isFalse(isMaxLengthArray([1], 0));
  });

  test('should act as a type guard', () => {
    const value: readonly number[] = [0, 1, 2] as const;

    if (isMaxLengthArray(value, 8)) {
      expectType<typeof value, MaxLengthArray<8, number>>('<=');

      expectType<typeof value, MaxLengthArray<16, number>>('<='); // 8 <= 16

      expectType<typeof value, MaxLengthArray<2, number>>('!<=');

      expect(value.length).toBeLessThanOrEqual(8);
    }
  });
});

describe(isBoundedLengthArray, () => {
  test('should return true when the length is within the range', () => {
    assert.isTrue(isBoundedLengthArray([1, 2, 3], 1, 5));

    assert.isTrue(isBoundedLengthArray([1], 1, 5));

    assert.isTrue(isBoundedLengthArray([1, 2, 3, 4, 5], 1, 5));
  });

  test('should return false when the length is out of the range', () => {
    assert.isFalse(isBoundedLengthArray([], 1, 5));

    assert.isFalse(isBoundedLengthArray([1, 2, 3, 4, 5, 6], 1, 5));
  });

  test('should act as a type guard', () => {
    const value: readonly number[] = [1, 2, 3] as const;

    if (isBoundedLengthArray(value, 1, 5)) {
      expectType<typeof value, BoundedLengthArray<1, 5, number>>('<=');

      expectType<typeof value, BoundedLengthArray<0, 100, number>>('<=');

      expectType<typeof value, MinLengthArray<1, number>>('<=');

      expectType<typeof value, MaxLengthArray<5, number>>('<=');

      expectType<typeof value, BoundedLengthArray<2, 5, number>>('!<=');
    }
  });
});

describe(isFixedLengthArray, () => {
  test('should return true when the length matches exactly', () => {
    assert.isTrue(isFixedLengthArray([1, 2, 3], 3));

    assert.isTrue(isFixedLengthArray([], 0));
  });

  test('should return false when the length does not match', () => {
    assert.isFalse(isFixedLengthArray([1, 2, 3], 2));

    assert.isFalse(isFixedLengthArray([1, 2, 3], 4));
  });

  test('should act as a type guard', () => {
    const value: readonly number[] = [255, 128, 0] as const;

    if (isFixedLengthArray(value, 3)) {
      expectType<typeof value, FixedLengthArray<3, number>>('<=');

      expectType<typeof value, MaxLengthArray<5, number>>('<='); // 3 <= 5

      expectType<typeof value, MinLengthArray<1, number>>('<='); // 3 >= 1

      expectType<typeof value, FixedLengthArray<4, number>>('!<=');

      // `length` is narrowed to the literal and in-range indexed access does
      // not include `undefined` (even under `noUncheckedIndexedAccess`)
      const _len = value.length;

      expectType<typeof _len, 3>('=');

      const _second = value[1];

      expectType<typeof _second, number>('=');

      expect(value).toHaveLength(3);
    }
  });
});

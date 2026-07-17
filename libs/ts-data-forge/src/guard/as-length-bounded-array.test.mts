import {
  type BoundedLengthArray,
  type FixedLengthArray,
  type MaxLengthArray,
  type MinLengthArray,
} from 'ts-type-forge';
import { expectType } from '../expect-type.mjs';
import {
  asBoundedLengthArray,
  asFixedLengthArray,
  asMaxLengthArray,
  asMinLengthArray,
} from './as-length-bounded-array.mjs';

describe(asFixedLengthArray, () => {
  test('should return the input when the length matches exactly', () => {
    const xs: readonly number[] = [0, 1, 2, 3] as const;

    const casted = asFixedLengthArray(xs, 4);

    expect(casted).toBe(xs);

    expectType<typeof casted, FixedLengthArray<4, number>>('<=');

    // in-range indexed access does not include `undefined`
    const _first = casted[0];

    expectType<typeof _first, number>('=');
  });

  test('should throw when the length does not match', () => {
    expect(() => asFixedLengthArray([0, 1, 2], 4)).toThrow(TypeError);

    expect(() => asFixedLengthArray([0, 1, 2], 4)).toThrow(
      'Expected an array of length 4, got an array of length 3',
    );
  });

  test('should preserve the original array type', () => {
    const tuple = [1, 2, 3] as const;

    const casted = asFixedLengthArray(tuple, 3);

    expect(casted).toBe(tuple);

    expectType<typeof casted, readonly [1, 2, 3]>('<=');

    expectType<typeof casted, FixedLengthArray<3, 1 | 2 | 3>>('<=');
  });
});

describe(asMinLengthArray, () => {
  test('should return the input when the array is long enough', () => {
    const xs: readonly number[] = [0, 1, 2, 3] as const;

    const casted = asMinLengthArray(xs, 3);

    expect(casted).toBe(xs);

    expectType<typeof casted, MinLengthArray<3, number>>('<=');

    expectType<typeof casted, MinLengthArray<1, number>>('<='); // 3 >= 1
  });

  test('should throw when the array is too short', () => {
    expect(() => asMinLengthArray([0], 3)).toThrow(TypeError);

    expect(() => asMinLengthArray([0], 3)).toThrow(
      'Expected an array of length >= 3, got an array of length 1',
    );
  });
});

describe(asMaxLengthArray, () => {
  test('should return the input when the array is short enough', () => {
    const xs: readonly number[] = [0, 1, 2] as const;

    const casted = asMaxLengthArray(xs, 8);

    expect(casted).toBe(xs);

    expectType<typeof casted, MaxLengthArray<8, number>>('<=');

    expectType<typeof casted, MaxLengthArray<16, number>>('<='); // 8 <= 16
  });

  test('should throw when the array is too long', () => {
    expect(() => asMaxLengthArray([0, 1, 2], 2)).toThrow(TypeError);

    expect(() => asMaxLengthArray([0, 1, 2], 2)).toThrow(
      'Expected an array of length <= 2, got an array of length 3',
    );
  });
});

describe(asBoundedLengthArray, () => {
  test('should return the input when the length is within the range', () => {
    const xs: readonly number[] = [1, 2, 3] as const;

    const casted = asBoundedLengthArray(xs, 1, 5);

    expect(casted).toBe(xs);

    expectType<typeof casted, BoundedLengthArray<1, 5, number>>('<=');

    expectType<typeof casted, MinLengthArray<1, number>>('<=');

    expectType<typeof casted, MaxLengthArray<5, number>>('<=');
  });

  test('should throw when the length is out of the range', () => {
    expect(() => asBoundedLengthArray([], 1, 5)).toThrow(TypeError);

    expect(() => asBoundedLengthArray([1, 2, 3, 4, 5, 6], 1, 5)).toThrow(
      'Expected an array of length in [1, 5], got an array of length 6',
    );
  });
});

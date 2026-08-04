import {
  type BoundedLengthTuple,
  type FixedLengthTuple,
  type MaxLengthTuple,
  type MinLengthTuple,
} from 'ts-type-forge';
import { expectType } from '../../expect-type.mjs';
import {
  asBoundedLengthTuple,
  asEmptyTuple,
  asFixedLengthTuple,
  asMaxLengthTuple,
  asMinLengthTuple,
  asNonEmptyTuple,
} from './array-utils-length-bounded-tuple-cast.mjs';

describe(asFixedLengthTuple, () => {
  test('casts to the structural tuple, so indexed access is defined', () => {
    const values: readonly number[] = [255, 128, 0] as const;

    const casted = asFixedLengthTuple(3, values);

    expectType<typeof casted, FixedLengthTuple<3, number>>('~=');

    const red: number = casted[0];

    assert.deepStrictEqual(red, 255);
  });

  test('is the same value it was handed', () => {
    const values: readonly number[] = [1, 2] as const;

    expect(asFixedLengthTuple(2, values)).toBe(values);
  });

  test('throws on a length mismatch', () => {
    expect(() => asFixedLengthTuple(3, [255, 128])).toThrow(TypeError);

    expect(() => asFixedLengthTuple(3, [255, 128])).toThrow(
      'Expected an array of length 3, got an array of length 2',
    );
  });

  test('curried form applies the same check later', () => {
    const asRgb = asFixedLengthTuple(3);

    const casted = asRgb([1, 2, 3] as const);

    // The input type is carried over, so the literal positions survive the cast
    // exactly as they do for `asFixedLengthArray`.
    expectType<
      typeof casted,
      FixedLengthTuple<3, 1 | 2 | 3> & readonly [1, 2, 3]
    >('~=');

    assert.deepStrictEqual<readonly number[]>(casted, [1, 2, 3]);

    expect(() => asRgb([1, 2])).toThrow(TypeError);
  });
});

describe(asMinLengthTuple, () => {
  test('casts to the structural minimum-length tuple', () => {
    const values: readonly number[] = [0, 1, 2, 3] as const;

    const casted = asMinLengthTuple(3, values);

    expectType<typeof casted, MinLengthTuple<3, number>>('~=');

    const first: number = casted[0];

    assert.deepStrictEqual(first, 0);
  });

  test('throws when the array is too short', () => {
    expect(() => asMinLengthTuple(3, [0, 1])).toThrow(
      'Expected an array of length >= 3, got an array of length 2',
    );
  });

  test('curried form applies the same check later', () => {
    const asHistory = asMinLengthTuple(3);

    assert.deepStrictEqual(asHistory([1, 2, 3]), [1, 2, 3]);

    expect(() => asHistory([1])).toThrow(TypeError);
  });
});

describe(asMaxLengthTuple, () => {
  test('casts to the structural maximum-length tuple', () => {
    const values: readonly string[] = ['a', 'b', 'c'] as const;

    const casted = asMaxLengthTuple(8, values);

    expectType<typeof casted, MaxLengthTuple<8, string>>('~=');

    assert.deepStrictEqual<readonly string[]>(casted, ['a', 'b', 'c']);
  });

  test('throws when the array is too long', () => {
    expect(() => asMaxLengthTuple(2, ['a', 'b', 'c'])).toThrow(
      'Expected an array of length <= 2, got an array of length 3',
    );
  });

  test('curried form applies the same check later', () => {
    const asTags = asMaxLengthTuple(2);

    assert.deepStrictEqual(asTags(['a']), ['a']);

    expect(() => asTags(['a', 'b', 'c'])).toThrow(TypeError);
  });
});

describe(asBoundedLengthTuple, () => {
  test('casts to the structural bounded-length tuple', () => {
    const values: readonly number[] = [1, 2, 3] as const;

    const casted = asBoundedLengthTuple(1, 5, values);

    expectType<typeof casted, BoundedLengthTuple<1, 5, number>>('~=');

    assert.deepStrictEqual<readonly number[]>(casted, [1, 2, 3]);
  });

  test('throws when the length is outside the range', () => {
    expect(() => asBoundedLengthTuple(1, 2, [1, 2, 3])).toThrow(
      'Expected an array of length in [1, 2], got an array of length 3',
    );
  });

  test('curried form applies the same check later', () => {
    const asSelection = asBoundedLengthTuple(1, 2);

    assert.deepStrictEqual(asSelection([1]), [1]);

    expect(() => asSelection([1, 2, 3])).toThrow(TypeError);
  });
});

describe(asEmptyTuple, () => {
  test('casts an empty array to the empty tuple', () => {
    const values: readonly number[] = [] as const;

    const casted = asEmptyTuple(values);

    expectType<typeof casted, readonly []>('~=');

    // Like the other casts, this hands back the value it was given.
    expect(casted).toBe(values);
  });

  test('throws when the array is not empty', () => {
    expect(() => asEmptyTuple([1])).toThrow(
      'Expected an empty array, got an array of length 1',
    );
  });
});

describe(asNonEmptyTuple, () => {
  test('casts to the structural non-empty tuple', () => {
    const values: readonly number[] = [1, 2, 3] as const;

    const casted = asNonEmptyTuple(values);

    expectType<typeof casted, MinLengthTuple<1, number>>('~=');

    const first: number = casted[0];

    assert.deepStrictEqual(first, 1);
  });

  test('throws when the array is empty', () => {
    expect(() => asNonEmptyTuple([])).toThrow(
      'Expected a non-empty array, got an empty array',
    );
  });
});

describe('tuple casts preserve the input type, like their branded counterparts', () => {
  test('an exact tuple survives asMinLengthTuple', () => {
    const values = [1, 2, 3, 4, 5] as const;

    const casted = asMinLengthTuple(3, values);

    // Before, this widened to `MinLengthTuple<3, 1 | 2 | 3 | 4 | 5>` and the
    // exact length was gone; `asMinLengthArray` never lost it.
    expectType<typeof casted, readonly [1, 2, 3, 4, 5]>('~=');

    const length: 5 = casted.length;

    assert.deepStrictEqual(length, 5);

    assert.deepStrictEqual<readonly number[]>(casted, [1, 2, 3, 4, 5]);
  });

  test('asNonEmptyTuple keeps the tuple too', () => {
    const casted = asNonEmptyTuple([1, 2, 3] as const);

    expectType<typeof casted, readonly [1, 2, 3]>('~=');

    const first: 1 = casted[0];

    assert.deepStrictEqual(first, 1);
  });
});

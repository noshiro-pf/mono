import { expectType, Result } from 'ts-data-forge';
import {
  type BoundedLengthArray,
  type MaxLengthArray,
  type MinLengthArray,
} from 'ts-type-forge';
import { number } from '../primitives/index.mjs';
import { type TypeOf } from '../type.mjs';
import { boundedLengthArray } from './bounded-length-array.mjs';

describe(boundedLengthArray, () => {
  test('default value', () => {
    assert.deepStrictEqual<readonly number[]>(
      boundedLengthArray(1, 3, number()).defaultValue,
      [0],
    );
  });

  const xs = boundedLengthArray(1, 3, number());

  type Xs = TypeOf<typeof xs>;

  expectType<Xs, BoundedLengthArray<1, 3, number>>('=');

  // both bounds can be weakened independently
  expectType<Xs, BoundedLengthArray<0, 100, number>>('<=');

  expectType<Xs, MinLengthArray<1, number>>('<=');

  expectType<Xs, MaxLengthArray<3, number>>('<=');

  expectType<Xs, BoundedLengthArray<2, 3, number>>('!<=');

  test('is', () => {
    assert.isTrue(xs.is([1]));

    assert.isTrue(xs.is([1, 2, 3]));

    assert.isFalse(xs.is([]));

    assert.isFalse(xs.is([1, 2, 3, 4]));
  });

  test('validate error details', () => {
    const result = xs.validate([]);

    assert.isTrue(Result.isErr(result));

    if (Result.isErr(result)) {
      assert.deepStrictEqual(result.value[0]?.details, {
        kind: 'array-range-length',
        minLength: 1,
        maxLength: 3,
        actualLength: 0,
      });
    }
  });

  test('fill pads or trims to fit the bounds', () => {
    assert.deepStrictEqual<readonly number[]>(xs.fill([]), [0]);

    assert.deepStrictEqual<readonly number[]>(xs.fill([5, 6, 7, 8]), [5, 6, 7]);

    assert.deepStrictEqual<readonly number[]>(xs.fill([5, 6]), [5, 6]);
  });
});

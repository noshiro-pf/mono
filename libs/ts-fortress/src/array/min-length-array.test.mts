import { expectType, Result } from 'ts-data-forge';
import { type MinLengthArray } from 'ts-type-forge';
import { number } from '../primitives/index.mjs';
import { type TypeOf } from '../type.mjs';
import { minLengthArray } from './min-length-array.mjs';

describe(minLengthArray, () => {
  test('default value', () => {
    assert.deepStrictEqual<readonly number[]>(
      minLengthArray(2, number()).defaultValue,
      [0, 0],
    );
  });

  const xs = minLengthArray(2, number());

  type Xs = TypeOf<typeof xs>;

  expectType<Xs, MinLengthArray<2, number>>('=');

  expectType<Xs, MinLengthArray<1, number>>('<=');

  expectType<Xs, MinLengthArray<3, number>>('!<=');

  test('is', () => {
    assert.isTrue(xs.is([1, 2]));

    assert.isTrue(xs.is([1, 2, 3, 4, 5]));

    assert.isFalse(xs.is([1]));

    assert.isFalse(xs.is(undefined));
  });

  test('validate error details', () => {
    const result = xs.validate([1]);

    assert.isTrue(Result.isErr(result));

    if (Result.isErr(result)) {
      assert.deepStrictEqual(result.value[0]?.details, {
        kind: 'array-min-length',
        minLength: 2,
        actualLength: 1,
      });
    }
  });

  test('fill keeps longer input intact', () => {
    assert.deepStrictEqual<readonly number[]>(xs.fill([5, 6, 7]), [5, 6, 7]);

    assert.deepStrictEqual<readonly number[]>(xs.fill([5]), [5, 0]);
  });
});

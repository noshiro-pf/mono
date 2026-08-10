import { expectType, Result } from 'ts-data-forge';
import { type MaxLengthArray } from 'ts-type-forge';
import { number } from '../primitives/index.mjs';
import { type TypeOf } from '../type.mjs';
import { maxLengthArray } from './max-length-array.mjs';

describe(maxLengthArray, () => {
  test('default value', () => {
    assert.deepStrictEqual<readonly number[]>(
      maxLengthArray(3, number()).defaultValue,
      [],
    );
  });

  const xs = maxLengthArray(3, number());

  type Xs = TypeOf<typeof xs>;

  expectType<Xs, MaxLengthArray<3, number>>('=');

  expectType<Xs, MaxLengthArray<5, number>>('<=');

  expectType<Xs, MaxLengthArray<2, number>>('!<=');

  test('is', () => {
    assert.isTrue(xs.is([]));

    assert.isTrue(xs.is([1, 2, 3]));

    assert.isFalse(xs.is([1, 2, 3, 4]));
  });

  test('validate error details', () => {
    const result = xs.validate([1, 2, 3, 4]);

    assert.isTrue(Result.isErr(result));

    if (Result.isErr(result)) {
      assert.deepStrictEqual(result.value[0]?.details, {
        kind: 'array-max-length',
        maxLength: 3,
        actualLength: 4,
      });
    }
  });

  test('fill trims down to the bound', () => {
    assert.deepStrictEqual<readonly number[]>(xs.fill([5, 6, 7, 8]), [5, 6, 7]);

    assert.deepStrictEqual<readonly number[]>(xs.fill([5]), [5]);
  });
});

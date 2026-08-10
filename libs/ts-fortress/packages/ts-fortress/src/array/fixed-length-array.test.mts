import { expectType, Result } from 'ts-data-forge';
import {
  type FixedLengthArray,
  type MaxLengthArray,
  type MinLengthArray,
} from 'ts-type-forge';
import { number } from '../primitives/index.mjs';
import { type TypeOf } from '../type.mjs';
import { fixedLengthArray } from './fixed-length-array.mjs';

describe(fixedLengthArray, () => {
  test('default value', () => {
    assert.deepStrictEqual<readonly number[]>(
      fixedLengthArray(3, number()).defaultValue,
      [0, 0, 0],
    );

    assert.deepStrictEqual<readonly number[]>(
      fixedLengthArray(3, number(), { defaultValue: [1, 2, 3] }).defaultValue,
      [1, 2, 3],
    );
  });

  const xs = fixedLengthArray(3, number());

  type Xs = TypeOf<typeof xs>;

  expectType<Xs, FixedLengthArray<3, number>>('=');

  // participates in the length-constraint subtyping relation
  expectType<Xs, MaxLengthArray<5, number>>('<=');

  expectType<Xs, MinLengthArray<1, number>>('<=');

  expectType<Xs, readonly number[]>('<=');

  test('is', () => {
    assert.isTrue(xs.is([1, 2, 3]));

    assert.isFalse(xs.is([1, 2]));

    assert.isFalse(xs.is([1, 2, 3, 4]));

    assert.isFalse(xs.is(['1', '2', '3']));

    assert.isFalse(xs.is('not an array'));
  });

  test('validate error details', () => {
    const result = xs.validate([1, 2]);

    assert.isTrue(Result.isErr(result));

    if (Result.isErr(result)) {
      assert.deepStrictEqual(result.value[0]?.details, {
        kind: 'array-length',
        expectedLength: 3,
        actualLength: 2,
      });
    }
  });

  test('fill', () => {
    assert.deepStrictEqual<readonly number[]>(xs.fill([5, 6]), [5, 6, 0]);

    assert.deepStrictEqual<readonly number[]>(xs.fill([5, 6, 7, 8]), [5, 6, 7]);

    assert.deepStrictEqual<readonly number[]>(xs.fill('ignored'), [0, 0, 0]);
  });
});

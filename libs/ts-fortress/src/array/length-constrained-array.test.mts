import { expectType, Result } from 'ts-data-forge';
import {
  type BoundedLengthArray,
  type FixedLengthArray,
  type MaxLengthArray,
  type MinLengthArray,
} from 'ts-type-forge';
import { number } from '../primitives/index.mjs';
import { type TypeOf } from '../type.mjs';
import {
  boundedLengthArray,
  fixedLengthArray,
  maxLengthArray,
  minLengthArray,
} from './length-constrained-array.mjs';

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

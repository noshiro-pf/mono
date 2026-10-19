import type { SafeInt, SafeUint } from 'ts-type-forge';
import { expectType } from '../expect-type.mjs';
import { asNonZeroSafeInt, asSafeUint } from '../number/index.mjs';
import { range } from './range.mjs';

describe(range, () => {
  test('range(0, 10)', () => {
    assert.deepStrictEqual(
      Array.from(range(0, 10)),
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    );
  });

  test('range(10)', () => {
    assert.deepStrictEqual(
      Array.from(range(10)),
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    );
  });

  test('range(0)', () => {
    assert.deepStrictEqual(Array.from(range(0)), []);
  });

  test('range(-1)', () => {
    // @ts-expect-error negative end is not allowed
    assert.deepStrictEqual(Array.from(range(-1)), []);
  });

  test('range(10, 0, -1)', () => {
    assert.deepStrictEqual(
      Array.from(range(10, 0, -1)),
      [10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
    );
  });

  test('range(0, -10, -1)', () => {
    assert.deepStrictEqual(
      Array.from(range(0, -10, -1)),
      [0, -1, -2, -3, -4, -5, -6, -7, -8, -9],
    );
  });

  test('range(0, 0)', () => {
    assert.deepStrictEqual(Array.from(range(0, 0)), []);
  });

  test('range(0, 11, 2)', () => {
    assert.deepStrictEqual(Array.from(range(0, 11, 2)), [0, 2, 4, 6, 8, 10]);
  });

  test('range(1, 12, 2)', () => {
    assert.deepStrictEqual(Array.from(range(1, 12, 2)), [1, 3, 5, 7, 9, 11]);
  });

  // A negative step from non-negative bounds only counts down to `end`, so
  // every value stays non-negative.
  test('a negative step from non-negative bounds yields SafeUint', () => {
    const xs = Array.from(range(asSafeUint(3), asSafeUint(0), -1));

    expectType<(typeof xs)[number], SafeUint>('=');

    assert.deepStrictEqual(xs, [3, 2, 1]);

    const ys = Array.from(
      range(asSafeUint(3), asSafeUint(0), asNonZeroSafeInt(-2)),
    );

    expectType<(typeof ys)[number], SafeUint>('=');

    assert.deepStrictEqual(ys, [3, 1]);
  });

  test('a negative bound still yields SafeInt', () => {
    const xs = Array.from(range(0, -2, -1));

    expectType<(typeof xs)[number], SafeInt>('=');

    assert.deepStrictEqual(xs, [0, -1]);
  });
});

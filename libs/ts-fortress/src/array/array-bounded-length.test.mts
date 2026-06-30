import { expectType, Result } from 'ts-data-forge';
import {
  type ArrayAtLeastLen,
  type ArrayAtMostLen,
  type ArrayBoundedLen,
} from 'ts-type-forge';
import { number } from '../primitives/index.mjs';
import { type TypeOf } from '../type.mjs';
import {
  type ValidationError,
  validationErrorsToMessages,
} from '../utils/index.mjs';
import { arrayBoundedLength } from './array-bounded-length.mjs';

describe(arrayBoundedLength, () => {
  describe('arg patterns', () => {
    test('without explicit default value', () => {
      assert.deepStrictEqual(
        arrayBoundedLength(2, 4, number()).defaultValue,
        [0, 0],
      );
    });

    test('with explicit element default value', () => {
      assert.deepStrictEqual(
        arrayBoundedLength(2, 4, number(5)).defaultValue,
        [5, 5],
      );
    });

    test('with explicit default value override', () => {
      assert.deepStrictEqual(
        arrayBoundedLength(2, 4, number(), {
          typeName: 'ys',
          defaultValue: [1, 2, 3],
        }).defaultValue,
        [1, 2, 3],
      );
    });
  });

  const xs = arrayBoundedLength(2, 4, number(), {
    typeName: 'xs',
    defaultValue: [1, 2, 3],
  });

  type Xs = TypeOf<typeof xs>;

  expectType<Xs, ArrayBoundedLen<2, 4, number>>('=');

  expectType<typeof xs.defaultValue, Xs>('=');

  describe('is', () => {
    test('truthy case (min length)', () => {
      const ys: unknown = [4, 5] as const;

      if (xs.is(ys)) {
        expectType<typeof ys, Xs>('=');
      } else {
        expectType<typeof ys, unknown>('=');
      }

      assert.isTrue(xs.is(ys));
    });

    test('truthy case (max length)', () => {
      const ys: unknown = [4, 5, 6, 7] as const;

      assert.isTrue(xs.is(ys));
    });

    test('falsy case 1 (too short)', () => {
      const ys: unknown = [4] as const;

      assert.isFalse(xs.is(ys));
    });

    test('falsy case 2 (too long)', () => {
      const ys: unknown = [1, 2, 3, 4, 5] as const;

      assert.isFalse(xs.is(ys));
    });

    test('falsy case 3 (wrong element type)', () => {
      const ys: unknown = [1, '2'] as const;

      assert.isFalse(xs.is(ys));
    });

    test('falsy case 4 (not an array)', () => {
      const ys: unknown = 'foo';

      assert.isFalse(xs.is(ys));
    });
  });

  describe('validate', () => {
    test('truthy case', () => {
      const ys: unknown = [4, 5, 6] as const;

      const result = xs.validate(ys);

      expectType<typeof result, Result<Xs, readonly ValidationError[]>>('=');

      assert.isTrue(Result.isOk(result));

      const resultValue = Result.unwrapThrow(result);

      assert.deepStrictEqual(resultValue, [4, 5, 6]);
    });

    test('validate returns input as-is for OK cases', () => {
      const input = [4, 5, 6] as const;

      const result = xs.validate(input);

      assert.isTrue(Result.isOk(result));

      const resultValue1 = Result.unwrapThrow(result);

      expect(resultValue1).toBe(input); // ✅ same reference
    });

    test('falsy case 1 (not an array)', () => {
      const ys: unknown = 'foo';

      const result = xs.validate(ys);

      assert.isTrue(Result.isErr(result));

      const resultError = Result.unwrapErrThrow(result);

      assert.deepStrictEqual(resultError, [
        {
          path: [],
          actualValue: ys,
          expectedType: 'array',
          typeName: 'xs',
          details: undefined,
        },
      ]);

      assert.deepStrictEqual(validationErrorsToMessages(resultError), [
        'Error: expected <array> type but <string> type value "foo" was passed.',
      ]);
    });

    test('falsy case 2 (too short)', () => {
      const ys: unknown = [4] as const;

      const result = xs.validate(ys);

      assert.isTrue(Result.isErr(result));

      const resultError = Result.unwrapErrThrow(result);

      assert.deepStrictEqual(resultError, [
        {
          path: [],
          actualValue: ys,
          expectedType: 'xs',
          typeName: 'xs',
          details: {
            kind: 'array-range-length',
            minLength: 2,
            maxLength: 4,
            actualLength: 1,
          },
        },
      ]);

      assert.deepStrictEqual(validationErrorsToMessages(resultError), [
        'Error: expected array of length between 2 and 4 but length 1 was passed.',
      ]);
    });

    test('falsy case 3 (too long)', () => {
      const ys: unknown = [1, 2, 3, 4, 5] as const;

      const result = xs.validate(ys);

      assert.isTrue(Result.isErr(result));

      const resultError = Result.unwrapErrThrow(result);

      assert.deepStrictEqual(resultError, [
        {
          path: [],
          actualValue: ys,
          expectedType: 'xs',
          typeName: 'xs',
          details: {
            kind: 'array-range-length',
            minLength: 2,
            maxLength: 4,
            actualLength: 5,
          },
        },
      ]);

      assert.deepStrictEqual(validationErrorsToMessages(resultError), [
        'Error: expected array of length between 2 and 4 but length 5 was passed.',
      ]);
    });

    test('falsy case 4 (wrong element type)', () => {
      const ys: unknown = [1, '2'] as const;

      const result = xs.validate(ys);

      assert.isTrue(Result.isErr(result));

      const resultError = Result.unwrapErrThrow(result);

      assert.deepStrictEqual(resultError, [
        {
          path: ['1'],
          actualValue: '2',
          expectedType: 'number',
          typeName: 'number',
          details: undefined,
        },
      ]);

      assert.deepStrictEqual(validationErrorsToMessages(resultError), [
        'Error at 1: expected <number> type but <string> type value "2" was passed.',
      ]);
    });
  });

  describe('fill', () => {
    test('trims extras down to max', () => {
      const ys: unknown = [4, 5, 6, 7, 8] as const;

      assert.deepStrictEqual(xs.fill(ys), [4, 5, 6, 7]);
    });

    test('pads up to min and fills invalid entries', () => {
      const ys: unknown = [4] as const;

      assert.deepStrictEqual(xs.fill(ys), [4, 0]);
    });

    test('keeps in-range arrays and fills invalid entries', () => {
      const ys: unknown = [4, '5', 6] as const;

      assert.deepStrictEqual(xs.fill(ys), [4, 0, 6]);
    });

    test('fill with the default value for non-array input', () => {
      const ys: unknown = null;

      assert.deepStrictEqual(xs.fill(ys), [1, 2, 3]);
    });
  });

  describe('bounds outside SmallUint', () => {
    // A plain `number` is outside `SmallUint`, so it drops the corresponding
    // bound from the result type.
    const dynamic: number = 3;

    // min ∈ SmallUint & max ∉ SmallUint -> ArrayAtLeastLen<min, A>
    const atLeast = arrayBoundedLength(2, dynamic, number());

    expectType<TypeOf<typeof atLeast>, ArrayAtLeastLen<2, number>>('=');

    // min ∉ SmallUint & max ∈ SmallUint -> ArrayAtMostLen<max, A>
    const atMost = arrayBoundedLength(dynamic, 5, number());

    expectType<TypeOf<typeof atMost>, ArrayAtMostLen<5, number>>('=');

    // min ∉ SmallUint & max ∉ SmallUint -> readonly A[]
    const unbounded = arrayBoundedLength(dynamic, dynamic, number());

    expectType<TypeOf<typeof unbounded>, readonly number[]>('=');

    test('still validates the range at runtime', () => {
      // `atLeast` has range [2, 3], `atMost` has range [3, 5], `unbounded` [3, 3].
      assert.isTrue(atLeast.is([0, 0]));

      assert.isFalse(atLeast.is([0]));

      assert.isTrue(atMost.is([0, 0, 0]));

      assert.isFalse(atMost.is([0, 0]));

      assert.isTrue(unbounded.is([0, 0, 0]));

      assert.isFalse(unbounded.is([0, 0]));
    });
  });
});

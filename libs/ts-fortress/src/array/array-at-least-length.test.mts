import { expectType, Result } from 'ts-data-forge';
import { type ArrayAtLeastLen } from 'ts-type-forge';
import { number } from '../primitives/index.mjs';
import { type TypeOf } from '../type.mjs';
import {
  type ValidationError,
  validationErrorsToMessages,
} from '../utils/index.mjs';
import { arrayAtLeastLength } from './array-at-least-length.mjs';

describe(arrayAtLeastLength, () => {
  describe('arg patterns', () => {
    test('without explicit default value', () => {
      assert.deepStrictEqual(
        arrayAtLeastLength(3, number()).defaultValue,
        [0, 0, 0],
      );
    });

    test('with explicit element default value', () => {
      assert.deepStrictEqual(
        arrayAtLeastLength(2, number(5)).defaultValue,
        [5, 5],
      );
    });

    test('with explicit default value override', () => {
      assert.deepStrictEqual(
        arrayAtLeastLength(3, number(), {
          typeName: 'ys',
          defaultValue: [1, 2, 3, 4],
        }).defaultValue,
        [1, 2, 3, 4],
      );
    });
  });

  const xs = arrayAtLeastLength(3, number(), {
    typeName: 'xs',
    defaultValue: [1, 2, 3],
  });

  type Xs = TypeOf<typeof xs>;

  expectType<Xs, ArrayAtLeastLen<3, number>>('=');

  expectType<typeof xs.defaultValue, Xs>('=');

  describe('is', () => {
    test('truthy case', () => {
      const ys: unknown = [4, 5, 6, 7] as const;

      if (xs.is(ys)) {
        expectType<typeof ys, Xs>('=');
      } else {
        expectType<typeof ys, unknown>('=');
      }

      assert.isTrue(xs.is(ys));
    });

    test('falsy case 1', () => {
      const ys: unknown = [1, 2] as const;

      if (xs.is(ys)) {
        expectType<typeof ys, Xs>('=');
      } else {
        expectType<typeof ys, unknown>('=');
      }

      assert.isFalse(xs.is(ys));
    });

    test('falsy case 2', () => {
      const ys: unknown = [1, '2', 3] as const;

      if (xs.is(ys)) {
        expectType<typeof ys, Xs>('=');
      } else {
        expectType<typeof ys, unknown>('=');
      }

      assert.isFalse(xs.is(ys));
    });

    test('falsy case 3', () => {
      const ys: unknown = 'foo';

      if (xs.is(ys)) {
        expectType<typeof ys, Xs>('=');
      } else {
        expectType<typeof ys, unknown>('=');
      }

      assert.isFalse(xs.is(ys));
    });
  });

  describe('validate', () => {
    test('truthy case', () => {
      const ys: unknown = [4, 5, 6, 7] as const;

      const result = xs.validate(ys);

      expectType<typeof result, Result<Xs, readonly ValidationError[]>>('=');

      assert.isTrue(Result.isOk(result));

      const resultValue = Result.unwrapThrow(result);

      assert.deepStrictEqual(resultValue, [4, 5, 6, 7]);
    });

    test('validate returns input as-is for OK cases', () => {
      const input = [4, 5, 6] as const;

      const result = xs.validate(input);

      assert.isTrue(Result.isOk(result));

      const resultValue1 = Result.unwrapThrow(result);

      expect(resultValue1).toBe(input); // ✅ same reference
    });

    test('falsy case 1', () => {
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

    test('falsy case 2', () => {
      const ys: unknown = [1, 2] as const;

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
            kind: 'array-min-length',
            minLength: 3,
            actualLength: 2,
          },
        },
      ]);

      assert.deepStrictEqual(validationErrorsToMessages(resultError), [
        'Error: expected array of length 3 or more but length 2 was passed.',
      ]);
    });

    test('falsy case 3', () => {
      const ys: unknown = [1, '2', 3] as const;

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
    test('keeps numeric entries and trims extras', () => {
      const ys: unknown = [4, 5, 6, 7] as const;

      assert.deepStrictEqual(xs.fill(ys), [4, 5, 6]);
    });

    test('fills missing or invalid entries', () => {
      const ys: unknown = [4, '5'] as const;

      assert.deepStrictEqual(xs.fill(ys), [4, 0, 0]);
    });

    test('fill with the default value for non-array input', () => {
      const ys: unknown = null;

      assert.deepStrictEqual(xs.fill(ys), [1, 2, 3]);
    });
  });
});

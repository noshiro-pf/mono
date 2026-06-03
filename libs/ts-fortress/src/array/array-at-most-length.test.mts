import { expectType, Result } from 'ts-data-forge';
import { type ArrayAtMostLen } from 'ts-type-forge';
import { number } from '../primitives/index.mjs';
import { type TypeOf } from '../type.mjs';
import {
  type ValidationError,
  validationErrorsToMessages,
} from '../utils/index.mjs';
import { arrayAtMostLength } from './array-at-most-length.mjs';

describe(arrayAtMostLength, () => {
  describe('arg patterns', () => {
    test('without explicit default value', () => {
      assert.deepStrictEqual(arrayAtMostLength(3, number()).defaultValue, []);
    });

    test('with explicit default value override', () => {
      assert.deepStrictEqual(
        arrayAtMostLength(3, number(), {
          typeName: 'ys',
          defaultValue: [1, 2, 3],
        }).defaultValue,
        [1, 2, 3],
      );
    });
  });

  const xs = arrayAtMostLength(3, number(), {
    typeName: 'xs',
    defaultValue: [1, 2, 3],
  });

  type Xs = TypeOf<typeof xs>;

  expectType<Xs, ArrayAtMostLen<3, number>>('=');

  expectType<typeof xs.defaultValue, Xs>('=');

  describe('is', () => {
    test('truthy case (max length)', () => {
      const ys: unknown = [4, 5, 6] as const;

      if (xs.is(ys)) {
        expectType<typeof ys, Xs>('=');
      } else {
        expectType<typeof ys, unknown>('=');
      }

      assert.isTrue(xs.is(ys));
    });

    test('truthy case (empty)', () => {
      const ys: unknown = [] as const;

      assert.isTrue(xs.is(ys));
    });

    test('falsy case 1 (too long)', () => {
      const ys: unknown = [1, 2, 3, 4] as const;

      assert.isFalse(xs.is(ys));
    });

    test('falsy case 2 (wrong element type)', () => {
      const ys: unknown = [1, '2', 3] as const;

      assert.isFalse(xs.is(ys));
    });

    test('falsy case 3 (not an array)', () => {
      const ys: unknown = 'foo';

      assert.isFalse(xs.is(ys));
    });
  });

  describe('validate', () => {
    test('truthy case', () => {
      const ys: unknown = [4, 5] as const;

      const result = xs.validate(ys);

      expectType<typeof result, Result<Xs, readonly ValidationError[]>>('=');

      assert.isTrue(Result.isOk(result));

      const resultValue = Result.unwrapThrow(result);

      assert.deepStrictEqual(resultValue, [4, 5]);
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

    test('falsy case 2 (too long)', () => {
      const ys: unknown = [1, 2, 3, 4] as const;

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
            kind: 'array-max-length',
            maxLength: 3,
            actualLength: 4,
          },
        },
      ]);

      assert.deepStrictEqual(validationErrorsToMessages(resultError), [
        'Error: expected array of length 3 or less but length 4 was passed.',
      ]);
    });

    test('falsy case 3 (wrong element type)', () => {
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
    test('keeps numeric entries and trims extras to max', () => {
      const ys: unknown = [4, 5, 6, 7] as const;

      assert.deepStrictEqual(xs.fill(ys), [4, 5, 6]);
    });

    test('keeps shorter arrays as-is and fills invalid entries', () => {
      const ys: unknown = [4, '5'] as const;

      assert.deepStrictEqual(xs.fill(ys), [4, 0]);
    });

    test('keeps the empty array', () => {
      const ys: unknown = [] as const;

      assert.deepStrictEqual(xs.fill(ys), []);
    });

    test('fill with the default value for non-array input', () => {
      const ys: unknown = null;

      assert.deepStrictEqual(xs.fill(ys), [1, 2, 3]);
    });
  });
});

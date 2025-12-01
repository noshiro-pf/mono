import { expectType, Result } from 'ts-data-forge';
import { number } from '../primitives/index.mjs';
import { type TypeOf } from '../type.mjs';
import {
  type ValidationError,
  validationErrorsToMessages,
} from '../utils/index.mjs';
import { arrayOfLength } from './array-of-length.mjs';

describe(arrayOfLength, () => {
  describe('arg patterns', () => {
    test('without explicit default value', () => {
      assert.deepStrictEqual(
        arrayOfLength(3, number()).defaultValue,
        [0, 0, 0],
      );
    });

    test('with explicit default value, case 1', () => {
      assert.deepStrictEqual(
        arrayOfLength(3, number(2)).defaultValue,
        [2, 2, 2],
      );
    });

    test('with explicit default value, case 2', () => {
      assert.deepStrictEqual(
        arrayOfLength(4, number(), {
          typeName: 'xs',
          defaultValue: [1, 2, 3, 4],
        }).defaultValue,
        [1, 2, 3, 4],
      );
    });
  });

  const xs = arrayOfLength(4, number(), {
    typeName: 'xs',
    defaultValue: [1, 2, 3, 4],
  });

  type Xs = TypeOf<typeof xs>;

  expectType<Xs, ArrayOfLength<4, number>>('=');

  expectType<typeof xs.defaultValue, Xs>('=');

  describe('is', () => {
    test('truthy case', () => {
      const ys: unknown = [5, 6, 7, 8];

      if (xs.is(ys)) {
        expectType<typeof ys, Xs>('=');
      } else {
        expectType<typeof ys, unknown>('=');
      }

      assert.isTrue(xs.is(ys));
    });

    test('falsy case 1', () => {
      const ys: unknown = [];

      if (xs.is(ys)) {
        expectType<typeof ys, Xs>('=');
      } else {
        expectType<typeof ys, unknown>('=');
      }

      assert.isFalse(xs.is(ys));
    });

    test('falsy case 2', () => {
      const ys: unknown = ['1', '', 3];

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
      const ys: unknown = [5, 6, 7, 8];

      const result = xs.validate(ys);

      expectType<typeof result, Result<Xs, readonly ValidationError[]>>('=');

      assert.isTrue(Result.isOk(result));

      const resultValue = Result.unwrapThrow(result);

      assert.deepStrictEqual(resultValue, [5, 6, 7, 8]);
    });

    test('validate returns input as-is for OK cases', () => {
      const input = [5, 6, 7, 8];

      const result = xs.validate(input);

      assert.isTrue(Result.isOk(result));

      const resultValue1 = Result.unwrapThrow(result);

      expect(resultValue1).toBe(input); // ✅ same reference
    });

    test('falsy case 1', () => {
      const ys: unknown = [];

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
            kind: 'array-length',
            expectedLength: 4,
            actualLength: 0,
          },
        },
      ]);

      assert.deepStrictEqual(validationErrorsToMessages(resultError), [
        'Error: expected array of length 4 but length 0 was passed.',
      ]);
    });

    test('falsy case 2', () => {
      const ys: unknown = [0, '1', '', 3];

      const result = xs.validate(ys);

      assert.isTrue(Result.isErr(result));

      const resultError1 = Result.unwrapErrThrow(result);

      assert.deepStrictEqual(resultError1, [
        {
          path: ['1'],
          actualValue: '1',
          expectedType: 'number',
          typeName: 'number',
          details: undefined,
        },
        {
          path: ['2'],
          actualValue: '',
          expectedType: 'number',
          typeName: 'number',
          details: undefined,
        },
      ]);

      assert.deepStrictEqual(validationErrorsToMessages(resultError1), [
        'Error at 1: expected <number> value but <string> type value "1" was passed.',
        'Error at 2: expected <number> value but <string> type value "" was passed.',
      ]);
    });
  });

  describe('fill', () => {
    test('noop', () => {
      const ys: unknown = [1, 2, 3];

      assert.deepStrictEqual(xs.fill(ys), [1, 2, 3, 0]);
    });

    test('fill with the default value', () => {
      const ys: unknown = ['1', '', 3];

      assert.deepStrictEqual(xs.fill(ys), [0, 0, 3, 0]);
    });

    test('fill empty array', () => {
      const ys: unknown = [];

      assert.deepStrictEqual(xs.fill(ys), [0, 0, 0, 0]);
    });
  });
});

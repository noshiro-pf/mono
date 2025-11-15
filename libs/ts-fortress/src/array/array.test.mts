import { expectType, Result } from 'ts-data-forge';
import { number } from '../primitives/index.mjs';
import { type TypeOf } from '../type.mjs';
import {
  type ValidationError,
  validationErrorsToMessages,
} from '../utils/index.mjs';
import { array } from './array.mjs';

describe(array, () => {
  describe('arg patterns', () => {
    test('without explicit default value', () => {
      assert.deepStrictEqual(array(number()).defaultValue, []);
    });

    test('with explicit default value', () => {
      assert.deepStrictEqual(
        array(number(), {
          typeName: 'xs',
          defaultValue: [],
        }).defaultValue,
        [],
      );
    });
  });

  const xs = array(number(), {
    typeName: 'xs',
    defaultValue: [],
  });

  type Xs = TypeOf<typeof xs>;

  expectType<Xs, readonly number[]>('=');

  expectType<typeof xs.defaultValue, Xs>('=');

  describe('is', () => {
    test('truthy case', () => {
      const ys: unknown = [1, 2, 3];

      if (xs.is(ys)) {
        expectType<typeof ys, Xs>('=');
      } else {
        expectType<typeof ys, unknown>('=');
      }

      expect(xs.is(ys)).toBe(true);
    });

    test('falsy case', () => {
      const ys: unknown = ['1', '', 3];

      if (xs.is(ys)) {
        expectType<typeof ys, Xs>('=');
      } else {
        expectType<typeof ys, unknown>('=');
      }

      expect(xs.is(ys)).toBe(false);
    });
  });

  describe('validate', () => {
    test('truthy case', () => {
      const ys: unknown = [1, 2, 3];

      const result = xs.validate(ys);

      expectType<typeof result, Result<Xs, readonly ValidationError[]>>('=');

      expect(Result.isOk(result)).toBe(true);

      const resultValue = Result.unwrapThrow(result);

      assert.deepStrictEqual(resultValue, [1, 2, 3]);
    });

    test('falsy case', () => {
      const ys: unknown = ['1', '', 3];

      expect(xs.is(ys)).toBe(false);

      const result = xs.validate(ys);

      expect(Result.isErr(result)).toBe(true);

      const resultError = Result.unwrapErrThrow(result);

      // Test that we have structured ValidationError objects

      assert.deepStrictEqual(resultError, [
        {
          path: ['0'],
          actualValue: '1',
          expectedType: 'number',
          typeName: 'number',
          details: undefined,
        },
        {
          path: ['1'],
          actualValue: '',
          expectedType: 'number',
          typeName: 'number',
          details: undefined,
        },
      ]);

      // Test that we can convert to legacy string format for backward compatibility

      assert.deepStrictEqual(validationErrorsToMessages(resultError), [
        'Error at 0: expected <number> value but <string> type value "1" was passed.',
        'Error at 1: expected <number> value but <string> type value "" was passed.',
      ]);
    });

    test('validate returns input as-is for OK cases', () => {
      const input = [10, 20, 30];
      const result = xs.validate(input);

      expect(Result.isOk(result)).toBe(true);

      const resultValue1 = Result.unwrapThrow(result);

      expect(resultValue1).toBe(input); // ✅ same reference
    });
  });

  describe('fill', () => {
    test('noop', () => {
      const ys: unknown = [1, 2, 3];

      assert.deepStrictEqual(xs.fill(ys), [1, 2, 3]);
    });

    test('fill with the default value', () => {
      const ys: unknown = ['1', '', 3];

      assert.deepStrictEqual(xs.fill(ys), [0, 0, 3]);
    });
  });
});

import { expectType, Result } from 'ts-data-forge';
import { number } from '../primitives/index.mjs';
import { type TypeOf } from '../type.mjs';
import {
  type ValidationError,
  validationErrorsToMessages,
} from '../utils/index.mjs';
import { nonEmptyArray } from './non-empty-array.mjs';

describe(nonEmptyArray, () => {
  describe('arg patterns', () => {
    test('without explicit default value', () => {
      assert.deepStrictEqual(nonEmptyArray(number()).defaultValue, [0]);
    });

    test('with explicit default value, case 1', () => {
      assert.deepStrictEqual(nonEmptyArray(number(1)).defaultValue, [1]);
    });

    test('with explicit default value, case 2', () => {
      assert.deepStrictEqual(
        nonEmptyArray(number(), {
          typeName: 'xs',
          defaultValue: [2],
        }).defaultValue,
        [2],
      );
    });
  });

  const xs = nonEmptyArray(number(), {
    defaultValue: [1],
    typeName: 'xs',
  });

  type Xs = TypeOf<typeof xs>;

  expectType<Xs, NonEmptyArray<number>>('=');

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

    test('falsy case 1', () => {
      const ys: unknown = [];

      if (xs.is(ys)) {
        expectType<typeof ys, Xs>('=');
      } else {
        expectType<typeof ys, unknown>('=');
      }

      expect(xs.is(ys)).toBe(false);
    });

    test('falsy case 2', () => {
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

    test('validate returns input as-is for OK cases', () => {
      const input = [1, 2, 3];
      const result = xs.validate(input);

      expect(Result.isOk(result)).toBe(true);

      const resultValue1 = Result.unwrapThrow(result);

      expect(resultValue1).toBe(input); // ✅ same reference
    });

    test('falsy case 1', () => {
      const ys: unknown = [];

      const result = xs.validate(ys);

      expect(Result.isErr(result)).toBe(true);

      const resultError = Result.unwrapErrThrow(result);

      assert.deepStrictEqual(resultError, [
        {
          path: [],
          actualValue: ys,
          expectedType: 'xs',
          typeName: 'xs',
          message: 'Expected non-empty array, got empty array',
        },
      ]);

      assert.deepStrictEqual(validationErrorsToMessages(resultError), [
        'Expected non-empty array, got empty array',
      ]);
    });

    test('falsy case 2', () => {
      const ys: unknown = ['1', '', 3];

      const result = xs.validate(ys);

      expect(Result.isErr(result)).toBe(true);

      const resultError1 = Result.unwrapErrThrow(result);

      assert.deepStrictEqual(resultError1, [
        {
          path: ['0'],
          actualValue: '1',
          expectedType: 'number',
          typeName: 'number',
          message: undefined,
        },
        {
          path: ['1'],
          actualValue: '',
          expectedType: 'number',
          typeName: 'number',
          message: undefined,
        },
      ]);

      assert.deepStrictEqual(validationErrorsToMessages(resultError1), [
        'Expected <number> at 0, got <string> type value "1".',
        'Expected <number> at 1, got <string> type value "".',
      ]);
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

    test('fill empty array', () => {
      const ys: unknown = [];

      assert.deepStrictEqual(xs.fill(ys), [1]);
    });
  });
});

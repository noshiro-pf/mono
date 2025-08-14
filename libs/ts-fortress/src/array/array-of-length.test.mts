import { expectType, Result } from 'ts-data-forge';
import { number } from '../primitives/index.mjs';
import { type TypeOf } from '../type.mjs';
import {
  type ValidationError,
  validationErrorsToMessages,
} from '../validation-error.mjs';
import { arrayOfLength } from './array-of-length.mjs';

describe('arrayOfLength', () => {
  describe('arg patterns', () => {
    test('without explicit default value', () => {
      expect(arrayOfLength(3, number()).defaultValue).toStrictEqual([0, 0, 0]);
    });

    test('with explicit default value, case 1', () => {
      expect(arrayOfLength(3, number(2)).defaultValue).toStrictEqual([2, 2, 2]);
    });

    test('with explicit default value, case 2', () => {
      expect(
        arrayOfLength(4, number(0), {
          typeName: 'xs',
          defaultValue: [1, 2, 3, 4],
        }).defaultValue,
      ).toStrictEqual([1, 2, 3, 4]);
    });
  });

  const xs = arrayOfLength(4, number(0), {
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
      const ys: unknown = [5, 6, 7, 8];

      const result = xs.validate(ys);
      expectType<typeof result, Result<Xs, readonly ValidationError[]>>('=');
      expect(Result.isOk(result)).toBe(true);

      if (Result.isOk(result)) {
        expect(result.value).toStrictEqual([5, 6, 7, 8]);
      }
    });

    test('falsy case 1', () => {
      const ys: unknown = [];

      const result = xs.validate(ys);
      expect(Result.isErr(result)).toBe(true);

      if (Result.isErr(result)) {
        expect(result.value).toStrictEqual([
          {
            path: [],
            actualValue: ys,
            expectedType: 'xs',
            typeName: 'xs',
            message: 'Expected array of length 4, got length 0',
          },
        ]);

        expect(validationErrorsToMessages(result.value)).toStrictEqual([
          'Expected array of length 4, got length 0',
        ]);
      }
    });

    test('falsy case 2', () => {
      const ys: unknown = [0, '1', '', 3];

      const result = xs.validate(ys);
      expect(Result.isErr(result)).toBe(true);

      if (Result.isErr(result)) {
        expect(result.value).toStrictEqual([
          {
            path: ['1'],
            actualValue: '1',
            expectedType: 'number',
            typeName: 'number',
            message: undefined,
          },
          {
            path: ['2'],
            actualValue: '',
            expectedType: 'number',
            typeName: 'number',
            message: undefined,
          },
        ]);

        expect(validationErrorsToMessages(result.value)).toStrictEqual([
          'Expected number at 1, got string',
          'Expected number at 2, got string',
        ]);
      }
    });
  });

  describe('fill', () => {
    test('noop', () => {
      const ys: unknown = [1, 2, 3];

      expect(xs.fill(ys)).toStrictEqual([1, 2, 3, 0]);
    });

    test('fill with the default value', () => {
      const ys: unknown = ['1', '', 3];

      expect(xs.fill(ys)).toStrictEqual([0, 0, 3, 0]);
    });

    test('fill empty array', () => {
      const ys: unknown = [];

      expect(xs.fill(ys)).toStrictEqual([0, 0, 0, 0]);
    });
  });
});

import { expectType, Result } from 'ts-data-forge';
import { number } from '../primitives/index.mjs';
import { type TypeOf } from '../type.mjs';
import {
  type ValidationError,
  validationErrorsToMessages,
} from '../validation-error.mjs';
import { array } from './array.mjs';

describe('array', () => {
  describe('arg patterns', () => {
    test('without explicit default value', () => {
      expect(array(number()).defaultValue).toStrictEqual([]);
    });

    test('with explicit default value', () => {
      expect(
        array(number(0), {
          typeName: 'xs',
          defaultValue: [],
        }).defaultValue,
      ).toStrictEqual([]);
    });
  });

  const xs = array(number(0), {
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

      if (Result.isOk(result)) {
        expect(result.value).toStrictEqual([1, 2, 3]);
      }
    });

    test('falsy case', () => {
      const ys: unknown = ['1', '', 3];

      expect(xs.is(ys)).toBe(false);
      const result = xs.validate(ys);
      expect(Result.isErr(result)).toBe(true);

      if (Result.isErr(result)) {
        // Test that we have structured ValidationError objects
        expect(result.value).toStrictEqual([
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

        // Test that we can convert to legacy string format for backward compatibility
        expect(validationErrorsToMessages(result.value)).toStrictEqual([
          'Expected number at 0, got string',
          'Expected number at 1, got string',
        ]);
      } else {
        throw new Error('Expected validation to fail');
      }
    });
  });

  describe('fill', () => {
    test('noop', () => {
      const ys: unknown = [1, 2, 3];

      expect(xs.fill(ys)).toStrictEqual([1, 2, 3]);
    });

    test('fill with the default value', () => {
      const ys: unknown = ['1', '', 3];

      expect(xs.fill(ys)).toStrictEqual([0, 0, 3]);
    });
  });
});

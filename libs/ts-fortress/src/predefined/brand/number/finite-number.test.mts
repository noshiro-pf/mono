import { asFiniteNumber, expectType, Result } from 'ts-data-forge';
import { type TypeOf } from '../../../type.mjs';
import { validationErrorsToMessages } from '../../../utils/index.mjs';
import { finiteNumber } from './finite-number.mjs';

describe('finiteNumber', () => {
  const targetType = finiteNumber(asFiniteNumber(0));

  type TargetType = TypeOf<typeof targetType>;

  expectType<TargetType, FiniteNumber>('=');

  expectType<typeof targetType.defaultValue, TargetType>('=');

  describe('is', () => {
    test('truthy case', () => {
      const x: unknown = 123.456;

      if (targetType.is(x)) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      expect(targetType.is(x)).toBe(true);
    });

    test('falsy case - infinity', () => {
      const x: unknown = Number.POSITIVE_INFINITY;

      if (targetType.is(x)) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      expect(targetType.is(x)).toBe(false);
    });

    test('falsy case - NaN', () => {
      const x: unknown = Number.NaN;

      if (targetType.is(x)) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      expect(targetType.is(x)).toBe(false);
    });

    test('falsy case - string', () => {
      const x: unknown = '123';

      if (targetType.is(x)) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      expect(targetType.is(x)).toBe(false);
    });
  });

  describe('validate', () => {
    test('truthy case', () => {
      const result = targetType.validate(-42.5);
      expect(Result.isOk(result)).toBe(true);

      const resultValue = Result.unwrapThrow(result);
      expect(resultValue).toBe(-42.5);
    });

    test('validate returns input as-is for OK cases', () => {
      const input = 123.456;
      const result = targetType.validate(input);
      expect(Result.isOk(result)).toBe(true);
      const resultValue1 = Result.unwrapThrow(result);
      expect(resultValue1).toBe(input); // ✅ same reference
    });

    test('falsy case - infinity', () => {
      const result = targetType.validate(Number.POSITIVE_INFINITY);
      expect(Result.isErr(result)).toBe(true);

      const resultError = Result.unwrapErrThrow(result);
      expect(resultError).toStrictEqual([
        {
          path: [],
          actualValue: Number.POSITIVE_INFINITY,
          expectedType: 'FiniteNumber',
          typeName: 'FiniteNumber',
          message: undefined,
        },
      ]);
    });

    test('falsy case - string', () => {
      const result = targetType.validate('not a number');
      expect(Result.isErr(result)).toBe(true);

      const resultError1 = Result.unwrapErrThrow(result);
      expect(resultError1).toStrictEqual([
        {
          path: [],
          actualValue: 'not a number',
          expectedType: 'number',
          typeName: 'number',
          message: undefined,
        },
      ]);

      expect(validationErrorsToMessages(resultError1)).toStrictEqual([
        'Expected <number>, got <string> type value "not a number".',
      ]);
    });
  });

  describe('assertIs', () => {
    test('truthy case', () => {
      const x: unknown = -42.123;

      const assertIs: (a: unknown) => asserts a is TargetType =
        targetType.assertIs;
      expect(() => {
        assertIs(x);
      }).not.toThrow();
    });

    test('falsy case', () => {
      const x: unknown = Number.NaN;

      const assertIs: (a: unknown) => asserts a is TargetType =
        targetType.assertIs;
      expect(() => {
        assertIs(x);
      }).toThrow('Expected <FiniteNumber>');
    });
  });

  describe('cast', () => {
    test('truthy case', () => {
      const x: unknown = 100.5;

      expect(targetType.cast(x)).toBe(100.5);
    });

    test('falsy case', () => {
      const x: unknown = 'invalid';

      expect(() => targetType.cast(x)).toThrow('Expected');
    });
  });

  describe('fill', () => {
    test('noop', () => {
      const x: unknown = -123.456;

      expect(targetType.fill(x)).toBe(-123.456);
    });

    test('fill with the default value', () => {
      const x: unknown = 'not a finite number';

      expect(targetType.fill(x)).toBe(0);
    });
  });
});

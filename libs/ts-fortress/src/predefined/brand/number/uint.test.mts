import { asUint, expectType, isNumber, isUint, Result } from 'ts-data-forge';
import { type TypeOf } from '../../../type.mjs';
import { validationErrorsToMessages } from '../../../utils/index.mjs';
import { uint } from './uint.mjs';

describe('uint', () => {
  const targetType = uint(asUint(0));

  type TargetType = TypeOf<typeof targetType>;

  expectType<TargetType, Uint>('=');

  expectType<typeof targetType.defaultValue, TargetType>('=');

  describe('is', () => {
    test('truthy case', () => {
      const x: unknown = 123;

      const isTarget = targetType.is(x);

      if (isTarget) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      expect(isTarget).toBe(true);
      assert(isNumber(x));
      expect(isUint(x)).toBe(true);
    });

    test('truthy case - zero', () => {
      const x: unknown = 0;

      const isTarget = targetType.is(x);

      if (isTarget) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      expect(isTarget).toBe(true);
    });

    test('falsy case - negative', () => {
      const x: unknown = -5;

      const isTarget = targetType.is(x);

      if (isTarget) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      expect(isTarget).toBe(false);
    });

    test('falsy case - float', () => {
      const x: unknown = 123.456;

      const isTarget = targetType.is(x);

      if (isTarget) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      expect(isTarget).toBe(false);
    });
  });

  describe('validate', () => {
    test('truthy case', () => {
      const result = targetType.validate(42);
      expect(Result.isOk(result)).toBe(true);

      const resultValue = Result.unwrapThrow(result);
      expect(resultValue).toBe(42);
    });

    test('validate returns input as-is for OK cases', () => {
      const input = 123;
      const result = targetType.validate(input);
      expect(Result.isOk(result)).toBe(true);
      const resultValue1 = Result.unwrapThrow(result);
      expect(resultValue1).toBe(input); // ✅ same reference
    });

    test('falsy case - negative', () => {
      const result = targetType.validate(-5);
      expect(Result.isErr(result)).toBe(true);

      const resultError = Result.unwrapErrThrow(result);
      expect(resultError).toStrictEqual([
        {
          path: [],
          actualValue: -5,
          expectedType: 'Uint',
          typeName:
            '"Finite" & "Int" & "> -2^32" & ">= -2^31" & "> -2^16" & ">= -2^15" & ">=0" & not("NaNValue")',
          message: undefined,
        },
      ]);
      expect(validationErrorsToMessages(resultError)).toStrictEqual([
        'Expected <Uint>, got <number> type value `-5`.',
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
      const x: unknown = 42;

      const assertIs: (a: unknown) => asserts a is TargetType =
        targetType.assertIs;
      expect(() => {
        assertIs(x);
      }).not.toThrow();
    });

    test('falsy case', () => {
      const x: unknown = -42;

      const assertIs: (a: unknown) => asserts a is TargetType =
        targetType.assertIs;
      expect(() => {
        assertIs(x);
      }).toThrow('Expected <Uint>');
    });
  });

  describe('cast', () => {
    test('truthy case', () => {
      const x: unknown = 100;

      expect(targetType.cast(x)).toBe(100);
    });

    test('falsy case', () => {
      const x: unknown = 'invalid';

      expect(() => targetType.cast(x)).toThrow('Expected');
    });
  });

  describe('fill', () => {
    test('noop', () => {
      const x: unknown = 123;

      expect(targetType.fill(x)).toBe(123);
    });

    test('fill with the default value', () => {
      const x: unknown = 'not a uint';

      expect(targetType.fill(x)).toBe(0);
    });
  });
});

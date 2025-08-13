import { asInt, expectType, Result } from 'ts-data-forge';
import { type TypeOf } from '../../type.mjs';
import { validationErrorsToMessages } from '../../validation-error.mjs';
import { int } from './int.mjs';

describe('int', () => {
  const targetType = int(asInt(0));

  type TargetType = TypeOf<typeof targetType>;

  expectType<TargetType, Int>('=');

  expectType<typeof targetType.defaultValue, TargetType>('=');

  describe('is', () => {
    test('truthy case', () => {
      const x: unknown = 123;

      if (targetType.is(x)) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      expect(targetType.is(x)).toBe(true);
    });

    test('falsy case - float', () => {
      const x: unknown = 123.456;

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
      const result = targetType.validate(42);
      expect(Result.isOk(result)).toBe(true);

      if (Result.isOk(result)) {
        expect(result.value).toBe(42);
      }
    });

    test('falsy case - float', () => {
      const result = targetType.validate(42.5);
      expect(Result.isErr(result)).toBe(true);

      if (Result.isErr(result)) {
        expect(result.value).toStrictEqual([
          {
            path: [],
            actualValue: 42.5,
            expectedType: 'Finite & Int & not(NaNValue)',
            typeName: 'Finite & Int & not(NaNValue)',
            message:
              'The value must satisfy the constraint corresponding to the brand keys: <Finite & Int & not(NaNValue)>',
          },
        ]);

        expect(validationErrorsToMessages(result.value)).toStrictEqual([
          'The value must satisfy the constraint corresponding to the brand keys: <Finite & Int & not(NaNValue)>',
        ]);
      }
    });

    test('falsy case - string', () => {
      const result = targetType.validate('not a number');
      expect(Result.isErr(result)).toBe(true);

      if (Result.isErr(result)) {
        expect(result.value).toStrictEqual([
          {
            path: [],
            actualValue: 'not a number',
            expectedType: 'number',
            typeName: 'number',
            message: undefined,
          },
        ]);

        expect(validationErrorsToMessages(result.value)).toStrictEqual([
          'Expected number, got string',
        ]);
      }
    });
  });

  describe('assertIs', () => {
    test('truthy case', () => {
      const x: unknown = -42;

      const assertIs: (a: unknown) => asserts a is TargetType =
        targetType.assertIs;
      expect(() => {
        assertIs(x);
      }).not.toThrow();
    });

    test('falsy case', () => {
      const x: unknown = 42.5;

      const assertIs: (a: unknown) => asserts a is TargetType =
        targetType.assertIs;
      expect(() => {
        assertIs(x);
      }).toThrow('The value must satisfy the constraint');
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
      const x: unknown = -123;

      expect(targetType.fill(x)).toBe(-123);
    });

    test('fill with the default value', () => {
      const x: unknown = 'not an int';

      expect(targetType.fill(x)).toBe(0);
    });
  });
});

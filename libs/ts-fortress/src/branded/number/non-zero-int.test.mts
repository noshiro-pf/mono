import { asNonZeroInt, expectType, isNonZeroInt, Result } from 'ts-data-forge';
import { type TypeOf } from '../../type.mjs';
import { validationErrorsToMessages } from '../../validation-error.mjs';
import { nonZeroInt } from './non-zero-int.mjs';

describe('nonZeroInt', () => {
  const targetType = nonZeroInt(asNonZeroInt(1));

  type TargetType = TypeOf<typeof targetType>;

  expectType<TargetType, NonZeroInt>('=');

  expectType<typeof targetType.defaultValue, TargetType>('=');

  describe('is', () => {
    test('truthy case - positive', () => {
      const x: unknown = 123;

      if (targetType.is(x)) {
        expectType<typeof x, TargetType>('=');
        expect(isNonZeroInt(x)).toBe(true);
      } else {
        expectType<typeof x, unknown>('=');
      }

      expect(targetType.is(x)).toBe(true);
    });

    test('truthy case - negative', () => {
      const x: unknown = -42;

      expect(targetType.is(x)).toBe(true);
    });

    test('falsy case - zero', () => {
      const x: unknown = 0;

      if (targetType.is(x)) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      expect(targetType.is(x)).toBe(false);
    });

    test('falsy case - float', () => {
      const x: unknown = 123.456;

      expect(targetType.is(x)).toBe(false);
    });
  });

  describe('validate', () => {
    test('truthy case', () => {
      const result = targetType.validate(-42);
      expect(Result.isOk(result)).toBe(true);

      if (Result.isOk(result)) {
        expect(result.value).toBe(-42);
      }
    });

    test('falsy case - zero', () => {
      const result = targetType.validate(0);
      expect(Result.isErr(result)).toBe(true);

      if (Result.isErr(result)) {
        expect(result.value).toStrictEqual([
          {
            path: [],
            actualValue: 0,
            expectedType: 'Finite & Int & !=0 & not(NaNValue)',
            typeName: 'Finite & Int & !=0 & not(NaNValue)',
            message:
              'The value must satisfy the constraint corresponding to the brand keys: <Finite & Int & !=0 & not(NaNValue)>',
          },
        ]);
        expect(validationErrorsToMessages(result.value)).toStrictEqual([
          'The value must satisfy the constraint corresponding to the brand keys: <Finite & Int & !=0 & not(NaNValue)>',
        ]);
      }
    });
  });

  describe('cast', () => {
    test('truthy case', () => {
      const x: unknown = -100;

      expect(targetType.cast(x)).toBe(-100);
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
      const x: unknown = 'not a non-zero int';

      expect(targetType.fill(x)).toBe(1);
    });
  });
});

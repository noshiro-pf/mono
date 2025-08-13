import { asInt16, expectType, isInt16, Result } from 'ts-data-forge';
import { type TypeOf } from '../../type.mjs';
import { validationErrorsToMessages } from '../../validation-error.mjs';
import { int16 } from './int16.mjs';

describe('int16', () => {
  const targetType = int16(asInt16(0));

  type TargetType = TypeOf<typeof targetType>;

  expectType<TargetType, Int16>('=');

  expectType<typeof targetType.defaultValue, TargetType>('=');

  describe('is', () => {
    test('truthy case', () => {
      const x: unknown = 1000;

      if (targetType.is(x)) {
        expectType<typeof x, TargetType>('=');
        expect(isInt16(x)).toBe(true);
      } else {
        expectType<typeof x, unknown>('=');
      }

      expect(targetType.is(x)).toBe(true);
    });

    test('falsy case - too large', () => {
      const x: unknown = 40000;

      if (targetType.is(x)) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      expect(targetType.is(x)).toBe(false);
    });

    test('falsy case - too small', () => {
      const x: unknown = -40000;

      expect(targetType.is(x)).toBe(false);
    });

    test('falsy case - float', () => {
      const x: unknown = 123.456;

      expect(targetType.is(x)).toBe(false);
    });
  });

  describe('validate', () => {
    test('truthy case', () => {
      const result = targetType.validate(-1000);
      expect(Result.isOk(result)).toBe(true);

      if (Result.isOk(result)) {
        expect(result.value).toBe(-1000);
      }
    });

    test('falsy case - out of range', () => {
      const result = targetType.validate(50000);
      expect(Result.isErr(result)).toBe(true);

      if (Result.isErr(result)) {
        expect(result.value).toStrictEqual([
          {
            path: [],
            actualValue: 50000,
            expectedType:
              'Finite & Int & SafeInt & > -2^32 & >= -2^31 & < 2^32 & < 2^31 & < 2^15 & < 2^16 & > -2^16 & >= -2^15 & not(NaNValue)',
            typeName:
              'Finite & Int & SafeInt & > -2^32 & >= -2^31 & < 2^32 & < 2^31 & < 2^15 & < 2^16 & > -2^16 & >= -2^15 & not(NaNValue)',
            message:
              'The value must satisfy the constraint corresponding to the brand keys: <Finite & Int & SafeInt & > -2^32 & >= -2^31 & < 2^32 & < 2^31 & < 2^15 & < 2^16 & > -2^16 & >= -2^15 & not(NaNValue)>',
          },
        ]);
        expect(validationErrorsToMessages(result.value)).toStrictEqual([
          'The value must satisfy the constraint corresponding to the brand keys: <Finite & Int & SafeInt & > -2^32 & >= -2^31 & < 2^32 & < 2^31 & < 2^15 & < 2^16 & > -2^16 & >= -2^15 & not(NaNValue)>',
        ]);
      }
    });
  });

  describe('cast', () => {
    test('truthy case', () => {
      const x: unknown = 15000;

      expect(targetType.cast(x)).toBe(15000);
    });

    test('falsy case', () => {
      const x: unknown = 'invalid';

      expect(() => targetType.cast(x)).toThrow('Expected');
    });
  });

  describe('fill', () => {
    test('noop', () => {
      const x: unknown = -5000;

      expect(targetType.fill(x)).toBe(-5000);
    });

    test('fill with the default value', () => {
      const x: unknown = 'not an int16';

      expect(targetType.fill(x)).toBe(0);
    });
  });
});

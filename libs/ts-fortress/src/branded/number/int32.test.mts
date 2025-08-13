import { asInt32, expectType, isInt32, Result } from 'ts-data-forge';
import { type TypeOf } from '../../type.mjs';
import { validationErrorsToMessages } from '../../validation-error.mjs';
import { int32 } from './int32.mjs';

describe('int32', () => {
  const targetType = int32(asInt32(0));

  type TargetType = TypeOf<typeof targetType>;

  expectType<TargetType, Int32>('=');

  expectType<typeof targetType.defaultValue, TargetType>('=');

  describe('is', () => {
    test('truthy case', () => {
      const x: unknown = 1000000;

      if (targetType.is(x)) {
        expectType<typeof x, TargetType>('=');
        expect(isInt32(x)).toBe(true);
      } else {
        expectType<typeof x, unknown>('=');
      }

      expect(targetType.is(x)).toBe(true);
    });

    test('falsy case - too large', () => {
      const x: unknown = 3000000000;

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
      const result = targetType.validate(-1000000);
      expect(Result.isOk(result)).toBe(true);

      if (Result.isOk(result)) {
        expect(result.value).toBe(-1000000);
      }
    });

    test('falsy case - out of range', () => {
      const result = targetType.validate(3000000000);
      expect(Result.isErr(result)).toBe(true);

      if (Result.isErr(result)) {
        expect(result.value).toStrictEqual([
          {
            path: [],
            actualValue: 3000000000,
            expectedType:
              'Finite & Int & SafeInt & > -2^32 & >= -2^31 & < 2^32 & < 2^31 & not(NaNValue)',
            typeName:
              'Finite & Int & SafeInt & > -2^32 & >= -2^31 & < 2^32 & < 2^31 & not(NaNValue)',
            message:
              'The value must satisfy the constraint corresponding to the brand keys: <Finite & Int & SafeInt & > -2^32 & >= -2^31 & < 2^32 & < 2^31 & not(NaNValue)>',
          },
        ]);
        expect(validationErrorsToMessages(result.value)).toStrictEqual([
          'The value must satisfy the constraint corresponding to the brand keys: <Finite & Int & SafeInt & > -2^32 & >= -2^31 & < 2^32 & < 2^31 & not(NaNValue)>',
        ]);
      }
    });
  });

  describe('cast', () => {
    test('truthy case', () => {
      const x: unknown = 150000000;

      expect(targetType.cast(x)).toBe(150000000);
    });

    test('falsy case', () => {
      const x: unknown = 'invalid';

      expect(() => targetType.cast(x)).toThrow('Expected');
    });
  });

  describe('fill', () => {
    test('noop', () => {
      const x: unknown = -50000000;

      expect(targetType.fill(x)).toBe(-50000000);
    });

    test('fill with the default value', () => {
      const x: unknown = 'not an int32';

      expect(targetType.fill(x)).toBe(0);
    });
  });
});

import { asUint16, expectType, isUint16, Result } from 'ts-data-forge';
import { type TypeOf } from '../../type.mjs';
import { validationErrorsToMessages } from '../../validation-error.mjs';
import { uint16 } from './uint16.mjs';

describe('uint16', () => {
  const targetType = uint16(asUint16(0));

  type TargetType = TypeOf<typeof targetType>;

  expectType<TargetType, Uint16>('=');

  expectType<typeof targetType.defaultValue, TargetType>('=');

  describe('is', () => {
    test('truthy case', () => {
      const x: unknown = 30000;

      if (targetType.is(x)) {
        expectType<typeof x, TargetType>('=');
        expect(isUint16(x)).toBe(true);
      } else {
        expectType<typeof x, unknown>('=');
      }

      expect(targetType.is(x)).toBe(true);
    });

    test('truthy case - zero', () => {
      const x: unknown = 0;

      expect(targetType.is(x)).toBe(true);
    });

    test('falsy case - negative', () => {
      const x: unknown = -1;

      if (targetType.is(x)) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      expect(targetType.is(x)).toBe(false);
    });

    test('falsy case - too large', () => {
      const x: unknown = 70000;

      expect(targetType.is(x)).toBe(false);
    });

    test('falsy case - float', () => {
      const x: unknown = 123.456;

      expect(targetType.is(x)).toBe(false);
    });
  });

  describe('validate', () => {
    test('truthy case', () => {
      const result = targetType.validate(50000);
      expect(Result.isOk(result)).toBe(true);

      if (Result.isOk(result)) {
        expect(result.value).toBe(50000);
      }
    });

    test('falsy case - negative', () => {
      const result = targetType.validate(-5);
      expect(Result.isErr(result)).toBe(true);

      if (Result.isErr(result)) {
        expect(result.value).toStrictEqual([
          {
            path: [],
            actualValue: -5,
            expectedType:
              'Finite & Int & SafeInt & > -2^16 & > -2^32 & >= -2^15 & >= -2^31 & >=0 & < 2^32 & < 2^16 & < 2^31 & not(NaNValue)',
            typeName:
              'Finite & Int & SafeInt & > -2^16 & > -2^32 & >= -2^15 & >= -2^31 & >=0 & < 2^32 & < 2^16 & < 2^31 & not(NaNValue)',
            message:
              'The value must satisfy the constraint corresponding to the brand keys: <Finite & Int & SafeInt & > -2^16 & > -2^32 & >= -2^15 & >= -2^31 & >=0 & < 2^32 & < 2^16 & < 2^31 & not(NaNValue)>',
          },
        ]);
        expect(validationErrorsToMessages(result.value)).toStrictEqual([
          'The value must satisfy the constraint corresponding to the brand keys: <Finite & Int & SafeInt & > -2^16 & > -2^32 & >= -2^15 & >= -2^31 & >=0 & < 2^32 & < 2^16 & < 2^31 & not(NaNValue)>',
        ]);
      }
    });
  });

  describe('cast', () => {
    test('truthy case', () => {
      const x: unknown = 40000;

      expect(targetType.cast(x)).toBe(40000);
    });

    test('falsy case', () => {
      const x: unknown = 'invalid';

      expect(() => targetType.cast(x)).toThrow('Expected');
    });
  });

  describe('fill', () => {
    test('noop', () => {
      const x: unknown = 25000;

      expect(targetType.fill(x)).toBe(25000);
    });

    test('fill with the default value', () => {
      const x: unknown = 'not a uint16';

      expect(targetType.fill(x)).toBe(0);
    });
  });
});

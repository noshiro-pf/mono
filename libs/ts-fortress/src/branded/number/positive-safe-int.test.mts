import {
  asPositiveSafeInt,
  expectType,
  isPositiveSafeInt,
  Result,
} from 'ts-data-forge';
import { type TypeOf } from '../../type.mjs';
import { validationErrorsToMessages } from '../../utils/index.mjs';
import { positiveSafeInt } from './positive-safe-int.mjs';

describe('positiveSafeInt', () => {
  const targetType = positiveSafeInt(asPositiveSafeInt(1));

  type TargetType = TypeOf<typeof targetType>;

  expectType<TargetType, PositiveSafeInt>('=');

  expectType<typeof targetType.defaultValue, TargetType>('=');

  describe('is', () => {
    test('truthy case', () => {
      const x: unknown = 123456;

      if (targetType.is(x)) {
        expectType<typeof x, TargetType>('=');
        expect(isPositiveSafeInt(x)).toBe(true);
      } else {
        expectType<typeof x, unknown>('=');
      }

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

    test('falsy case - negative', () => {
      const x: unknown = -5;

      expect(targetType.is(x)).toBe(false);
    });

    test('falsy case - unsafe integer', () => {
      const x: unknown = Number.MAX_SAFE_INTEGER + 1;

      expect(targetType.is(x)).toBe(false);
    });

    test('falsy case - float', () => {
      const x: unknown = 123.456;

      expect(targetType.is(x)).toBe(false);
    });
  });

  describe('validate', () => {
    test('truthy case', () => {
      const result = targetType.validate(789012);
      expect(Result.isOk(result)).toBe(true);

      if (Result.isOk(result)) {
        expect(result.value).toBe(789012);
      }
    });

    test('validate returns input as-is for OK cases', () => {
      const input = 123456;
      const result = targetType.validate(input);
      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value).toBe(input); // ✅ same reference
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
            expectedType:
              'Finite & Int & SafeInt & > -2^32 & >= -2^31 & > -2^16 & >= -2^15 & >=0 & !=0 & not(NaNValue)',
            typeName:
              'Finite & Int & SafeInt & > -2^32 & >= -2^31 & > -2^16 & >= -2^15 & >=0 & !=0 & not(NaNValue)',
            message:
              'The value must satisfy the constraint corresponding to the brand keys: <Finite & Int & SafeInt & > -2^32 & >= -2^31 & > -2^16 & >= -2^15 & >=0 & !=0 & not(NaNValue)>',
          },
        ]);
        expect(validationErrorsToMessages(result.value)).toStrictEqual([
          'The value must satisfy the constraint corresponding to the brand keys: <Finite & Int & SafeInt & > -2^32 & >= -2^31 & > -2^16 & >= -2^15 & >=0 & !=0 & not(NaNValue)>',
        ]);
      }
    });
  });

  describe('cast', () => {
    test('truthy case', () => {
      const x: unknown = 100000;

      expect(targetType.cast(x)).toBe(100000);
    });

    test('falsy case', () => {
      const x: unknown = 'invalid';

      expect(() => targetType.cast(x)).toThrow('Expected');
    });
  });

  describe('fill', () => {
    test('noop', () => {
      const x: unknown = 456789;

      expect(targetType.fill(x)).toBe(456789);
    });

    test('fill with the default value', () => {
      const x: unknown = 'not a positive safe int';

      expect(targetType.fill(x)).toBe(1);
    });
  });
});

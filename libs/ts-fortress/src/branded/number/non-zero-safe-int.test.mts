import { expectType, isNonZeroSafeInt, Result } from 'ts-data-forge';
import { type TypeOf } from '../../type.mjs';
import { validationErrorsToMessages } from '../../validation-error.mjs';
import { nonZeroSafeInt } from './non-zero-safe-int.mjs';

describe('nonZeroSafeInt', () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  const targetType = nonZeroSafeInt(1 as NonZeroSafeInt);

  type TargetType = TypeOf<typeof targetType>;

  expectType<TargetType, NonZeroSafeInt>('=');

  expectType<typeof targetType.defaultValue, TargetType>('=');

  describe('is', () => {
    test('truthy case - positive', () => {
      const x: unknown = 123456;

      if (targetType.is(x)) {
        expectType<typeof x, TargetType>('=');
        expect(isNonZeroSafeInt(x)).toBe(true);
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
      const result = targetType.validate(-789012);
      expect(Result.isOk(result)).toBe(true);

      if (Result.isOk(result)) {
        expect(result.value).toBe(-789012);
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
            expectedType: 'Finite & Int & SafeInt & !=0 & not(NaNValue)',
            typeName: 'Finite & Int & SafeInt & !=0 & not(NaNValue)',
            message:
              'The value must satisfy the constraint corresponding to the brand keys: <Finite & Int & SafeInt & !=0 & not(NaNValue)>',
          },
        ]);
        expect(validationErrorsToMessages(result.value)).toStrictEqual([
          'The value must satisfy the constraint corresponding to the brand keys: <Finite & Int & SafeInt & !=0 & not(NaNValue)>',
        ]);
      }
    });
  });

  describe('cast', () => {
    test('truthy case', () => {
      const x: unknown = -100000;

      expect(targetType.cast(x)).toBe(-100000);
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
      const x: unknown = 'not a non zero safe int';

      expect(targetType.fill(x)).toBe(1);
    });
  });
});

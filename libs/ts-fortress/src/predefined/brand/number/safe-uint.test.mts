import { expectType, isNumber, isSafeUint, Result } from 'ts-data-forge';
import { type TypeOf } from '../../../type.mjs';
import { validationErrorsToMessages } from '../../../utils/index.mjs';
import { safeUint } from './safe-uint.mjs';

describe('safeUint', () => {
  const targetType = safeUint(0);

  type TargetType = TypeOf<typeof targetType>;

  expectType<TargetType, SafeUint>('=');

  expectType<typeof targetType.defaultValue, TargetType>('=');

  describe('is', () => {
    test('truthy case', () => {
      const x: unknown = 123_456;

      const isTarget = targetType.is(x);

      if (isTarget) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      expect(isTarget).toBe(true);
      assert(isNumber(x));
      expect(isSafeUint(x)).toBe(true);
    });

    test('truthy case - zero', () => {
      const x: unknown = 0;

      expect(targetType.is(x)).toBe(true);
    });

    test('falsy case - negative', () => {
      const x: unknown = -1;

      const isTarget = targetType.is(x);

      if (isTarget) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      expect(isTarget).toBe(false);
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
      const result = targetType.validate(789_012);
      expect(Result.isOk(result)).toBe(true);

      const resultValue = Result.unwrapThrow(result);
      expect(resultValue).toBe(789_012);
    });

    test('validate returns input as-is for OK cases', () => {
      const input = 123_456;
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
          expectedType: 'SafeUint',
          typeName: 'SafeUint',
          message: undefined,
        },
      ]);
      expect(validationErrorsToMessages(resultError)).toStrictEqual([
        'Expected <SafeUint>, got <number> type value `-5`.',
      ]);
    });
  });

  describe('cast', () => {
    test('truthy case', () => {
      const x: unknown = 100_000;

      expect(targetType.cast(x)).toBe(100_000);
    });

    test('falsy case', () => {
      const x: unknown = 'invalid';

      expect(() => targetType.cast(x)).toThrow('Expected');
    });
  });

  describe('fill', () => {
    test('noop', () => {
      const x: unknown = 456_789;

      expect(targetType.fill(x)).toBe(456_789);
    });

    test('fill with the default value', () => {
      const x: unknown = 'not a safe uint';

      expect(targetType.fill(x)).toBe(0);
    });
  });
});

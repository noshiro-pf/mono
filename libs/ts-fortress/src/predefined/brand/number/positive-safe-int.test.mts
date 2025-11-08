import { expectType, isNumber, isPositiveSafeInt, Result } from 'ts-data-forge';
import { type TypeOf } from '../../../type.mjs';
import { validationErrorsToMessages } from '../../../utils/index.mjs';
import { positiveSafeInt } from './positive-safe-int.mjs';

describe(positiveSafeInt, () => {
  const targetType = positiveSafeInt(1);

  type TargetType = TypeOf<typeof targetType>;

  expectType<TargetType, PositiveSafeInt>('=');

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

      expect(isPositiveSafeInt(x)).toBe(true);
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

    test('falsy case - zero', () => {
      const result = targetType.validate(0);

      expect(Result.isErr(result)).toBe(true);

      const resultError = Result.unwrapErrThrow(result);

      expect(resultError).toStrictEqual([
        {
          path: [],
          actualValue: 0,
          expectedType: 'PositiveSafeInt',
          typeName: 'PositiveSafeInt',
          message: undefined,
        },
      ]);
      expect(validationErrorsToMessages(resultError)).toStrictEqual([
        'Expected <PositiveSafeInt>, got <number> type value `0`.',
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
      const x: unknown = 'not a positive safe int';

      expect(targetType.fill(x)).toBe(1);
    });
  });
});

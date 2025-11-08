import { asInt32, expectType, isInt32, isNumber, Result } from 'ts-data-forge';
import { type TypeOf } from '../../../type.mjs';
import { validationErrorsToMessages } from '../../../utils/index.mjs';
import { int32 } from './int32.mjs';

describe(int32, () => {
  const targetType = int32(asInt32(0));

  type TargetType = TypeOf<typeof targetType>;

  expectType<TargetType, Int32>('=');

  expectType<typeof targetType.defaultValue, TargetType>('=');

  describe('is', () => {
    test('truthy case', () => {
      const x: unknown = 1_000_000;

      const isTarget = targetType.is(x);

      if (isTarget) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      expect(isTarget).toBe(true);

      assert(isNumber(x));

      expect(isInt32(x)).toBe(true);
    });

    test('falsy case - too large', () => {
      const x: unknown = 3_000_000_000;

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

      expect(targetType.is(x)).toBe(false);
    });
  });

  describe('validate', () => {
    test('truthy case', () => {
      const result = targetType.validate(-1_000_000);

      expect(Result.isOk(result)).toBe(true);

      const resultValue = Result.unwrapThrow(result);

      expect(resultValue).toBe(-1_000_000);
    });

    test('validate returns input as-is for OK cases', () => {
      const input = 1_000_000;
      const result = targetType.validate(input);

      expect(Result.isOk(result)).toBe(true);

      const resultValue1 = Result.unwrapThrow(result);

      expect(resultValue1).toBe(input); // ✅ same reference
    });

    test('falsy case - out of range', () => {
      const result = targetType.validate(3_000_000_000);

      expect(Result.isErr(result)).toBe(true);

      const resultError = Result.unwrapErrThrow(result);

      expect(resultError).toStrictEqual([
        {
          path: [],
          actualValue: 3_000_000_000,
          expectedType: 'Int32',
          typeName: 'Int32',
          message: undefined,
        },
      ]);
      expect(validationErrorsToMessages(resultError)).toStrictEqual([
        'Expected <Int32>, got <number> type value `3000000000`.',
      ]);
    });
  });

  describe('cast', () => {
    test('truthy case', () => {
      const x: unknown = 150_000_000;

      expect(targetType.cast(x)).toBe(150_000_000);
    });

    test('falsy case', () => {
      const x: unknown = 'invalid';

      expect(() => targetType.cast(x)).toThrow('Expected');
    });
  });

  describe('fill', () => {
    test('noop', () => {
      const x: unknown = -50_000_000;

      expect(targetType.fill(x)).toBe(-50_000_000);
    });

    test('fill with the default value', () => {
      const x: unknown = 'not an int32';

      expect(targetType.fill(x)).toBe(0);
    });
  });
});

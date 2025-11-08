import { asInt16, expectType, isInt16, isNumber, Result } from 'ts-data-forge';
import { type TypeOf } from '../../../type.mjs';
import { validationErrorsToMessages } from '../../../utils/index.mjs';
import { int16 } from './int16.mjs';

describe(int16, () => {
  const targetType = int16(asInt16(0));

  type TargetType = TypeOf<typeof targetType>;

  expectType<TargetType, Int16>('=');

  expectType<typeof targetType.defaultValue, TargetType>('=');

  describe('is', () => {
    test('truthy case', () => {
      const x: unknown = 1000;

      const isTarget = targetType.is(x);

      if (isTarget) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      expect(isTarget).toBe(true);

      assert(isNumber(x));

      expect(isInt16(x)).toBe(true);
    });

    test('falsy case - too large', () => {
      const x: unknown = 40_000;

      const isTarget = targetType.is(x);

      if (isTarget) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      expect(isTarget).toBe(false);
    });

    test('falsy case - too small', () => {
      const x: unknown = -40_000;

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

      const resultValue = Result.unwrapThrow(result);

      expect(resultValue).toBe(-1000);
    });

    test('validate returns input as-is for OK cases', () => {
      const input = 15_000;
      const result = targetType.validate(input);

      expect(Result.isOk(result)).toBe(true);

      const resultValue1 = Result.unwrapThrow(result);

      expect(resultValue1).toBe(input); // ✅ same reference
    });

    test('falsy case - out of range', () => {
      const result = targetType.validate(50_000);

      expect(Result.isErr(result)).toBe(true);

      const resultError = Result.unwrapErrThrow(result);

      assert.deepStrictEqual(resultError, [
        {
          path: [],
          actualValue: 50_000,
          expectedType: 'Int16',
          typeName: 'Int16',
          details: undefined,
        },
      ]);

      assert.deepStrictEqual(validationErrorsToMessages(resultError), [
        'Expected <Int16>, got <number> type value `50000`.',
      ]);
    });
  });

  describe('cast', () => {
    test('truthy case', () => {
      const x: unknown = 15_000;

      expect(targetType.cast(x)).toBe(15_000);
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

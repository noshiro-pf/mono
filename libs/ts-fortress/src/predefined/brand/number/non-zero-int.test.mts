import { expectType, isNonZeroInt, isNumber, Result } from 'ts-data-forge';
import { type TypeOf } from '../../../type.mjs';
import { validationErrorsToMessages } from '../../../utils/index.mjs';
import { nonZeroInt } from './non-zero-int.mjs';

describe(nonZeroInt, () => {
  const targetType = nonZeroInt(1);

  type TargetType = TypeOf<typeof targetType>;

  expectType<TargetType, NonZeroInt>('=');

  expectType<typeof targetType.defaultValue, TargetType>('=');

  describe('is', () => {
    test('truthy case - positive', () => {
      const x: unknown = 123;

      const isTarget = targetType.is(x);

      if (isTarget) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      expect(isTarget).toBe(true);

      assert(isNumber(x));

      expect(isNonZeroInt(x)).toBe(true);
    });

    test('truthy case - negative', () => {
      const x: unknown = -42;

      expect(targetType.is(x)).toBe(true);
    });

    test('falsy case - zero', () => {
      const x: unknown = 0;

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
      const result = targetType.validate(-42);

      expect(Result.isOk(result)).toBe(true);

      const resultValue = Result.unwrapThrow(result);

      expect(resultValue).toBe(-42);
    });

    test('validate returns input as-is for OK cases', () => {
      const input = 123;
      const result = targetType.validate(input);

      expect(Result.isOk(result)).toBe(true);

      const resultValue1 = Result.unwrapThrow(result);

      expect(resultValue1).toBe(input); // ✅ same reference
    });

    test('falsy case - zero', () => {
      const result = targetType.validate(0);

      expect(Result.isErr(result)).toBe(true);

      const resultError = Result.unwrapErrThrow(result);

      assert.deepStrictEqual(resultError, [
        {
          path: [],
          actualValue: 0,
          expectedType: 'NonZeroInt',
          typeName: 'NonZeroInt',
          details: undefined,
        },
      ]);

      assert.deepStrictEqual(validationErrorsToMessages(resultError), [
        'Error: expected <NonZeroInt> value but <number> type value `0` was passed.',
      ]);
    });
  });

  describe('cast', () => {
    test('truthy case', () => {
      const x: unknown = -100;

      expect(targetType.cast(x)).toBe(-100);
    });

    test('falsy case', () => {
      const x: unknown = 'invalid';

      expect(() => targetType.cast(x)).toThrow('Error');
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

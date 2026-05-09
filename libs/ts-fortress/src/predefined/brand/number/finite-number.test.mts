import { expectType, Result } from 'ts-data-forge';
import { type FiniteNumber } from 'ts-type-forge';
import { type TypeOf } from '../../../type.mjs';
import { validationErrorsToMessages } from '../../../utils/index.mjs';
import { finiteNumber } from './finite-number.mjs';

describe(finiteNumber, () => {
  const targetType = finiteNumber(0);

  type TargetType = TypeOf<typeof targetType>;

  expectType<TargetType, FiniteNumber>('=');

  expectType<typeof targetType.defaultValue, TargetType>('=');

  describe('is', () => {
    test('truthy case', () => {
      const x: unknown = 123.456;

      if (targetType.is(x)) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      assert.isTrue(targetType.is(x));
    });

    test('falsy case - infinity', () => {
      const x: unknown = Number.POSITIVE_INFINITY;

      if (targetType.is(x)) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      assert.isFalse(targetType.is(x));
    });

    test('falsy case - NaN', () => {
      const x: unknown = Number.NaN;

      if (targetType.is(x)) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      assert.isFalse(targetType.is(x));
    });

    test('falsy case - string', () => {
      const x: unknown = '123';

      if (targetType.is(x)) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      assert.isFalse(targetType.is(x));
    });
  });

  describe('validate', () => {
    test('truthy case', () => {
      const result = targetType.validate(-42.5);

      assert.isTrue(Result.isOk(result));

      const resultValue = Result.unwrapThrow(result);

      expect(resultValue).toBe(-42.5);
    });

    test('validate returns input as-is for OK cases', () => {
      const input = 123.456;

      const result = targetType.validate(input);

      assert.isTrue(Result.isOk(result));

      const resultValue1 = Result.unwrapThrow(result);

      expect(resultValue1).toBe(input); // ✅ same reference
    });

    test('falsy case - infinity', () => {
      const result = targetType.validate(Number.POSITIVE_INFINITY);

      assert.isTrue(Result.isErr(result));

      const resultError = Result.unwrapErrThrow(result);

      assert.deepStrictEqual(resultError, [
        {
          path: [],
          actualValue: Number.POSITIVE_INFINITY,
          expectedType: 'FiniteNumber',
          typeName: 'FiniteNumber',
          details: undefined,
        },
      ]);
    });

    test('falsy case - string', () => {
      const result = targetType.validate('not a number');

      assert.isTrue(Result.isErr(result));

      const resultError1 = Result.unwrapErrThrow(result);

      assert.deepStrictEqual(resultError1, [
        {
          path: [],
          actualValue: 'not a number',
          expectedType: 'number',
          typeName: 'number',
          details: undefined,
        },
      ]);

      assert.deepStrictEqual(validationErrorsToMessages(resultError1), [
        'Error: expected <number> type but <string> type value "not a number" was passed.',
      ]);
    });
  });

  describe('assertIs', () => {
    test('truthy case', () => {
      const x: unknown = -42.123;

      const assertIs: (a: unknown) => asserts a is TargetType =
        targetType.assertIs;

      expect(() => {
        assertIs(x);
      }).not.toThrow();
    });

    test('falsy case', () => {
      const x: unknown = Number.NaN;

      const assertIs: (a: unknown) => asserts a is TargetType =
        targetType.assertIs;

      expect(() => {
        assertIs(x);
      }).toThrow('Error: expected <FiniteNumber> type');
    });
  });

  describe('cast', () => {
    test('truthy case', () => {
      const x: unknown = 100.5;

      expect(targetType.cast(x)).toBe(100.5);
    });

    test('falsy case', () => {
      const x: unknown = 'invalid';

      expect(() => targetType.cast(x)).toThrow('Error');
    });
  });

  describe('fill', () => {
    test('noop', () => {
      const x: unknown = -123.456;

      expect(targetType.fill(x)).toBe(-123.456);
    });

    test('fill with the default value', () => {
      const x: unknown = 'not a finite number';

      expect(targetType.fill(x)).toBe(0);
    });
  });
});

import {
  expectType,
  isNumber,
  isPositiveFiniteNumber,
  Result,
} from 'ts-data-forge';
import { type TypeOf } from '../../../type.mjs';
import { validationErrorsToMessages } from '../../../utils/index.mjs';
import { positiveFiniteNumber } from './positive-finite-number.mjs';

describe(positiveFiniteNumber, () => {
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  const targetType = positiveFiniteNumber(1.5 as PositiveFiniteNumber);

  type TargetType = TypeOf<typeof targetType>;

  expectType<TargetType, PositiveFiniteNumber>('=');

  expectType<typeof targetType.defaultValue, TargetType>('=');

  describe('is', () => {
    test('truthy case', () => {
      const x: unknown = 123.456;

      const isTarget = targetType.is(x);

      if (isTarget) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      expect(isTarget).toBe(true);

      assert(isNumber(x));

      expect(isPositiveFiniteNumber(x)).toBe(true);
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

    test('falsy case - negative', () => {
      const x: unknown = -5.5;

      expect(targetType.is(x)).toBe(false);
    });

    test('falsy case - infinity', () => {
      const x: unknown = Number.POSITIVE_INFINITY;

      expect(targetType.is(x)).toBe(false);
    });

    test('falsy case - NaN', () => {
      const x: unknown = Number.NaN;

      expect(targetType.is(x)).toBe(false);
    });
  });

  describe('validate', () => {
    test('truthy case', () => {
      const result = targetType.validate(789.012);

      expect(Result.isOk(result)).toBe(true);

      const resultValue = Result.unwrapThrow(result);

      expect(resultValue).toBe(789.012);
    });

    test('validate returns input as-is for OK cases', () => {
      const input = 123.456;
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
          expectedType: 'PositiveFiniteNumber',
          typeName: 'PositiveFiniteNumber',
          message: undefined,
        },
      ]);
      assert.deepStrictEqual(validationErrorsToMessages(resultError), [
        'Expected <PositiveFiniteNumber>, got <number> type value `0`.',
      ]);
    });
  });

  describe('cast', () => {
    test('truthy case', () => {
      const x: unknown = 100.5;

      expect(targetType.cast(x)).toBe(100.5);
    });

    test('falsy case', () => {
      const x: unknown = 'invalid';

      expect(() => targetType.cast(x)).toThrow('Expected');
    });
  });

  describe('fill', () => {
    test('noop', () => {
      const x: unknown = 456.789;

      expect(targetType.fill(x)).toBe(456.789);
    });

    test('fill with the default value', () => {
      const x: unknown = 'not a positive finite number';

      expect(targetType.fill(x)).toBe(1.5);
    });
  });
});

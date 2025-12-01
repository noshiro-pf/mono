import { asUint32, expectType, Result } from 'ts-data-forge';
import { type TypeOf } from '../../../type.mjs';
import { validationErrorsToMessages } from '../../../utils/index.mjs';
import { uint32 } from './uint32.mjs';

describe(uint32, () => {
  const targetType = uint32(asUint32(0));

  type TargetType = TypeOf<typeof targetType>;

  expectType<TargetType, Uint32>('=');

  expectType<typeof targetType.defaultValue, TargetType>('=');

  describe('is', () => {
    test('truthy case', () => {
      const x: unknown = 2_000_000_000;

      const isTarget = targetType.is(x);

      if (isTarget) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      assert.isTrue(isTarget);
    });

    test('truthy case - zero', () => {
      const x: unknown = 0;

      assert.isTrue(targetType.is(x));
    });

    test('falsy case - negative', () => {
      const x: unknown = -1;

      const isTarget = targetType.is(x);

      if (isTarget) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      assert.isFalse(isTarget);
    });

    test('falsy case - too large', () => {
      const x: unknown = 5_000_000_000;

      assert.isFalse(targetType.is(x));
    });

    test('falsy case - float', () => {
      const x: unknown = 123.456;

      assert.isFalse(targetType.is(x));
    });
  });

  describe('validate', () => {
    test('truthy case', () => {
      const result = targetType.validate(3_000_000_000);

      assert.isTrue(Result.isOk(result));

      const resultValue = Result.unwrapThrow(result);

      expect(resultValue).toBe(3_000_000_000);
    });

    test('validate returns input as-is for OK cases', () => {
      const input = 2_000_000_000;

      const result = targetType.validate(input);

      assert.isTrue(Result.isOk(result));

      const resultValue1 = Result.unwrapThrow(result);

      expect(resultValue1).toBe(input); // ✅ same reference
    });

    test('falsy case - negative', () => {
      const result = targetType.validate(-5);

      assert.isTrue(Result.isErr(result));

      const resultError = Result.unwrapErrThrow(result);

      assert.deepStrictEqual(resultError, [
        {
          path: [],
          actualValue: -5,
          expectedType: 'Uint32',
          typeName: 'Uint32',
          details: undefined,
        },
      ]);

      assert.deepStrictEqual(validationErrorsToMessages(resultError), [
        'Error: expected <Uint32> value but <number> type value `-5` was passed.',
      ]);
    });
  });

  describe('cast', () => {
    test('truthy case', () => {
      const x: unknown = 1_500_000_000;

      expect(targetType.cast(x)).toBe(1_500_000_000);
    });

    test('falsy case', () => {
      const x: unknown = 'invalid';

      expect(() => targetType.cast(x)).toThrowError('Error');
    });
  });

  describe('fill', () => {
    test('noop', () => {
      const x: unknown = 2_500_000_000;

      expect(targetType.fill(x)).toBe(2_500_000_000);
    });

    test('fill with the default value', () => {
      const x: unknown = 'not a uint32';

      expect(targetType.fill(x)).toBe(0);
    });
  });
});

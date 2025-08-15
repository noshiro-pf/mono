import { asUint32, expectType, isUint32, Result } from 'ts-data-forge';
import { type TypeOf } from '../../type.mjs';
import { validationErrorsToMessages } from '../../utils/index.mjs';
import { uint32 } from './uint32.mjs';

describe('uint32', () => {
  const targetType = uint32(asUint32(0));

  type TargetType = TypeOf<typeof targetType>;

  expectType<TargetType, Uint32>('=');

  expectType<typeof targetType.defaultValue, TargetType>('=');

  describe('is', () => {
    test('truthy case', () => {
      const x: unknown = 2000000000;

      if (targetType.is(x)) {
        expectType<typeof x, TargetType>('=');
        expect(isUint32(x)).toBe(true);
      } else {
        expectType<typeof x, unknown>('=');
      }

      expect(targetType.is(x)).toBe(true);
    });

    test('truthy case - zero', () => {
      const x: unknown = 0;

      expect(targetType.is(x)).toBe(true);
    });

    test('falsy case - negative', () => {
      const x: unknown = -1;

      if (targetType.is(x)) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      expect(targetType.is(x)).toBe(false);
    });

    test('falsy case - too large', () => {
      const x: unknown = 5000000000;

      expect(targetType.is(x)).toBe(false);
    });

    test('falsy case - float', () => {
      const x: unknown = 123.456;

      expect(targetType.is(x)).toBe(false);
    });
  });

  describe('validate', () => {
    test('truthy case', () => {
      const result = targetType.validate(3000000000);
      expect(Result.isOk(result)).toBe(true);

      if (Result.isOk(result)) {
        expect(result.value).toBe(3000000000);
      }
    });

    test('falsy case - negative', () => {
      const result = targetType.validate(-5);
      expect(Result.isErr(result)).toBe(true);

      if (Result.isErr(result)) {
        expect(result.value).toStrictEqual([
          {
            path: [],
            actualValue: -5,
            expectedType:
              'Finite & Int & SafeInt & > -2^16 & > -2^32 & >= -2^15 & >= -2^31 & >=0 & < 2^32 & not(NaNValue)',
            typeName:
              'Finite & Int & SafeInt & > -2^16 & > -2^32 & >= -2^15 & >= -2^31 & >=0 & < 2^32 & not(NaNValue)',
            message:
              'The value must satisfy the constraint corresponding to the brand keys: <Finite & Int & SafeInt & > -2^16 & > -2^32 & >= -2^15 & >= -2^31 & >=0 & < 2^32 & not(NaNValue)>',
          },
        ]);
        expect(validationErrorsToMessages(result.value)).toStrictEqual([
          'The value must satisfy the constraint corresponding to the brand keys: <Finite & Int & SafeInt & > -2^16 & > -2^32 & >= -2^15 & >= -2^31 & >=0 & < 2^32 & not(NaNValue)>',
        ]);
      }
    });
  });

  describe('cast', () => {
    test('truthy case', () => {
      const x: unknown = 1500000000;

      expect(targetType.cast(x)).toBe(1500000000);
    });

    test('falsy case', () => {
      const x: unknown = 'invalid';

      expect(() => targetType.cast(x)).toThrow('Expected');
    });
  });

  describe('fill', () => {
    test('noop', () => {
      const x: unknown = 2500000000;

      expect(targetType.fill(x)).toBe(2500000000);
    });

    test('fill with the default value', () => {
      const x: unknown = 'not a uint32';

      expect(targetType.fill(x)).toBe(0);
    });
  });
});

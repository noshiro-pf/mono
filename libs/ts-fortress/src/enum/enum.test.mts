import { expectType, Result } from 'ts-data-forge';
import { type TypeOf } from '../type.mjs';
import {
  type ValidationError,
  validationErrorsToMessages,
} from '../utils/index.mjs';
import { enumType } from './enum.mjs';

describe('enumType', () => {
  const targetType = enumType([3, '2', 'a'], {
    defaultValue: 3,
  });

  type TargetType = TypeOf<typeof targetType>;

  expectType<TargetType, '2' | 'a' | 3>('=');

  expectType<typeof targetType.defaultValue, TargetType>('=');

  describe('is', () => {
    test('truthy case', () => {
      const x: number | string = Math.random() >= 0 ? 3 : '0'; // the value is always 1

      if (targetType.is(x)) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, number | string>('=');
      }

      expect(targetType.is(x)).toBe(true);
    });

    test('falsy case', () => {
      const x: number | string = Math.random() >= 0 ? 5 : '0'; // the value is always 5

      if (targetType.is(x)) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, number | string>('=');
      }

      expect(targetType.is(x)).toBe(false);
    });
  });

  describe('validate', () => {
    test('truthy case', () => {
      const result = targetType.validate(3);
      expectType<typeof result, Result<TargetType, readonly ValidationError[]>>(
        '=',
      );
      expect(Result.isOk(result)).toBe(true);

      if (Result.isOk(result)) {
        expect(result.value).toBe(3);
      }
    });

    test('falsy case', () => {
      const result = targetType.validate(5);
      expect(Result.isErr(result)).toBe(true);

      if (Result.isErr(result)) {
        expect(result.value[0]).toStrictEqual({
          path: [],
          actualValue: 5,
          expectedType: 'enum',
          typeName: 'enum',
          message:
            'The value is expected to be one of the elements contained in { 3, 2, a }',
        });
        expect(validationErrorsToMessages(result.value)).toStrictEqual([
          'The value is expected to be one of the elements contained in { 3, 2, a }',
        ]);
      } else {
        throw new Error('Expected validation to fail');
      }
    });

    test('validate returns input as-is for OK cases', () => {
      const input = 'a';
      const result = targetType.validate(input);
      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value).toBe(input); // ✅ same reference
      }
    });
  });

  describe('fill', () => {
    test('noop', () => {
      const x: number = (() => 3)();

      expect(targetType.fill(x)).toBe(3);
    });

    test('fill with the default value', () => {
      const x: number = (() => 5)();

      expect(targetType.fill(x)).toBe(3);
    });
  });
});

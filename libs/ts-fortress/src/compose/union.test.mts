import { expectType, Result } from 'ts-data-forge';
import { literal } from '../other-types/index.mjs';
import { number } from '../primitives/index.mjs';
import { record } from '../record/index.mjs';
import { type TypeOf } from '../type.mjs';
import {
  type ValidationError,
  validationErrorsToMessages,
} from '../utils/index.mjs';
import { union } from './union.mjs';

describe(union, () => {
  const targetType = union(
    [record({ x: number(), y: number() }), literal(3), literal('2')],
    {
      defaultType: literal(3),
    },
  );

  type TargetType = TypeOf<typeof targetType>;

  expectType<
    TargetType,
    | Readonly<{
        x: number;
        y: number;
      }>
    | '2'
    | 3
  >('=');

  expectType<typeof targetType.defaultValue, TargetType>('=');

  describe('is', () => {
    test('truthy case', () => {
      const x: unknown = Math.random() >= 0 ? 3 : '0'; // the value is always 1

      if (targetType.is(x)) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      expect(targetType.is(x)).toBe(true);
    });

    test('truthy case 2', () => {
      const x: unknown = { x: 1, y: 2 };

      if (targetType.is(x)) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      expect(targetType.is(x)).toBe(true);
    });

    test('falsy case', () => {
      const x: unknown = Math.random() >= 0 ? 5 : '0'; // the value is always 5

      if (targetType.is(x)) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, unknown>('=');
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

      const resultValue = Result.unwrapThrow(result);

      expect(resultValue).toBe(3);
    });

    test('falsy case', () => {
      const result = targetType.validate(5);

      expect(Result.isErr(result)).toBe(true);

      const resultError = Result.unwrapErrThrow(result);

      assert.deepStrictEqual(resultError[0], {
        path: [],
        actualValue: 5,
        expectedType: '({ x: number, y: number } | literal(3) | literal("2"))',
        typeName: '({ x: number, y: number } | literal(3) | literal("2"))',
        message:
          'The type of value is expected to be one of the elements contained in { { x: number, y: number }, literal(3), literal("2") }',
      });
      assert.deepStrictEqual(validationErrorsToMessages(resultError), [
        'The type of value is expected to be one of the elements contained in { { x: number, y: number }, literal(3), literal("2") }',
      ]);
    });

    test('validate returns input as-is for OK cases', () => {
      const input = { x: 10, y: 20 };
      const result = targetType.validate(input);

      expect(Result.isOk(result)).toBe(true);

      const resultValue1 = Result.unwrapThrow(result);

      expect(resultValue1).toBe(input); // ✅ same reference
    });
  });

  describe('fill', () => {
    test('noop', () => {
      const x: unknown = { x: 3, y: 4 };

      assert.deepStrictEqual(targetType.fill(x), { x: 3, y: 4 });
    });

    test('fill with the default value', () => {
      const x = 5;

      expect(targetType.fill(x)).toBe(3);
    });
  });
});

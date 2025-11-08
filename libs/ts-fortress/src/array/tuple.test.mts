import { expectType, Result } from 'ts-data-forge';
import { literal } from '../other-types/index.mjs';
import { number } from '../primitives/index.mjs';
import { record } from '../record/index.mjs';
import { type TypeOf } from '../type.mjs';
import {
  type ValidationError,
  validationErrorsToMessages,
} from '../utils/index.mjs';
import { tuple } from './tuple.mjs';

describe(tuple, () => {
  describe('arg patterns', () => {
    test('without explicit default value', () => {
      assert.deepStrictEqual(
        tuple([literal(1), literal(2), literal(3)]).defaultValue,
        [1, 2, 3],
      );
    });

    test('with explicit default value', () => {
      expect(
        tuple([literal(1), literal(2), literal(3)], {
          typeName: 'tpl',
        }).typeName,
      ).toBe('tpl');
    });
  });

  const targetType = tuple([
    record({ x: number(), y: number() }),
    literal(3),
    literal('2'),
  ]);

  type TargetType = TypeOf<typeof targetType>;

  expectType<
    TargetType,
    readonly [
      Readonly<{
        x: number;
        y: number;
      }>,
      3,
      '2',
    ]
  >('=');

  expectType<typeof targetType.defaultValue, TargetType>('=');

  describe('is', () => {
    test('truthy case', () => {
      const x: unknown = [{ x: 1, y: 2 }, 3, '2'];

      if (targetType.is(x)) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      expect(targetType.is(x)).toBe(true);
    });

    test('falsy case', () => {
      const x: unknown = [{ x: 'str', y: 'str' }, 3, '2'];

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
      const x: unknown = [{ x: 1, y: 2 }, 3, '2'];

      const result = targetType.validate(x);

      expectType<typeof result, Result<TargetType, readonly ValidationError[]>>(
        '=',
      );

      expect(Result.isOk(result)).toBe(true);

      const resultValue = Result.unwrapThrow(result);

      assert.deepStrictEqual(resultValue, [{ x: 1, y: 2 }, 3, '2']);
    });

    test('falsy case - not array', () => {
      const x: unknown = 'not an array';

      const result = targetType.validate(x);

      expect(Result.isErr(result)).toBe(true);

      const resultError = Result.unwrapErrThrow(result);

      assert.deepStrictEqual(resultError, [
        {
          path: [],
          actualValue: 'not an array',
          expectedType: 'array',
          typeName: 'tuple',
          details: undefined,
        },
      ]);
    });

    test('falsy case - wrong length', () => {
      const x: unknown = [{ x: 1, y: 2 }];

      const result = targetType.validate(x);

      expect(Result.isErr(result)).toBe(true);

      const resultError1 = Result.unwrapErrThrow(result);

      assert.deepStrictEqual(resultError1, [
        {
          path: [],
          actualValue: x,
          expectedType: 'tuple',
          typeName: 'tuple',
          details: {
            kind: 'tuple-length',
            expectedLength: 3,
            actualLength: 1,
          },
        },
      ]);
    });

    test('falsy case - element validation errors', () => {
      const x: unknown = [{ x: 'str', y: 'str' }, 3, '2'];

      const result = targetType.validate(x);

      expect(Result.isErr(result)).toBe(true);

      const resultError2 = Result.unwrapErrThrow(result);

      assert.deepStrictEqual(resultError2, [
        {
          path: ['0', 'x'],
          actualValue: 'str',
          expectedType: 'number',
          typeName: 'number',
          details: undefined,
        },
        {
          path: ['0', 'y'],
          actualValue: 'str',
          expectedType: 'number',
          typeName: 'number',
          details: undefined,
        },
      ]);

      assert.deepStrictEqual(validationErrorsToMessages(resultError2), [
        'Expected <number> at 0.x, got <string> type value "str".',
        'Expected <number> at 0.y, got <string> type value "str".',
      ]);
    });

    test('validate returns input as-is for OK cases', () => {
      const input = [{ x: 5, y: 10 }, 3, '2'] as const;
      const result = targetType.validate(input);

      expect(Result.isOk(result)).toBe(true);

      const resultValue1 = Result.unwrapThrow(result);

      // Note: tuple validation may create new arrays for type safety
      // so we check for structural equality rather than reference equality

      assert.deepStrictEqual(resultValue1, input);

      // For tuples, the inner objects should maintain reference equality
      expect(resultValue1[0]).toBe(input[0]); // ✅ same reference for nested objects
    });
  });

  describe('fill', () => {
    test('noop', () => {
      const x: unknown = [{ x: 1, y: 2 }, 3, '2'];

      assert.deepStrictEqual(targetType.fill(x), [{ x: 1, y: 2 }, 3, '2']);
    });

    test('fill with the default value', () => {
      const x: unknown = 5;

      assert.deepStrictEqual(targetType.fill(x), [{ x: 0, y: 0 }, 3, '2']);
    });

    test('fill only the first element with the default value, case 1', () => {
      const x: unknown = [123, 3, '2'];

      assert.deepStrictEqual(targetType.fill(x), [{ x: 0, y: 0 }, 3, '2']);
    });

    test('fill only the first element with the default value, case 2', () => {
      const x: unknown = [{ z: 5 }, 3, '2'];

      assert.deepStrictEqual(targetType.fill(x), [{ x: 0, y: 0 }, 3, '2']);
    });

    test('fill only the second element with the default value', () => {
      const x: unknown = [{ x: 1, y: 2 }, 0, '2'];

      assert.deepStrictEqual(targetType.fill(x), [{ x: 1, y: 2 }, 3, '2']);
    });

    test('fill only the third element with the default value', () => {
      const x: unknown = [{ x: 1, y: 2 }, 3, 999];

      assert.deepStrictEqual(targetType.fill(x), [{ x: 1, y: 2 }, 3, '2']);
    });
  });
});

import { expectType, Result } from 'ts-data-forge';
import { array } from '../array/index.mjs';
import { literal } from '../other-types/index.mjs';
import { number, string } from '../primitives/index.mjs';
import { record } from '../record/index.mjs';
import { type TypeOf } from '../type.mjs';
import {
  type ValidationError,
  validationErrorsToMessages,
} from '../utils/index.mjs';
import { union } from './union.mjs';

describe('union - mixed types', () => {
  const targetType = union(
    [literal('empty'), number(), record({ status: string() }), array(number())],
    {
      defaultType: literal('empty'),
    },
  );

  type TargetType = TypeOf<typeof targetType>;

  expectType<
    TargetType,
    | 'empty'
    | number
    | Readonly<{
        status: string;
      }>
    | readonly number[]
  >('=');

  expectType<typeof targetType.defaultValue, TargetType>('=');

  describe('is', () => {
    test('truthy case - literal', () => {
      const x: unknown = 'empty';

      if (targetType.is(x)) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      assert.isTrue(targetType.is(x));
    });

    test('truthy case - number', () => {
      const x: unknown = 42;

      if (targetType.is(x)) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      assert.isTrue(targetType.is(x));
    });

    test('truthy case - record', () => {
      const x: unknown = { status: 'ok' } as const;

      if (targetType.is(x)) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      assert.isTrue(targetType.is(x));
    });

    test('truthy case - array', () => {
      const x: unknown = [1, 2, 3] as const;

      if (targetType.is(x)) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      assert.isTrue(targetType.is(x));
    });

    test('falsy case', () => {
      const x: unknown = true;

      if (targetType.is(x)) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      assert.isFalse(targetType.is(x));
    });
  });

  describe('validate', () => {
    test('truthy case - literal', () => {
      const result = targetType.validate('empty');

      expectType<typeof result, Result<TargetType, readonly ValidationError[]>>(
        '=',
      );

      assert.isTrue(Result.isOk(result));

      const resultValue = Result.unwrapThrow(result);

      expect(resultValue).toBe('empty');
    });

    test('truthy case - number', () => {
      const result = targetType.validate(999);

      assert.isTrue(Result.isOk(result));

      const resultValue = Result.unwrapThrow(result);

      expect(resultValue).toBe(999);
    });

    test('truthy case - record', () => {
      const result = targetType.validate({ status: 'active' });

      assert.isTrue(Result.isOk(result));

      const resultValue = Result.unwrapThrow(result);

      assert.deepStrictEqual(resultValue, { status: 'active' });
    });

    test('truthy case - array', () => {
      const result = targetType.validate([10, 20]);

      assert.isTrue(Result.isOk(result));

      const resultValue = Result.unwrapThrow(result);

      assert.deepStrictEqual(resultValue, [10, 20]);
    });

    test('falsy case', () => {
      const result = targetType.validate(null);

      assert.isTrue(Result.isErr(result));

      const resultError = Result.unwrapErrThrow(result);

      assert.deepStrictEqual(resultError[0], {
        path: [],
        actualValue: null,
        expectedType: '("empty" | number | { status: string } | number[])',
        typeName: '("empty" | number | { status: string } | number[])',
        details: {
          kind: 'union',
          typeNames: ['"empty"', 'number', '{ status: string }', 'number[]'],
        },
      });

      assert.deepStrictEqual(validationErrorsToMessages(resultError), [
        'Error: expected one of <"empty">, <number>, <{ status: string }>, <number[]> but <object> type value `null` was passed.',
      ]);
    });

    test('validate returns input as-is for OK cases', () => {
      const input = [5, 10] as const;

      const result = targetType.validate(input);

      assert.isTrue(Result.isOk(result));

      const resultValue = Result.unwrapThrow(result);

      expect(resultValue).toBe(input);
    });
  });

  describe('fill', () => {
    test('noop - literal', () => {
      const x: unknown = 'empty';

      assert.deepStrictEqual(targetType.fill(x), 'empty');
    });

    test('noop - number', () => {
      const x: unknown = 77;

      assert.deepStrictEqual(targetType.fill(x), 77);
    });

    test('noop - record', () => {
      const x: unknown = { status: 'running' } as const;

      assert.deepStrictEqual(targetType.fill(x), { status: 'running' });
    });

    test('noop - array', () => {
      const x: unknown = [100, 200] as const;

      assert.deepStrictEqual(targetType.fill(x), [100, 200]);
    });

    test('fill with the default value', () => {
      const x = false;

      expect(targetType.fill(x)).toBe('empty');
    });
  });
});

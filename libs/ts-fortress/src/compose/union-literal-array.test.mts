import { expectType, Result } from 'ts-data-forge';
import { array } from '../array/index.mjs';
import { literal } from '../other-types/index.mjs';
import { number } from '../primitives/index.mjs';
import { type TypeOf } from '../type.mjs';
import {
  type ValidationError,
  validationErrorsToMessages,
} from '../utils/index.mjs';
import { union } from './union.mjs';

describe('union - literal and array', () => {
  const targetType = union([literal('none'), array(number()), literal(false)], {
    defaultType: literal('none'),
  });

  type TargetType = TypeOf<typeof targetType>;

  expectType<TargetType, 'none' | readonly number[] | false>('=');

  expectType<typeof targetType.defaultValue, TargetType>('=');

  describe('is', () => {
    test('truthy case - first literal', () => {
      const x: unknown = 'none';

      if (targetType.is(x)) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      assert.isTrue(targetType.is(x));
    });

    test('truthy case - array', () => {
      const x: unknown = [1, 2, 3];

      if (targetType.is(x)) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      assert.isTrue(targetType.is(x));
    });

    test('truthy case - second literal', () => {
      const x: unknown = false;

      if (targetType.is(x)) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      assert.isTrue(targetType.is(x));
    });

    test('falsy case', () => {
      const x: unknown = 'invalid';

      if (targetType.is(x)) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      assert.isFalse(targetType.is(x));
    });
  });

  describe('validate', () => {
    test('truthy case - first literal', () => {
      const result = targetType.validate('none');

      expectType<typeof result, Result<TargetType, readonly ValidationError[]>>(
        '=',
      );

      assert.isTrue(Result.isOk(result));

      const resultValue = Result.unwrapThrow(result);

      expect(resultValue).toBe('none');
    });

    test('truthy case - array', () => {
      const result = targetType.validate([10, 20]);

      assert.isTrue(Result.isOk(result));

      const resultValue = Result.unwrapThrow(result);

      assert.deepStrictEqual(resultValue, [10, 20]);
    });

    test('truthy case - second literal', () => {
      const result = targetType.validate(false);

      assert.isTrue(Result.isOk(result));

      const resultValue = Result.unwrapThrow(result);

      expect(resultValue).toBe(false);
    });

    test('falsy case', () => {
      const result = targetType.validate({ key: 'value' });

      assert.isTrue(Result.isErr(result));

      const resultError = Result.unwrapErrThrow(result);

      assert.deepStrictEqual(resultError[0], {
        path: [],
        actualValue: { key: 'value' },
        expectedType: '(literal("none") | number[] | literal(false))',
        typeName: '(literal("none") | number[] | literal(false))',
        details: {
          kind: 'union',
          typeNames: ['literal("none")', 'number[]', 'literal(false)'],
        },
      });

      assert.deepStrictEqual(validationErrorsToMessages(resultError), [
        'Error: expected one of { literal("none"), number[], literal(false) } but <object> type value `{"key":"value"}` was passed.',
      ]);
    });

    test('validate returns input as-is for OK cases', () => {
      const input = [5, 10, 15];

      const result = targetType.validate(input);

      assert.isTrue(Result.isOk(result));

      const resultValue = Result.unwrapThrow(result);

      expect(resultValue).toBe(input);
    });
  });

  describe('fill', () => {
    test('noop - first literal', () => {
      const x: unknown = 'none';

      assert.deepStrictEqual(targetType.fill(x), 'none');
    });

    test('noop - array', () => {
      const x: unknown = [100, 200];

      assert.deepStrictEqual(targetType.fill(x), [100, 200]);
    });

    test('noop - second literal', () => {
      const x: unknown = false;

      assert.deepStrictEqual(targetType.fill(x), false);
    });

    test('fill with the default value', () => {
      const x = null;

      expect(targetType.fill(x)).toBe('none');
    });
  });
});

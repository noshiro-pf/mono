import { expectType, Result } from 'ts-data-forge';
import { array } from '../array/index.mjs';
import { number, string } from '../primitives/index.mjs';
import { type TypeOf } from '../type.mjs';
import {
  type ValidationError,
  validationErrorsToMessages,
} from '../utils/index.mjs';
import { union } from './union.mjs';

describe('union - primitive and array', () => {
  const targetType = union([string(), array(number()), array(string())], {
    defaultType: string(),
  });

  type TargetType = TypeOf<typeof targetType>;

  expectType<TargetType, string | readonly number[] | readonly string[]>('=');

  expectType<typeof targetType.defaultValue, TargetType>('=');

  describe('is', () => {
    test('truthy case - string', () => {
      const x: unknown = 'plain';

      if (targetType.is(x)) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      assert.isTrue(targetType.is(x));
    });

    test('truthy case - number array', () => {
      const x: unknown = [1, 2, 3];

      if (targetType.is(x)) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      assert.isTrue(targetType.is(x));
    });

    test('truthy case - string array', () => {
      const x: unknown = ['a', 'b', 'c'];

      if (targetType.is(x)) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      assert.isTrue(targetType.is(x));
    });

    test('falsy case', () => {
      const x: unknown = { key: 'value' };

      if (targetType.is(x)) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      assert.isFalse(targetType.is(x));
    });
  });

  describe('validate', () => {
    test('truthy case - string', () => {
      const result = targetType.validate('hello');

      expectType<typeof result, Result<TargetType, readonly ValidationError[]>>(
        '=',
      );

      assert.isTrue(Result.isOk(result));

      const resultValue = Result.unwrapThrow(result);

      expect(resultValue).toBe('hello');
    });

    test('truthy case - number array', () => {
      const result = targetType.validate([10, 20, 30]);

      assert.isTrue(Result.isOk(result));

      const resultValue = Result.unwrapThrow(result);

      assert.deepStrictEqual(resultValue, [10, 20, 30]);
    });

    test('truthy case - string array', () => {
      const result = targetType.validate(['x', 'y']);

      assert.isTrue(Result.isOk(result));

      const resultValue = Result.unwrapThrow(result);

      assert.deepStrictEqual(resultValue, ['x', 'y']);
    });

    test('falsy case', () => {
      const result = targetType.validate(42);

      assert.isTrue(Result.isErr(result));

      const resultError = Result.unwrapErrThrow(result);

      assert.deepStrictEqual(resultError[0], {
        path: [],
        actualValue: 42,
        expectedType: '(string | number[] | string[])',
        typeName: '(string | number[] | string[])',
        details: {
          kind: 'union',
          typeNames: ['string', 'number[]', 'string[]'],
        },
      });

      assert.deepStrictEqual(validationErrorsToMessages(resultError), [
        'Error: expected one of <string>, <number[]>, <string[]> but <number> type value `42` was passed.',
      ]);
    });

    test('validate returns input as-is for OK cases', () => {
      const input = [1, 2, 3];

      const result = targetType.validate(input);

      assert.isTrue(Result.isOk(result));

      const resultValue = Result.unwrapThrow(result);

      expect(resultValue).toBe(input);
    });
  });

  describe('fill', () => {
    test('noop - string', () => {
      const x: unknown = 'keep';

      assert.deepStrictEqual(targetType.fill(x), 'keep');
    });

    test('noop - number array', () => {
      const x: unknown = [7, 8, 9];

      assert.deepStrictEqual(targetType.fill(x), [7, 8, 9]);
    });

    test('noop - string array', () => {
      const x: unknown = ['p', 'q'];

      assert.deepStrictEqual(targetType.fill(x), ['p', 'q']);
    });

    test('fill with the default value', () => {
      const x = true;

      expect(targetType.fill(x)).toBe('');
    });
  });
});

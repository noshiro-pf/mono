import { expectType, Result } from 'ts-data-forge';
import { array } from '../array/index.mjs';
import { number, string } from '../primitives/index.mjs';
import { record } from '../record/index.mjs';
import { type TypeOf } from '../type.mjs';
import {
  type ValidationError,
  validationErrorsToMessages,
} from '../utils/index.mjs';
import { union } from './union.mjs';

describe('union - record and array', () => {
  const targetType = union(
    [record({ x: number(), y: number() }), array(string()), array(number())],
    {
      defaultType: array(number()),
    },
  );

  type TargetType = TypeOf<typeof targetType>;

  expectType<
    TargetType,
    | Readonly<{
        x: number;
        y: number;
      }>
    | readonly string[]
    | readonly number[]
  >('=');

  expectType<typeof targetType.defaultValue, TargetType>('=');

  describe('is', () => {
    test('truthy case - record', () => {
      const x: unknown = { x: 10, y: 20 };

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

    test('truthy case - number array', () => {
      const x: unknown = [1, 2, 3];

      if (targetType.is(x)) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      assert.isTrue(targetType.is(x));
    });

    test('falsy case', () => {
      const x: unknown = 'string';

      if (targetType.is(x)) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      assert.isFalse(targetType.is(x));
    });
  });

  describe('validate', () => {
    test('truthy case - record', () => {
      const result = targetType.validate({ x: 100, y: 200 });

      expectType<typeof result, Result<TargetType, readonly ValidationError[]>>(
        '=',
      );

      assert.isTrue(Result.isOk(result));

      const resultValue = Result.unwrapThrow(result);

      assert.deepStrictEqual(resultValue, { x: 100, y: 200 });
    });

    test('truthy case - string array', () => {
      const result = targetType.validate(['foo', 'bar']);

      assert.isTrue(Result.isOk(result));

      const resultValue = Result.unwrapThrow(result);

      assert.deepStrictEqual(resultValue, ['foo', 'bar']);
    });

    test('truthy case - number array', () => {
      const result = targetType.validate([10, 20, 30]);

      assert.isTrue(Result.isOk(result));

      const resultValue = Result.unwrapThrow(result);

      assert.deepStrictEqual(resultValue, [10, 20, 30]);
    });

    test('falsy case', () => {
      const result = targetType.validate(123);

      assert.isTrue(Result.isErr(result));

      const resultError = Result.unwrapErrThrow(result);

      assert.deepStrictEqual(resultError[0], {
        path: [],
        actualValue: 123,
        expectedType: '({ x: number, y: number } | string[] | number[])',
        typeName: '({ x: number, y: number } | string[] | number[])',
        details: {
          kind: 'union',
          typeNames: ['{ x: number, y: number }', 'string[]', 'number[]'],
        },
      });

      assert.deepStrictEqual(validationErrorsToMessages(resultError), [
        'Error: expected one of <{ x: number, y: number }>, <string[]>, <number[]> but <number> type value `123` was passed.',
      ]);
    });

    test('validate returns input as-is for OK cases', () => {
      const input = { x: 5, y: 10 };

      const result = targetType.validate(input);

      assert.isTrue(Result.isOk(result));

      const resultValue = Result.unwrapThrow(result);

      expect(resultValue).toBe(input);
    });
  });

  describe('fill', () => {
    test('noop - record', () => {
      const x: unknown = { x: 7, y: 8 };

      assert.deepStrictEqual(targetType.fill(x), { x: 7, y: 8 });
    });

    test('noop - string array', () => {
      const x: unknown = ['p', 'q'];

      assert.deepStrictEqual(targetType.fill(x), ['p', 'q']);
    });

    test('noop - number array', () => {
      const x: unknown = [99, 88];

      assert.deepStrictEqual(targetType.fill(x), [99, 88]);
    });

    test('fill with the default value', () => {
      const x = 'invalid';

      assert.deepStrictEqual(targetType.fill(x), []);
    });
  });
});

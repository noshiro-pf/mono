import { expectType, Result } from 'ts-data-forge';
import { array } from '../array/index.mjs';
import { literal } from '../other-types/index.mjs';
import { number, string } from '../primitives/index.mjs';
import { type TypeOf } from '../type.mjs';
import {
  type ValidationError,
  validationErrorsToMessages,
} from '../utils/index.mjs';
import { union } from './union.mjs';

describe('union - nested arrays', () => {
  const targetType = union(
    [array(array(number())), array(string()), literal(0)],
    {
      defaultType: literal(0),
    },
  );

  type TargetType = TypeOf<typeof targetType>;

  expectType<
    TargetType,
    readonly (readonly number[])[] | readonly string[] | 0
  >('=');

  expectType<typeof targetType.defaultValue, TargetType>('=');

  describe('is', () => {
    test('truthy case - nested array', () => {
      const x: unknown = [
        [1, 2],
        [3, 4],
      ];

      if (targetType.is(x)) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      assert.isTrue(targetType.is(x));
    });

    test('truthy case - string array', () => {
      const x: unknown = ['a', 'b'];

      if (targetType.is(x)) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      assert.isTrue(targetType.is(x));
    });

    test('truthy case - empty array literal', () => {
      const x: unknown = [];

      if (targetType.is(x)) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      assert.isTrue(targetType.is(x));
    });

    test('truthy case - literal', () => {
      const x: unknown = 0;

      if (targetType.is(x)) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      assert.isTrue(targetType.is(x));
    });

    test('falsy case', () => {
      const x: unknown = 123;

      if (targetType.is(x)) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      assert.isFalse(targetType.is(x));
    });
  });

  describe('validate', () => {
    test('truthy case - nested array', () => {
      const result = targetType.validate([
        [10, 20],
        [30, 40],
      ]);

      expectType<typeof result, Result<TargetType, readonly ValidationError[]>>(
        '=',
      );

      assert.isTrue(Result.isOk(result));

      const resultValue = Result.unwrapThrow(result);

      assert.deepStrictEqual(resultValue, [
        [10, 20],
        [30, 40],
      ]);
    });

    test('truthy case - string array', () => {
      const result = targetType.validate(['x', 'y', 'z']);

      assert.isTrue(Result.isOk(result));

      const resultValue = Result.unwrapThrow(result);

      assert.deepStrictEqual(resultValue, ['x', 'y', 'z']);
    });

    test('truthy case - empty array literal', () => {
      const result = targetType.validate([]);

      assert.isTrue(Result.isOk(result));

      const resultValue = Result.unwrapThrow(result);

      assert.deepStrictEqual(resultValue, []);
    });

    test('truthy case - literal', () => {
      const result = targetType.validate(0);

      assert.isTrue(Result.isOk(result));

      const resultValue = Result.unwrapThrow(result);

      expect(resultValue).toBe(0);
    });

    test('falsy case', () => {
      const result = targetType.validate('not array');

      assert.isTrue(Result.isErr(result));

      const resultError = Result.unwrapErrThrow(result);

      assert.deepStrictEqual(resultError[0], {
        path: [],
        actualValue: 'not array',
        expectedType: '(number[][] | string[] | literal(0))',
        typeName: '(number[][] | string[] | literal(0))',
        details: {
          kind: 'union',
          typeNames: ['number[][]', 'string[]', 'literal(0)'],
        },
      });

      assert.deepStrictEqual(validationErrorsToMessages(resultError), [
        'Error: expected one of { number[][], string[], literal(0) } but <string> type value "not array" was passed.',
      ]);
    });

    test('validate returns input as-is for OK cases', () => {
      const input = [
        [1, 2],
        [3, 4],
      ];

      const result = targetType.validate(input);

      assert.isTrue(Result.isOk(result));

      const resultValue = Result.unwrapThrow(result);

      expect(resultValue).toBe(input);
    });
  });

  describe('fill', () => {
    test('noop - nested array', () => {
      const x: unknown = [
        [5, 6],
        [7, 8],
      ];

      assert.deepStrictEqual(targetType.fill(x), [
        [5, 6],
        [7, 8],
      ]);
    });

    test('noop - string array', () => {
      const x: unknown = ['a', 'b'];

      assert.deepStrictEqual(targetType.fill(x), ['a', 'b']);
    });

    test('noop - empty array', () => {
      const x: unknown = [];

      assert.deepStrictEqual(targetType.fill(x), []);
    });

    test('noop - literal', () => {
      const x: unknown = 0;

      assert.deepStrictEqual(targetType.fill(x), 0);
    });

    test('fill with the default value', () => {
      const x = null;

      assert.deepStrictEqual(targetType.fill(x), 0);
    });
  });
});

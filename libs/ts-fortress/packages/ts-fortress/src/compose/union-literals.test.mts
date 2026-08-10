import { expectType, Result } from 'ts-data-forge';
import { literal } from '../other-types/index.mjs';
import { type TypeOf } from '../type.mjs';
import {
  type ValidationError,
  validationErrorsToMessages,
} from '../utils/index.mjs';
import { union } from './union.mjs';

describe('union - literals only', () => {
  const targetType = union(
    [literal('red'), literal('green'), literal('blue')],
    {
      defaultType: literal('red'),
    },
  );

  type TargetType = TypeOf<typeof targetType>;

  expectType<TargetType, 'red' | 'green' | 'blue'>('=');

  expectType<typeof targetType.defaultValue, TargetType>('=');

  describe('is', () => {
    test('truthy case', () => {
      const x: unknown = 'green';

      if (targetType.is(x)) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      assert.isTrue(targetType.is(x));
    });

    test('falsy case', () => {
      const x: unknown = 'yellow';

      if (targetType.is(x)) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      assert.isFalse(targetType.is(x));
    });
  });

  describe('validate', () => {
    test('truthy case', () => {
      const result = targetType.validate('blue');

      expectType<typeof result, Result<TargetType, readonly ValidationError[]>>(
        '=',
      );

      assert.isTrue(Result.isOk(result));

      const resultValue = Result.unwrapThrow(result);

      expect(resultValue).toBe('blue');
    });

    test('falsy case', () => {
      const result = targetType.validate('purple');

      assert.isTrue(Result.isErr(result));

      const resultError = Result.unwrapErrThrow(result);

      assert.deepStrictEqual(resultError[0], {
        path: [],
        actualValue: 'purple',
        expectedType: '("red" | "green" | "blue")',
        typeName: '("red" | "green" | "blue")',
        details: {
          kind: 'union',
          typeNames: ['"red"', '"green"', '"blue"'],
        },
      });

      assert.deepStrictEqual(validationErrorsToMessages(resultError), [
        'Error: expected one of <"red">, <"green">, <"blue"> but <string> type value "purple" was passed.',
      ]);
    });

    test('validate returns input as-is for OK cases', () => {
      const input = 'red';

      const result = targetType.validate(input);

      assert.isTrue(Result.isOk(result));

      const resultValue = Result.unwrapThrow(result);

      expect(resultValue).toBe(input);
    });
  });

  describe('fill', () => {
    test('noop', () => {
      const x: unknown = 'blue';

      assert.deepStrictEqual(targetType.fill(x), 'blue');
    });

    test('fill with the default value', () => {
      const x = 'invalid';

      expect(targetType.fill(x)).toBe('red');
    });
  });
});

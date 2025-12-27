import { expectType, Result } from 'ts-data-forge';
import { literal } from '../other-types/index.mjs';
import { number, string } from '../primitives/index.mjs';
import { type TypeOf } from '../type.mjs';
import {
  type ValidationError,
  validationErrorsToMessages,
} from '../utils/index.mjs';
import { union } from './union.mjs';

describe('union - primitive and literal', () => {
  const targetType = union([string(), literal(42), number()], {
    defaultType: literal(42),
  });

  type TargetType = TypeOf<typeof targetType>;

  expectType<TargetType, string | 42 | number>('=');

  expectType<typeof targetType.defaultValue, TargetType>('=');

  describe('is', () => {
    test('truthy case - string', () => {
      const x: unknown = 'hello';

      if (targetType.is(x)) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      assert.isTrue(targetType.is(x));
    });

    test('truthy case - literal', () => {
      const x: unknown = 42;

      if (targetType.is(x)) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      assert.isTrue(targetType.is(x));
    });

    test('truthy case - number', () => {
      const x: unknown = 100;

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
    test('truthy case - string', () => {
      const result = targetType.validate('test');

      expectType<typeof result, Result<TargetType, readonly ValidationError[]>>(
        '=',
      );

      assert.isTrue(Result.isOk(result));

      const resultValue = Result.unwrapThrow(result);

      expect(resultValue).toBe('test');
    });

    test('truthy case - literal', () => {
      const result = targetType.validate(42);

      assert.isTrue(Result.isOk(result));

      const resultValue = Result.unwrapThrow(result);

      expect(resultValue).toBe(42);
    });

    test('truthy case - number', () => {
      const result = targetType.validate(999);

      assert.isTrue(Result.isOk(result));

      const resultValue = Result.unwrapThrow(result);

      expect(resultValue).toBe(999);
    });

    test('falsy case', () => {
      const result = targetType.validate(null);

      assert.isTrue(Result.isErr(result));

      const resultError = Result.unwrapErrThrow(result);

      assert.deepStrictEqual(resultError[0], {
        path: [],
        actualValue: null,
        expectedType: '(string | literal(42) | number)',
        typeName: '(string | literal(42) | number)',
        details: {
          kind: 'union',
          typeNames: ['string', 'literal(42)', 'number'],
        },
      });

      assert.deepStrictEqual(validationErrorsToMessages(resultError), [
        'Error: expected one of { string, literal(42), number } but <object> type value `null` was passed.',
      ]);
    });

    test('validate returns input as-is for OK cases', () => {
      const input = 'immutable';

      const result = targetType.validate(input);

      assert.isTrue(Result.isOk(result));

      const resultValue = Result.unwrapThrow(result);

      expect(resultValue).toBe(input);
    });
  });

  describe('fill', () => {
    test('noop - string', () => {
      const x: unknown = 'world';

      assert.deepStrictEqual(targetType.fill(x), 'world');
    });

    test('noop - number', () => {
      const x: unknown = 7;

      assert.deepStrictEqual(targetType.fill(x), 7);
    });

    test('fill with the default value', () => {
      const x = false;

      expect(targetType.fill(x)).toBe(42);
    });
  });
});

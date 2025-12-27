import { expectType, Result } from 'ts-data-forge';
import { number, string } from '../primitives/index.mjs';
import { record } from '../record/index.mjs';
import { type TypeOf } from '../type.mjs';
import {
  type ValidationError,
  validationErrorsToMessages,
} from '../utils/index.mjs';
import { union } from './union.mjs';

describe('union - record and primitive', () => {
  const targetType = union(
    [record({ id: number(), name: string() }), string(), number()],
    {
      defaultType: string(),
    },
  );

  type TargetType = TypeOf<typeof targetType>;

  expectType<
    TargetType,
    | Readonly<{
        id: number;
        name: string;
      }>
    | string
    | number
  >('=');

  expectType<typeof targetType.defaultValue, TargetType>('=');

  describe('is', () => {
    test('truthy case - record', () => {
      const x: unknown = { id: 123, name: 'test' };

      if (targetType.is(x)) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      assert.isTrue(targetType.is(x));
    });

    test('truthy case - string', () => {
      const x: unknown = 'hello';

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

    test('falsy case', () => {
      const x: unknown = [1, 2, 3];

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
      const result = targetType.validate({ id: 999, name: 'user' });

      expectType<typeof result, Result<TargetType, readonly ValidationError[]>>(
        '=',
      );

      assert.isTrue(Result.isOk(result));

      const resultValue = Result.unwrapThrow(result);

      assert.deepStrictEqual(resultValue, { id: 999, name: 'user' });
    });

    test('truthy case - string', () => {
      const result = targetType.validate('valid');

      assert.isTrue(Result.isOk(result));

      const resultValue = Result.unwrapThrow(result);

      expect(resultValue).toBe('valid');
    });

    test('truthy case - number', () => {
      const result = targetType.validate(777);

      assert.isTrue(Result.isOk(result));

      const resultValue = Result.unwrapThrow(result);

      expect(resultValue).toBe(777);
    });

    test('falsy case', () => {
      const result = targetType.validate(true);

      assert.isTrue(Result.isErr(result));

      const resultError = Result.unwrapErrThrow(result);

      assert.deepStrictEqual(resultError[0], {
        path: [],
        actualValue: true,
        expectedType: '({ id: number, name: string } | string | number)',
        typeName: '({ id: number, name: string } | string | number)',
        details: {
          kind: 'union',
          typeNames: ['{ id: number, name: string }', 'string', 'number'],
        },
      });

      assert.deepStrictEqual(validationErrorsToMessages(resultError), [
        'Error: expected one of { { id: number, name: string }, string, number } but <boolean> type value `true` was passed.',
      ]);
    });

    test('validate returns input as-is for OK cases', () => {
      const input = { id: 1, name: 'original' };

      const result = targetType.validate(input);

      assert.isTrue(Result.isOk(result));

      const resultValue = Result.unwrapThrow(result);

      expect(resultValue).toBe(input);
    });
  });

  describe('fill', () => {
    test('noop - record', () => {
      const x: unknown = { id: 5, name: 'test' };

      assert.deepStrictEqual(targetType.fill(x), { id: 5, name: 'test' });
    });

    test('noop - string', () => {
      const x: unknown = 'keep';

      assert.deepStrictEqual(targetType.fill(x), 'keep');
    });

    test('noop - number', () => {
      const x: unknown = 100;

      assert.deepStrictEqual(targetType.fill(x), 100);
    });

    test('fill with the default value', () => {
      const x = null;

      expect(targetType.fill(x)).toBe('');
    });
  });
});

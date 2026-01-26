import { expectType, Result } from 'ts-data-forge';
import { number, string } from '../primitives/index.mjs';
import { record } from '../record/index.mjs';
import { type TypeOf } from '../type.mjs';
import {
  type ValidationError,
  validationErrorsToMessages,
} from '../utils/index.mjs';
import { union } from './union.mjs';

describe('union - nested records', () => {
  const targetType = union(
    [
      record({
        type: string(),
        data: record({ value: number() }),
      }),
      record({
        kind: string(),
        config: record({ enabled: string() }),
      }),
    ],
    {
      defaultType: record({
        type: string(),
        data: record({ value: number() }),
      }),
    },
  );

  type TargetType = TypeOf<typeof targetType>;

  expectType<
    TargetType,
    Readonly<
      | {
          type: string;
          data: Readonly<{ value: number }>;
        }
      | {
          kind: string;
          config: Readonly<{ enabled: string }>;
        }
    >
  >('=');

  expectType<typeof targetType.defaultValue, TargetType>('=');

  describe('is', () => {
    test('truthy case - first nested record', () => {
      const x: unknown = { type: 'A', data: { value: 10 } };

      if (targetType.is(x)) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      assert.isTrue(targetType.is(x));
    });

    test('truthy case - second nested record', () => {
      const x: unknown = { kind: 'B', config: { enabled: 'yes' } };

      if (targetType.is(x)) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      assert.isTrue(targetType.is(x));
    });

    test('falsy case', () => {
      const x: unknown = { wrong: 'structure' };

      if (targetType.is(x)) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      assert.isFalse(targetType.is(x));
    });
  });

  describe('validate', () => {
    test('truthy case - first nested record', () => {
      const result = targetType.validate({ type: 'test', data: { value: 42 } });

      expectType<typeof result, Result<TargetType, readonly ValidationError[]>>(
        '=',
      );

      assert.isTrue(Result.isOk(result));

      const resultValue = Result.unwrapThrow(result);

      assert.deepStrictEqual(resultValue, {
        type: 'test',
        data: { value: 42 },
      });
    });

    test('truthy case - second nested record', () => {
      const result = targetType.validate({
        kind: 'option',
        config: { enabled: 'true' },
      });

      assert.isTrue(Result.isOk(result));

      const resultValue = Result.unwrapThrow(result);

      assert.deepStrictEqual(resultValue, {
        kind: 'option',
        config: { enabled: 'true' },
      });
    });

    test('falsy case', () => {
      const result = targetType.validate({ invalid: 'data' });

      assert.isTrue(Result.isErr(result));

      const resultError = Result.unwrapErrThrow(result);

      assert.deepStrictEqual(resultError[0], {
        path: [],
        actualValue: { invalid: 'data' },
        expectedType:
          '({ type: string, data: { value: number } } | { kind: string, config: { enabled: string } })',
        typeName:
          '({ type: string, data: { value: number } } | { kind: string, config: { enabled: string } })',
        details: {
          kind: 'union',
          typeNames: [
            '{ type: string, data: { value: number } }',
            '{ kind: string, config: { enabled: string } }',
          ],
        },
      });

      assert.deepStrictEqual(validationErrorsToMessages(resultError), [
        'Error: expected one of <{ type: string, data: { value: number } }>, <{ kind: string, config: { enabled: string } }> but <object> type value `{"invalid":"data"}` was passed.',
      ]);
    });

    test('validate returns input as-is for OK cases', () => {
      const input = { type: 'original', data: { value: 100 } };

      const result = targetType.validate(input);

      assert.isTrue(Result.isOk(result));

      const resultValue = Result.unwrapThrow(result);

      expect(resultValue).toBe(input);
    });
  });

  describe('fill', () => {
    test('noop - first nested record', () => {
      const x: unknown = { type: 'valid', data: { value: 5 } };

      assert.deepStrictEqual(targetType.fill(x), {
        type: 'valid',
        data: { value: 5 },
      });
    });

    test('noop - second nested record', () => {
      const x: unknown = { kind: 'ok', config: { enabled: 'yes' } };

      assert.deepStrictEqual(targetType.fill(x), {
        kind: 'ok',
        config: { enabled: 'yes' },
      });
    });

    test('fill with the default value', () => {
      const x = 123;

      assert.deepStrictEqual(targetType.fill(x), {
        type: '',
        data: { value: 0 },
      });
    });
  });
});

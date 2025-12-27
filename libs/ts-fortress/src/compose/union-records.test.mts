import { expectType, Result } from 'ts-data-forge';
import { number, string } from '../primitives/index.mjs';
import { record } from '../record/index.mjs';
import { type TypeOf } from '../type.mjs';
import {
  type ValidationError,
  validationErrorsToMessages,
} from '../utils/index.mjs';
import { union } from './union.mjs';

describe('union - records only', () => {
  const targetType = union(
    [
      record({ kind: string(), value: number() }),
      record({ type: string(), data: string() }),
    ],
    {
      defaultType: record({ kind: string(), value: number() }),
    },
  );

  type TargetType = TypeOf<typeof targetType>;

  expectType<
    TargetType,
    | Readonly<{
        kind: string;
        value: number;
      }>
    | Readonly<{
        type: string;
        data: string;
      }>
  >('=');

  expectType<typeof targetType.defaultValue, TargetType>('=');

  describe('is', () => {
    test('truthy case - first record', () => {
      const x: unknown = { kind: 'A', value: 10 };

      if (targetType.is(x)) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      assert.isTrue(targetType.is(x));
    });

    test('truthy case - second record', () => {
      const x: unknown = { type: 'B', data: 'test' };

      if (targetType.is(x)) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      assert.isTrue(targetType.is(x));
    });

    test('falsy case', () => {
      const x: unknown = { invalid: 'field' };

      if (targetType.is(x)) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      assert.isFalse(targetType.is(x));
    });
  });

  describe('validate', () => {
    test('truthy case - first record', () => {
      const result = targetType.validate({ kind: 'test', value: 42 });

      expectType<typeof result, Result<TargetType, readonly ValidationError[]>>(
        '=',
      );

      assert.isTrue(Result.isOk(result));

      const resultValue = Result.unwrapThrow(result);

      assert.deepStrictEqual(resultValue, { kind: 'test', value: 42 });
    });

    test('truthy case - second record', () => {
      const result = targetType.validate({ type: 'info', data: 'content' });

      assert.isTrue(Result.isOk(result));

      const resultValue = Result.unwrapThrow(result);

      assert.deepStrictEqual(resultValue, { type: 'info', data: 'content' });
    });

    test('falsy case', () => {
      const result = targetType.validate({ wrong: 'structure' });

      assert.isTrue(Result.isErr(result));

      const resultError = Result.unwrapErrThrow(result);

      assert.deepStrictEqual(resultError[0], {
        path: [],
        actualValue: { wrong: 'structure' },
        expectedType:
          '({ kind: string, value: number } | { type: string, data: string })',
        typeName:
          '({ kind: string, value: number } | { type: string, data: string })',
        details: {
          kind: 'union',
          typeNames: [
            '{ kind: string, value: number }',
            '{ type: string, data: string }',
          ],
        },
      });

      assert.deepStrictEqual(validationErrorsToMessages(resultError), [
        'Error: expected one of <{ kind: string, value: number }>, <{ type: string, data: string }> but <object> type value was passed.',
      ]);
    });

    test('validate returns input as-is for OK cases', () => {
      const input = { kind: 'original', value: 100 };

      const result = targetType.validate(input);

      assert.isTrue(Result.isOk(result));

      const resultValue = Result.unwrapThrow(result);

      expect(resultValue).toBe(input);
    });
  });

  describe('fill', () => {
    test('noop - first record', () => {
      const x: unknown = { kind: 'valid', value: 5 };

      assert.deepStrictEqual(targetType.fill(x), { kind: 'valid', value: 5 });
    });

    test('noop - second record', () => {
      const x: unknown = { type: 'ok', data: 'yes' };

      assert.deepStrictEqual(targetType.fill(x), { type: 'ok', data: 'yes' });
    });

    test('fill with the default value', () => {
      const x = 123;

      assert.deepStrictEqual(targetType.fill(x), { kind: '', value: 0 });
    });
  });
});

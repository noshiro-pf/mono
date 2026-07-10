import { expectType, Result } from 'ts-data-forge';
import { type UnknownRecord } from 'ts-type-forge';
import { number, string } from '../primitives/index.mjs';
import { record, strictRecord } from '../record/index.mjs';
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
    Readonly<
      | {
          kind: string;
          value: number;
        }
      | {
          type: string;
          data: string;
        }
    >
  >('=');

  expectType<typeof targetType.defaultValue, TargetType>('=');

  describe('is', () => {
    test('truthy case - first record', () => {
      const x: unknown = { kind: 'A', value: 10 } as const;

      if (targetType.is(x)) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      assert.isTrue(targetType.is(x));
    });

    test('truthy case - second record', () => {
      const x: unknown = { type: 'B', data: 'test' } as const;

      if (targetType.is(x)) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      assert.isTrue(targetType.is(x));
    });

    test('falsy case', () => {
      const x: unknown = { invalid: 'field' } as const;

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
      const input = { kind: 'original', value: 100 } as const;

      const result = targetType.validate(input);

      assert.isTrue(Result.isOk(result));

      const resultValue = Result.unwrapThrow(result);

      expect(resultValue).toBe(input);
    });
  });

  describe('fill', () => {
    test('noop - first record', () => {
      const x: unknown = { kind: 'valid', value: 5 } as const;

      assert.deepStrictEqual(targetType.fill(x), { kind: 'valid', value: 5 });
    });

    test('noop - second record', () => {
      const x: unknown = { type: 'ok', data: 'yes' } as const;

      assert.deepStrictEqual(targetType.fill(x), { type: 'ok', data: 'yes' });
    });

    test('fill with the default value', () => {
      const x = 123;

      assert.deepStrictEqual(targetType.fill(x), { kind: '', value: 0 });
    });
  });

  describe('prune', () => {
    test('prunes with the first member that matches', () => {
      assert.deepStrictEqual(
        targetType.prune({ kind: 'A', value: 10, excess: 9 }),
        { kind: 'A', value: 10 },
      );
    });

    test('prunes with the second member when the first does not match', () => {
      assert.deepStrictEqual(
        targetType.prune({ type: 'B', data: 'x', excess: 9 }),
        { type: 'B', data: 'x' },
      );
    });

    test('member order decides the result when multiple members match', () => {
      // The value matches both members; the first one wins, so the second
      // member's paths (`type`, `data`) are removed.
      assert.deepStrictEqual(
        targetType.prune({ kind: 'A', value: 10, type: 'B', data: 'x' }),
        { kind: 'A', value: 10 },
      );
    });
  });
});

describe('union - prune member selection traps', () => {
  const point2d = record({ x: number(), y: number() });

  const point2dStrict = strictRecord({ x: number(), y: number() });

  const point3d = record({ x: number(), y: number(), z: number() });

  test('an earlier member that also matches removes later member paths', () => {
    // point2d.is({ x, y, z }) is true because excess properties are allowed
    // by default, so the value is pruned as a 2D point and `z` is removed.
    assert.deepStrictEqual(
      union([point2d, point3d]).prune({ x: 1, y: 2, z: 3 }),
      { x: 1, y: 2 },
    );
  });

  test('putting the more specific member first keeps its paths', () => {
    assert.deepStrictEqual(
      union([point3d, point2d]).prune({ x: 1, y: 2, z: 3 }),
      { x: 1, y: 2, z: 3 },
    );
  });

  test('a member that rejects the value falls through to later members', () => {
    // strictRecord rejects excess properties, so `is` fails for the first
    // member and the 3D member prunes the value instead.
    assert.deepStrictEqual(
      union([point2dStrict, point3d]).prune({
        x: 1,
        y: 2,
        z: 3,
      }),
      { x: 1, y: 2, z: 3 },
    );
  });

  test('returns the value as-is when no member matches', () => {
    // Contract-violating input (excess property on a strict record): prune
    // removes nothing rather than guessing a member.
    const pruned: UnknownRecord = union([point2dStrict]).prune({
      x: 1,
      y: 2,
      z: 3,
    });

    assert.deepStrictEqual(pruned, { x: 1, y: 2, z: 3 });
  });

  test('prunes recursively inside the matched member', () => {
    const withNested = union([
      record({ pos: point2d }),
      record({ other: number() }),
    ]);

    assert.deepStrictEqual(
      withNested.prune({ pos: { x: 1, y: 2, z: 9 }, excess: 9 }),
      { pos: { x: 1, y: 2 } },
    );
  });
});

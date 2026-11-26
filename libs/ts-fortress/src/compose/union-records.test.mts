import { expectType, Result } from 'ts-data-forge';
import type { UnknownRecord } from 'ts-type-forge';
import { array, tuple } from '../array/index.mjs';
import { literal, recursion } from '../other-types/index.mjs';
import { nullType, number, string } from '../primitives/index.mjs';
import {
  keyValueRecord,
  optional,
  record,
  strictRecord,
} from '../record/index.mjs';
import type { Type, TypeOf } from '../type.mjs';
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
          kind: 'union-closest-member',
          memberCount: 2,
          closestMemberTypeName: '{ kind: string, value: number }',
          equallyCloseMemberTypeNames: ['{ type: string, data: string }'],
        },
      });

      assert.deepStrictEqual(validationErrorsToMessages(resultError), [
        'Error: the value did not match any of the 2 members of the union; the closest member types are <{ kind: string, value: number }>, <{ type: string, data: string }>; the first of them failed as follows:',
        'Error at kind: missing required key "kind".',
        'Error at value: missing required key "value".',
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

describe('union - fill repairs with the closest member', () => {
  test('a record missing a key is repaired by the record, not by a first null', () => {
    const nullable = union([nullType, record({ x: number(), y: number() })]);

    assert.deepStrictEqual(nullable.fill({ x: 1 }), { x: 1, y: 0 });

    assert.deepStrictEqual(nullable.fill({}), { x: 0, y: 0 });

    // A value of no member's category is still repaired by the default.
    assert.isNull(nullable.fill('x'));
  });

  test('a discriminated variant keeps its discriminant', () => {
    const circle = record({ kind: literal('circle'), radius: number() });

    const square = record({ kind: literal('square'), size: number() });

    const shape = union([square, circle]);

    assert.deepStrictEqual(shape.fill({ kind: 'circle', radius: '5' }), {
      kind: 'circle',
      radius: 0,
    });
  });

  test('members as close as each other leave the repair to the default', () => {
    const ac = record({ a: number(), c: number() });

    const bd = record({ b: number(), d: number() });

    // Each keeps one key of the value and drops the other.
    assert.deepStrictEqual(union([ac, bd]).fill({ a: 1, b: 2 }), {
      a: 1,
      c: 0,
    });

    assert.deepStrictEqual(union([bd, ac]).fill({ a: 1, b: 2 }), {
      b: 2,
      d: 0,
    });
  });

  test('members that keep none of the value leave the repair to the default', () => {
    const a = record({ a: number() });

    const b = record({ b: number() });

    assert.deepStrictEqual(union([a, b]).fill({ c: 1 }), { a: 0 });
  });

  test('a record repeated by a nested union is one member', () => {
    const xy = record({ x: number(), y: number() });

    assert.deepStrictEqual(
      union([nullType, xy, union([xy, nullType])]).fill({}),
      { x: 0, y: 0 },
    );
  });

  test("a value that is not a plain object nor an array reads no default, nor an array a record's", () => {
    const Even: Type<unknown> = recursion('Even', () =>
      record({ type: literal('even'), next: union([Odd, nullType]) }),
    );

    const Odd: Type<unknown> = recursion('Odd', () =>
      record({ type: literal('odd'), next: union([Even, nullType]) }),
    );

    assert.isNull(union([nullType, Even]).fill('x'));

    assert.isNull(union([nullType, Even]).fill([1]));

    assert.isNull(union([nullType, record({ x: number() })]).fill(new Date(0)));
  });

  test('a given defaultType repairs as before', () => {
    const nullable = union([nullType, record({ x: number() })], {
      defaultType: nullType,
    });

    assert.isNull(nullable.fill({ garbage: true }));
  });

  test('a closer member that checks the value as a whole leaves the repair to the default', () => {
    assert.deepStrictEqual(
      union([
        keyValueRecord(string(), number()),
        record({ x: number(), y: number(), z: number() }),
      ]).fill({ a: 1, b: 2, c: 'x' }),
      { a: 1, b: 2 },
    );
  });

  test('a record that keeps one key does not win against a member that checks the value as a whole', () => {
    const kv = keyValueRecord(string(), number());

    assert.deepStrictEqual(
      union([kv, record({ x: number(), y: number() })]).fill({
        x: 1,
        y: 'bad',
        a: 2,
      }),
      kv.fill({ x: 1, y: 'bad', a: 2 }),
    );

    const numbers = array(number());

    assert.deepStrictEqual(
      union([numbers, tuple([string(), string()])]).fill([1, 'x']),
      numbers.fill([1, 'x']),
    );
  });

  test('a recursion that is not a record leaves the repair to the default', () => {
    const T: Type<unknown> = recursion('T', () => tuple([number(), array(T)]));

    assert.isNull(
      union([nullType, T, tuple([number(), string()])]).fill([1, 5]),
    );
  });

  test('a key holding undefined speaks for no member', () => {
    const az = record({ a: number(), z: number() });

    const bc = record({ b: number(), c: number() });

    // Without `z`, each keeps one key and does not declare the other: a tie.
    assert.deepStrictEqual(union([bc, az]).fill({ a: 1, b: 1, z: undefined }), {
      b: 1,
      c: 0,
    });
  });

  test('members checked as a whole leave the repair to the default', () => {
    assert.strictEqual(union([literal('a'), literal('b')]).fill('z'), 'a');
  });

  test('a tuple of another length than the value is not taken for the closest', () => {
    assert.deepStrictEqual(
      union([tuple([number()]), tuple([number(), number(), number()])]).fill([
        'x',
      ]),
      [0],
    );
  });

  test('a nested union repairs with its own defaultType', () => {
    const inner = union(
      [record({ a: number(), b: number() }), record({ c: number() })],
      { defaultType: record({ c: number() }) },
    );

    assert.deepStrictEqual(union([inner, nullType]).fill({ a: 1, b: 'x' }), {
      c: 0,
    });
  });

  test('a variant whose discriminant matches is repaired by it though wrong under one key in several places', () => {
    const circle = record({
      kind: literal('circle'),
      center: record({ x: number(), y: number(), z: number() }),
    });

    const square = record({ kind: literal('square'), size: number() });

    assert.deepStrictEqual(
      union([circle, square]).fill({
        kind: 'circle',
        center: { x: 'a', y: 'b', z: 'c' },
      }),
      { kind: 'circle', center: { x: 0, y: 0, z: 0 } },
    );
  });

  test('keys the value leaves out speak for no variant', () => {
    const a = record({ kind: literal('a'), x: number() });

    const b = record({
      kind: literal('b'),
      o1: optional(number()),
      o2: optional(number()),
      o3: optional(number()),
    });

    assert.deepStrictEqual(union([b, a]).fill({ kind: 'a', x: 'bad' }), {
      kind: 'a',
      x: 0,
    });

    const circle = record({
      kind: literal('circle'),
      cx: number(),
      cy: number(),
      r: number(),
    });

    const square = record({ kind: literal('square'), size: number() });

    assert.deepStrictEqual(union([square, circle]).fill({ kind: 'circle' }), {
      kind: 'circle',
      cx: 0,
      cy: 0,
      r: 0,
    });
  });

  test('a key of the value that a member does not declare counts against it', () => {
    const circle = record({
      kind: literal('circle'),
      radius: number(),
      color: string(),
    });

    const square = record({ kind: literal('square'), size: number() });

    // Each keeps one of the four keys: a tie, repaired by the first member.
    assert.deepStrictEqual(
      union([circle, square]).fill({
        kind: 'circle',
        radius: '5',
        color: 1,
        size: 3,
      }),
      { kind: 'circle', radius: 0, color: '' },
    );
  });

  test('keys an Object.prototype member is named after are counted as any other', () => {
    const xOrY = union([
      nullType,
      record({ x: number(), w: number() }),
      record({ y: number(), w: number() }),
    ]);

    assert.isNull(xOrY.fill({ toString: 'a', x: 'bad' }));

    assert.deepStrictEqual(xOrY.fill({ toString: 'a', x: 1, y: 'bad' }), {
      x: 1,
      w: 0,
    });

    assert.deepStrictEqual(
      xOrY.fill(JSON.parse('{"__proto__":1,"x":1,"y":"bad"}')),
      { x: 1, w: 0 },
    );
  });

  test('a direct member is repaired by itself though a nested union holds it too', () => {
    const xy = record({ x: number(), y: number() });

    assert.deepStrictEqual(
      union([union([xy, nullType], { defaultType: nullType }), xy]).fill({
        x: 1,
      }),
      { x: 1, y: 0 },
    );
  });

  test('a record that rejects an excess key counts it as a key rejected', () => {
    assert.deepStrictEqual(
      union([
        nullType,
        strictRecord({ x: number() }),
        record({ q: number() }),
      ]).fill({ x: 1, y: 2 }),
      { x: 1 },
    );
  });

  test('a tuple of another length is not a repair even as the only one', () => {
    assert.isNull(
      union([nullType, tuple([number(), number()])]).fill([1, 2, 3]),
    );
  });

  test('a tuple is repaired by the closest tuple', () => {
    const pair = union([nullType, tuple([number(), string()])]);

    assert.deepStrictEqual(pair.fill([1, 2]), [1, '']);
  });
});

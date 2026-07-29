import { expectType } from 'ts-data-forge';
import { array, tuple } from '../array/index.mjs';
import { union } from '../compose/index.mjs';
import { literal, recursion } from '../other-types/index.mjs';
import { boolean, nullType, number, string } from '../primitives/index.mjs';
import {
  expandShapeStructure,
  type ShapeStructure,
  type Type,
  type TypeOf,
} from '../type.mjs';
import { at } from './at.mjs';
import { mergeRecords } from './merge-records.mjs';
import { optional } from './optional.mjs';
import { record } from './record.mjs';

describe(at, () => {
  describe('record key access', () => {
    const ymd = record({
      year: number(1900),
      month: number(1),
      date: number(1),
    });

    test('extracts the Type at a key (spec example)', () => {
      const year = at(ymd, 'year');

      expectType<typeof year, Type<number>>('=');

      assert.isTrue(year.is(2000));

      assert.isFalse(year.is('2000'));
    });

    test('returns the exact stored Type (defaultValue preserved)', () => {
      const year = at(ymd, 'year');

      expect(year.defaultValue).toBe(1900);
    });

    test('key argument is constrained to declared keys', () => {
      // @ts-expect-error "nope" is not a key of ymd
      expect(() => at(ymd, 'nope')).toThrow('does not exist');
    });

    test('single-field record', () => {
      const r = record({ only: string() });

      const only = at(r, 'only');

      expectType<TypeOf<typeof only>, string>('=');

      assert.isTrue(only.is('x'));

      assert.isFalse(only.is(1));
    });
  });

  describe('optional key', () => {
    const r = record({ a: number(), b: optional(string()) });

    test('accessed value includes undefined', () => {
      const b = at(r, 'b');

      expectType<TypeOf<typeof b>, string | undefined>('=');

      assert.isTrue(b.is('x'));

      assert.isTrue(b.is(undefined));

      assert.isFalse(b.is(1));
    });

    test('required sibling key is unaffected', () => {
      const a = at(r, 'a');

      expectType<TypeOf<typeof a>, number>('=');

      assert.isTrue(a.is(1));

      assert.isFalse(a.is(undefined));
    });
  });

  describe('union of records', () => {
    const shape = union([
      record({ type: literal('a'), value: number() }),
      record({ type: literal('b'), value: string() }),
    ]);

    test('common key resolves to the union of member types', () => {
      const value = at(shape, 'value');

      expectType<TypeOf<typeof value>, number | string>('=');

      assert.isTrue(value.is(1));

      assert.isTrue(value.is('x'));

      assert.isFalse(value.is(true));
    });

    test('discriminant key resolves to the union of literals', () => {
      const type = at(shape, 'type');

      expectType<TypeOf<typeof type>, 'a' | 'b'>('=');

      assert.isTrue(type.is('a'));

      assert.isTrue(type.is('b'));

      assert.isFalse(type.is('c'));
    });
  });

  describe('mergeRecords (intersection)', () => {
    const merged = mergeRecords([
      record({ a: number() }),
      record({ b: string() }),
    ]);

    test('extracts a key from each merged part', () => {
      const a = at(merged, 'a');

      const b = at(merged, 'b');

      expectType<TypeOf<typeof a>, number>('=');

      expectType<TypeOf<typeof b>, string>('=');

      assert.isTrue(a.is(1));

      assert.isFalse(a.is('x'));

      assert.isTrue(b.is('x'));

      assert.isFalse(b.is(1));
    });
  });

  describe('mergeRecords of a union (intersection containing a union)', () => {
    const combo = mergeRecords([
      union([record({ kind: literal('x') }), record({ kind: literal('y') })]),
      record({ shared: number() }),
    ]);

    test('key from the union part resolves across all variants', () => {
      const kind = at(combo, 'kind');

      expectType<TypeOf<typeof kind>, 'x' | 'y'>('=');

      assert.isTrue(kind.is('x'));

      assert.isTrue(kind.is('y'));

      assert.isFalse(kind.is('z'));
    });

    test('key from the plain part is extracted normally', () => {
      const shared = at(combo, 'shared');

      expectType<TypeOf<typeof shared>, number>('=');

      assert.isTrue(shared.is(42));
    });
  });

  describe(recursion, () => {
    type Tree = Readonly<{ value: number; children: readonly Tree[] }>;

    const TreeNode: Type<Tree> = recursion('Tree', () =>
      record({ value: number(), children: array(TreeNode) }),
    );

    test('extracts a primitive key from a recursive record', () => {
      const value = at(TreeNode, 'value');

      expectType<TypeOf<typeof value>, number>('=');

      assert.isTrue(value.is(5));

      assert.isFalse(value.is('5'));
    });

    test('extracts a self-referential key', () => {
      const children = at(TreeNode, 'children');

      assert.isTrue(children.is([]));

      assert.isTrue(children.is([{ value: 1, children: [] }]));

      assert.isFalse(children.is('not-an-array'));
    });
  });

  describe('recursion combined with union', () => {
    type LinkedList = Readonly<{ value: number; next: LinkedList | null }>;

    const List: Type<LinkedList> = recursion('LinkedList', () =>
      record({ value: number(), next: union([nullType, List]) }),
    );

    test('extracts a key whose type is a union of null and the recursive type', () => {
      const next = at(List, 'next');

      expectType<TypeOf<typeof next>, LinkedList | null>('=');

      assert.isTrue(next.is(null));

      assert.isTrue(next.is({ value: 1, next: null }));

      assert.isFalse(next.is(5));
    });
  });

  describe('tuple index access', () => {
    const tup = tuple([number(), string(), boolean()]);

    test('extracts the Type at each index', () => {
      const first = at(tup, 0);

      const second = at(tup, 1);

      const third = at(tup, 2);

      expectType<TypeOf<typeof first>, number>('=');

      expectType<TypeOf<typeof second>, string>('=');

      expectType<TypeOf<typeof third>, boolean>('=');

      assert.isTrue(first.is(1));

      assert.isFalse(first.is('x'));

      assert.isTrue(second.is('x'));

      assert.isTrue(third.is(true));
    });

    test('index argument is constrained to valid indices', () => {
      // @ts-expect-error 3 is out of range for a 3-element tuple
      expect(() => at(tup, 3)).toThrow('out of range');
    });
  });

  describe('error handling', () => {
    test('throws when given a non-record, non-tuple type', () => {
      expect(() => {
        // @ts-expect-error number() is not a record type
        at(number(), 'x');
      }).toThrow('Expected a record type');
    });
  });

  // `at` expands the full shape structure to resolve a key. Intersecting unions
  // multiplies the variant counts, so the underlying `expandShapeStructure`
  // guards against exponential blow-up.
  describe('variant-count guard', () => {
    const simple: ShapeStructure = {
      kind: 'simple',
      shape: { k: number() },
    } as const;

    test('throws when an intersection would expand to too many variants', () => {
      const unionOf7: ShapeStructure = {
        kind: 'union',
        variants: [simple, simple, simple, simple, simple, simple, simple],
      } as const;

      // 7^5 = 16807 > 10_000
      const nested: ShapeStructure = {
        kind: 'intersection',
        parts: [unionOf7, unionOf7, unionOf7, unionOf7, unionOf7],
      } as const;

      expect(() => expandShapeStructure(nested)).toThrow('exceeding the limit');
    });

    test('does not throw for a moderate intersection', () => {
      const unionOf3: ShapeStructure = {
        kind: 'union',
        variants: [simple, simple, simple],
      } as const;

      // 3^2 = 9 <= 10_000
      const moderate: ShapeStructure = {
        kind: 'intersection',
        parts: [unionOf3, unionOf3],
      } as const;

      expect(expandShapeStructure(moderate)).toHaveLength(9);
    });
  });
});

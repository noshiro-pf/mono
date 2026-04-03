import { expectType } from '../expect-type.mjs';
import { pipe } from '../functional/index.mjs';
import { Obj } from './object.mjs';

describe('shallowEq', () => {
  test('truthy case 1', () => {
    assert.isTrue(Obj.shallowEq({ x: 0 }, { x: 0 }));
  });

  test('truthy case 2', () => {
    assert.isTrue(Obj.shallowEq({}, {}));
  });

  test('falsy case 1', () => {
    assert.isFalse(Obj.shallowEq({ x: 0 }, { x: 0, y: 0 }));
  });

  test('falsy case 2', () => {
    assert.isFalse(Obj.shallowEq({ x: 0, y: 0 }, { x: 0 }));
  });

  test('falsy case 3', () => {
    assert.isFalse(Obj.shallowEq({ x: 0 }, { y: 0 }));
  });

  test('falsy case 4', () => {
    assert.isFalse(Obj.shallowEq({ x: [] }, { y: 0 }));
  });
});

describe('pick', () => {
  test('should pick specified keys', () => {
    assert.deepStrictEqual(Obj.pick({ a: 1, b: 2, c: 3 }, ['a', 'b']), {
      a: 1,
      b: 2,
    });
  });

  test('pick should support curried form', () => {
    const pickAB = Obj.pick(['a', 'b']);

    const result = pickAB({ a: 1, b: 2, c: 3, d: 4 });

    assert.deepStrictEqual(result, { a: 1, b: 2 });
  });

  test('pick should work with pipe when curried', () => {
    const pickIdAndName = Obj.pick(['id', 'name']);

    const user = {
      id: 1,
      name: 'Alice',
      email: 'alice@example.com',
      age: 30,
    } as const;

    const result = pipe(user).map(pickIdAndName).value;

    assert.deepStrictEqual(result, { id: 1, name: 'Alice' });
  });

  test('pick should handle empty keys in curried form', () => {
    const pickNone = Obj.pick([]);

    const result = pickNone({ a: 1, b: 2 });

    assert.deepStrictEqual(result, {});
  });

  test('pick should work for records that only partially contain the key in curried form', () => {
    const pickVisible = Obj.pick(['name', 'age']);

    const user = {
      id: 1,
      name: 'Alice',
      password: 'secret123',
    } as const;

    const result = pipe(user).map(pickVisible).value satisfies Readonly<{
      name: string;
    }>;

    assert.deepStrictEqual(result, { name: 'Alice' });
  });
});

describe('omit', () => {
  test('should omit specified keys', () => {
    assert.deepStrictEqual(Obj.omit({ a: 1, b: 2, c: 3 }, ['c']), {
      a: 1,
      b: 2,
    });
  });

  test('omit should support curried form', () => {
    const omitC = Obj.omit(['c']);

    const result = omitC({ a: 1, b: 2, c: 3, d: 4 });

    assert.deepStrictEqual(result, { a: 1, b: 2, d: 4 });
  });

  test('omit should work with pipe when curried', () => {
    const omitSensitive = Obj.omit(['password', 'email']);

    const user = {
      id: 1,
      name: 'Alice',
      email: 'alice@example.com',
      password: 'secret123',
    } as const;

    const result = pipe(user).map(omitSensitive).value;

    assert.deepStrictEqual(result, { id: 1, name: 'Alice' });
  });

  test('omit should handle empty keys in curried form', () => {
    const omitNone = Obj.omit([]);

    const original = { a: 1, b: 2, c: 3 } as const;

    const result = omitNone(original);

    assert.deepStrictEqual(result, original);
  });

  test('should omit multiple keys in curried form', () => {
    const omitBAndD = Obj.omit(['b', 'd']);

    const result = omitBAndD({ a: 1, b: 2, c: 3, d: 4, e: 5 });

    assert.deepStrictEqual(result, { a: 1, c: 3, e: 5 });
  });

  test('omit should work for records that only partially contain the key in curried form', () => {
    const omitSensitive = Obj.omit(['password', 'email']);

    const user = {
      id: 1,
      name: 'Alice',
      password: 'secret123',
    } as const;

    const result = pipe(user).map(omitSensitive).value satisfies Readonly<{
      id: number;
      name: string;
    }>;

    assert.deepStrictEqual(result, { id: 1, name: 'Alice' });
  });
});

describe('fromEntries', () => {
  test('should build readonly object from fixed entries', () => {
    const entries = [
      ['name', 'Alice'],
      ['age', 30],
      ['active', true],
    ] as const;

    const result = Obj.fromEntries(entries);

    expectType<
      typeof result,
      Readonly<{ name: 'Alice'; age: 30; active: true }>
    >('=');

    assert.deepStrictEqual(result, { name: 'Alice', age: 30, active: true });
  });

  test('should produce partial record when keys are unions', () => {
    const dynamicEntries: readonly (readonly ['name' | 'email', string])[] = [
      ['name', 'Alice'],
    ] as const;

    const result = Obj.fromEntries(dynamicEntries) satisfies Partial<
      Readonly<Record<'name' | 'email', string>>
    >;

    assert.deepStrictEqual(result, { name: 'Alice' });
  });
});

describe('merge', () => {
  test('should merge two objects, later overriding earlier', () => {
    const a = { a: 0, b: 0 } as const;

    const b = { b: 1, c: 0 } as const;

    const result = Obj.merge(a, b);

    expectType<typeof result, Readonly<{ a: 0; b: 1; c: 0 }>>('=');

    assert.deepStrictEqual(result, { a: 0, b: 1, c: 0 });
  });

  test('should merge three objects', () => {
    const a = { x: 1, y: 2 } as const;

    const b = { y: 3, z: 4 } as const;

    const c = { z: 5, w: 6 } as const;

    const result = Obj.merge(a, b, c);

    expectType<typeof result, Readonly<{ x: 1; y: 3; z: 5; w: 6 }>>('=');

    assert.deepStrictEqual(result, { x: 1, y: 3, z: 5, w: 6 });
  });

  test('should return empty object when called with no arguments', () => {
    const result = Obj.merge();

    expectType<typeof result, {}>('=');

    assert.deepStrictEqual(result, {});
  });

  test('should return the same shape for a single argument', () => {
    const a = { a: 1, b: 2 } as const;

    const result = Obj.merge(a);

    expectType<typeof result, Readonly<{ a: 1; b: 2 }>>('=');

    assert.deepStrictEqual(result, { a: 1, b: 2 });
  });

  test('type: later key completely overrides earlier key type', () => {
    const a = { key: 'hello' } as const;

    const b = { key: 42 } as const;

    const result = Obj.merge(a, b);

    expectType<typeof result, Readonly<{ key: 42 }>>('=');

    assert.deepStrictEqual(result, { key: 42 });
  });

  test('type: MergeAll with four objects', () => {
    const a = { a: 1, b: 2 } as const;

    const b = { b: 3, c: 4 } as const;

    const c = { c: 5, d: 6 } as const;

    const d = { d: 7, e: 8 } as const;

    const result = Obj.merge(a, b, c, d);

    expectType<typeof result, Readonly<{ a: 1; b: 3; c: 5; d: 7; e: 8 }>>('=');

    assert.deepStrictEqual(result, { a: 1, b: 3, c: 5, d: 7, e: 8 });
  });

  test('type: MergeAll with same key multiple times', () => {
    const a = { x: 'first' } as const;

    const b = { x: 'second' } as const;

    const c = { x: 'third' } as const;

    const result = Obj.merge(a, b, c);

    expectType<typeof result, Readonly<{ x: 'third' }>>('=');

    assert.deepStrictEqual(result, { x: 'third' });
  });

  test('type: MergeAll with disjoint keys', () => {
    const a = { a: 1 } as const;

    const b = { b: 2 } as const;

    const c = { c: 3 } as const;

    const result = Obj.merge(a, b, c);

    expectType<typeof result, Readonly<{ a: 1; b: 2; c: 3 }>>('=');

    assert.deepStrictEqual(result, { a: 1, b: 2, c: 3 });
  });

  test('type: MergeAll with complex nested types', () => {
    const a = { value: { nested: 1 } } as const;

    const b = { value: { nested: 2, extra: 'text' } } as const;

    const result = Obj.merge(a, b);

    expectType<
      typeof result,
      DeepReadonly<{ value: { nested: 2; extra: 'text' } }>
    >('=');

    assert.deepStrictEqual(result, { value: { nested: 2, extra: 'text' } });
  });

  test('type: MergeAll with mixed value types', () => {
    const a = { x: 1, y: 'string' } as const;

    const b = { y: 2, z: true } as const;

    const c = { z: false, w: undefined } as const;

    const result = Obj.merge(a, b, c);

    expectType<typeof result, Readonly<{ x: 1; y: 2; z: false; w: undefined }>>(
      '=',
    );

    assert.deepStrictEqual(result, { x: 1, y: 2, z: false, w: undefined });
  });

  test('type: MergeAll with mixed value types with optional properties', () => {
    const a: Readonly<{ x: number; y?: string }> = {
      x: 1,
      y: 'string',
    } as const;

    const b: Readonly<{ y?: number; z?: boolean }> = { y: 2, z: true } as const;

    const c: Readonly<{ z?: boolean; w?: undefined }> = {
      z: false,
      w: undefined,
    } as const;

    const result = Obj.merge(a, b, c);

    expectType<
      typeof result,
      Readonly<{ x: number; y?: string | number; z?: boolean; w?: undefined }>
    >('=');

    assert.deepStrictEqual(result, { x: 1, y: 2, z: false, w: undefined });
  });

  test('type: MergeAll empty array produces empty object', () => {
    const result = Obj.merge();

    expectType<typeof result, {}>('=');

    assert.deepStrictEqual(result, {});
  });

  test('type: MergeAll with arrays as values', () => {
    const a = { items: [1, 2] } as const;

    const b = { items: [3, 4, 5] } as const;

    const result = Obj.merge(a, b);

    expectType<typeof result, Readonly<{ items: readonly [3, 4, 5] }>>('=');

    assert.deepStrictEqual(result, { items: [3, 4, 5] });
  });

  test('type: MergeAll preserves literal types', () => {
    const a = { status: 'pending', count: 0 } as const;

    const b = { status: 'completed' } as const;

    const result = Obj.merge(a, b);

    expectType<typeof result, Readonly<{ status: 'completed'; count: 0 }>>('=');

    assert.deepStrictEqual(result, { status: 'completed', count: 0 });
  });

  test('type: MergeAll with UnknownRecord[] produces UnknownRecord', () => {
    const records: readonly UnknownRecord[] = [
      { a: 1, b: 2 },
      { b: 3, c: 4 },
      { c: 5, d: 6 },
    ] as const;

    const result = Obj.merge(...records);

    expectType<typeof result, UnknownRecord>('=');

    assert.deepStrictEqual(result, { a: 1, b: 3, c: 5, d: 6 });
  });

  test('type: MergeAll with specific typed array', () => {
    type MyRecord = Readonly<{ x: number; y: string }>;

    const records: readonly MyRecord[] = [
      { x: 1, y: 'a' },
      { x: 2, y: 'b' },
      { x: 3, y: 'c' },
    ] as const;

    const result = Obj.merge(...records);

    expectType<typeof result, MyRecord>('=');

    assert.deepStrictEqual(result, { x: 3, y: 'c' });
  });

  test('type: MergeAll with fixed length typed array', () => {
    type MyRecord = Readonly<{ x: number; y: string }>;

    const records: ArrayOfLength<3, MyRecord> = [
      { x: 1, y: 'a' },
      { x: 2, y: 'b' },
      { x: 3, y: 'c' },
    ] as const;

    const result = Obj.merge(...records);

    expectType<typeof result, MyRecord>('=');

    assert.deepStrictEqual(result, { x: 3, y: 'c' });
  });

  test('type: MergeAll with array and optional properties', () => {
    type RecordWithOptional = Readonly<{ x: number; y?: string }>;

    const records: readonly RecordWithOptional[] = [
      { x: 1, y: 'a' },
      { x: 2 },
    ] as const;

    const result = Obj.merge(...records);

    expectType<typeof result, RecordWithOptional>('=');

    assert.deepStrictEqual(result, { x: 2, y: 'a' });
  });

  test('type: MergeAll with fixed length typed array and optional properties', () => {
    type RecordWithOptional = Readonly<{ x: number; y?: string }>;

    const records: ArrayOfLength<2, RecordWithOptional> = [
      { x: 1, y: 'a' },
      { x: 2 },
    ] as const;

    const result = Obj.merge(...records);

    expectType<typeof result, RecordWithOptional>('=');

    assert.deepStrictEqual(result, { x: 2, y: 'a' });
  });

  test('type: MergeAll with empty dynamic array', () => {
    const records: readonly UnknownRecord[] = [] as const;

    const result = Obj.merge(...records);

    expectType<typeof result, UnknownRecord>('=');

    assert.deepStrictEqual(result, {});
  });

  test('type: MergeAll with union type array', () => {
    type RecordA = Readonly<{ a: number; b: string }>;

    type RecordB = Readonly<{ c: boolean; d: number }>;

    const records: readonly (RecordA | RecordB)[] = [
      { a: 1, b: 'text' },
      { c: true, d: 42 },
    ] as const;

    const result = Obj.merge(...records);

    expectType<typeof result, RecordA | RecordB>('=');

    assert.deepStrictEqual(result, { a: 1, b: 'text', c: true, d: 42 });
  });
});

describe('deepPick', () => {
  test('should deeply pick a nested property', () => {
    const data = { a: { b: { c: 1, d: 2 }, e: 3 }, f: 4 } as const;

    const result = Obj.deepPick(data, ['a', 'b', 'c']);

    assert.deepStrictEqual(result, { a: { b: { c: 1 } } });

    expectType<
      typeof result,
      Readonly<{ a: Readonly<{ b: Readonly<{ c: 1 }> }> }>
    >('=');
  });

  test('should pick at depth 1', () => {
    const data = { a: 1, b: 2, c: 3 } as const;

    const result = Obj.deepPick(data, ['a']);

    assert.deepStrictEqual(result, { a: 1 });

    expectType<typeof result, Readonly<{ a: 1 }>>('=');
  });

  test('should pick at depth 2', () => {
    const data = { a: { b: 10, c: 20 }, d: 30 } as const;

    const result = Obj.deepPick(data, ['a', 'b']);

    assert.deepStrictEqual(result, { a: { b: 10 } });

    expectType<typeof result, Readonly<{ a: Readonly<{ b: 10 }> }>>('=');
  });

  test('should return empty object for non-existent key', () => {
    const data = { a: 1 } as const;

    const result = Obj.deepPick(data, ['x']);

    assert.deepStrictEqual(result, {});
  });

  test('should return empty nested for non-existent nested key', () => {
    const data = { a: { b: 1 } } as const;

    const result = Obj.deepPick(data, ['a', 'x']);

    assert.deepStrictEqual(result, { a: {} });
  });

  test('should support curried form with correct type inference', () => {
    const pickABC = Obj.deepPick(['a', 'b', 'c']);

    const data = { a: { b: { c: 42, d: 99 } } } as const;

    const result = pickABC(data);

    assert.deepStrictEqual(result, { a: { b: { c: 42 } } });

    expectType<
      typeof result,
      Readonly<{ a: Readonly<{ b: Readonly<{ c: 42 }> }> }>
    >('=');
  });

  test('should work with pipe when curried with correct type inference', () => {
    const pickNested = Obj.deepPick(['a', 'b']);

    const data = { a: { b: 1, c: 2 }, d: 3 } as const;

    const result = pipe(data).map(pickNested).value;

    assert.deepStrictEqual(result, { a: { b: 1 } });

    expectType<typeof result, Readonly<{ a: Readonly<{ b: 1 }> }>>('=');
  });

  test('should return {} for path through primitive', () => {
    const data = { a: 42 } as const;

    const result = Obj.deepPick(data, ['a', 'b']);

    assert.deepStrictEqual(result, { a: {} });
  });
});

describe('deepOmit', () => {
  test('should deeply omit a nested property', () => {
    const data = { a: { b: { c: 1, d: 2 }, e: 3 }, f: 4 } as const;

    const result = Obj.deepOmit(data, ['a', 'b', 'c']);

    assert.deepStrictEqual(result, { a: { b: { d: 2 }, e: 3 }, f: 4 });

    expectType<
      typeof result,
      Readonly<{ a: Readonly<{ b: Readonly<{ d: 2 }>; e: 3 }>; f: 4 }>
    >('=');
  });

  test('should omit at depth 1', () => {
    const data = { a: 1, b: 2, c: 3 } as const;

    const result = Obj.deepOmit(data, ['a']);

    assert.deepStrictEqual(result, { b: 2, c: 3 });

    expectType<typeof result, Readonly<{ b: 2; c: 3 }>>('=');
  });

  test('should omit at depth 2', () => {
    const data = { a: { b: 10, c: 20 }, d: 30 } as const;

    const result = Obj.deepOmit(data, ['a', 'b']);

    assert.deepStrictEqual(result, { a: { c: 20 }, d: 30 });

    expectType<typeof result, Readonly<{ a: Readonly<{ c: 20 }>; d: 30 }>>('=');
  });

  test('should return unchanged for non-existent key', () => {
    const data = { a: 1, b: 2 } as const;

    const result = Obj.deepOmit(data, ['x']);

    assert.deepStrictEqual(result, { a: 1, b: 2 });
  });

  test('should return unchanged for non-existent nested key', () => {
    const data = { a: { b: 1 } } as const;

    const result = Obj.deepOmit(data, ['a', 'x']);

    assert.deepStrictEqual(result, { a: { b: 1 } });
  });

  test('should return unchanged for path through primitive', () => {
    const data = { a: 42, b: 'hello' } as const;

    const result = Obj.deepOmit(data, ['a', 'toString']);

    assert.deepStrictEqual(result, { a: 42, b: 'hello' });
  });

  test('should support curried form with correct type inference', () => {
    const omitABC = Obj.deepOmit(['a', 'b', 'c']);

    const data = { a: { b: { c: 1, d: 2 } } } as const;

    const result = omitABC(data);

    assert.deepStrictEqual(result, { a: { b: { d: 2 } } });

    expectType<
      typeof result,
      Readonly<{ a: Readonly<{ b: Readonly<{ d: 2 }> }> }>
    >('=');
  });

  test('should work with pipe when curried with correct type inference', () => {
    const omitNested = Obj.deepOmit(['a', 'b']);

    const data = { a: { b: 1, c: 2 }, d: 3 } as const;

    const result = pipe(data).map(omitNested).value;

    assert.deepStrictEqual(result, { a: { c: 2 }, d: 3 });

    expectType<typeof result, Readonly<{ a: Readonly<{ c: 2 }>; d: 3 }>>('=');
  });
});

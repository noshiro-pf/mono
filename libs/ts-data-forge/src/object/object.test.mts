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

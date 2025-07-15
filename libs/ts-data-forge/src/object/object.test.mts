import { pipe } from '../functional/index.mjs';
import { Obj } from './object.mjs';

describe('shallowEq', () => {
  test('truthy case 1', () => {
    expect(Obj.shallowEq({ x: 0 }, { x: 0 })).toBe(true);
  });

  test('truthy case 2', () => {
    expect(Obj.shallowEq({}, {})).toBe(true);
  });

  test('falsy case 1', () => {
    expect(Obj.shallowEq({ x: 0 }, { x: 0, y: 0 })).toBe(false);
  });

  test('falsy case 2', () => {
    expect(Obj.shallowEq({ x: 0, y: 0 }, { x: 0 })).toBe(false);
  });

  test('falsy case 3', () => {
    expect(Obj.shallowEq({ x: 0 }, { y: 0 })).toBe(false);
  });

  test('falsy case 4', () => {
    expect(Obj.shallowEq({ x: [] }, { y: 0 })).toBe(false);
  });
});

describe('pick', () => {
  test('should pick specified keys', () => {
    expect(Obj.pick({ a: 1, b: 2, c: 3 }, ['a', 'b'])).toStrictEqual({
      a: 1,
      b: 2,
    });
  });

  test('pick should support curried form', () => {
    const pickAB = Obj.pick(['a', 'b']);
    const result = pickAB({ a: 1, b: 2, c: 3, d: 4 });
    expect(result).toStrictEqual({ a: 1, b: 2 });
  });

  test('pick should work with pipe when curried', () => {
    const pickIdAndName = Obj.pick(['id', 'name']);
    const user = { id: 1, name: 'Alice', email: 'alice@example.com', age: 30 };

    const result = pipe(user).map(pickIdAndName).value;
    expect(result).toStrictEqual({ id: 1, name: 'Alice' });
  });

  test('pick should handle empty keys in curried form', () => {
    const pickNone = Obj.pick([]);
    const result = pickNone({ a: 1, b: 2 });
    expect(result).toStrictEqual({});
  });

  test('pick should work for records that only partially contain the key in curried form', () => {
    const pickVisible = Obj.pick(['name', 'age']);
    const user = {
      id: 1,
      name: 'Alice',
      password: 'secret123',
    } as const;

    const result = pipe(user).map(pickVisible).value satisfies {
      name: string;
    };
    expect(result).toStrictEqual({ name: 'Alice' });
  });
});

describe('omit', () => {
  test('should omit specified keys', () => {
    expect(Obj.omit({ a: 1, b: 2, c: 3 }, ['c'])).toStrictEqual({ a: 1, b: 2 });
  });

  test('omit should support curried form', () => {
    const omitC = Obj.omit(['c']);
    const result = omitC({ a: 1, b: 2, c: 3, d: 4 });
    expect(result).toStrictEqual({ a: 1, b: 2, d: 4 });
  });

  test('omit should work with pipe when curried', () => {
    const omitSensitive = Obj.omit(['password', 'email']);
    const user = {
      id: 1,
      name: 'Alice',
      email: 'alice@example.com',
      password: 'secret123',
    };

    const result = pipe(user).map(omitSensitive).value;
    expect(result).toStrictEqual({ id: 1, name: 'Alice' });
  });

  test('omit should handle empty keys in curried form', () => {
    const omitNone = Obj.omit([]);
    const original = { a: 1, b: 2, c: 3 };
    const result = omitNone(original);
    expect(result).toStrictEqual(original);
  });

  test('should omit multiple keys in curried form', () => {
    const omitBAndD = Obj.omit(['b', 'd']);
    const result = omitBAndD({ a: 1, b: 2, c: 3, d: 4, e: 5 });
    expect(result).toStrictEqual({ a: 1, c: 3, e: 5 });
  });

  test('omit should work for records that only partially contain the key in curried form', () => {
    const omitSensitive = Obj.omit(['password', 'email']);
    const user = {
      id: 1,
      name: 'Alice',
      password: 'secret123',
    } as const;

    const result = pipe(user).map(omitSensitive).value satisfies {
      id: number;
      name: string;
    };
    expect(result).toStrictEqual({ id: 1, name: 'Alice' });
  });
});

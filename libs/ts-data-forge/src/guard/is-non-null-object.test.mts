import { expectType } from '../expect-type.mjs';
import { isNonNullObject } from './is-non-null-object.mjs';

describe(isNonNullObject, () => {
  test('should return true for plain objects', () => {
    expect(isNonNullObject({})).toBe(true);
    expect(isNonNullObject({ a: 1, b: 'test' })).toBe(true);
    expect(isNonNullObject({ nested: { value: true } })).toBe(true);
  });

  test('should return true for arrays', () => {
    expect(isNonNullObject([])).toBe(true);
    expect(isNonNullObject([1, 2, 3])).toBe(true);
    expect(isNonNullObject(['a', 'b', 'c'])).toBe(true);
  });

  test('should return true for functions', () => {
    expect(isNonNullObject(() => {})).toBe(false);
    expect(isNonNullObject(async () => {})).toBe(false);
    // eslint-disable-next-line @typescript-eslint/no-extraneous-class
    expect(isNonNullObject(class MyClass {})).toBe(false);
  });

  test('should return true for built-in objects', () => {
    expect(isNonNullObject(new Date())).toBe(true);
    expect(isNonNullObject(/test/u)).toBe(true);
    expect(isNonNullObject(/regex/u)).toBe(true);
    expect(isNonNullObject(new Map())).toBe(true);
    expect(isNonNullObject(new Set())).toBe(true);
    expect(isNonNullObject(new Error('test'))).toBe(true);
  });

  test('should return true for boxed primitives', () => {
    // eslint-disable-next-line unicorn/new-for-builtins
    expect(isNonNullObject(new String('hello'))).toBe(true);
    // eslint-disable-next-line unicorn/new-for-builtins
    expect(isNonNullObject(new Number(42))).toBe(true);
    // eslint-disable-next-line unicorn/new-for-builtins
    expect(isNonNullObject(new Boolean(true))).toBe(true);
  });

  test('should return false for null', () => {
    expect(isNonNullObject(null)).toBe(false);
  });

  test('should return false for primitive values', () => {
    expect(isNonNullObject(undefined)).toBe(false);
    expect(isNonNullObject('string')).toBe(false);
    expect(isNonNullObject(42)).toBe(false);
    expect(isNonNullObject(true)).toBe(false);
    expect(isNonNullObject(false)).toBe(false);
    expect(isNonNullObject(Symbol('test'))).toBe(false);
    expect(isNonNullObject(123n)).toBe(false);
  });

  test('should act as a type guard', () => {
    const value: unknown = { test: true };

    if (isNonNullObject(value)) {
      expectType<typeof value, object>('=');
    }
  });

  test('should narrow nullable object types', () => {
    const nullable: UnknownRecord | null = Math.random() > 0.5 ? {} : null;

    if (isNonNullObject(nullable)) {
      expectType<typeof nullable, UnknownRecord>('=');
    }
  });

  test('should work in filter operations', () => {
    const mixed: unknown[] = [
      'string',
      42,
      { a: 1 },
      null,
      undefined,
      [],
      () => {},
      true,
    ];

    const objects = mixed.filter(isNonNullObject);

    assert.deepStrictEqual(objects, [{ a: 1 }, []]);
  });
});

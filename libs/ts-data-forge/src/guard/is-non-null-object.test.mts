import { expectType } from '../expect-type.mjs';
import { isNonNullObject } from './is-non-null-object.mjs';

describe(isNonNullObject, () => {
  test('should return true for plain objects', () => {
    assert.isTrue(isNonNullObject({}));

    assert.isTrue(isNonNullObject({ a: 1, b: 'test' }));

    assert.isTrue(isNonNullObject({ nested: { value: true } }));
  });

  test('should return true for arrays', () => {
    assert.isTrue(isNonNullObject([]));

    assert.isTrue(isNonNullObject([1, 2, 3]));

    assert.isTrue(isNonNullObject(['a', 'b', 'c']));
  });

  test('should return true for functions', () => {
    assert.isFalse(isNonNullObject(() => {}));

    assert.isFalse(isNonNullObject(async () => {}));

    // eslint-disable-next-line @typescript-eslint/no-extraneous-class
    assert.isFalse(isNonNullObject(class MyClass {}));
  });

  test('should return true for built-in objects', () => {
    assert.isTrue(isNonNullObject(new Date()));

    assert.isTrue(isNonNullObject(/test/u));

    assert.isTrue(isNonNullObject(/regex/u));

    assert.isTrue(isNonNullObject(new Map()));

    assert.isTrue(isNonNullObject(new Set()));

    assert.isTrue(isNonNullObject(new Error('test')));
  });

  test('should return true for boxed primitives', () => {
    // eslint-disable-next-line unicorn/new-for-builtins
    assert.isTrue(isNonNullObject(new String('hello')));

    // eslint-disable-next-line unicorn/new-for-builtins
    assert.isTrue(isNonNullObject(new Number(42)));

    // eslint-disable-next-line unicorn/new-for-builtins
    assert.isTrue(isNonNullObject(new Boolean(true)));
  });

  test('should return false for null', () => {
    assert.isFalse(isNonNullObject(null));
  });

  test('should return false for primitive values', () => {
    assert.isFalse(isNonNullObject(undefined));

    assert.isFalse(isNonNullObject('string'));

    assert.isFalse(isNonNullObject(42));

    assert.isFalse(isNonNullObject(true));

    assert.isFalse(isNonNullObject(false));

    assert.isFalse(isNonNullObject(Symbol('test')));

    assert.isFalse(isNonNullObject(123n));
  });

  test('should act as a type guard', () => {
    const value: unknown = { test: true } as const;

    if (isNonNullObject(value)) {
      expectType<typeof value, object>('=');
    }
  });

  test('should narrow nullable object types', () => {
    const nullable: UnknownRecord | null =
      Math.random() > 0.5 ? ({} as const) : null;

    if (isNonNullObject(nullable)) {
      expectType<typeof nullable, UnknownRecord>('=');
    }
  });

  test('should work in filter operations', () => {
    const mixed: readonly unknown[] = [
      'string',
      42,
      { a: 1 },
      null,
      undefined,
      [],
      () => {},
      true,
    ] as const;

    const objects = mixed.filter(isNonNullObject);

    assert.deepStrictEqual(objects, [{ a: 1 }, []]);
  });
});

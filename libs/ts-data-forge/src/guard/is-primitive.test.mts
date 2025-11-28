import { expectType } from '../expect-type.mjs';
import { isPrimitive } from './is-primitive.mjs';
import { isSymbol } from './is-type.mjs';

describe(isPrimitive, () => {
  test('should return true for string primitives', () => {
    assert.isTrue(isPrimitive('hello'));

    assert.isTrue(isPrimitive(''));

    const value: unknown = 'test';

    if (isPrimitive(value)) {
      expectType<
        typeof value,
        bigint | boolean | number | string | symbol | undefined | null
      >('=');
    }
  });

  test('should return true for number primitives', () => {
    assert.isTrue(isPrimitive(42));

    assert.isTrue(isPrimitive(0));

    assert.isTrue(isPrimitive(-3.14));

    assert.isTrue(isPrimitive(Number.NaN));

    assert.isTrue(isPrimitive(Number.POSITIVE_INFINITY));
  });

  test('should return true for boolean primitives', () => {
    assert.isTrue(isPrimitive(true));

    assert.isTrue(isPrimitive(false));
  });

  test('should return true for symbol primitives', () => {
    assert.isTrue(isPrimitive(Symbol('test')));

    assert.isTrue(isPrimitive(Symbol.iterator));
  });

  test('should return true for bigint primitives', () => {
    assert.isTrue(isPrimitive(123n));

    assert.isTrue(isPrimitive(0n));

    assert.isTrue(isPrimitive(-123n));
  });

  test('should return true for null', () => {
    // Note: null is considered an object by typeof, so isPrimitive returns false
    assert.isTrue(isPrimitive(null));
  });

  test('should return true for undefined', () => {
    assert.isTrue(isPrimitive(undefined));
  });

  test('should return false for objects', () => {
    assert.isFalse(isPrimitive({}));

    assert.isFalse(isPrimitive({ a: 1 }));

    assert.isFalse(isPrimitive(new Date()));
  });

  test('should return false for arrays', () => {
    assert.isFalse(isPrimitive([]));

    assert.isFalse(isPrimitive([1, 2, 3]));
  });

  test('should return false for functions', () => {
    assert.isFalse(isPrimitive(() => {}));

    assert.isFalse(isPrimitive(() => {}));

    assert.isFalse(isPrimitive(async () => {}));
  });

  test('should return false for boxed primitives', () => {
    // eslint-disable-next-line unicorn/new-for-builtins
    assert.isFalse(isPrimitive(new String('hello')));

    // eslint-disable-next-line unicorn/new-for-builtins
    assert.isFalse(isPrimitive(new Number(42)));

    // eslint-disable-next-line unicorn/new-for-builtins
    assert.isFalse(isPrimitive(new Boolean(true)));
  });

  test('should narrow types correctly in conditional', () => {
    const values: unknown[] = [
      'string',
      42,
      true,
      {},
      [],
      null,
      undefined,
      Symbol('test'),
    ];

    const primitives = values.filter(isPrimitive);

    const nonPrimitives = values.filter((v) => !isPrimitive(v));

    expect(primitives).toHaveLength(6); // string, 42, true, null, undefined, symbol

    expect(primitives[0]).toBe('string');

    expect(primitives[1]).toBe(42);

    expect(primitives[2]).toBe(true);

    expect(primitives[3]).toBeNull();

    expect(primitives[4]).toBeUndefined();

    assert.isTrue(isSymbol(primitives[5]));

    assert.deepStrictEqual(nonPrimitives, [{}, []]);
  });
});

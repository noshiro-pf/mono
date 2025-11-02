import { expectType } from '../expect-type.mjs';
import { isPrimitive } from './is-primitive.mjs';

describe('isPrimitive', () => {
  test('should return true for string primitives', () => {
    expect(isPrimitive('hello')).toBe(true);
    expect(isPrimitive('')).toBe(true);

    const value: unknown = 'test';
    if (isPrimitive(value)) {
      expectType<
        typeof value,
        bigint | boolean | number | string | symbol | undefined | null
      >('=');
    }
  });

  test('should return true for number primitives', () => {
    expect(isPrimitive(42)).toBe(true);
    expect(isPrimitive(0)).toBe(true);
    expect(isPrimitive(-3.14)).toBe(true);
    expect(isPrimitive(Number.NaN)).toBe(true);
    expect(isPrimitive(Number.POSITIVE_INFINITY)).toBe(true);
  });

  test('should return true for boolean primitives', () => {
    expect(isPrimitive(true)).toBe(true);
    expect(isPrimitive(false)).toBe(true);
  });

  test('should return true for symbol primitives', () => {
    expect(isPrimitive(Symbol('test'))).toBe(true);
    expect(isPrimitive(Symbol.iterator)).toBe(true);
  });

  test('should return true for bigint primitives', () => {
    expect(isPrimitive(123n)).toBe(true);
    expect(isPrimitive(0n)).toBe(true);
    expect(isPrimitive(-123n)).toBe(true);
  });

  test('should return true for null', () => {
    // Note: null is considered an object by typeof, so isPrimitive returns false
    expect(isPrimitive(null)).toBe(true);
  });

  test('should return true for undefined', () => {
    expect(isPrimitive(undefined)).toBe(true);
  });

  test('should return false for objects', () => {
    expect(isPrimitive({})).toBe(false);
    expect(isPrimitive({ a: 1 })).toBe(false);
    expect(isPrimitive(new Date())).toBe(false);
  });

  test('should return false for arrays', () => {
    expect(isPrimitive([])).toBe(false);
    expect(isPrimitive([1, 2, 3])).toBe(false);
  });

  test('should return false for functions', () => {
    expect(isPrimitive(() => {})).toBe(false);
    expect(isPrimitive(() => {})).toBe(false);
    expect(isPrimitive(async () => {})).toBe(false);
  });

  test('should return false for boxed primitives', () => {
    // eslint-disable-next-line unicorn/new-for-builtins
    expect(isPrimitive(new String('hello'))).toBe(false);
    // eslint-disable-next-line unicorn/new-for-builtins
    expect(isPrimitive(new Number(42))).toBe(false);
    // eslint-disable-next-line unicorn/new-for-builtins
    expect(isPrimitive(new Boolean(true))).toBe(false);
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
    expect(typeof primitives[5]).toBe('symbol');

    expect(nonPrimitives).toStrictEqual([{}, []]);
  });
});

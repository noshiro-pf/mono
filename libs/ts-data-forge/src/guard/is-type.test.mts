import { expectType } from '../expect-type.mjs';
import {
  isBigint,
  isBoolean,
  isNonNullish,
  isNotBigint,
  isNotBoolean,
  isNotNull,
  isNotNumber,
  isNotString,
  isNotSymbol,
  isNotUndefined,
  isNull,
  isNullish,
  isNumber,
  isString,
  isSymbol,
  isUndefined,
} from './is-type.mjs';

describe('isUndefined', () => {
  test('should return true for undefined', () => {
    expect(isUndefined(undefined)).toBe(true);
  });

  test('should return false for non-undefined values', () => {
    expect(isUndefined(null)).toBe(false);
    expect(isUndefined(0)).toBe(false);
    expect(isUndefined('')).toBe(false);
    expect(isUndefined(false)).toBe(false);
    expect(isUndefined({})).toBe(false);
  });

  test('should act as a type guard', () => {
    const value: string | undefined = undefined;
    if (isUndefined(value)) {
      expectType<typeof value, undefined>('=');
    }
  });
});

describe('isNotUndefined', () => {
  test('should return false for undefined', () => {
    expect(isNotUndefined(undefined)).toBe(false);
  });

  test('should return true for non-undefined values', () => {
    expect(isNotUndefined(null)).toBe(true);
    expect(isNotUndefined(0)).toBe(true);
    expect(isNotUndefined('')).toBe(true);
    expect(isNotUndefined(false)).toBe(true);
  });

  test('should narrow types correctly', () => {
    const value: string | undefined = 'test';
    if (isNotUndefined(value)) {
      expectType<typeof value, string>('=');
    }
  });
});

describe('isNull', () => {
  test('should return true for null', () => {
    expect(isNull(null)).toBe(true);
  });

  test('should return false for non-null values', () => {
    expect(isNull(undefined)).toBe(false);
    expect(isNull(0)).toBe(false);
    expect(isNull('')).toBe(false);
    expect(isNull(false)).toBe(false);
    expect(isNull({})).toBe(false);
  });

  test('should act as a type guard', () => {
    const value: string | null = null;
    if (isNull(value)) {
      expectType<typeof value, null>('=');
    }
  });
});

describe('isNotNull', () => {
  test('should return false for null', () => {
    expect(isNotNull(null)).toBe(false);
  });

  test('should return true for non-null values', () => {
    expect(isNotNull(undefined)).toBe(true);
    expect(isNotNull(0)).toBe(true);
    expect(isNotNull('')).toBe(true);
  });

  test('should narrow types correctly', () => {
    const value: string | null = 'test';
    if (isNotNull(value)) {
      expectType<typeof value, string>('=');
    }
  });
});

describe('isString', () => {
  test('should return true for strings', () => {
    expect(isString('')).toBe(true);
    expect(isString('hello')).toBe(true);
    expect(isString('123')).toBe(true);
    expect(isString(`template`)).toBe(true);
  });

  test('should return false for non-strings', () => {
    expect(isString(123)).toBe(false);
    expect(isString(true)).toBe(false);
    expect(isString(null)).toBe(false);
    expect(isString(undefined)).toBe(false);
    // eslint-disable-next-line no-new-wrappers, unicorn/new-for-builtins
    expect(isString(new String('hello'))).toBe(false);
  });

  test('should act as a type guard', () => {
    const value: unknown = 'test';
    if (isString(value)) {
      expectType<typeof value, string>('=');
      expect(value).toHaveLength(4);
    }
  });
});

describe('isNumber', () => {
  test('should return true for numbers', () => {
    expect(isNumber(0)).toBe(true);
    expect(isNumber(42)).toBe(true);
    expect(isNumber(-3.14)).toBe(true);
    expect(isNumber(Number.NaN)).toBe(true);
    expect(isNumber(Number.POSITIVE_INFINITY)).toBe(true);
    expect(isNumber(Number.NEGATIVE_INFINITY)).toBe(true);
  });

  test('should return false for non-numbers', () => {
    expect(isNumber('123')).toBe(false);
    expect(isNumber(true)).toBe(false);
    expect(isNumber(null)).toBe(false);
    expect(isNumber(BigInt(123))).toBe(false);
    // eslint-disable-next-line no-new-wrappers, unicorn/new-for-builtins
    expect(isNumber(new Number(42))).toBe(false);
  });

  test('should act as a type guard', () => {
    const value: unknown = 42;
    if (isNumber(value)) {
      expectType<typeof value, number>('=');
      expect(value + 1).toBe(43);
    }
  });
});

describe('isBigint', () => {
  test('should return true for bigints', () => {
    expect(isBigint(BigInt(0))).toBe(true);
    expect(isBigint(123n)).toBe(true);
    expect(isBigint(-456n)).toBe(true);
  });

  test('should return false for non-bigints', () => {
    expect(isBigint(123)).toBe(false);
    expect(isBigint('123')).toBe(false);
    expect(isBigint(true)).toBe(false);
    expect(isBigint(null)).toBe(false);
  });

  test('should act as a type guard', () => {
    const value: unknown = 123n;
    if (isBigint(value)) {
      expectType<typeof value, bigint>('=');
      expect(value + 1n).toBe(124n);
    }
  });
});

describe('isBoolean', () => {
  test('should return true for booleans', () => {
    expect(isBoolean(true)).toBe(true);
    expect(isBoolean(false)).toBe(true);
  });

  test('should return false for non-booleans', () => {
    expect(isBoolean(1)).toBe(false);
    expect(isBoolean(0)).toBe(false);
    expect(isBoolean('true')).toBe(false);
    expect(isBoolean(null)).toBe(false);
    // eslint-disable-next-line no-new-wrappers, unicorn/new-for-builtins
    expect(isBoolean(new Boolean(true))).toBe(false);
  });

  test('should act as a type guard', () => {
    const value: unknown = true;
    if (isBoolean(value)) {
      expectType<typeof value, boolean>('=');
      expect(!value).toBe(false);
    }
  });
});

describe('isSymbol', () => {
  test('should return true for symbols', () => {
    expect(isSymbol(Symbol())).toBe(true);
    expect(isSymbol(Symbol('test'))).toBe(true);
    expect(isSymbol(Symbol.iterator)).toBe(true);
  });

  test('should return false for non-symbols', () => {
    expect(isSymbol('symbol')).toBe(false);
    expect(isSymbol(123)).toBe(false);
    expect(isSymbol(null)).toBe(false);
  });

  test('should act as a type guard', () => {
    const value: unknown = Symbol('test');
    if (isSymbol(value)) {
      expectType<typeof value, symbol>('=');
      expect(value.toString()).toContain('Symbol');
    }
  });
});

describe('isNotBoolean', () => {
  test('should return false for boolean values', () => {
    expect(isNotBoolean(true)).toBe(false);
    expect(isNotBoolean(false)).toBe(false);
  });

  test('should return true for non-boolean values', () => {
    expect(isNotBoolean(0)).toBe(true);
    expect(isNotBoolean(1)).toBe(true);
    expect(isNotBoolean('true')).toBe(true);
    expect(isNotBoolean('false')).toBe(true);
    expect(isNotBoolean(null)).toBe(true);
    expect(isNotBoolean(undefined)).toBe(true);
    expect(isNotBoolean({})).toBe(true);
    expect(isNotBoolean([])).toBe(true);
  });

  test('should act as a type guard', () => {
    const value: string | number | boolean = 'test';
    if (isNotBoolean(value)) {
      expectType<typeof value, string | number>('<=');
      // Should not have boolean methods
      expect(typeof value === 'string' || typeof value === 'number').toBe(true);
    }
  });
});

describe('isNotNumber', () => {
  test('should return false for number values', () => {
    expect(isNotNumber(0)).toBe(false);
    expect(isNotNumber(42)).toBe(false);
    expect(isNotNumber(-3.14)).toBe(false);
    expect(isNotNumber(Number.NaN)).toBe(false);
    expect(isNotNumber(Number.POSITIVE_INFINITY)).toBe(false);
    expect(isNotNumber(Number.NEGATIVE_INFINITY)).toBe(false);
  });

  test('should return true for non-number values', () => {
    expect(isNotNumber('123')).toBe(true);
    expect(isNotNumber(true)).toBe(true);
    expect(isNotNumber(false)).toBe(true);
    expect(isNotNumber(null)).toBe(true);
    expect(isNotNumber(undefined)).toBe(true);
    expect(isNotNumber(BigInt(123))).toBe(true);
    expect(isNotNumber({})).toBe(true);
    expect(isNotNumber([])).toBe(true);
    expect(isNotNumber(Symbol('test'))).toBe(true);
  });

  test('should act as a type guard', () => {
    const value: string | number | boolean = 'test';
    if (isNotNumber(value)) {
      expectType<typeof value, string | boolean>('<=');
      expect(typeof value === 'string' || typeof value === 'boolean').toBe(
        true,
      );
    }
  });
});

describe('isNotBigint', () => {
  test('should return false for bigint values', () => {
    expect(isNotBigint(BigInt(0))).toBe(false);
    expect(isNotBigint(123n)).toBe(false);
    expect(isNotBigint(-456n)).toBe(false);
  });

  test('should return true for non-bigint values', () => {
    expect(isNotBigint(123)).toBe(true);
    expect(isNotBigint('123')).toBe(true);
    expect(isNotBigint(true)).toBe(true);
    expect(isNotBigint(false)).toBe(true);
    expect(isNotBigint(null)).toBe(true);
    expect(isNotBigint(undefined)).toBe(true);
    expect(isNotBigint({})).toBe(true);
    expect(isNotBigint(Symbol('test'))).toBe(true);
  });

  test('should act as a type guard', () => {
    const value: number | bigint = 123;
    if (isNotBigint(value)) {
      expectType<typeof value, number>('<=');
      expect(typeof value).toBe('number');
    }
  });
});

describe('isNotString', () => {
  test('should return false for string values', () => {
    expect(isNotString('')).toBe(false);
    expect(isNotString('hello')).toBe(false);
    expect(isNotString('123')).toBe(false);
    expect(isNotString(`template`)).toBe(false);
  });

  test('should return true for non-string values', () => {
    expect(isNotString(123)).toBe(true);
    expect(isNotString(true)).toBe(true);
    expect(isNotString(false)).toBe(true);
    expect(isNotString(null)).toBe(true);
    expect(isNotString(undefined)).toBe(true);
    expect(isNotString({})).toBe(true);
    expect(isNotString([])).toBe(true);
    expect(isNotString(Symbol('test'))).toBe(true);
    expect(isNotString(BigInt(123))).toBe(true);
  });

  test('should act as a type guard', () => {
    const value: string | number | boolean = 42;
    if (isNotString(value)) {
      expectType<typeof value, number | boolean>('<=');
      expect(typeof value === 'number' || typeof value === 'boolean').toBe(
        true,
      );
    }
  });
});

describe('isNotSymbol', () => {
  test('should return false for symbol values', () => {
    expect(isNotSymbol(Symbol())).toBe(false);
    expect(isNotSymbol(Symbol('test'))).toBe(false);
    expect(isNotSymbol(Symbol.iterator)).toBe(false);
  });

  test('should return true for non-symbol values', () => {
    expect(isNotSymbol('symbol')).toBe(true);
    expect(isNotSymbol(123)).toBe(true);
    expect(isNotSymbol(true)).toBe(true);
    expect(isNotSymbol(false)).toBe(true);
    expect(isNotSymbol(null)).toBe(true);
    expect(isNotSymbol(undefined)).toBe(true);
    expect(isNotSymbol({})).toBe(true);
    expect(isNotSymbol([])).toBe(true);
    expect(isNotSymbol(BigInt(123))).toBe(true);
  });

  test('should act as a type guard', () => {
    const value: string | number | symbol = 'test';
    if (isNotSymbol(value)) {
      expectType<typeof value, string | number>('<=');
      expect(typeof value === 'string' || typeof value === 'number').toBe(true);
    }
  });
});

describe('isNullish', () => {
  test('should return true for null and undefined', () => {
    expect(isNullish(null)).toBe(true);
    expect(isNullish(undefined)).toBe(true);
  });

  test('should return false for non-nullish values', () => {
    expect(isNullish(0)).toBe(false);
    expect(isNullish(false)).toBe(false);
    expect(isNullish('')).toBe(false);
    expect(isNullish('null')).toBe(false);
    expect(isNullish('undefined')).toBe(false);
    expect(isNullish({})).toBe(false);
    expect(isNullish([])).toBe(false);
    expect(isNullish(Number.NaN)).toBe(false);
  });

  test('should act as a type guard', () => {
    const value: string | null | undefined = null;
    if (isNullish(value)) {
      expectType<typeof value, null | undefined>('<=');
      // Value is guaranteed to be null or undefined in this branch
      expect(true).toBe(true);
    }
  });

  test('should handle edge cases', () => {
    // Test that it uses loose equality (==)
    expect(isNullish(null)).toBe(true);
    expect(isNullish(undefined)).toBe(true);
  });
});

describe('isNonNullish', () => {
  test('should return false for null and undefined', () => {
    expect(isNonNullish(null)).toBe(false);
    expect(isNonNullish(undefined)).toBe(false);
  });

  test('should return true for non-nullish values', () => {
    expect(isNonNullish(0)).toBe(true);
    expect(isNonNullish(false)).toBe(true);
    expect(isNonNullish('')).toBe(true);
    expect(isNonNullish('null')).toBe(true);
    expect(isNonNullish('undefined')).toBe(true);
    expect(isNonNullish({})).toBe(true);
    expect(isNonNullish([])).toBe(true);
    expect(isNonNullish(Number.NaN)).toBe(true);
    expect(isNonNullish(Symbol('test'))).toBe(true);
    expect(isNonNullish(BigInt(123))).toBe(true);
  });

  test('should act as a type guard', () => {
    const value: string | null | undefined = 'test';
    if (isNonNullish(value)) {
      expectType<typeof value, string>('<=');
      expect(value).toHaveLength(4);
    }
  });

  test('should work with array filtering', () => {
    const items: (string | null | undefined)[] = [
      'hello',
      null,
      'world',
      undefined,
      'test',
    ];

    const definedItems = items.filter(isNonNullish);
    expectType<typeof definedItems, string[]>('<=');

    expect(definedItems).toHaveLength(3);
    expect(definedItems).toStrictEqual(['hello', 'world', 'test']);
  });

  test('should handle complex union types', () => {
    type ComplexType = string | number | boolean | null | undefined;
    const value: ComplexType = 42;

    if (isNonNullish(value)) {
      expectType<typeof value, string | number | boolean>('<=');
      // Value is guaranteed to be non-nullish in this branch
      expect(true).toBe(true);
    }
  });
});

describe('type guard behavior in complex scenarios', () => {
  test('should work with nested conditions', () => {
    const value: string | number | boolean | null | undefined = 'test';

    if (isNonNullish(value) && isNotBoolean(value) && isNotNumber(value)) {
      expectType<typeof value, string>('<=');
      expect(typeof value).toBe('string');
    }
  });

  test('should work with array operations', () => {
    const mixed: (string | number | boolean | null | undefined)[] = [
      'hello',
      42,
      true,
      null,
      'world',
      undefined,
      false,
      123,
    ];

    const nonNullish = mixed.filter(isNonNullish);
    expectType<typeof nonNullish, (string | number | boolean)[]>('<=');

    const nonBooleans = nonNullish.filter(isNotBoolean);
    expectType<typeof nonBooleans, (string | number)[]>('<=');

    const strings = nonBooleans.filter(isNotNumber);
    expectType<typeof strings, string[]>('<=');

    expect(strings).toStrictEqual(['hello', 'world']);
  });
});

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

describe(isUndefined, () => {
  test('should return true for undefined', () => {
    assert.isTrue(isUndefined(undefined));
  });

  test('should return false for non-undefined values', () => {
    assert.isFalse(isUndefined(null));

    assert.isFalse(isUndefined(0));

    assert.isFalse(isUndefined(''));

    assert.isFalse(isUndefined(false));

    assert.isFalse(isUndefined({}));
  });

  test('should act as a type guard', () => {
    const value: string | undefined = undefined;

    if (isUndefined(value)) {
      expectType<typeof value, undefined>('=');
    }
  });
});

describe(isNotUndefined, () => {
  test('should return false for undefined', () => {
    assert.isFalse(isNotUndefined(undefined));
  });

  test('should return true for non-undefined values', () => {
    assert.isTrue(isNotUndefined(null));

    assert.isTrue(isNotUndefined(0));

    assert.isTrue(isNotUndefined(''));

    assert.isTrue(isNotUndefined(false));
  });

  test('should narrow types correctly', () => {
    const value: string | undefined = 'test';

    if (isNotUndefined(value)) {
      expectType<typeof value, string>('=');
    }
  });
});

describe(isNull, () => {
  test('should return true for null', () => {
    assert.isTrue(isNull(null));
  });

  test('should return false for non-null values', () => {
    assert.isFalse(isNull(undefined));

    assert.isFalse(isNull(0));

    assert.isFalse(isNull(''));

    assert.isFalse(isNull(false));

    assert.isFalse(isNull({}));
  });

  test('should act as a type guard', () => {
    const value: string | null = null;

    if (isNull(value)) {
      expectType<typeof value, null>('=');
    }
  });
});

describe(isNotNull, () => {
  test('should return false for null', () => {
    assert.isFalse(isNotNull(null));
  });

  test('should return true for non-null values', () => {
    assert.isTrue(isNotNull(undefined));

    assert.isTrue(isNotNull(0));

    assert.isTrue(isNotNull(''));
  });

  test('should narrow types correctly', () => {
    const value: string | null = 'test';

    if (isNotNull(value)) {
      expectType<typeof value, string>('=');
    }
  });
});

describe(isString, () => {
  test('should return true for strings', () => {
    assert.isTrue(isString(''));

    assert.isTrue(isString('hello'));

    assert.isTrue(isString('123'));

    assert.isTrue(isString(`template`));
  });

  test('should return false for non-strings', () => {
    assert.isFalse(isString(123));

    assert.isFalse(isString(true));

    assert.isFalse(isString(null));

    assert.isFalse(isString(undefined));

    // eslint-disable-next-line unicorn/new-for-builtins
    assert.isFalse(isString(new String('hello')));
  });

  test('should act as a type guard', () => {
    const value: unknown = 'test';

    if (isString(value)) {
      expectType<typeof value, string>('=');

      expect(value).toHaveLength(4);
    }
  });
});

describe(isNumber, () => {
  test('should return true for numbers', () => {
    assert.isTrue(isNumber(0));

    assert.isTrue(isNumber(42));

    assert.isTrue(isNumber(-3.14));

    assert.isTrue(isNumber(Number.NaN));

    assert.isTrue(isNumber(Number.POSITIVE_INFINITY));

    assert.isTrue(isNumber(Number.NEGATIVE_INFINITY));
  });

  test('should return false for non-numbers', () => {
    assert.isFalse(isNumber('123'));

    assert.isFalse(isNumber(true));

    assert.isFalse(isNumber(null));

    assert.isFalse(isNumber(123n));

    // eslint-disable-next-line unicorn/new-for-builtins
    assert.isFalse(isNumber(new Number(42)));
  });

  test('should act as a type guard', () => {
    const value: unknown = 42;

    if (isNumber(value)) {
      expectType<typeof value, number>('=');

      expect(value + 1).toBe(43);
    }
  });
});

describe(isBigint, () => {
  test('should return true for bigints', () => {
    assert.isTrue(isBigint(0n));

    assert.isTrue(isBigint(123n));

    assert.isTrue(isBigint(-456n));
  });

  test('should return false for non-bigints', () => {
    assert.isFalse(isBigint(123));

    assert.isFalse(isBigint('123'));

    assert.isFalse(isBigint(true));

    assert.isFalse(isBigint(null));
  });

  test('should act as a type guard', () => {
    const value: unknown = 123n;

    if (isBigint(value)) {
      expectType<typeof value, bigint>('=');

      expect(value + 1n).toBe(124n);
    }
  });
});

describe(isBoolean, () => {
  test('should return true for booleans', () => {
    assert.isTrue(isBoolean(true));

    assert.isTrue(isBoolean(false));
  });

  test('should return false for non-booleans', () => {
    assert.isFalse(isBoolean(1));

    assert.isFalse(isBoolean(0));

    assert.isFalse(isBoolean('true'));

    assert.isFalse(isBoolean(null));

    // eslint-disable-next-line unicorn/new-for-builtins
    assert.isFalse(isBoolean(new Boolean(true)));
  });

  test('should act as a type guard', () => {
    const value: unknown = true;

    if (isBoolean(value)) {
      expectType<typeof value, boolean>('=');

      assert.isTrue(value);
    }
  });
});

describe(isSymbol, () => {
  test('should return true for symbols', () => {
    assert.isTrue(isSymbol(Symbol()));

    assert.isTrue(isSymbol(Symbol('test')));

    assert.isTrue(isSymbol(Symbol.iterator));
  });

  test('should return false for non-symbols', () => {
    assert.isFalse(isSymbol('symbol'));

    assert.isFalse(isSymbol(123));

    assert.isFalse(isSymbol(null));
  });

  test('should act as a type guard', () => {
    const value: unknown = Symbol('test');

    if (isSymbol(value)) {
      expectType<typeof value, symbol>('=');

      expect(value.toString()).toContain('Symbol');
    }
  });
});

describe(isNotBoolean, () => {
  test('should return false for boolean values', () => {
    assert.isFalse(isNotBoolean(true));

    assert.isFalse(isNotBoolean(false));
  });

  test('should return true for non-boolean values', () => {
    assert.isTrue(isNotBoolean(0));

    assert.isTrue(isNotBoolean(1));

    assert.isTrue(isNotBoolean('true'));

    assert.isTrue(isNotBoolean('false'));

    assert.isTrue(isNotBoolean(null));

    assert.isTrue(isNotBoolean(undefined));

    assert.isTrue(isNotBoolean({}));

    assert.isTrue(isNotBoolean([]));
  });

  test('should act as a type guard', () => {
    const value: string | number | boolean = 'test';

    if (isNotBoolean(value)) {
      expectType<typeof value, string | number>('<=');

      // Should not have boolean methods
      assert.isTrue(typeof value === 'string' || typeof value === 'number');
    }
  });
});

describe(isNotNumber, () => {
  test('should return false for number values', () => {
    assert.isFalse(isNotNumber(0));

    assert.isFalse(isNotNumber(42));

    assert.isFalse(isNotNumber(-3.14));

    assert.isFalse(isNotNumber(Number.NaN));

    assert.isFalse(isNotNumber(Number.POSITIVE_INFINITY));

    assert.isFalse(isNotNumber(Number.NEGATIVE_INFINITY));
  });

  test('should return true for non-number values', () => {
    assert.isTrue(isNotNumber('123'));

    assert.isTrue(isNotNumber(true));

    assert.isTrue(isNotNumber(false));

    assert.isTrue(isNotNumber(null));

    assert.isTrue(isNotNumber(undefined));

    assert.isTrue(isNotNumber(123n));

    assert.isTrue(isNotNumber({}));

    assert.isTrue(isNotNumber([]));

    assert.isTrue(isNotNumber(Symbol('test')));
  });

  test('should act as a type guard', () => {
    const value: string | number | boolean = 'test';

    if (isNotNumber(value)) {
      expectType<typeof value, string | boolean>('<=');

      assert.isTrue(typeof value === 'string' || typeof value === 'boolean');
    }
  });
});

describe(isNotBigint, () => {
  test('should return false for bigint values', () => {
    assert.isFalse(isNotBigint(0n));

    assert.isFalse(isNotBigint(123n));

    assert.isFalse(isNotBigint(-456n));
  });

  test('should return true for non-bigint values', () => {
    assert.isTrue(isNotBigint(123));

    assert.isTrue(isNotBigint('123'));

    assert.isTrue(isNotBigint(true));

    assert.isTrue(isNotBigint(false));

    assert.isTrue(isNotBigint(null));

    assert.isTrue(isNotBigint(undefined));

    assert.isTrue(isNotBigint({}));

    assert.isTrue(isNotBigint(Symbol('test')));
  });

  test('should act as a type guard', () => {
    const value: number | bigint = 123;

    if (isNotBigint(value)) {
      expectType<typeof value, number>('<=');

      expectTypeOf(value).toBeNumber();
    }
  });
});

describe(isNotString, () => {
  test('should return false for string values', () => {
    assert.isFalse(isNotString(''));

    assert.isFalse(isNotString('hello'));

    assert.isFalse(isNotString('123'));

    assert.isFalse(isNotString(`template`));
  });

  test('should return true for non-string values', () => {
    assert.isTrue(isNotString(123));

    assert.isTrue(isNotString(true));

    assert.isTrue(isNotString(false));

    assert.isTrue(isNotString(null));

    assert.isTrue(isNotString(undefined));

    assert.isTrue(isNotString({}));

    assert.isTrue(isNotString([]));

    assert.isTrue(isNotString(Symbol('test')));

    assert.isTrue(isNotString(123n));
  });

  test('should act as a type guard', () => {
    const value: string | number | boolean = 42;

    if (isNotString(value)) {
      expectType<typeof value, number | boolean>('<=');

      assert.isTrue(typeof value === 'number' || typeof value === 'boolean');
    }
  });
});

describe(isNotSymbol, () => {
  test('should return false for symbol values', () => {
    assert.isFalse(isNotSymbol(Symbol()));

    assert.isFalse(isNotSymbol(Symbol('test')));

    assert.isFalse(isNotSymbol(Symbol.iterator));
  });

  test('should return true for non-symbol values', () => {
    assert.isTrue(isNotSymbol('symbol'));

    assert.isTrue(isNotSymbol(123));

    assert.isTrue(isNotSymbol(true));

    assert.isTrue(isNotSymbol(false));

    assert.isTrue(isNotSymbol(null));

    assert.isTrue(isNotSymbol(undefined));

    assert.isTrue(isNotSymbol({}));

    assert.isTrue(isNotSymbol([]));

    assert.isTrue(isNotSymbol(123n));
  });

  test('should act as a type guard', () => {
    const value: string | number | symbol = 'test';

    if (isNotSymbol(value)) {
      expectType<typeof value, string | number>('<=');

      assert.isTrue(typeof value === 'string' || typeof value === 'number');
    }
  });
});

describe(isNullish, () => {
  test('should return true for null and undefined', () => {
    assert.isTrue(isNullish(null));

    assert.isTrue(isNullish(undefined));
  });

  test('should return false for non-nullish values', () => {
    assert.isFalse(isNullish(0));

    assert.isFalse(isNullish(false));

    assert.isFalse(isNullish(''));

    assert.isFalse(isNullish('null'));

    assert.isFalse(isNullish('undefined'));

    assert.isFalse(isNullish({}));

    assert.isFalse(isNullish([]));

    assert.isFalse(isNullish(Number.NaN));
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
    assert.isTrue(isNullish(null));

    assert.isTrue(isNullish(undefined));
  });
});

describe(isNonNullish, () => {
  test('should return false for null and undefined', () => {
    assert.isFalse(isNonNullish(null));

    assert.isFalse(isNonNullish(undefined));
  });

  test('should return true for non-nullish values', () => {
    assert.isTrue(isNonNullish(0));

    assert.isTrue(isNonNullish(false));

    assert.isTrue(isNonNullish(''));

    assert.isTrue(isNonNullish('null'));

    assert.isTrue(isNonNullish('undefined'));

    assert.isTrue(isNonNullish({}));

    assert.isTrue(isNonNullish([]));

    assert.isTrue(isNonNullish(Number.NaN));

    assert.isTrue(isNonNullish(Symbol('test')));

    assert.isTrue(isNonNullish(123n));
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

    assert.deepStrictEqual(definedItems, ['hello', 'world', 'test']);
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

      expectTypeOf(value).toBeString();
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

    assert.deepStrictEqual(strings, ['hello', 'world']);
  });
});

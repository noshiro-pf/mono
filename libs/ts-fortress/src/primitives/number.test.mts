import { expectType, Result } from 'ts-data-forge';
import { type TypeOf } from '../type.mjs';
import { number, numberLiteral } from './number.mjs';

describe('number', () => {
  describe('default value', () => {
    test('without explicit default value', () => {
      const numDefault = number();
      expect(numDefault.defaultValue).toBe(0);
    });

    test('with explicit default value', () => {
      const numCustom = number(42);
      expect(numCustom.defaultValue).toBe(42);
    });
  });

  const num = number(0);
  type Num = TypeOf<typeof num>;

  expectType<Num, number>('=');
  expectType<typeof num.defaultValue, Num>('=');

  describe('is', () => {
    test('truthy cases', () => {
      const values = [
        0,
        42,
        -42,
        3.14,
        -3.14,
        Number.POSITIVE_INFINITY,
        Number.NEGATIVE_INFINITY,
        Number.NaN,
      ];

      for (const value of values) {
        const v: unknown = value;

        if (num.is(v)) {
          expectType<typeof v, Num>('=');
        } else {
          expectType<typeof v, unknown>('=');
        }

        expect(num.is(v)).toBe(true);
      }
    });

    test('falsy cases', () => {
      const values = [
        '42',
        '0',
        true,
        false,
        null,
        undefined,
        {},
        [],
        Symbol('test'),
      ];

      for (const value of values) {
        const v: unknown = value;

        if (num.is(v)) {
          expectType<typeof v, Num>('=');
        } else {
          expectType<typeof v, unknown>('=');
        }

        expect(num.is(v)).toBe(false);
      }
    });
  });

  describe('assertIs', () => {
    const assertIs: (a: unknown) => asserts a is number = num.assertIs;

    test('valid number', () => {
      const value: unknown = 42;
      expect(() => {
        assertIs(value);
      }).not.toThrow();
    });

    test('invalid value throws', () => {
      const value: unknown = '42';
      expect(() => {
        assertIs(value);
      }).toThrow(/Expected number/u);
    });
  });

  describe('cast', () => {
    test('valid number returns as is', () => {
      const value: unknown = 42;
      const result = num.cast(value);
      expect(result).toBe(42);
    });

    test('invalid value throws error', () => {
      const value: unknown = 'not a number';
      expect(() => num.cast(value)).toThrow('Expected number, got string');
    });

    test('throws error with type mismatch', () => {
      const numWithDefault = number(100);
      const value: unknown = 'not a number';
      expect(() => numWithDefault.cast(value)).toThrow(
        'Expected number, got string',
      );
    });
  });

  describe('fill', () => {
    test('valid number returns as is', () => {
      const value: unknown = 42;
      const result = num.fill(value);
      expect(result).toBe(42);
    });

    test('undefined returns default', () => {
      const value: unknown = undefined;
      const result = num.fill(value);
      expect(result).toBe(0);
    });

    test('null returns default', () => {
      const value: unknown = null;
      const result = num.fill(value);
      expect(result).toBe(0);
    });

    test('invalid value returns default', () => {
      const value: unknown = 'not a number';
      const result = num.fill(value);
      expect(result).toBe(0);
    });

    test('uses custom default value for invalid', () => {
      const numWithDefault = number(100);
      const value: unknown = 'not a number';
      const result = numWithDefault.fill(value);
      expect(result).toBe(100);
    });
  });

  describe('validate', () => {
    test('valid number', () => {
      const value: unknown = 42;
      const result = num.validate(value);

      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value).toBe(42);
      }
    });

    test('invalid value', () => {
      const value: unknown = 'not a number';
      const result = num.validate(value);

      expect(Result.isErr(result)).toBe(true);
      if (Result.isErr(result)) {
        expect(result.value).toStrictEqual([
          {
            path: [],
            actualValue: 'not a number',
            expectedType: 'number',
            typeName: 'number',
            message: undefined,
          },
        ]);
      }
    });
  });
});

describe('numberLiteral', () => {
  const literal42 = numberLiteral(42);
  type Literal42 = TypeOf<typeof literal42>;

  expectType<Literal42, 42>('=');
  expectType<typeof literal42.defaultValue, Literal42>('=');

  describe('default value', () => {
    test('uses literal as default', () => {
      expect(literal42.defaultValue).toBe(42);
    });
  });

  describe('is', () => {
    test('exact match returns true', () => {
      const value: unknown = 42;

      if (literal42.is(value)) {
        expectType<typeof value, Literal42>('=');
      } else {
        expectType<typeof value, unknown>('=');
      }

      expect(literal42.is(value)).toBe(true);
    });

    test('different number returns false', () => {
      const value: unknown = 43;

      if (literal42.is(value)) {
        expectType<typeof value, Literal42>('=');
      } else {
        expectType<typeof value, unknown>('=');
      }

      expect(literal42.is(value)).toBe(false);
    });

    test('non-number returns false', () => {
      const value: unknown = '42';

      expect(literal42.is(value)).toBe(false);
    });
  });

  describe('special number literals', () => {
    test('zero literal', () => {
      const zero = numberLiteral(0);
      type Zero = TypeOf<typeof zero>;
      expectType<Zero, 0>('=');

      expect(zero.is(0)).toBe(true);
      expect(zero.is(-0)).toBe(true); // JavaScript treats 0 and -0 as equal
      expect(zero.is(1)).toBe(false);
    });

    test('negative literal', () => {
      const negative = numberLiteral(-100);
      type Negative = TypeOf<typeof negative>;
      expectType<Negative, -100>('=');

      expect(negative.is(-100)).toBe(true);
      expect(negative.is(100)).toBe(false);
    });

    test('decimal literal', () => {
      const pi = numberLiteral(3.14);
      type Pi = TypeOf<typeof pi>;
      expectType<Pi, 3.14>('=');

      expect(pi.is(3.14)).toBe(true);
      expect(pi.is(3.141)).toBe(false);
    });
  });

  describe('validate', () => {
    test('exact match', () => {
      const value: unknown = 42;
      const result = literal42.validate(value);

      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value).toBe(42);
      }
    });

    test('different value', () => {
      const value: unknown = 43;
      const result = literal42.validate(value);

      expect(Result.isErr(result)).toBe(true);
      if (Result.isErr(result)) {
        expect(result.value).toStrictEqual([
          {
            path: [],
            actualValue: 43,
            expectedType: 'numberLiteral(42)',
            typeName: 'numberLiteral(42)',
            message: undefined,
          },
        ]);
      }
    });
  });
});

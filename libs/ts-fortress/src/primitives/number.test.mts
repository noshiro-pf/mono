import { expectType, Result } from 'ts-data-forge';
import { type Type, type TypeOf } from '../type.mjs';
import { number } from './number.mjs';

describe(number, () => {
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

  const num = number();

  type Num = TypeOf<typeof num>;

  expectType<Num, number>('=');

  expectType<typeof num.defaultValue, Num>('=');

  describe('is', () => {
    test.each([
      0,
      42,
      -42,
      3.14,
      -3.14,
      Number.POSITIVE_INFINITY,
      Number.NEGATIVE_INFINITY,
      Number.NaN,
    ])('num.is($0) should be true', (v: unknown) => {
      if (num.is(v)) {
        expectType<typeof v, Num>('=');
      } else {
        expectType<typeof v, unknown>('=');
      }

      assert.isTrue(num.is(v));
    });

    test.each([
      '42',
      '0',
      true,
      false,
      null,
      undefined,
      {},
      [],
      Symbol('test'),
    ])('num.is($0) should be false', (v: unknown) => {
      if (num.is(v)) {
        expectType<typeof v, Num>('=');
      } else {
        expectType<typeof v, unknown>('=');
      }

      assert.isFalse(num.is(v));
    });
  });

  describe('assertIs', () => {
    const assertIs: (a: unknown) => asserts a is number = num.assertIs;

    test('valid number', () => {
      const value: unknown = 42;

      expect(() => {
        assertIs(value);
      }).not.toThrowError();
    });

    test('invalid value throws', () => {
      const value: unknown = '42';

      expect(() => {
        assertIs(value);
      }).toThrowError(/Error: expected <number> value/u);
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

      expect(() => num.cast(value)).toThrowError(
        'Error: expected <number> value but <string> type value "not a number" was passed.',
      );
    });

    test('throws error with type mismatch', () => {
      const numWithDefault = number(100);

      const value: unknown = 'not a number';

      expect(() => numWithDefault.cast(value)).toThrowError(
        'Error: expected <number> value but <string> type value "not a number" was passed.',
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

      assert.isTrue(Result.isOk(result));

      const resultValue = Result.unwrapThrow(result);

      expect(resultValue).toBe(42);
    });

    test('invalid value', () => {
      const value: unknown = 'not a number';

      const result = num.validate(value);

      assert.isTrue(Result.isErr(result));

      const resultError = Result.unwrapErrThrow(result);

      assert.deepStrictEqual(resultError, [
        {
          path: [],
          actualValue: 'not a number',
          expectedType: 'number',
          typeName: 'number',
          details: undefined,
        },
      ]);
    });

    test('validate returns input as-is for OK cases', () => {
      const input = 123.456;

      const result = num.validate(input);

      assert.isTrue(Result.isOk(result));

      const resultValue1 = Result.unwrapThrow(result);

      expect(resultValue1).toBe(input); // ✅ same reference
    });
  });
});

describe('number with constraints', () => {
  describe('number constrained by gt', () => {
    test('accepts valid default value', () => {
      const type = number(10, { gt: 5 });

      expectType<typeof type, Type<number>>('=');

      assert.isTrue(type.is(6));

      assert.isFalse(type.is(5));

      assert.isTrue(type.is(42));
    });

    test('rejects invalid default value', () => {
      expect(() => number(5, { gt: 5 })).toThrowError('gt = 5');
    });
  });

  describe('number constrained by gte', () => {
    test('accepts valid default value', () => {
      const type = number(5, { gte: 5 });

      expectType<typeof type, Type<number>>('=');

      assert.isTrue(type.is(5));

      assert.isFalse(type.is(4));

      assert.isTrue(type.is(10));
    });

    test('rejects invalid default value', () => {
      expect(() => number(4, { gte: 5 })).toThrowError('gte = 5');
    });
  });

  describe('number constrained by min', () => {
    test('accepts valid default value', () => {
      const type = number(5, { min: 5 });

      expectType<typeof type, Type<number>>('=');

      assert.isTrue(type.is(7));

      assert.isFalse(type.is(4));
    });

    test('rejects invalid default value', () => {
      expect(() => number(4, { min: 5 })).toThrowError('min = 5');
    });
  });

  describe('number constrained by lt', () => {
    test('accepts valid default value', () => {
      const type = number(4, { lt: 5 });

      expectType<typeof type, Type<number>>('=');

      assert.isTrue(type.is(3));

      assert.isFalse(type.is(5));

      assert.isFalse(type.is(10));
    });

    test('rejects invalid default value', () => {
      expect(() => number(5, { lt: 5 })).toThrowError('lt = 5');
    });
  });

  describe('number constrained by lte', () => {
    test('accepts valid default value', () => {
      const type = number(5, { lte: 5 });

      expectType<typeof type, Type<number>>('=');

      assert.isTrue(type.is(4));

      assert.isTrue(type.is(5));

      assert.isFalse(type.is(6));
    });

    test('rejects invalid default value', () => {
      expect(() => number(6, { lte: 5 })).toThrowError('lte = 5');
    });
  });

  describe('number constrained by max', () => {
    test('accepts valid default value', () => {
      const type = number(5, { max: 5 });

      expectType<typeof type, Type<number>>('=');

      assert.isTrue(type.is(5));

      assert.isFalse(type.is(6));

      assert.isTrue(type.is(3));
    });

    test('rejects invalid default value', () => {
      expect(() => number(6, { max: 5 })).toThrowError('max = 5');
    });
  });

  describe('number constrained by positive', () => {
    test('accepts valid default value', () => {
      const type = number(1, { positive: true });

      expectType<typeof type, Type<number>>('=');

      assert.isTrue(type.is(10));

      assert.isFalse(type.is(0));

      assert.isFalse(type.is(-1));
    });

    test('rejects invalid default value', () => {
      expect(() =>
        // @ts-expect-error 0 is not > 0 when positive is true
        number(0, { positive: true }),
      ).toThrowError('positive = true');
    });
  });

  describe('number constrained by nonNegative', () => {
    test('accepts valid default value', () => {
      const type = number(0, { nonNegative: true });

      expectType<typeof type, Type<number>>('=');

      assert.isTrue(type.is(5));

      assert.isTrue(type.is(0));

      assert.isFalse(type.is(-1));
    });

    test('rejects invalid default value', () => {
      expect(() =>
        // @ts-expect-error -1 is not >= 0 when nonNegative is true
        number(-1, { nonNegative: true }),
      ).toThrowError('nonNegative = true');
    });
  });

  describe('number constrained by negative', () => {
    test('accepts valid default value', () => {
      const type = number(-1, { negative: true });

      expectType<typeof type, Type<number>>('=');

      assert.isTrue(type.is(-5));

      assert.isFalse(type.is(0));

      assert.isFalse(type.is(1));
    });

    test('rejects invalid default value', () => {
      expect(() =>
        // @ts-expect-error 0 is not < 0 when negative is true
        number(0, { negative: true }),
      ).toThrowError('negative = true');
    });
  });

  describe('number constrained by nonPositive', () => {
    test('accepts valid default value', () => {
      const type = number(0, { nonPositive: true });

      expectType<typeof type, Type<number>>('=');

      assert.isTrue(type.is(-5));

      assert.isTrue(type.is(0));

      assert.isFalse(type.is(1));
    });

    test('rejects invalid default value', () => {
      expect(() =>
        // @ts-expect-error 1 is not <= 0 when nonPositive is true
        number(1, { nonPositive: true }),
      ).toThrowError('nonPositive = true');
    });
  });

  describe('number constrained by multipleOf', () => {
    test('accepts valid default value', () => {
      const type = number(6, { multipleOf: 3 });

      expectType<typeof type, Type<number>>('=');

      assert.isTrue(type.is(9));

      assert.isFalse(type.is(10));
    });

    test('rejects invalid default value', () => {
      expect(() => number(7, { multipleOf: 3 })).toThrowError('multipleOf = 3');
    });
  });

  describe('number constrained by step', () => {
    test('accepts valid default value', () => {
      const type = number(8, { step: 2 });

      expectType<typeof type, Type<number>>('=');

      assert.isTrue(type.is(10));

      assert.isFalse(type.is(11));
    });

    test('rejects invalid default value', () => {
      expect(() => number(9, { step: 2 })).toThrowError('step = 2');
    });
  });

  describe('complex constraints', () => {
    describe('number constrained by gt and lt', () => {
      test('accepts valid default value', () => {
        const type = number(5, { gt: 1, lt: 10 });

        expectType<typeof type, Type<number>>('=');

        assert.isTrue(type.is(6));

        assert.isFalse(type.is(1));

        assert.isFalse(type.is(10));
      });

      test('rejects invalid default value', () => {
        expect(() => number(1, { gt: 1, lt: 10 })).toThrowError('gt = 1');
      });
    });

    describe('number constrained by gte and lte', () => {
      test('accepts valid default value', () => {
        const type = number(5, { gte: 5, lte: 10 });

        expectType<typeof type, Type<number>>('=');

        assert.isTrue(type.is(5));

        assert.isTrue(type.is(10));

        assert.isFalse(type.is(4));

        assert.isFalse(type.is(11));
      });

      test('rejects invalid default value', () => {
        expect(() => number(4, { gte: 5, lte: 10 })).toThrowError('gte = 5');
      });
    });

    describe('number constrained by positive and multipleOf', () => {
      test('accepts valid default value', () => {
        const type = number(6, { positive: true, multipleOf: 3 });

        expectType<typeof type, Type<number>>('=');

        assert.isTrue(type.is(9));

        assert.isTrue(type.is(3));

        assert.isFalse(type.is(-3));

        assert.isFalse(type.is(10));
      });

      test('rejects invalid default value', () => {
        expect(() => number(4, { positive: true, multipleOf: 3 })).toThrowError(
          'multipleOf = 3',
        );
      });
    });

    describe('number constrained by nonNegative, max, and step', () => {
      test('accepts valid default value', () => {
        const type = number(8, {
          nonNegative: true,
          max: 10,
          step: 2,
        });

        expectType<typeof type, Type<number>>('=');

        assert.isTrue(type.is(10));

        assert.isTrue(type.is(0));

        assert.isFalse(type.is(11));

        assert.isFalse(type.is(-2));

        assert.isFalse(type.is(9));
      });

      test('rejects invalid default value', () => {
        expect(() =>
          number(12, { nonNegative: true, max: 10, step: 2 }),
        ).toThrowError('max = 10');
      });
    });
  });
});

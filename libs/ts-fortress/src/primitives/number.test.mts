import { expectType, Result } from 'ts-data-forge';
import {
  type NegativeInt,
  type NegativeNumber,
  type NonNegativeNumber,
  type NonZeroNumber,
  type PositiveNumber,
} from 'ts-type-forge';
import { type Type, type TypeOf } from '../type.mjs';
import { validationErrorsToMessages } from '../utils/index.mjs';
import { number } from './number.mjs';

const messageOf = (type: Type<number>, value: unknown): string => {
  const result = type.validate(value);

  assert.isTrue(Result.isErr(result));

  return validationErrorsToMessages(Result.unwrapErrThrow(result)).join('\n');
};

describe(number, () => {
  const targetType = number();

  type TargetType = TypeOf<typeof targetType>;

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

  expectType<TargetType, number>('=');

  expectType<typeof targetType.defaultValue, TargetType>('=');

  describe('is', () => {
    test.each([
      0,
      42,
      -42,
      1.5,
      -1.5,
      Number.POSITIVE_INFINITY,
      Number.NEGATIVE_INFINITY,
      Number.NaN,
    ])('num.is($0) should be true', (v: unknown) => {
      if (targetType.is(v)) {
        expectType<typeof v, TargetType>('=');
      } else {
        expectType<typeof v, unknown>('=');
      }

      assert.isTrue(targetType.is(v));
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
      if (targetType.is(v)) {
        expectType<typeof v, TargetType>('=');
      } else {
        expectType<typeof v, unknown>('=');
      }

      assert.isFalse(targetType.is(v));
    });
  });

  describe('assertIs', () => {
    const assertIs: (a: unknown) => asserts a is number = targetType.assertIs;

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
      }).toThrow(/Error: expected <number> type/u);
    });
  });

  describe('cast', () => {
    test('valid number returns as is', () => {
      const value: unknown = 42;

      const result = targetType.cast(value);

      expect(result).toBe(42);
    });

    test('invalid value throws error', () => {
      const value: unknown = 'not a number';

      expect(() => targetType.cast(value)).toThrow(
        'Error: expected <number> type but <string> type value "not a number" was passed.',
      );
    });

    test('throws error with type mismatch', () => {
      const numWithDefault = number(100);

      const value: unknown = 'not a number';

      expect(() => numWithDefault.cast(value)).toThrow(
        'Error: expected <number> type but <string> type value "not a number" was passed.',
      );
    });
  });

  describe('fill', () => {
    test('valid number returns as is', () => {
      const value: unknown = 42;

      const result = targetType.fill(value);

      expect(result).toBe(42);
    });

    test('undefined returns default', () => {
      const value: unknown = undefined;

      expect(targetType.fill(value)).toBe(0);
    });

    test('null returns default', () => {
      const value: unknown = null;

      expect(targetType.fill(value)).toBe(0);
    });

    test('invalid value returns default', () => {
      const value: unknown = 'not a number';

      expect(targetType.fill(value)).toBe(0);
    });

    test('uses custom default value for invalid', () => {
      const numWithDefault = number(100);

      const value: unknown = 'not a number';

      expect(numWithDefault.fill(value)).toBe(100);
    });
  });

  describe('validate', () => {
    test('valid number', () => {
      const value: unknown = 42;

      const result = targetType.validate(value);

      assert.isTrue(Result.isOk(result));

      const resultValue = Result.unwrapThrow(result);

      expect(resultValue).toBe(42);
    });

    test('invalid value', () => {
      const value: unknown = 'not a number';

      const result = targetType.validate(value);

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

      const result = targetType.validate(input);

      assert.isTrue(Result.isOk(result));

      const resultValue1 = Result.unwrapThrow(result);

      expect(resultValue1).toBe(input); // ✅ same reference
    });
  });
});

describe('number with constraints', () => {
  describe('number constrained by nonZero', () => {
    test('accepts valid default value', () => {
      const type = number(1, { nonZero: true });

      expectType<typeof type, Type<NonZeroNumber>>('=');

      assert.isTrue(type.is(-5));

      assert.isTrue(type.is(5));

      assert.isFalse(type.is(0));
    });

    test('rejects invalid default value', () => {
      expect(() =>
        // @ts-expect-error 0 is not allowed when nonZero is true
        number(0, { nonZero: true }),
      ).toThrow('nonZero = true');
    });
  });

  describe('number constrained by negative', () => {
    test('accepts valid default value', () => {
      const type = number(-1, { negative: true });

      expectType<typeof type, Type<NegativeNumber>>('=');

      assert.isTrue(type.is(-5));

      assert.isFalse(type.is(0));

      assert.isFalse(type.is(1));
    });

    test('rejects invalid default value', () => {
      expect(() =>
        // @ts-expect-error 0 is not < 0 when negative is true
        number(0, { negative: true }),
      ).toThrow('negative = true');
    });
  });

  describe('number constrained by nonNegative', () => {
    test('accepts valid default value', () => {
      const type = number(0, { nonNegative: true });

      expectType<typeof type, Type<NonNegativeNumber>>('=');

      assert.isTrue(type.is(5));

      assert.isTrue(type.is(0));

      assert.isFalse(type.is(-1));
    });

    test('rejects invalid default value', () => {
      expect(() =>
        // @ts-expect-error -1 is not >= 0 when nonNegative is true
        number(-1, { nonNegative: true }),
      ).toThrow('nonNegative = true');
    });
  });

  describe('number constrained by positive', () => {
    test('accepts valid default value', () => {
      const type = number(1, { positive: true });

      expectType<typeof type, Type<PositiveNumber>>('=');

      assert.isTrue(type.is(10));

      assert.isFalse(type.is(0));

      assert.isFalse(type.is(-1));
    });

    test('rejects invalid default value', () => {
      expect(() =>
        // @ts-expect-error 0 is not > 0 when positive is true
        number(0, { positive: true }),
      ).toThrow('positive = true');
    });
  });

  describe('number constrained by nonPositive', () => {
    test('accepts valid default value', () => {
      const type = number(0, { nonPositive: true });

      expectType<typeof type, Type<NegativeInt>>('>=');

      assert.isTrue(type.is(-5));

      assert.isTrue(type.is(0));

      assert.isFalse(type.is(1));
    });

    test('rejects invalid default value', () => {
      expect(() =>
        // @ts-expect-error 1 is not <= 0 when nonPositive is true
        number(1, { nonPositive: true }),
      ).toThrow('nonPositive = true');
    });
  });

  describe('number constrained by gt', () => {
    test('accepts valid default value', () => {
      const type = number(10, { gt: 5 });

      expectType<typeof type, Type<number>>('=');

      assert.isTrue(type.is(6));

      assert.isFalse(type.is(5));

      assert.isTrue(type.is(42));
    });

    test('rejects invalid default value', () => {
      expect(() => number(5, { gt: 5 })).toThrow('gt = 5');
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
      expect(() => number(4, { gte: 5 })).toThrow('gte = 5');
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
      expect(() => number(4, { min: 5 })).toThrow('min = 5');
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
      expect(() => number(5, { lt: 5 })).toThrow('lt = 5');
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
      expect(() => number(6, { lte: 5 })).toThrow('lte = 5');
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
      expect(() => number(6, { max: 5 })).toThrow('max = 5');
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
      expect(() => number(7, { multipleOf: 3 })).toThrow('multipleOf = 3');
    });

    test('treats a zero divisor as accepting only zero', () => {
      const type = number(0, { multipleOf: 0 });

      expectType<typeof type, Type<number>>('=');

      assert.isTrue(type.is(0));

      assert.isFalse(type.is(3));

      expect(() => number(5, { multipleOf: 0 })).toThrow('multipleOf = 0');
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
      expect(() => number(9, { step: 2 })).toThrow('step = 2');
    });

    test('treats a zero divisor as accepting only zero', () => {
      const type = number(0, { step: 0 });

      expectType<typeof type, Type<number>>('=');

      assert.isTrue(type.is(0));

      assert.isFalse(type.is(2));

      expect(() => number(5, { step: 0 })).toThrow('step = 0');
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
        expect(() => number(1, { gt: 1, lt: 10 })).toThrow('gt = 1');
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
        expect(() => number(4, { gte: 5, lte: 10 })).toThrow('gte = 5');
      });
    });

    describe('number constrained by positive and multipleOf', () => {
      test('accepts valid default value', () => {
        const type = number(6, { positive: true, multipleOf: 3 });

        expectType<typeof type, Type<PositiveNumber>>('=');

        assert.isTrue(type.is(9));

        assert.isTrue(type.is(3));

        assert.isFalse(type.is(-3));

        assert.isFalse(type.is(10));
      });

      test('rejects invalid default value', () => {
        expect(() => number(4, { positive: true, multipleOf: 3 })).toThrow(
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

        expectType<typeof type, Type<NonNegativeNumber>>('=');

        assert.isTrue(type.is(10));

        assert.isTrue(type.is(0));

        assert.isFalse(type.is(11));

        assert.isFalse(type.is(-2));

        assert.isFalse(type.is(9));
      });

      test('rejects invalid default value', () => {
        expect(() =>
          number(12, { nonNegative: true, max: 10, step: 2 }),
        ).toThrow('max = 10');
      });
    });
  });
});

describe('number constraint validation messages', () => {
  test('finite reports the violated constraint', () => {
    expect(
      messageOf(number(0, { finite: true }), Number.POSITIVE_INFINITY),
    ).toBe('Error: expected a finite number but `Infinity` was passed.');
  });

  test('int reports the violated constraint', () => {
    expect(messageOf(number(2, { int: true }), 1.5)).toBe(
      'Error: expected an integer but `1.5` was passed.',
    );
  });

  test('safeInteger reports the violated constraint', () => {
    expect(messageOf(number(2, { safeInteger: true }), 2 ** 53)).toBe(
      'Error: expected a safe integer but `9007199254740992` was passed.',
    );
  });

  test('nonZero reports the violated constraint', () => {
    expect(messageOf(number(1, { nonZero: true }), 0)).toBe(
      'Error: expected a non-zero number but `0` was passed.',
    );
  });

  test('negative reports the violated constraint', () => {
    expect(messageOf(number(-1, { negative: true }), 3)).toBe(
      'Error: expected a negative number but `3` was passed.',
    );
  });

  test('nonNegative reports the violated constraint', () => {
    expect(messageOf(number(0, { nonNegative: true }), -3)).toBe(
      'Error: expected a non-negative number but `-3` was passed.',
    );
  });

  test('positive reports the violated constraint', () => {
    expect(messageOf(number(1, { positive: true }), -1)).toBe(
      'Error: expected a positive number but `-1` was passed.',
    );
  });

  test('nonPositive reports the violated constraint', () => {
    expect(messageOf(number(0, { nonPositive: true }), 5)).toBe(
      'Error: expected a non-positive number but `5` was passed.',
    );
  });

  test('gt reports the bound', () => {
    expect(messageOf(number(1, { gt: 0 }), -3)).toBe(
      'Error: expected a number greater than 0 but `-3` was passed.',
    );
  });

  test('gte and min report the bound', () => {
    expect(messageOf(number(10, { gte: 10 }), 5)).toBe(
      'Error: expected a number greater than or equal to 10 but `5` was passed.',
    );

    expect(messageOf(number(10, { min: 10 }), 5)).toBe(
      'Error: expected a number greater than or equal to 10 but `5` was passed.',
    );
  });

  test('lt reports the bound', () => {
    expect(messageOf(number(1, { lt: 5 }), 5)).toBe(
      'Error: expected a number less than 5 but `5` was passed.',
    );
  });

  test('lte and max report the bound', () => {
    expect(messageOf(number(1, { lte: 5 }), 7)).toBe(
      'Error: expected a number less than or equal to 5 but `7` was passed.',
    );

    expect(messageOf(number(1, { max: 5 }), 7)).toBe(
      'Error: expected a number less than or equal to 5 but `7` was passed.',
    );
  });

  test('multipleOf and step report the divisor', () => {
    expect(messageOf(number(3, { multipleOf: 3 }), 7)).toBe(
      'Error: expected a number to be a multiple of 3 but `7` was passed.',
    );

    expect(messageOf(number(4, { step: 2 }), 7)).toBe(
      'Error: expected a number to be a multiple of 2 but `7` was passed.',
    );
  });
});

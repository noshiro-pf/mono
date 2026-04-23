import { expectType, Result } from 'ts-data-forge';
import { type Type, type TypeOf } from '../type.mjs';
import { validationErrorsToMessages } from '../utils/index.mjs';
import { bigint } from './bigint.mjs';

describe(bigint, () => {
  const targetType = bigint(0n);

  type TargetType = TypeOf<typeof targetType>;

  expectType<TargetType, bigint>('=');

  expectType<typeof targetType.defaultValue, TargetType>('=');

  describe('is', () => {
    test('truthy case', () => {
      const x: unknown = 123n;

      if (targetType.is(x)) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      assert.isTrue(targetType.is(x));
    });

    test('falsy case', () => {
      const x: unknown = 123;

      if (targetType.is(x)) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      assert.isFalse(targetType.is(x));
    });
  });

  describe('validate', () => {
    test('truthy case', () => {
      const result = targetType.validate(456n);

      assert.isTrue(Result.isOk(result));

      const resultValue = Result.unwrapThrow(result);

      expect(resultValue).toBe(456n);
    });

    test('falsy case', () => {
      const result = targetType.validate(123);

      assert.isTrue(Result.isErr(result));

      const resultError = Result.unwrapErrThrow(result);

      assert.deepStrictEqual(resultError, [
        {
          path: [],
          actualValue: 123,
          expectedType: 'bigint',
          typeName: 'bigint',
          details: undefined,
        },
      ]);

      assert.deepStrictEqual(validationErrorsToMessages(resultError), [
        'Error: expected <bigint> type but <number> type value `123` was passed.',
      ]);
    });

    test('validate returns input as-is for OK cases', () => {
      const input = 999n;

      const result = targetType.validate(input);

      assert.isTrue(Result.isOk(result));

      const resultValue1 = Result.unwrapThrow(result);

      expect(resultValue1).toBe(input); // ✅ same reference
    });
  });

  describe('assertIs', () => {
    test('truthy case', () => {
      const x: unknown = 789n;

      const assertIs: (a: unknown) => asserts a is bigint = targetType.assertIs;

      expect(() => {
        assertIs(x);
      }).not.toThrow();
    });

    test('falsy case', () => {
      const x: unknown = 'not a bigint';

      const assertIs: (a: unknown) => asserts a is bigint = targetType.assertIs;

      expect(() => {
        assertIs(x);
      }).toThrow('Error');
    });
  });

  describe('cast', () => {
    test('truthy case', () => {
      const x: unknown = 999n;

      expect(targetType.cast(x)).toBe(999n);
    });

    test('falsy case', () => {
      const x: unknown = 'invalid';

      expect(() => targetType.cast(x)).toThrow('Error');
    });
  });

  describe('fill', () => {
    test('noop', () => {
      const x: unknown = 111n;

      expect(targetType.fill(x)).toBe(111n);
    });

    test('fill with the default value', () => {
      const x: unknown = 'not a bigint';

      expect(targetType.fill(x)).toBe(0n);
    });
  });
});

describe('bigint with constraints', () => {
  describe('bigint constrained by gt', () => {
    test('accepts valid default value', () => {
      const type = bigint(10n, { gt: 5n });

      expectType<typeof type, Type<bigint>>('=');

      assert.isTrue(type.is(6n));

      assert.isFalse(type.is(5n));

      assert.isTrue(type.is(20n));
    });

    test('rejects invalid default value', () => {
      expect(() => bigint(5n, { gt: 5n })).toThrow('gt = 5');
    });
  });

  describe('bigint constrained by gte', () => {
    test('accepts valid default value', () => {
      const type = bigint(5n, { gte: 5n });

      expectType<typeof type, Type<bigint>>('=');

      assert.isTrue(type.is(5n));

      assert.isFalse(type.is(4n));

      assert.isTrue(type.is(10n));
    });

    test('rejects invalid default value', () => {
      expect(() => bigint(4n, { gte: 5n })).toThrow('gte = 5');
    });
  });

  describe('bigint constrained by min', () => {
    test('accepts valid default value', () => {
      const type = bigint(5n, { min: 5n });

      expectType<typeof type, Type<bigint>>('=');

      assert.isTrue(type.is(6n));

      assert.isFalse(type.is(4n));
    });

    test('rejects invalid default value', () => {
      expect(() => bigint(4n, { min: 5n })).toThrow('min = 5');
    });
  });

  describe('bigint constrained by lt', () => {
    test('accepts valid default value', () => {
      const type = bigint(4n, { lt: 5n });

      expectType<typeof type, Type<bigint>>('=');

      assert.isTrue(type.is(3n));

      assert.isFalse(type.is(5n));

      assert.isFalse(type.is(10n));
    });

    test('rejects invalid default value', () => {
      expect(() => bigint(5n, { lt: 5n })).toThrow('lt = 5');
    });
  });

  describe('bigint constrained by lte', () => {
    test('accepts valid default value', () => {
      const type = bigint(5n, { lte: 5n });

      expectType<typeof type, Type<bigint>>('=');

      assert.isTrue(type.is(4n));

      assert.isTrue(type.is(5n));

      assert.isFalse(type.is(6n));
    });

    test('rejects invalid default value', () => {
      expect(() => bigint(6n, { lte: 5n })).toThrow('lte = 5');
    });
  });

  describe('bigint constrained by max', () => {
    test('accepts valid default value', () => {
      const type = bigint(5n, { max: 5n });

      expectType<typeof type, Type<bigint>>('=');

      assert.isTrue(type.is(5n));

      assert.isFalse(type.is(6n));

      assert.isTrue(type.is(3n));
    });

    test('rejects invalid default value', () => {
      expect(() => bigint(6n, { max: 5n })).toThrow('max = 5');
    });
  });

  describe('bigint constrained by positive', () => {
    test('accepts valid default value', () => {
      const type = bigint(1n, { positive: true });

      expectType<typeof type, Type<bigint>>('=');

      assert.isTrue(type.is(10n));

      assert.isFalse(type.is(0n));

      assert.isFalse(type.is(-1n));
    });

    test('rejects invalid default value', () => {
      expect(() =>
        // @ts-expect-error 0n is not > 0n when positive is true
        bigint(0n, { positive: true }),
      ).toThrow('positive = true');
    });
  });

  describe('bigint constrained by nonNegative', () => {
    test('accepts valid default value', () => {
      const type = bigint(0n, { nonNegative: true });

      expectType<typeof type, Type<bigint>>('=');

      assert.isTrue(type.is(5n));

      assert.isTrue(type.is(0n));

      assert.isFalse(type.is(-1n));
    });

    test('rejects invalid default value', () => {
      expect(() =>
        // @ts-expect-error -1n is not >= 0n when nonNegative is true
        bigint(-1n, { nonNegative: true }),
      ).toThrow('nonNegative = true');
    });
  });

  describe('bigint constrained by negative', () => {
    test('accepts valid default value', () => {
      const type = bigint(-1n, { negative: true });

      expectType<typeof type, Type<bigint>>('=');

      assert.isTrue(type.is(-5n));

      assert.isFalse(type.is(0n));

      assert.isFalse(type.is(1n));
    });

    test('rejects invalid default value', () => {
      expect(() =>
        // @ts-expect-error 0n is not < 0n when negative is true
        bigint(0n, { negative: true }),
      ).toThrow('negative = true');
    });
  });

  describe('bigint constrained by nonPositive', () => {
    test('accepts valid default value', () => {
      const type = bigint(0n, { nonPositive: true });

      expectType<typeof type, Type<bigint>>('=');

      assert.isTrue(type.is(-5n));

      assert.isTrue(type.is(0n));

      assert.isFalse(type.is(1n));
    });

    test('rejects invalid default value', () => {
      expect(() =>
        // @ts-expect-error 1n is not <= 0n when nonPositive is true
        bigint(1n, { nonPositive: true }),
      ).toThrow('nonPositive = true');
    });
  });

  describe('bigint constrained by multipleOf', () => {
    test('accepts valid default value', () => {
      const type = bigint(6n, { multipleOf: 3n });

      expectType<typeof type, Type<bigint>>('=');

      assert.isTrue(type.is(9n));

      assert.isFalse(type.is(10n));

      assert.isTrue(type.is(-6n));
    });

    test('rejects invalid default value', () => {
      expect(() => bigint(7n, { multipleOf: 3n })).toThrow('multipleOf = 3');
    });
  });

  describe('bigint constrained by step', () => {
    test('accepts valid default value', () => {
      const type = bigint(8n, { step: 2n });

      expectType<typeof type, Type<bigint>>('=');

      assert.isTrue(type.is(10n));

      assert.isFalse(type.is(11n));

      assert.isTrue(type.is(-2n));
    });

    test('rejects invalid default value', () => {
      expect(() => bigint(9n, { step: 2n })).toThrow('step = 2');
    });
  });

  describe('complex constraints', () => {
    describe('bigint constrained by gt and lt', () => {
      test('accepts valid default value', () => {
        const type = bigint(5n, { gt: 1n, lt: 10n });

        expectType<typeof type, Type<bigint>>('=');

        assert.isTrue(type.is(6n));

        assert.isFalse(type.is(1n));

        assert.isFalse(type.is(10n));
      });

      test('rejects invalid default value', () => {
        expect(() => bigint(1n, { gt: 1n, lt: 10n })).toThrow('gt = 1');
      });
    });

    describe('bigint constrained by gte and lte', () => {
      test('accepts valid default value', () => {
        const type = bigint(5n, { gte: 5n, lte: 10n });

        expectType<typeof type, Type<bigint>>('=');

        assert.isTrue(type.is(5n));

        assert.isTrue(type.is(10n));

        assert.isFalse(type.is(4n));

        assert.isFalse(type.is(11n));
      });

      test('rejects invalid default value', () => {
        expect(() => bigint(4n, { gte: 5n, lte: 10n })).toThrow('gte = 5');
      });
    });

    describe('bigint constrained by positive and multipleOf', () => {
      test('accepts valid default value', () => {
        const type = bigint(6n, { positive: true, multipleOf: 3n });

        expectType<typeof type, Type<bigint>>('=');

        assert.isTrue(type.is(9n));

        assert.isTrue(type.is(3n));

        assert.isFalse(type.is(-3n));

        assert.isFalse(type.is(10n));
      });

      test('rejects invalid default value', () => {
        expect(() => bigint(4n, { positive: true, multipleOf: 3n })).toThrow(
          'multipleOf = 3',
        );
      });
    });

    describe('bigint constrained by nonNegative, max, and step', () => {
      test('accepts valid default value', () => {
        const type = bigint(8n, {
          nonNegative: true,
          max: 10n,
          step: 2n,
        });

        expectType<typeof type, Type<bigint>>('=');

        assert.isTrue(type.is(10n));

        assert.isTrue(type.is(0n));

        assert.isFalse(type.is(11n));

        assert.isFalse(type.is(-2n));

        assert.isFalse(type.is(9n));
      });

      test('rejects invalid default value', () => {
        expect(() =>
          bigint(12n, { nonNegative: true, max: 10n, step: 2n }),
        ).toThrow('max = 10');
      });
    });
  });
});

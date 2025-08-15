import { expectType, Result } from 'ts-data-forge';
import { type TypeOf } from '../type.mjs';
import { validationErrorsToMessages } from '../utils/index.mjs';
import { bigint, bigintLiteral } from './bigint.mjs';

describe('bigint', () => {
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

      expect(targetType.is(x)).toBe(true);
    });

    test('falsy case', () => {
      const x: unknown = 123;

      if (targetType.is(x)) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      expect(targetType.is(x)).toBe(false);
    });
  });

  describe('validate', () => {
    test('truthy case', () => {
      const result = targetType.validate(456n);
      expect(Result.isOk(result)).toBe(true);

      if (Result.isOk(result)) {
        expect(result.value).toBe(456n);
      }
    });

    test('falsy case', () => {
      const result = targetType.validate(123);
      expect(Result.isErr(result)).toBe(true);

      if (Result.isErr(result)) {
        expect(result.value).toStrictEqual([
          {
            path: [],
            actualValue: 123,
            expectedType: 'bigint',
            typeName: 'bigint',
            message: undefined,
          },
        ]);

        expect(validationErrorsToMessages(result.value)).toStrictEqual([
          'Expected bigint, got number',
        ]);
      }
    });

    test('validate returns input as-is for OK cases', () => {
      const input = 999n;
      const result = targetType.validate(input);
      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value).toBe(input); // ✅ same reference
      }
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
      }).toThrow('Expected');
    });
  });

  describe('cast', () => {
    test('truthy case', () => {
      const x: unknown = 999n;

      expect(targetType.cast(x)).toBe(999n);
    });

    test('falsy case', () => {
      const x: unknown = 'invalid';

      expect(() => targetType.cast(x)).toThrow('Expected');
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

describe('bigintLiteral', () => {
  const targetType = bigintLiteral(42n);

  type TargetType = TypeOf<typeof targetType>;

  expectType<TargetType, 42n>('=');

  expectType<typeof targetType.defaultValue, TargetType>('=');

  test('type name includes literal value', () => {
    expect(targetType.typeName).toBe('bigintLiteral(42)');
  });

  describe('is', () => {
    test('truthy case - exact literal match', () => {
      const x: unknown = 42n;

      if (targetType.is(x)) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      expect(targetType.is(x)).toBe(true);
    });

    test('falsy case - different bigint', () => {
      const x: unknown = 123n;

      if (targetType.is(x)) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      expect(targetType.is(x)).toBe(false);
    });

    test('falsy case - non-bigint', () => {
      const x: unknown = 42;

      expect(targetType.is(x)).toBe(false);
    });
  });

  describe('validate', () => {
    test('truthy case', () => {
      const result = targetType.validate(42n);
      expect(Result.isOk(result)).toBe(true);

      if (Result.isOk(result)) {
        expect(result.value).toBe(42n);
      }
    });

    test('falsy case - different bigint', () => {
      const result = targetType.validate(99n);
      expect(Result.isErr(result)).toBe(true);

      if (Result.isErr(result)) {
        expect(result.value).toStrictEqual([
          {
            path: [],
            actualValue: 99n,
            expectedType: 'bigintLiteral(42)',
            typeName: 'bigintLiteral(42)',
            message: undefined,
          },
        ]);

        expect(validationErrorsToMessages(result.value)).toStrictEqual([
          'Expected bigintLiteral(42), got bigint',
        ]);
      }
    });

    test('falsy case - non-bigint', () => {
      const result = targetType.validate('not a bigint');
      expect(Result.isErr(result)).toBe(true);

      if (Result.isErr(result)) {
        expect(result.value).toStrictEqual([
          {
            path: [],
            actualValue: 'not a bigint',
            expectedType: 'bigintLiteral(42)',
            typeName: 'bigintLiteral(42)',
            message: undefined,
          },
        ]);

        expect(validationErrorsToMessages(result.value)).toStrictEqual([
          'Expected bigintLiteral(42), got string',
        ]);
      }
    });

    test('validate returns input as-is for OK cases', () => {
      const input = 42n;
      const result = targetType.validate(input);
      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value).toBe(input); // ✅ same reference
      }
    });
  });

  describe('cast', () => {
    test('truthy case', () => {
      const x: unknown = 42n;

      expect(targetType.cast(x)).toBe(42n);
    });

    test('falsy case', () => {
      const x: unknown = 123n;

      expect(() => targetType.cast(x)).toThrow('Expected');
    });
  });

  describe('fill', () => {
    test('noop', () => {
      const x: unknown = 42n;

      expect(targetType.fill(x)).toBe(42n);
    });

    test('fill with the default value', () => {
      const x: unknown = 999n;

      expect(targetType.fill(x)).toBe(42n);
    });
  });
});

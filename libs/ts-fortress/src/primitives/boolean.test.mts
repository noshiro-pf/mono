import { expectType, Result } from 'ts-data-forge';
import { type TypeOf } from '../type.mjs';
import { validationErrorsToMessages } from '../utils/index.mjs';
import { boolean, booleanLiteral } from './boolean.mjs';

describe('boolean', () => {
  const targetType = boolean(false);

  type TargetType = TypeOf<typeof targetType>;

  expectType<TargetType, boolean>('=');

  expectType<typeof targetType.defaultValue, TargetType>('=');

  describe('is', () => {
    test('truthy case', () => {
      const x: unknown = true;

      if (targetType.is(x)) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      expect(targetType.is(x)).toBe(true);
    });

    test('falsy case', () => {
      const x: unknown = 'not a boolean';

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
      const result = targetType.validate(true);
      expect(Result.isOk(result)).toBe(true);

      if (Result.isOk(result)) {
        expect(result.value).toBe(true);
      }
    });

    test('falsy case', () => {
      const result = targetType.validate('not a boolean');
      expect(Result.isErr(result)).toBe(true);

      if (Result.isErr(result)) {
        expect(result.value).toStrictEqual([
          {
            path: [],
            actualValue: 'not a boolean',
            expectedType: 'boolean',
            typeName: 'boolean',
            message: undefined,
          },
        ]);

        expect(validationErrorsToMessages(result.value)).toStrictEqual([
          'Expected boolean, got string',
        ]);
      }
    });

    test('validate returns input as-is for OK cases', () => {
      const input = false;
      const result = targetType.validate(input);
      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value).toBe(input); // ✅ same reference
      }
    });
  });

  describe('assertIs', () => {
    test('truthy case', () => {
      const x: unknown = false;

      const assertIs: (a: unknown) => asserts a is boolean =
        targetType.assertIs;
      expect(() => {
        assertIs(x);
      }).not.toThrow();
    });

    test('falsy case', () => {
      const x: unknown = 'not a boolean';

      const assertIs: (a: unknown) => asserts a is boolean =
        targetType.assertIs;
      expect(() => {
        assertIs(x);
      }).toThrow('Expected');
    });
  });

  describe('cast', () => {
    test('truthy case', () => {
      const x: unknown = true;

      expect(targetType.cast(x)).toBe(true);
    });

    test('falsy case', () => {
      const x: unknown = 'invalid';

      expect(() => targetType.cast(x)).toThrow('Expected');
    });
  });

  describe('fill', () => {
    test('noop', () => {
      const x: unknown = true;

      expect(targetType.fill(x)).toBe(true);
    });

    test('fill with the default value', () => {
      const x: unknown = 'not a boolean';

      expect(targetType.fill(x)).toBe(false);
    });
  });
});

describe('booleanLiteral', () => {
  describe('true literal', () => {
    const targetType = booleanLiteral(true);

    type TargetType = TypeOf<typeof targetType>;

    expectType<TargetType, true>('=');

    expectType<typeof targetType.defaultValue, TargetType>('=');

    test('type name includes literal value', () => {
      expect(targetType.typeName).toBe('booleanLiteral(true)');
    });

    describe('is', () => {
      test('truthy case - exact literal match', () => {
        const x: unknown = true;

        if (targetType.is(x)) {
          expectType<typeof x, TargetType>('=');
        } else {
          expectType<typeof x, unknown>('=');
        }

        expect(targetType.is(x)).toBe(true);
      });

      test('falsy case - different boolean', () => {
        const x: unknown = false;

        if (targetType.is(x)) {
          expectType<typeof x, TargetType>('=');
        } else {
          expectType<typeof x, unknown>('=');
        }

        expect(targetType.is(x)).toBe(false);
      });

      test('falsy case - non-boolean', () => {
        const x: unknown = 'true';

        expect(targetType.is(x)).toBe(false);
      });
    });

    describe('validate', () => {
      test('truthy case', () => {
        const result = targetType.validate(true);
        expect(Result.isOk(result)).toBe(true);

        if (Result.isOk(result)) {
          expect(result.value).toBe(true);
        }
      });

      test('falsy case - different boolean', () => {
        const result = targetType.validate(false);
        expect(Result.isErr(result)).toBe(true);

        if (Result.isErr(result)) {
          expect(result.value).toStrictEqual([
            {
              path: [],
              actualValue: false,
              expectedType: 'booleanLiteral(true)',
              typeName: 'booleanLiteral(true)',
              message: undefined,
            },
          ]);

          expect(validationErrorsToMessages(result.value)).toStrictEqual([
            'Expected booleanLiteral(true), got boolean',
          ]);
        }
      });

      test('falsy case - non-boolean', () => {
        const result = targetType.validate('not a boolean');
        expect(Result.isErr(result)).toBe(true);

        if (Result.isErr(result)) {
          expect(result.value).toStrictEqual([
            {
              path: [],
              actualValue: 'not a boolean',
              expectedType: 'booleanLiteral(true)',
              typeName: 'booleanLiteral(true)',
              message: undefined,
            },
          ]);

          expect(validationErrorsToMessages(result.value)).toStrictEqual([
            'Expected booleanLiteral(true), got string',
          ]);
        }
      });

      test('validate returns input as-is for OK cases', () => {
        const input = true;
        const result = targetType.validate(input);
        expect(Result.isOk(result)).toBe(true);
        if (Result.isOk(result)) {
          expect(result.value).toBe(input); // ✅ same reference
        }
      });
    });

    describe('cast', () => {
      test('truthy case', () => {
        const x: unknown = true;

        expect(targetType.cast(x)).toBe(true);
      });

      test('falsy case', () => {
        const x: unknown = false;

        expect(() => targetType.cast(x)).toThrow('Expected');
      });
    });

    describe('fill', () => {
      test('noop', () => {
        const x: unknown = true;

        expect(targetType.fill(x)).toBe(true);
      });

      test('fill with the default value', () => {
        const x: unknown = false;

        expect(targetType.fill(x)).toBe(true);
      });
    });
  });

  describe('false literal', () => {
    const targetType = booleanLiteral(false);

    type TargetType = TypeOf<typeof targetType>;

    expectType<TargetType, false>('=');

    test('type name includes literal value', () => {
      expect(targetType.typeName).toBe('booleanLiteral(false)');
    });

    describe('is', () => {
      test('truthy case - exact literal match', () => {
        const x: unknown = false;

        expect(targetType.is(x)).toBe(true);
      });

      test('falsy case - different boolean', () => {
        const x: unknown = true;

        expect(targetType.is(x)).toBe(false);
      });
    });

    describe('validate', () => {
      test('truthy case', () => {
        const result = targetType.validate(false);
        expect(Result.isOk(result)).toBe(true);

        if (Result.isOk(result)) {
          expect(result.value).toBe(false);
        }
      });

      test('falsy case - different boolean', () => {
        const result = targetType.validate(true);
        expect(Result.isErr(result)).toBe(true);

        if (Result.isErr(result)) {
          expect(result.value).toStrictEqual([
            {
              path: [],
              actualValue: true,
              expectedType: 'booleanLiteral(false)',
              typeName: 'booleanLiteral(false)',
              message: undefined,
            },
          ]);

          expect(validationErrorsToMessages(result.value)).toStrictEqual([
            'Expected booleanLiteral(false), got boolean',
          ]);
        }
      });

      test('validate returns input as-is for OK cases', () => {
        const input = false;
        const result = targetType.validate(input);
        expect(Result.isOk(result)).toBe(true);
        if (Result.isOk(result)) {
          expect(result.value).toBe(input); // ✅ same reference
        }
      });
    });

    describe('fill', () => {
      test('noop', () => {
        const x: unknown = false;

        expect(targetType.fill(x)).toBe(false);
      });

      test('fill with the default value', () => {
        const x: unknown = true;

        expect(targetType.fill(x)).toBe(false);
      });
    });
  });
});

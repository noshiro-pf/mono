import { expectType, Result } from 'ts-data-forge';
import { type TypeOf } from '../type.mjs';
import { validationErrorsToMessages } from '../utils/index.mjs';
import { literal } from './literal.mjs';

describe('literal', () => {
  describe('string', () => {
    const hello = literal('hello');
    type Hello = TypeOf<typeof hello>;

    expectType<Hello, 'hello'>('=');
    expectType<typeof hello.defaultValue, Hello>('=');

    describe('default value', () => {
      test('uses literal as default', () => {
        expect(hello.defaultValue).toBe('hello');
      });
    });

    describe('is', () => {
      test('exact match returns true', () => {
        const value: unknown = 'hello';

        if (hello.is(value)) {
          expectType<typeof value, Hello>('=');
        } else {
          expectType<typeof value, unknown>('=');
        }

        expect(hello.is(value)).toBe(true);
      });

      test('different string returns false', () => {
        const value: unknown = 'world';

        if (hello.is(value)) {
          expectType<typeof value, Hello>('=');
        } else {
          expectType<typeof value, unknown>('=');
        }

        expect(hello.is(value)).toBe(false);
      });

      test('non-string returns false', () => {
        const value: unknown = 42;

        expect(hello.is(value)).toBe(false);
      });
    });

    describe('special string literals', () => {
      test('empty string literal', () => {
        const empty = literal('');
        type Empty = TypeOf<typeof empty>;
        expectType<Empty, ''>('=');

        expect(empty.is('')).toBe(true);
        expect(empty.is(' ')).toBe(false);
      });

      test('whitespace literal', () => {
        const whitespace = literal('   ');
        type Whitespace = TypeOf<typeof whitespace>;
        expectType<Whitespace, '   '>('=');

        expect(whitespace.is('   ')).toBe(true);
        expect(whitespace.is('  ')).toBe(false);
        expect(whitespace.is('    ')).toBe(false);
      });

      test('emoji literal', () => {
        const emoji = literal('🎉');
        type Emoji = TypeOf<typeof emoji>;
        expectType<Emoji, '🎉'>('=');

        expect(emoji.is('🎉')).toBe(true);
        expect(emoji.is('🎊')).toBe(false);
      });

      test('multiline literal', () => {
        const multiline = literal('line1\nline2');
        type Multiline = TypeOf<typeof multiline>;
        expectType<Multiline, 'line1\nline2'>('=');

        expect(multiline.is('line1\nline2')).toBe(true);
        expect(multiline.is(String.raw`line1\nline2`)).toBe(false);
      });
    });

    describe('validate', () => {
      test('exact match', () => {
        const value: unknown = 'hello';
        const result = hello.validate(value);

        expect(Result.isOk(result)).toBe(true);
        const resultValue = Result.unwrapThrow(result);
        expect(resultValue).toBe('hello');
      });

      test('different value', () => {
        const value: unknown = 'world';
        const result = hello.validate(value);

        expect(Result.isErr(result)).toBe(true);
        const resultError = Result.unwrapErrThrow(result);
        expect(resultError).toStrictEqual([
          {
            path: [],
            actualValue: 'world',
            expectedType: 'literal("hello")',
            typeName: 'literal("hello")',
            message: undefined,
          },
        ]);
      });

      test('validate returns input as-is for OK cases', () => {
        const input = 'hello';
        const result = hello.validate(input);
        expect(Result.isOk(result)).toBe(true);
        const resultValue1 = Result.unwrapThrow(result);
        expect(resultValue1).toBe(input); // ✅ same reference
      });
    });

    describe('cast', () => {
      test('valid literal returns as is', () => {
        const value: unknown = 'hello';
        const result = hello.cast(value);
        expect(result).toBe('hello');
      });

      test('invalid value throws error', () => {
        const value: unknown = 'world';
        expect(() => hello.cast(value)).toThrow(
          'Expected <literal("hello")>, got <string> type value "world".',
        );
      });
    });

    describe('fill', () => {
      test('valid literal returns as is', () => {
        const value: unknown = 'hello';
        const result = hello.fill(value);
        expect(result).toBe('hello');
      });

      test('undefined returns default (the literal itself)', () => {
        const value: unknown = undefined;
        const result = hello.fill(value);
        expect(result).toBe('hello');
      });

      test('different value returns default', () => {
        const value: unknown = 'world';
        const result = hello.fill(value);
        expect(result).toBe('hello');
      });
    });
  });

  describe('number', () => {
    const literal42 = literal(42);
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
        const zero = literal(0);
        type Zero = TypeOf<typeof zero>;
        expectType<Zero, 0>('=');

        expect(zero.is(0)).toBe(true);
        expect(zero.is(-0)).toBe(true); // JavaScript treats 0 and -0 as equal
        expect(zero.is(1)).toBe(false);
      });

      test('negative literal', () => {
        const negative = literal(-100);
        type Negative = TypeOf<typeof negative>;
        expectType<Negative, -100>('=');

        expect(negative.is(-100)).toBe(true);
        expect(negative.is(100)).toBe(false);
      });

      test('decimal literal', () => {
        const pi = literal(3.14);
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
        const resultValue2 = Result.unwrapThrow(result);
        expect(resultValue2).toBe(42);
      });

      test('different value', () => {
        const value: unknown = 43;
        const result = literal42.validate(value);

        expect(Result.isErr(result)).toBe(true);
        const resultError1 = Result.unwrapErrThrow(result);
        expect(resultError1).toStrictEqual([
          {
            path: [],
            actualValue: 43,
            expectedType: 'literal(42)',
            typeName: 'literal(42)',
            message: undefined,
          },
        ]);
      });

      test('validate returns input as-is for OK cases', () => {
        const input = 42;
        const result = literal42.validate(input);
        expect(Result.isOk(result)).toBe(true);
        const resultValue3 = Result.unwrapThrow(result);
        expect(resultValue3).toBe(input); // ✅ same reference
      });
    });
  });

  describe('bigint', () => {
    const targetType = literal(42n);

    type TargetType = TypeOf<typeof targetType>;

    expectType<TargetType, 42n>('=');

    expectType<typeof targetType.defaultValue, TargetType>('=');

    test('type name includes literal value', () => {
      expect(targetType.typeName).toBe('literal(42n)');
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

        const resultValue4 = Result.unwrapThrow(result);
        expect(resultValue4).toBe(42n);
      });

      test('falsy case - different bigint', () => {
        const result = targetType.validate(99n);
        expect(Result.isErr(result)).toBe(true);

        const resultError2 = Result.unwrapErrThrow(result);
        expect(resultError2).toStrictEqual([
          {
            path: [],
            actualValue: 99n,
            expectedType: 'literal(42n)',
            typeName: 'literal(42n)',
            message: undefined,
          },
        ]);

        expect(validationErrorsToMessages(resultError2)).toStrictEqual([
          'Expected <literal(42n)>, got <bigint> type value `99n`.',
        ]);
      });

      test('falsy case - non-bigint', () => {
        const result = targetType.validate('not a bigint');
        expect(Result.isErr(result)).toBe(true);

        const resultError3 = Result.unwrapErrThrow(result);
        expect(resultError3).toStrictEqual([
          {
            path: [],
            actualValue: 'not a bigint',
            expectedType: 'literal(42n)',
            typeName: 'literal(42n)',
            message: undefined,
          },
        ]);

        expect(validationErrorsToMessages(resultError3)).toStrictEqual([
          'Expected <literal(42n)>, got <string> type value "not a bigint".',
        ]);
      });

      test('validate returns input as-is for OK cases', () => {
        const input = 42n;
        const result = targetType.validate(input);
        expect(Result.isOk(result)).toBe(true);
        const resultValue5 = Result.unwrapThrow(result);
        expect(resultValue5).toBe(input); // ✅ same reference
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

  describe('boolean', () => {
    describe('true literal', () => {
      const targetType = literal(true);

      type TargetType = TypeOf<typeof targetType>;

      expectType<TargetType, true>('=');

      expectType<typeof targetType.defaultValue, TargetType>('=');

      test('type name includes literal value', () => {
        expect(targetType.typeName).toBe('literal(true)');
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

          const resultValue6 = Result.unwrapThrow(result);
          expect(resultValue6).toBe(true);
        });

        test('falsy case - different boolean', () => {
          const result = targetType.validate(false);
          expect(Result.isErr(result)).toBe(true);

          const resultError4 = Result.unwrapErrThrow(result);
          expect(resultError4).toStrictEqual([
            {
              path: [],
              actualValue: false,
              expectedType: 'literal(true)',
              typeName: 'literal(true)',
              message: undefined,
            },
          ]);

          expect(validationErrorsToMessages(resultError4)).toStrictEqual([
            'Expected <literal(true)>, got <boolean> type value `false`.',
          ]);
        });

        test('falsy case - non-boolean', () => {
          const result = targetType.validate('not a boolean');
          expect(Result.isErr(result)).toBe(true);

          const resultError5 = Result.unwrapErrThrow(result);
          expect(resultError5).toStrictEqual([
            {
              path: [],
              actualValue: 'not a boolean',
              expectedType: 'literal(true)',
              typeName: 'literal(true)',
              message: undefined,
            },
          ]);

          expect(validationErrorsToMessages(resultError5)).toStrictEqual([
            'Expected <literal(true)>, got <string> type value "not a boolean".',
          ]);
        });

        test('validate returns input as-is for OK cases', () => {
          const input = true;
          const result = targetType.validate(input);
          expect(Result.isOk(result)).toBe(true);
          const resultValue7 = Result.unwrapThrow(result);
          expect(resultValue7).toBe(input); // ✅ same reference
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
      const targetType = literal(false);

      type TargetType = TypeOf<typeof targetType>;

      expectType<TargetType, false>('=');

      test('type name includes literal value', () => {
        expect(targetType.typeName).toBe('literal(false)');
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

          const resultValue8 = Result.unwrapThrow(result);
          expect(resultValue8).toBe(false);
        });

        test('falsy case - different boolean', () => {
          const result = targetType.validate(true);
          expect(Result.isErr(result)).toBe(true);

          const resultError6 = Result.unwrapErrThrow(result);
          expect(resultError6).toStrictEqual([
            {
              path: [],
              actualValue: true,
              expectedType: 'literal(false)',
              typeName: 'literal(false)',
              message: undefined,
            },
          ]);

          expect(validationErrorsToMessages(resultError6)).toStrictEqual([
            'Expected <literal(false)>, got <boolean> type value `true`.',
          ]);
        });

        test('validate returns input as-is for OK cases', () => {
          const input = false;
          const result = targetType.validate(input);
          expect(Result.isOk(result)).toBe(true);
          const resultValue9 = Result.unwrapThrow(result);
          expect(resultValue9).toBe(input); // ✅ same reference
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
});

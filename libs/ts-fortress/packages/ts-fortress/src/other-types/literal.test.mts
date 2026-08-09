/* eslint-disable unicorn/prefer-string-repeat */
import { expectType, Result } from 'ts-data-forge';
import { type TypeOf } from '../type.mjs';
import { validationErrorsToMessages } from '../utils/index.mjs';
import { literal } from './literal.mjs';

describe(literal, () => {
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

        assert.isTrue(hello.is(value));
      });

      test('different string returns false', () => {
        const value: unknown = 'world';

        if (hello.is(value)) {
          expectType<typeof value, Hello>('=');
        } else {
          expectType<typeof value, unknown>('=');
        }

        assert.isFalse(hello.is(value));
      });

      test('non-string returns false', () => {
        const value: unknown = 42;

        assert.isFalse(hello.is(value));
      });
    });

    describe('special string literals', () => {
      test('empty string literal', () => {
        const empty = literal('');

        type Empty = TypeOf<typeof empty>;

        expectType<Empty, ''>('=');

        assert.isTrue(empty.is(''));

        assert.isFalse(empty.is(' '));
      });

      test('whitespace literal', () => {
        const whitespace = literal('   ');

        type Whitespace = TypeOf<typeof whitespace>;

        expectType<Whitespace, '   '>('=');

        assert.isTrue(whitespace.is('   '));

        assert.isFalse(whitespace.is('  '));

        assert.isFalse(whitespace.is('    '));
      });

      test('emoji literal', () => {
        const emoji = literal('🎉');

        type Emoji = TypeOf<typeof emoji>;

        expectType<Emoji, '🎉'>('=');

        assert.isTrue(emoji.is('🎉'));

        assert.isFalse(emoji.is('🎊'));
      });

      test('multiline literal', () => {
        const multiline = literal('line1\nline2');

        type Multiline = TypeOf<typeof multiline>;

        expectType<Multiline, 'line1\nline2'>('=');

        assert.isTrue(multiline.is('line1\nline2'));

        assert.isFalse(multiline.is(String.raw`line1\nline2`));
      });
    });

    describe('validate', () => {
      test('exact match', () => {
        const value: unknown = 'hello';

        const result = hello.validate(value);

        assert.isTrue(Result.isOk(result));

        const resultValue = Result.unwrapThrow(result);

        expect(resultValue).toBe('hello');
      });

      test('different value', () => {
        const value: unknown = 'world';

        const result = hello.validate(value);

        assert.isTrue(Result.isErr(result));

        const resultError = Result.unwrapErrThrow(result);

        assert.deepStrictEqual(resultError, [
          {
            path: [],
            actualValue: 'world',
            expectedType: '"hello"',
            typeName: '"hello"',
            details: undefined,
          },
        ]);
      });

      test('validate returns input as-is for OK cases', () => {
        const input = 'hello';

        const result = hello.validate(input);

        assert.isTrue(Result.isOk(result));

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
          'Error: expected <"hello"> type but <string> type value "world" was passed.',
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

        assert.isTrue(literal42.is(value));
      });

      test('different number returns false', () => {
        const value: unknown = 43;

        if (literal42.is(value)) {
          expectType<typeof value, Literal42>('=');
        } else {
          expectType<typeof value, unknown>('=');
        }

        assert.isFalse(literal42.is(value));
      });

      test('non-number returns false', () => {
        const value: unknown = '42';

        assert.isFalse(literal42.is(value));
      });
    });

    describe('special number literals', () => {
      test('zero literal', () => {
        const zero = literal(0);

        type Zero = TypeOf<typeof zero>;

        expectType<Zero, 0>('=');

        assert.isTrue(zero.is(0));

        assert.isTrue(zero.is(-0)); // JavaScript treats 0 and -0 as equal

        assert.isFalse(zero.is(1));
      });

      test('negative literal', () => {
        const negative = literal(-100);

        type Negative = TypeOf<typeof negative>;

        expectType<Negative, -100>('=');

        assert.isTrue(negative.is(-100));

        assert.isFalse(negative.is(100));
      });

      test('decimal literal', () => {
        const decimal = literal(1.5);

        type Decimal = TypeOf<typeof decimal>;

        expectType<Decimal, 1.5>('=');

        assert.isTrue(decimal.is(1.5));

        assert.isFalse(decimal.is(1.25));
      });
    });

    describe('validate', () => {
      test('exact match', () => {
        const value: unknown = 42;

        const result = literal42.validate(value);

        assert.isTrue(Result.isOk(result));

        const resultValue2 = Result.unwrapThrow(result);

        expect(resultValue2).toBe(42);
      });

      test('different value', () => {
        const value: unknown = 43;

        const result = literal42.validate(value);

        assert.isTrue(Result.isErr(result));

        const resultError1 = Result.unwrapErrThrow(result);

        assert.deepStrictEqual(resultError1, [
          {
            path: [],
            actualValue: 43,
            expectedType: '42',
            typeName: '42',
            details: undefined,
          },
        ]);
      });

      test('validate returns input as-is for OK cases', () => {
        const input = 42;

        const result = literal42.validate(input);

        assert.isTrue(Result.isOk(result));

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
      expect(targetType.typeName).toBe('42n');
    });

    describe('is', () => {
      test('truthy case - exact literal match', () => {
        const x: unknown = 42n;

        if (targetType.is(x)) {
          expectType<typeof x, TargetType>('=');
        } else {
          expectType<typeof x, unknown>('=');
        }

        assert.isTrue(targetType.is(x));
      });

      test('falsy case - different bigint', () => {
        const x: unknown = 123n;

        if (targetType.is(x)) {
          expectType<typeof x, TargetType>('=');
        } else {
          expectType<typeof x, unknown>('=');
        }

        assert.isFalse(targetType.is(x));
      });

      test('falsy case - non-bigint', () => {
        const x: unknown = 42;

        assert.isFalse(targetType.is(x));
      });
    });

    describe('validate', () => {
      test('truthy case', () => {
        const result = targetType.validate(42n);

        assert.isTrue(Result.isOk(result));

        const resultValue4 = Result.unwrapThrow(result);

        expect(resultValue4).toBe(42n);
      });

      test('falsy case - different bigint', () => {
        const result = targetType.validate(99n);

        assert.isTrue(Result.isErr(result));

        const resultError2 = Result.unwrapErrThrow(result);

        assert.deepStrictEqual(resultError2, [
          {
            path: [],
            actualValue: 99n,
            expectedType: '42n',
            typeName: '42n',
            details: undefined,
          },
        ]);

        assert.deepStrictEqual(validationErrorsToMessages(resultError2), [
          'Error: expected <42n> type but <bigint> type value `99n` was passed.',
        ]);
      });

      test('falsy case - non-bigint', () => {
        const result = targetType.validate('not a bigint');

        assert.isTrue(Result.isErr(result));

        const resultError3 = Result.unwrapErrThrow(result);

        assert.deepStrictEqual(resultError3, [
          {
            path: [],
            actualValue: 'not a bigint',
            expectedType: '42n',
            typeName: '42n',
            details: undefined,
          },
        ]);

        assert.deepStrictEqual(validationErrorsToMessages(resultError3), [
          'Error: expected <42n> type but <string> type value "not a bigint" was passed.',
        ]);
      });

      test('validate returns input as-is for OK cases', () => {
        const input = 42n;

        const result = targetType.validate(input);

        assert.isTrue(Result.isOk(result));

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

        expect(() => targetType.cast(x)).toThrow('Error');
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
        expect(targetType.typeName).toBe('true');
      });

      describe('is', () => {
        test('truthy case - exact literal match', () => {
          const x: unknown = true;

          if (targetType.is(x)) {
            expectType<typeof x, TargetType>('=');
          } else {
            expectType<typeof x, unknown>('=');
          }

          assert.isTrue(targetType.is(x));
        });

        test('falsy case - different boolean', () => {
          const x: unknown = false;

          if (targetType.is(x)) {
            expectType<typeof x, TargetType>('=');
          } else {
            expectType<typeof x, unknown>('=');
          }

          assert.isFalse(targetType.is(x));
        });

        test('falsy case - non-boolean', () => {
          const x: unknown = 'true';

          assert.isFalse(targetType.is(x));
        });
      });

      describe('validate', () => {
        test('truthy case', () => {
          const result = targetType.validate(true);

          assert.isTrue(Result.isOk(result));

          const resultValue6 = Result.unwrapThrow(result);

          expect(resultValue6).toBe(true);
        });

        test('falsy case - different boolean', () => {
          const result = targetType.validate(false);

          assert.isTrue(Result.isErr(result));

          const resultError4 = Result.unwrapErrThrow(result);

          assert.deepStrictEqual(resultError4, [
            {
              path: [],
              actualValue: false,
              expectedType: 'true',
              typeName: 'true',
              details: undefined,
            },
          ]);

          assert.deepStrictEqual(validationErrorsToMessages(resultError4), [
            'Error: expected <true> type but <boolean> type value `false` was passed.',
          ]);
        });

        test('falsy case - non-boolean', () => {
          const result = targetType.validate('not a boolean');

          assert.isTrue(Result.isErr(result));

          const resultError5 = Result.unwrapErrThrow(result);

          assert.deepStrictEqual(resultError5, [
            {
              path: [],
              actualValue: 'not a boolean',
              expectedType: 'true',
              typeName: 'true',
              details: undefined,
            },
          ]);

          assert.deepStrictEqual(validationErrorsToMessages(resultError5), [
            'Error: expected <true> type but <string> type value "not a boolean" was passed.',
          ]);
        });

        test('validate returns input as-is for OK cases', () => {
          const input = true;

          const result = targetType.validate(input);

          assert.isTrue(Result.isOk(result));

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

          expect(() => targetType.cast(x)).toThrow('Error');
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
        expect(targetType.typeName).toBe('false');
      });

      describe('is', () => {
        test('truthy case - exact literal match', () => {
          const x: unknown = false;

          assert.isTrue(targetType.is(x));
        });

        test('falsy case - different boolean', () => {
          const x: unknown = true;

          assert.isFalse(targetType.is(x));
        });
      });

      describe('validate', () => {
        test('truthy case', () => {
          const result = targetType.validate(false);

          assert.isTrue(Result.isOk(result));

          const resultValue8 = Result.unwrapThrow(result);

          expect(resultValue8).toBe(false);
        });

        test('falsy case - different boolean', () => {
          const result = targetType.validate(true);

          assert.isTrue(Result.isErr(result));

          const resultError6 = Result.unwrapErrThrow(result);

          assert.deepStrictEqual(resultError6, [
            {
              path: [],
              actualValue: true,
              expectedType: 'false',
              typeName: 'false',
              details: undefined,
            },
          ]);

          assert.deepStrictEqual(validationErrorsToMessages(resultError6), [
            'Error: expected <false> type but <boolean> type value `true` was passed.',
          ]);
        });

        test('validate returns input as-is for OK cases', () => {
          const input = false;

          const result = targetType.validate(input);

          assert.isTrue(Result.isOk(result));

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

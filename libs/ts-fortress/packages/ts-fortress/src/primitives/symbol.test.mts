import { expectType, Result } from 'ts-data-forge';
import { type TypeOf } from '../type.mjs';
import { validationErrorsToMessages } from '../utils/index.mjs';
import { symbol } from './symbol.mjs';

describe(symbol, () => {
  const defaultSym = Symbol('default');

  const targetType = symbol(defaultSym);

  type TargetType = TypeOf<typeof targetType>;

  expectType<TargetType, symbol>('=');

  expectType<typeof targetType.defaultValue, TargetType>('=');

  describe('is', () => {
    test('truthy case', () => {
      const x: unknown = Symbol('test');

      if (targetType.is(x)) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      assert.isTrue(targetType.is(x));
    });

    test('falsy case', () => {
      const x: unknown = 'not a symbol';

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
      const testSym = Symbol('test');

      const result = targetType.validate(testSym);

      assert.isTrue(Result.isOk(result));

      const resultValue = Result.unwrapThrow(result);

      expect(resultValue).toBe(testSym);
    });

    test('falsy case', () => {
      const result = targetType.validate('not a symbol');

      assert.isTrue(Result.isErr(result));

      const resultError = Result.unwrapErrThrow(result);

      assert.deepStrictEqual(resultError, [
        {
          path: [],
          actualValue: 'not a symbol',
          expectedType: 'symbol',
          typeName: 'symbol',
          details: undefined,
        },
      ]);

      assert.deepStrictEqual(validationErrorsToMessages(resultError), [
        'Error: expected <symbol> type but <string> type value "not a symbol" was passed.',
      ]);
    });

    test('validate returns input as-is for OK cases', () => {
      const input = Symbol('my-symbol');

      const result = targetType.validate(input);

      assert.isTrue(Result.isOk(result));

      const resultValue1 = Result.unwrapThrow(result);

      expect(resultValue1).toBe(input); // ✅ same reference
    });
  });

  describe('assertIs', () => {
    test('truthy case', () => {
      const x: unknown = Symbol('test');

      const assertIs: (a: unknown) => asserts a is symbol = targetType.assertIs;

      expect(() => {
        assertIs(x);
      }).not.toThrow();
    });

    test('falsy case', () => {
      const x: unknown = 'not a symbol';

      const assertIs: (a: unknown) => asserts a is symbol = targetType.assertIs;

      expect(() => {
        assertIs(x);
      }).toThrow('Error');
    });
  });

  describe('cast', () => {
    test('truthy case', () => {
      const testSym = Symbol('test');

      const x: unknown = testSym;

      expect(targetType.cast(x)).toBe(testSym);
    });

    test('falsy case', () => {
      const x: unknown = 'invalid';

      expect(() => targetType.cast(x)).toThrow('Error');
    });
  });

  describe('fill', () => {
    test('noop', () => {
      const testSym = Symbol('test');

      const x: unknown = testSym;

      expect(targetType.fill(x)).toBe(testSym);
    });

    test('fill with the default value', () => {
      const x: unknown = 'not a symbol';

      expect(targetType.fill(x)).toBe(defaultSym);
    });
  });
});

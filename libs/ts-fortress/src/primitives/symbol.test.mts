import { expectType, Result } from 'ts-data-forge';
import { type TypeOf } from '../type.mjs';
import { validationErrorsToMessages } from '../validation-error.mjs';
import { symbol } from './symbol.mjs';

describe('symbol', () => {
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

      expect(targetType.is(x)).toBe(true);
    });

    test('falsy case', () => {
      const x: unknown = 'not a symbol';

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
      const testSym = Symbol('test');
      const result = targetType.validate(testSym);
      expect(Result.isOk(result)).toBe(true);

      if (Result.isOk(result)) {
        expect(result.value).toBe(testSym);
      }
    });

    test('falsy case', () => {
      const result = targetType.validate('not a symbol');
      expect(Result.isErr(result)).toBe(true);

      if (Result.isErr(result)) {
        expect(result.value).toStrictEqual([
          {
            path: [],
            actualValue: 'not a symbol',
            expectedType: 'symbol',
            typeName: 'symbol',
            message: undefined,
          },
        ]);

        expect(validationErrorsToMessages(result.value)).toStrictEqual([
          'Expected symbol, got string',
        ]);
      }
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
      }).toThrow('Expected');
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

      expect(() => targetType.cast(x)).toThrow('Expected');
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

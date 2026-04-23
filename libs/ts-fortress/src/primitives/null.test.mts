import { expectType, Result } from 'ts-data-forge';
import { type TypeOf } from '../type.mjs';
import { nullType } from './null.mjs';

describe('null type', () => {
  type Null = TypeOf<typeof nullType>;

  expectType<Null, null>('=');

  expectType<typeof nullType.defaultValue, Null>('=');

  describe('default value', () => {
    test('is null', () => {
      expect(nullType.defaultValue).toBeNull();
    });
  });

  describe('is', () => {
    test('null returns true', () => {
      const value: unknown = null;

      if (nullType.is(value)) {
        expectType<typeof value, Null>('=');
      } else {
        expectType<typeof value, {} | undefined>('=');
      }

      assert.isTrue(nullType.is(value));
    });

    test('undefined returns false', () => {
      const value: unknown = undefined;

      if (nullType.is(value)) {
        expectType<typeof value, Null>('=');
      } else {
        expectType<typeof value, {} | undefined>('=');
      }

      assert.isFalse(nullType.is(value));
    });

    test.each([0, '', false, Number.NaN, {}, [], 'null', 42, true])(
      'nullType.is($0) should be false',
      (v: unknown) => {
        if (nullType.is(v)) {
          expectType<typeof v, Null>('=');
        } else {
          expectType<typeof v, {} | undefined>('=');
        }

        assert.isFalse(nullType.is(v));
      },
    );
  });

  describe('assertIs', () => {
    test('null does not throw', () => {
      const value: unknown = null;

      expect(() => {
        nullType.assertIs(value);
      }).not.toThrow();
    });

    test('non-null throws', () => {
      const value: unknown = undefined;

      expect(() => {
        nullType.assertIs(value);
      }).toThrow(
        'Error: expected <null> type but <undefined> type value `undefined` was passed.',
      );
    });
  });

  describe('cast', () => {
    test('null returns null', () => {
      const value: unknown = null;

      const result = nullType.cast(value);

      expect(result).toBeNull();
    });

    test('non-null throws error', () => {
      const value: unknown = undefined;

      expect(() => nullType.cast(value)).toThrow(
        'Error: expected <null> type but <undefined> type value `undefined` was passed.',
      );
    });

    test.each([0, '', false, undefined, 42, 'hello'])(
      'nullType.cast($0) should throw error',
      (value) => {
        expect(() => nullType.cast(value)).toThrow(
          /Error: expected <null> type but <(number|string|boolean|undefined)> type value/u,
        );
      },
    );
  });

  describe('fill', () => {
    test('null returns null', () => {
      const value: unknown = null;

      const result = nullType.fill(value);

      expect(result).toBeNull();
    });

    test('undefined returns default (null)', () => {
      const value: unknown = undefined;

      const result = nullType.fill(value);

      expect(result).toBeNull();
    });

    test.each([0, '', false, 42, 'hello', {}])(
      'nullType.fill($0) should be default (null)',
      (value) => {
        const result = nullType.fill(value);

        expect(result).toBeNull();
      },
    );
  });

  describe('validate', () => {
    test('null is valid', () => {
      const value: unknown = null;

      const result = nullType.validate(value);

      assert.isTrue(Result.isOk(result));

      const resultValue = Result.unwrapThrow(result);

      expect(resultValue).toBeNull();
    });

    test('undefined is invalid', () => {
      const value: unknown = undefined;

      const result = nullType.validate(value);

      assert.isTrue(Result.isErr(result));

      const resultError = Result.unwrapErrThrow(result);

      assert.deepStrictEqual(resultError, [
        {
          path: [],
          actualValue: undefined,
          expectedType: 'null',
          typeName: 'null',
          details: undefined,
        },
      ]);
    });

    test('other values are invalid', () => {
      const value: unknown = 0;

      const result = nullType.validate(value);

      assert.isTrue(Result.isErr(result));

      const resultError1 = Result.unwrapErrThrow(result);

      assert.deepStrictEqual(resultError1, [
        {
          path: [],
          actualValue: 0,
          expectedType: 'null',
          typeName: 'null',
          details: undefined,
        },
      ]);
    });

    test('validate returns input as-is for OK cases', () => {
      const input = null;

      const result = nullType.validate(input);

      assert.isTrue(Result.isOk(result));

      const resultValue1 = Result.unwrapThrow(result);

      expect(resultValue1).toBe(input); // ✅ same reference
    });
  });
});

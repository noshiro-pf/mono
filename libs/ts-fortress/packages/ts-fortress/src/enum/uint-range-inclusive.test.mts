import { expectType, Result } from 'ts-data-forge';
import { type TypeOf } from '../type.mjs';
import {
  type ValidationError,
  validationErrorsToMessages,
} from '../utils/index.mjs';
import { uintRangeInclusive } from './uint-range-inclusive.mjs';

describe(uintRangeInclusive, () => {
  const month = uintRangeInclusive(1, 12, {
    defaultValue: 1,
    typeName: 'month',
  });

  type Month = TypeOf<typeof month>;

  expectType<Month, 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12>('=');

  expectType<typeof month.defaultValue, Month>('=');

  describe('object argument form', () => {
    test('accepts start and end as options', () => {
      const monthByObject = uintRangeInclusive({
        start: 1,
        end: 12,
        defaultValue: 1,
        typeName: 'month',
      });

      expectType<TypeOf<typeof monthByObject>, Month>('=');

      assert.isTrue(monthByObject.is(12));

      assert.isFalse(monthByObject.is(13));
    });
  });

  describe('is', () => {
    test('truthy case', () => {
      const x: number = Math.random() >= 0 ? 12 : 0; // the value is always 12

      if (month.is(x)) {
        expectType<typeof x, Month>('=');
      } else {
        expectType<typeof x, number>('=');
      }

      assert.isTrue(month.is(x)); // end is inclusive
    });

    test('falsy case', () => {
      const x: number = Math.random() >= 0 ? 13 : 0; // the value is always 13

      if (month.is(x)) {
        expectType<typeof x, Month>('=');
      } else {
        expectType<typeof x, number>('=');
      }

      assert.isFalse(month.is(x));
    });

    test('not an integer', () => {
      assert.isFalse(month.is(1.5));
    });
  });

  describe('single value range', () => {
    test('start equal to end', () => {
      const one = uintRangeInclusive(1, 1);

      expectType<TypeOf<typeof one>, 1>('=');

      assert.isTrue(one.is(1));

      assert.isFalse(one.is(0));

      assert.isFalse(one.is(2));
    });
  });

  describe('validate', () => {
    test('truthy case', () => {
      const result = month.validate(5);

      expectType<typeof result, Result<Month, readonly ValidationError[]>>('=');

      assert.isTrue(Result.isOk(result));

      const resultValue = Result.unwrapThrow(result);

      expect(resultValue).toBe(5);
    });

    test('validate returns input as-is for OK cases', () => {
      const input = 5;

      const result = month.validate(input);

      assert.isTrue(Result.isOk(result));

      const resultValue1 = Result.unwrapThrow(result);

      expect(resultValue1).toBe(input); // ✅ same reference
    });

    test('falsy case', () => {
      const result = month.validate(13);

      assert.isTrue(Result.isErr(result));

      const resultError = Result.unwrapErrThrow(result);

      assert.deepStrictEqual(resultError[0], {
        path: [],
        actualValue: 13,
        expectedType: 'month',
        typeName: 'month',
        details: {
          kind: 'integer-range-inclusive',
          start: 1,
          endInclusive: 12,
        },
      });

      assert.deepStrictEqual(validationErrorsToMessages(resultError), [
        'Error: expected an integer between 1 and 12 but `13` was passed.',
      ]);
    });
  });

  describe('typeName', () => {
    test('default type name', () => {
      const rng = uintRangeInclusive(3, 7);

      expect(rng.typeName).toBe('uintRangeInclusive(3, 7)');
    });
  });

  describe('fill', () => {
    test('noop', () => {
      const x: number = (() => 5)();

      expect(month.fill(x)).toBe(5);
    });

    test('fill with the default value', () => {
      const x: number = (() => 123)();

      expect(month.fill(x)).toBe(1);
    });

    test('fill with start when defaultValue is omitted', () => {
      const rng = uintRangeInclusive(3, 7);

      expect(rng.fill(99)).toBe(3);
    });
  });
});

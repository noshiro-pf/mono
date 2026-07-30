import { expectType, Result } from 'ts-data-forge';
import { type TypeOf } from '../type.mjs';
import { validationErrorsToMessages } from '../utils/index.mjs';
import { intRangeInclusive } from './int-range-inclusive.mjs';

describe(intRangeInclusive, () => {
  const rng = intRangeInclusive(-2, 2, {
    defaultValue: -2,
    typeName: 'rng',
  });

  type Rng = TypeOf<typeof rng>;

  expectType<Rng, -2 | -1 | 0 | 1 | 2>('=');

  expectType<typeof rng.defaultValue, Rng>('=');

  describe('object argument form', () => {
    test('accepts start and end as options', () => {
      const rngByObject = intRangeInclusive({
        start: -2,
        end: 2,
        defaultValue: -2,
        typeName: 'rng',
      });

      expectType<TypeOf<typeof rngByObject>, Rng>('=');

      assert.isTrue(rngByObject.is(2));

      assert.isFalse(rngByObject.is(3));
    });
  });

  describe('is', () => {
    test('valid cases', () => {
      assert.isTrue(rng.is(-2));

      assert.isTrue(rng.is(0));

      assert.isTrue(rng.is(2)); // end is inclusive
    });

    test('invalid cases', () => {
      assert.isFalse(rng.is(-3));

      assert.isFalse(rng.is(3));

      assert.isFalse(rng.is(1.5)); // not integer
    });
  });

  describe('validate', () => {
    test('ok', () => {
      const result = rng.validate(1);

      assert.isTrue(Result.isOk(result));

      const resultValue = Result.unwrapThrow(result);

      expect(resultValue).toBe(1);
    });

    test('error shape and message', () => {
      const result = rng.validate(3);

      assert.isTrue(Result.isErr(result));

      const resultError = Result.unwrapErrThrow(result);

      assert.deepStrictEqual(resultError[0], {
        path: [],
        actualValue: 3,
        expectedType: 'rng',
        typeName: 'rng',
        details: {
          kind: 'integer-range-inclusive',
          start: -2,
          endInclusive: 2,
        },
      });

      assert.deepStrictEqual(validationErrorsToMessages(resultError), [
        'Error: expected an integer between -2 and 2 but `3` was passed.',
      ]);
    });
  });

  describe('typeName', () => {
    test('default type name', () => {
      const rng2 = intRangeInclusive(-3, 3);

      expect(rng2.typeName).toBe('intRangeInclusive(-3, 3)');
    });
  });

  describe('fill', () => {
    test('returns default for invalid input', () => {
      expect(rng.fill(99)).toBe(-2);
    });

    test('returns input for valid input', () => {
      expect(rng.fill(0)).toBe(0);
    });

    test('fill with start when defaultValue is omitted', () => {
      const rng2 = intRangeInclusive(-3, 3);

      expect(rng2.fill(99)).toBe(-3);
    });
  });
});

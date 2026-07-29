import { expectType, Result } from 'ts-data-forge';
import { type TypeOf } from '../type.mjs';
import { validationErrorsToMessages } from '../utils/index.mjs';
import { intRange } from './int-range.mjs';

describe(intRange, () => {
  const rng = intRange({
    start: -2,
    end: 3,
    defaultValue: -2,
    typeName: 'rng',
  });

  type Rng = TypeOf<typeof rng>;

  expectType<Rng, -2 | -1 | 0 | 1 | 2>('=');

  expectType<typeof rng.defaultValue, Rng>('=');

  describe('is', () => {
    test('valid cases', () => {
      assert.isTrue(rng.is(-2));

      assert.isTrue(rng.is(0));

      assert.isTrue(rng.is(2));
    });

    test('invalid cases', () => {
      assert.isFalse(rng.is(-3));

      assert.isFalse(rng.is(3)); // end is exclusive

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
          kind: 'integer-range',
          start: -2,
          endExclusive: 3,
        },
      });

      assert.deepStrictEqual(validationErrorsToMessages(resultError), [
        'Error: expected an integer between -2 and 2 but `3` was passed.',
      ]);
    });
  });

  describe('fill', () => {
    test('returns default for invalid input', () => {
      expect(rng.fill(99)).toBe(-2);
    });

    test('returns input for valid input', () => {
      expect(rng.fill(0)).toBe(0);
    });
  });
});

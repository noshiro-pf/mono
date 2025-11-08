import { expectType, Result } from 'ts-data-forge';
import { type TypeOf } from '../type.mjs';
import {
  type ValidationError,
  validationErrorsToMessages,
} from '../utils/index.mjs';
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
      expect(rng.is(-2)).toBe(true);
      expect(rng.is(0)).toBe(true);
      expect(rng.is(2)).toBe(true);
    });

    test('invalid cases', () => {
      expect(rng.is(-3)).toBe(false);
      expect(rng.is(3)).toBe(false); // end is exclusive
      expect(rng.is(1.5)).toBe(false); // not integer
    });
  });

  describe('validate', () => {
    test('ok', () => {
      const result = rng.validate(1);

      expect(Result.isOk(result)).toBe(true);

      const resultValue = Result.unwrapThrow(result);

      expect(resultValue).toBe(1);
    });

    test('error shape and message', () => {
      const result = rng.validate(3);

      expect(Result.isErr(result)).toBe(true);

      const resultError = Result.unwrapErrThrow(result);

      expect(resultError[0]).toStrictEqual<ValidationError>({
        path: [],
        actualValue: 3,
        expectedType: 'rng',
        message: 'The value is expected to be an integer between -2 and 2',
        typeName: 'rng',
      });
      expect(validationErrorsToMessages(resultError)).toStrictEqual([
        'The value is expected to be an integer between -2 and 2',
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

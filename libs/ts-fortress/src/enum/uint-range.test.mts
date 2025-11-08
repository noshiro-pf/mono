import { expectType, Result } from 'ts-data-forge';
import { type TypeOf } from '../type.mjs';
import {
  type ValidationError,
  validationErrorsToMessages,
} from '../utils/index.mjs';
import { uintRange } from './uint-range.mjs';

describe(uintRange, () => {
  const month = uintRange({
    start: 1,
    end: 13,
    defaultValue: 1,
    typeName: 'month',
  });

  type Month = TypeOf<typeof month>;

  expectType<Month, 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12>('=');

  expectType<typeof month.defaultValue, Month>('=');

  describe('is', () => {
    test('truthy case', () => {
      const x: number = Math.random() >= 0 ? 1 : 0; // the value is always 1

      if (month.is(x)) {
        expectType<typeof x, Month>('=');
      } else {
        expectType<typeof x, number>('=');
      }

      expect(month.is(x)).toBe(true);
    });

    test('falsy case', () => {
      const x: number = Math.random() >= 0 ? 13 : 0; // the value is always 13

      if (month.is(x)) {
        expectType<typeof x, Month>('=');
      } else {
        expectType<typeof x, number>('=');
      }

      expect(month.is(x)).toBe(false);
    });
  });

  describe('validate', () => {
    test('truthy case', () => {
      const result = month.validate(5);
      expectType<typeof result, Result<Month, readonly ValidationError[]>>('=');

      expect(Result.isOk(result)).toBe(true);

      const resultValue = Result.unwrapThrow(result);

      expect(resultValue).toBe(5);
    });

    test('validate returns input as-is for OK cases', () => {
      const input = 5;
      const result = month.validate(input);

      expect(Result.isOk(result)).toBe(true);

      const resultValue1 = Result.unwrapThrow(result);

      expect(resultValue1).toBe(input); // ✅ same reference
    });

    test('falsy case', () => {
      const result = month.validate(13);

      expect(Result.isErr(result)).toBe(true);

      const resultError = Result.unwrapErrThrow(result);

      expect(resultError[0]).toStrictEqual({
        path: [],
        actualValue: 13,
        expectedType: 'month',
        typeName: 'month',
        message: 'The value is expected to be an integer between 1 and 12',
      });
      expect(validationErrorsToMessages(resultError)).toStrictEqual([
        'The value is expected to be an integer between 1 and 12',
      ]);
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
  });
});

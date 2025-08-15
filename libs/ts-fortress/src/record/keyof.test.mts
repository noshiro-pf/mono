import { expectType, Result } from 'ts-data-forge';
import { number } from '../primitives/index.mjs';
import { type Type, type TypeOf } from '../type.mjs';
import { validationErrorsToMessages } from '../utils/index.mjs';
import { keyof } from './keyof.mjs';
import { record } from './record.mjs';

describe('keyof', () => {
  const ymdKey = keyof(
    record({
      year: number(1900),
      month: number(1),
      date: number(1),
    }),
  );

  expectType<typeof ymdKey, Type<'year' | 'month' | 'date'>>('=');

  type Ymd = TypeOf<typeof ymdKey>;

  expectType<Ymd, 'year' | 'month' | 'date'>('=');

  expectType<typeof ymdKey.defaultValue, Ymd>('=');

  describe('is', () => {
    test('truthy case', () => {
      const x: unknown = 'year';

      if (ymdKey.is(x)) {
        expectType<typeof x, 'year' | 'month' | 'date'>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      expect(ymdKey.is(x)).toBe(true);
    });

    test('falsy case', () => {
      const x: unknown = 'minutes';

      if (ymdKey.is(x)) {
        expectType<typeof x, 'year' | 'month' | 'date'>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      expect(ymdKey.is(x)).toBe(false);
    });
  });

  describe('validate', () => {
    test('truthy case', () => {
      const x: unknown = 'year';

      const result = ymdKey.validate(x);
      expect(Result.isOk(result)).toBe(true);

      if (Result.isOk(result)) {
        expectType<typeof result.value, Ymd>('=');
        expect(result.value).toBe('year');
      }
    });

    test('falsy case', () => {
      const x: unknown = 'minutes';

      const result = ymdKey.validate(x);
      expect(Result.isErr(result)).toBe(true);

      if (Result.isErr(result)) {
        expect(result.value).toStrictEqual([
          {
            path: [],
            actualValue: 'minutes',
            expectedType: 'keyof { year: number, month: number, date: number }',
            typeName: 'keyof { year: number, month: number, date: number }',
            message:
              'The value is expected to be one of the elements contained in { year, month, date }',
          },
        ]);
        expect(validationErrorsToMessages(result.value)).toStrictEqual([
          'The value is expected to be one of the elements contained in { year, month, date }',
        ]);
      }
    });
  });

  describe('fill', () => {
    test('from external value', () => {
      const x: unknown = 'minutes';

      expect(ymdKey.fill(x)).toBe('year');
    });

    test('from key', () => {
      const x = 'month';

      expect(ymdKey.fill(x)).toBe('month');
    });
  });
});

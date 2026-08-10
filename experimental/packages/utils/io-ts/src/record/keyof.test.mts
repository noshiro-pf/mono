import { expectType } from '@noshiro/ts-utils';
import { number } from '../primitives/index.mjs';
import { type Type, type TypeOf } from '../type.mjs';
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
    test('falsy case', () => {
      const x: unknown = 'minutes';

      expect(ymdKey.validate(x).value).toStrictEqual([
        `The value is expected to be one of the elements contained in { year, month, date }, but it is actually '"minutes"'.`,
      ]);
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

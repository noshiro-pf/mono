import { assertType } from '@noshiro/ts-utils';
import type { TypeOf } from '../type';
import { uintRange } from './uint-range';

describe('uintRange', () => {
  const month = uintRange({
    min: 1,
    max: 12,
    defaultValue: 1,
    typeName: 'month',
  });

  type Month = TypeOf<typeof month>;

  assertType<TypeEq<Month, 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12>>();

  assertType<TypeEq<typeof month.defaultValue, Month>>();

  describe('is', () => {
    test('truthy case', () => {
      const x: number = Math.random() >= 0 ? 1 : 0; // the value is always 1

      if (month.is(x)) {
        assertType<TypeEq<typeof x, Month>>();
      } else {
        assertType<TypeEq<typeof x, number>>();
      }

      expect(month.is(x)).toBe(true);
    });

    test('falsy case', () => {
      const x: number = Math.random() >= 0 ? 13 : 0; // the value is always 13

      if (month.is(x)) {
        assertType<TypeEq<typeof x, Month>>();
      } else {
        assertType<TypeEq<typeof x, number>>();
      }

      expect(month.is(x)).toBe(false);
    });
  });

  describe('validate', () => {
    test('falsy case', () => {
      expect(month.validate(13).value).toStrictEqual([
        "The value is expected to be an integer between 1 and 12, but it is actually '13'.",
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

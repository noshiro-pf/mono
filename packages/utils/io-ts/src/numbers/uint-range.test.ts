import { assertType } from '@noshiro/ts-utils';
import type { Typeof } from '../type';
import { uintRange } from './uint-range';

describe('uintRange', () => {
  const month = uintRange(1, 12, 1);

  type Month = Typeof<typeof month>;

  type D = typeof month.defaultValue;

  assertType<TypeEq<Month, 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12>>();

  assertType<TypeEq<D, 1>>();

  describe('validate', () => {
    test('truthy case', () => {
      const x: number = Math.random() >= 0 ? 1 : 0; // the value is always 1

      if (month.is(x)) {
        assertType<
          TypeEq<typeof x, 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12>
        >();
      } else {
        assertType<TypeEq<typeof x, number>>();
      }

      expect(month.is(x)).toBe(true);
    });

    test('falsy case', () => {
      const x: number = Math.random() >= 0 ? 13 : 0; // the value is always 13

      if (month.is(x)) {
        assertType<
          TypeEq<typeof x, 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12>
        >();
      } else {
        assertType<TypeEq<typeof x, number>>();
      }

      expect(month.is(x)).toBe(false);
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

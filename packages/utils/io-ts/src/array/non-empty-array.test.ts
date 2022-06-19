import { assertType } from '@noshiro/ts-utils';
import { number } from '../primitives';
import type { Typeof } from '../type';
import { nonEmptyArray } from './non-empty-array';

describe('nonEmptyArray', () => {
  const xs = nonEmptyArray({ elementType: number(0), defaultValue: [1] });

  type Xs = Typeof<typeof xs>;

  type D = typeof xs.defaultValue;

  assertType<TypeEq<Xs, NonEmptyArray<number>>>();

  assertType<TypeEq<D, NonEmptyArray<number>>>();

  describe('validate', () => {
    test('truthy case', () => {
      const ys: unknown = [1, 2, 3];

      if (xs.is(ys)) {
        assertType<TypeEq<typeof ys, NonEmptyArray<number>>>();
      } else {
        assertType<TypeEq<typeof ys, unknown>>();
      }

      expect(xs.is(ys)).toBe(true);
    });

    test('falsy case', () => {
      const ys: unknown = ['1', '', 3];

      if (xs.is(ys)) {
        assertType<TypeEq<typeof ys, NonEmptyArray<number>>>();
      } else {
        assertType<TypeEq<typeof ys, unknown>>();
      }

      expect(xs.is(ys)).toBe(false);
    });
  });

  describe('fill', () => {
    test('noop', () => {
      const ys: unknown = [1, 2, 3];

      expect(xs.fill(ys)).toStrictEqual([1, 2, 3]);
    });

    test('fill with the default value', () => {
      const ys: unknown = ['1', '', 3];

      expect(xs.fill(ys)).toStrictEqual([0, 0, 3]);
    });

    test('fill empty array', () => {
      const ys: unknown = [];

      expect(xs.fill(ys)).toStrictEqual([1]);
    });
  });
});

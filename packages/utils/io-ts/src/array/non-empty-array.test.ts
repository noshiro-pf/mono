import { assertType } from '@noshiro/ts-utils';
import { number } from '../primitives';
import type { TypeOf } from '../type';
import { nonEmptyArray } from './non-empty-array';

describe('nonEmptyArray', () => {
  const xs = nonEmptyArray({
    typeName: 'xs',
    elementType: number(0),
    defaultValue: [1],
  });

  type Xs = TypeOf<typeof xs>;

  assertType<TypeEq<Xs, NonEmptyArray<number>>>();

  assertType<TypeEq<typeof xs.defaultValue, Xs>>();

  describe('is', () => {
    test('truthy case', () => {
      const ys: unknown = [1, 2, 3];

      if (xs.is(ys)) {
        assertType<TypeEq<typeof ys, Xs>>();
      } else {
        assertType<TypeEq<typeof ys, unknown>>();
      }

      expect(xs.is(ys)).toBe(true);
    });

    test('falsy case 1', () => {
      const ys: unknown = [];

      if (xs.is(ys)) {
        assertType<TypeEq<typeof ys, Xs>>();
      } else {
        assertType<TypeEq<typeof ys, unknown>>();
      }

      expect(xs.is(ys)).toBe(false);
    });

    test('falsy case 2', () => {
      const ys: unknown = ['1', '', 3];

      if (xs.is(ys)) {
        assertType<TypeEq<typeof ys, Xs>>();
      } else {
        assertType<TypeEq<typeof ys, unknown>>();
      }

      expect(xs.is(ys)).toBe(false);
    });
  });

  describe('validate', () => {
    test('falsy case 1', () => {
      const ys: unknown = [];

      expect(xs.validate(ys).value).toStrictEqual([
        'The value is expected to be a non-empty array, but it is empty.',
      ]);
    });

    test('falsy case 2', () => {
      const ys: unknown = ['1', '', 3];

      expect(xs.validate(ys).value).toStrictEqual([
        `The array element is expected to be <number>, but the actual value at index 0 is '"1"'.`,
        `The value is expected to be <number>, but it is actually '"1"'.`,
      ]);
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

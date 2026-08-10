import { expectType } from '@noshiro/ts-utils';
import { number } from '../primitives/index.mjs';
import { type TypeOf } from '../type.mjs';
import { nonEmptyArray } from './non-empty-array.mjs';

describe('nonEmptyArray', () => {
  describe('arg patterns', () => {
    test('without explicit default value', () => {
      expect(nonEmptyArray(number()).defaultValue).toStrictEqual([0]);
    });

    test('with explicit default value, case 1', () => {
      expect(nonEmptyArray(number(1)).defaultValue).toStrictEqual([1]);
    });

    test('with explicit default value, case 2', () => {
      expect(
        nonEmptyArray(number(0), {
          typeName: 'xs',
          defaultValue: [2],
        }).defaultValue,
      ).toStrictEqual([2]);
    });
  });

  const xs = nonEmptyArray(number(0), {
    defaultValue: [1],
    typeName: 'xs',
  });

  type Xs = TypeOf<typeof xs>;

  expectType<Xs, NonEmptyArray<number>>('=');

  expectType<typeof xs.defaultValue, Xs>('=');

  describe('is', () => {
    test('truthy case', () => {
      const ys: unknown = [1, 2, 3];

      if (xs.is(ys)) {
        expectType<typeof ys, Xs>('=');
      } else {
        expectType<typeof ys, unknown>('=');
      }

      expect(xs.is(ys)).toBe(true);
    });

    test('falsy case 1', () => {
      const ys: unknown = [];

      if (xs.is(ys)) {
        expectType<typeof ys, Xs>('=');
      } else {
        expectType<typeof ys, unknown>('=');
      }

      expect(xs.is(ys)).toBe(false);
    });

    test('falsy case 2', () => {
      const ys: unknown = ['1', '', 3];

      if (xs.is(ys)) {
        expectType<typeof ys, Xs>('=');
      } else {
        expectType<typeof ys, unknown>('=');
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

import { expectType } from '@noshiro/ts-utils';
import { describe, expect, test } from 'vitest';
import { number } from '../primitives/index.mjs';
import { type TypeOf } from '../type.mjs';
import { arrayOfLength } from './array-of-length.mjs';

describe('arrayOfLength', () => {
  const xs = arrayOfLength(4, number(0), {
    typeName: 'xs',
    defaultValue: [1, 2, 3, 4],
  });

  type Xs = TypeOf<typeof xs>;

  expectType<Xs, ArrayOfLength<4, number>>('=');

  expectType<typeof xs.defaultValue, Xs>('=');

  describe('is', () => {
    test('truthy case', () => {
      const ys: unknown = [5, 6, 7, 8];

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
        'The value is expected to be an array of length 4, but it is 0.',
      ]);
    });

    test('falsy case 2', () => {
      const ys: unknown = [0, '1', '', 3];

      expect(xs.validate(ys).value).toStrictEqual([
        `The array element is expected to be <number>, but the actual value at index 1 is '"1"'.`,
        `The value is expected to be <number>, but it is actually '"1"'.`,
      ]);
    });
  });

  describe('fill', () => {
    test('noop', () => {
      const ys: unknown = [1, 2, 3];

      expect(xs.fill(ys)).toStrictEqual([1, 2, 3, 0]);
    });

    test('fill with the default value', () => {
      const ys: unknown = ['1', '', 3];

      expect(xs.fill(ys)).toStrictEqual([0, 0, 3, 0]);
    });

    test('fill empty array', () => {
      const ys: unknown = [];

      expect(xs.fill(ys)).toStrictEqual([0, 0, 0, 0]);
    });
  });
});

import { expectType } from '@noshiro/ts-utils';
import { number } from '../primitives';
import { type TypeOf } from '../type';
import { array } from './array';

describe('array', () => {
  const xs = array(number(0), {
    typeName: 'xs',
    defaultValue: [],
  });

  type Xs = TypeOf<typeof xs>;

  expectType<Xs, readonly number[]>('=');

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

    test('falsy case', () => {
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
    test('falsy case', () => {
      const ys: unknown = ['1', '', 3];

      expect(xs.is(ys)).toBe(false);
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
  });
});

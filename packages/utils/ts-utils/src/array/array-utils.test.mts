import { expectType } from '../expect-type.mjs';
import { Arr } from './array-utils.mjs';

describe('ArrayUtils', () => {
  describe('isEmpty', () => {
    const xs = [1, 2, 3] as const;
    const result = Arr.isEmpty(xs);

    expectType<typeof result, boolean>('=');

    test('case 1', () => {
      expect(result).toBe(false);
    });

    test('case 2', () => {
      expect(Arr.isEmpty([])).toBe(true);
    });
  });

  describe('isNonEmpty', () => {
    const xs = [1, 2, 3] as const;
    const result = Arr.isNonEmpty(xs);

    expectType<typeof result, boolean>('=');

    test('case 1', () => {
      expect(result).toBe(true);
    });

    test('case 2', () => {
      expect(Arr.isNonEmpty([])).toBe(false);
    });
  });

  describe('flatMap', () => {
    const xs = [1, 2, 3] as const;
    const mapped = Arr.flatMap(xs, (x, i) => [i, x * x]);

    expectType<typeof mapped, readonly number[]>('=');

    test('case 1', () => {
      expect(mapped).toStrictEqual([0, 1, 1, 4, 2, 9]);
    });
  });

  describe('filterNot', () => {
    const xs = [1, 2, 3] as const;
    const filtered = Arr.filterNot(xs, (x) => x % 2 === 0);

    expectType<typeof filtered, readonly (1 | 2 | 3)[]>('=');

    test('case 1', () => {
      expect(filtered).toStrictEqual([1, 3]);
    });
  });

  describe('concat', () => {
    const xs = [1, 2, 3] as const;
    const ys = [4, 5] as const;
    const result = Arr.concat(xs, ys);

    expectType<typeof result, readonly [1, 2, 3, 4, 5]>('=');

    test('case 1', () => {
      expect(result).toStrictEqual([1, 2, 3, 4, 5]);
    });

    // testArrayEquality({
    //   testName: 'concat 2 arrays',
    //   target: concat([1, 2, 3], [4, 5, 6]),
    //   toBe: [1, 2, 3, 4, 5, 6],
    // });

    // testArrayEquality({
    //   testName: 'concat 2 arrays',
    //   target: concat([1, 2, 3], []),
    //   toBe: [1, 2, 3],
    // });

    // testArrayEquality({
    //   testName: 'concat 2 arrays',
    //   target: concat([], [4, 5, 6]),
    //   toBe: [4, 5, 6],
    // });

    // testArrayEquality({
    //   testName: 'concat 2 arrays',
    //   target: concat([], []),
    //   toBe: [],
    // });

    // testArrayEquality({
    //   testName: 'concat 2 arrays',
    //   target: concat(['1', '2', '3'], [4, 5, 6]),
    //   toBe: ['1', '2', '3', 4, 5, 6],
    // });
  });

  describe('copy', () => {
    const xs = [1, 2, 3] as const;
    const result = Arr.copy(xs);

    expectType<typeof result, readonly [1, 2, 3]>('=');

    test('case 1', () => {
      expect(result).toStrictEqual([1, 2, 3]);
    });
  });

  describe('range', () => {
    test('range(1, 3)', () => {
      const result = Arr.range(1, 3);

      expectType<typeof result, readonly [1, 2]>('=');

      expect(result).toStrictEqual([1, 2]);
    });

    test('range(1, 3, 1)', () => {
      const result = Arr.range(1, 3, 1);

      expectType<typeof result, readonly [1, 2]>('=');

      expect(result).toStrictEqual([1, 2]);
    });

    test('range(0, 0)', () => {
      const result = Arr.range(0, 0);

      expectType<typeof result, readonly []>('=');

      expect(result).toStrictEqual([]);
    });

    test('range(0, 1)', () => {
      const result = Arr.range(0, 1);

      expectType<typeof result, readonly [0]>('=');

      expect(result).toStrictEqual([0]);
    });

    test('range(0, -1)', () => {
      const result = Arr.range(0, -1);

      expectType<typeof result, readonly SafeInt[]>('=');

      expect(result).toStrictEqual([]);
    });

    test('range(SmallUint, SmallUint)', () => {
      const result = Arr.range<SmallUint, SmallUint>(0, 1);

      expectType<typeof result, readonly Exclude<SmallUint, 511>[]>('=');

      expect(result).toStrictEqual([0]);
    });

    test('range(0 | 1 | 2, 1 | 2 | 3)', () => {
      const result = Arr.range<0 | 1 | 2, 1 | 2 | 3>(0, 1);

      expectType<typeof result, readonly (0 | 1 | 2)[]>('=');

      expect(result).toStrictEqual([0]);
    });

    test('range(2|3, 5|6|7)', () => {
      const result = Arr.range<2 | 3, 5 | 6 | 7>(2, 5);

      expectType<typeof result, readonly (2 | 3 | 4 | 5 | 6)[]>('=');

      expect(result).toStrictEqual([2, 3, 4]);
    });

    test('range(0, 10, 2)', () => {
      const result = Arr.range(0, 10, 2);

      expectType<typeof result, readonly SafeUint[]>('=');

      expect(result).toStrictEqual([0, 2, 4, 6, 8]);
    });

    test('range(0, 11, 2)', () => {
      const result = Arr.range(0, 11, 2);

      expectType<typeof result, readonly SafeUint[]>('=');

      expect(result).toStrictEqual([0, 2, 4, 6, 8, 10]);
    });

    test('range(1, 12, 2)', () => {
      const result = Arr.range(1, 12, 2);

      expectType<typeof result, readonly SafeUint[]>('=');

      expect(result).toStrictEqual([1, 3, 5, 7, 9, 11]);
    });
  });
});

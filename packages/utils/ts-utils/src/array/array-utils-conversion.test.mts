import { IMap } from '../collections/index.mjs';
import { expectType } from '../expect-type.mjs';
import { Arr } from './array-utils.mjs';

describe('ArrayUtils', () => {
  describe('partition', () => {
    const xs = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

    {
      const result = Arr.partition(xs, 4);

      expectType<
        typeof result,
        readonly ArrayOfLength<
          4,
          1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
        >[]
      >('=');

      test('case 1', () => {
        expect(result).toStrictEqual([
          [1, 2, 3, 4],
          [5, 6, 7, 8],
          [9, 10, 11, 12],
        ]);
      });
    }

    {
      const result = Arr.partition(xs, 3);

      expectType<
        typeof result,
        readonly ArrayOfLength<
          3,
          1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
        >[]
      >('=');

      test('case 2', () => {
        expect(result).toStrictEqual([
          [1, 2, 3],
          [4, 5, 6],
          [7, 8, 9],
          [10, 11, 12],
        ]);
      });
    }
  });

  describe('reversed', () => {
    {
      const xs = [1, 2, 3] as const;
      const result = xs.toReversed();

      expectType<typeof result, readonly (1 | 2 | 3)[]>('=');

      test('case 1', () => {
        expect(result).toStrictEqual([3, 2, 1]);
      });
    }
  });

  describe('sorted', () => {
    {
      const xs = [2, 1, 3] as const;
      const result = xs.toSorted();

      expectType<typeof result, readonly (1 | 2 | 3)[]>('=');

      test('case 1', () => {
        expect(result).toStrictEqual([1, 2, 3]);
      });
    }
    {
      const xs = [2, 1, 3] as const;
      const result = xs.toSorted((a, b) => a - b);

      expectType<typeof result, readonly (1 | 2 | 3)[]>('=');

      test('case 2', () => {
        expect(result).toStrictEqual([1, 2, 3]);
      });
    }
    {
      const xs = [2, 1, 3] as const;
      const result = xs.toSorted((a, b) => b - a);

      expectType<typeof result, readonly (1 | 2 | 3)[]>('=');

      test('case 3', () => {
        expect(result).toStrictEqual([3, 2, 1]);
      });
    }
  });

  describe('sortedBy', () => {
    {
      const xs = [{ v: 2 }, { v: 1 }, { v: 3 }] as const;
      const sorted = Arr.sortedBy(xs, (x) => x.v);

      expectType<
        typeof sorted,
        readonly (
          | Readonly<{ v: 1 }>
          | Readonly<{ v: 2 }>
          | Readonly<{ v: 3 }>
        )[]
      >('=');

      test('case 1', () => {
        expect(sorted).toStrictEqual([{ v: 1 }, { v: 2 }, { v: 3 }]);
      });
    }
    {
      const xs = [{ v: 2 }, { v: 1 }, { v: 3 }] as const;
      const sorted = Arr.sortedBy(
        xs,
        (x) => x.v,
        (a, b) => a - b,
      );

      expectType<
        typeof sorted,
        readonly (
          | Readonly<{ v: 1 }>
          | Readonly<{ v: 2 }>
          | Readonly<{ v: 3 }>
        )[]
      >('=');

      test('case 2', () => {
        expect(sorted).toStrictEqual([{ v: 1 }, { v: 2 }, { v: 3 }]);
      });
    }
  });

  describe('groupBy', () => {
    const xs = [
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 3, y: 1 },
      { x: 1, y: 2 },
      { x: 2, y: 2 },
      { x: 1, y: 3 },
    ] as const;

    const result = Arr.groupBy(xs, (a) => a.x);

    expectType<
      typeof result,
      IMap<
        1 | 2 | 3,
        readonly (
          | Readonly<{ x: 1; y: 1 }>
          | Readonly<{ x: 1; y: 2 }>
          | Readonly<{ x: 1; y: 3 }>
          | Readonly<{ x: 2; y: 1 }>
          | Readonly<{ x: 2; y: 2 }>
          | Readonly<{ x: 3; y: 1 }>
        )[]
      >
    >('=');

    test('case 1', () => {
      expect(result).toStrictEqual(
        IMap.new<
          1 | 2 | 3,
          readonly (
            | Readonly<{ x: 1; y: 1 }>
            | Readonly<{ x: 1; y: 2 }>
            | Readonly<{ x: 1; y: 3 }>
            | Readonly<{ x: 2; y: 1 }>
            | Readonly<{ x: 2; y: 2 }>
            | Readonly<{ x: 3; y: 1 }>
          )[]
        >([
          [
            1,
            [
              { x: 1, y: 1 },
              { x: 1, y: 2 },
              { x: 1, y: 3 },
            ],
          ],
          [
            2,
            [
              { x: 2, y: 1 },
              { x: 2, y: 2 },
            ],
          ],
          [3, [{ x: 3, y: 1 }]],
        ]),
      );
    });
  });
});

import { describe, expect, test } from 'vitest';
import { expectType } from '../expect-type.mjs';
import { Arr } from './array-utils.mjs';

describe('ArrayUtils', () => {
  describe('zip', () => {
    {
      const xs = [1, 2, 3] as const;
      const ys = [4, 5, 6] as const;
      const zipped = Arr.zip(xs, ys);

      expectType<
        typeof zipped,
        readonly [readonly [1, 4], readonly [2, 5], readonly [3, 6]]
      >('=');

      test('case 1', () => {
        expect(zipped).toStrictEqual([
          [1, 4],
          [2, 5],
          [3, 6],
        ]);
      });
    }
    {
      const xs: readonly number[] = [1, 2, 3];
      const ys: readonly number[] = [4];
      const zipped = Arr.zip(xs, ys);

      expectType<typeof zipped, readonly (readonly [number, number])[]>('=');

      test('case 2', () => {
        expect(zipped).toStrictEqual([[1, 4]]);
      });
    }
    {
      const xs = [1] as const;
      const ys: readonly number[] = [4, 5, 6];
      const zipped = Arr.zip(xs, ys);

      expectType<typeof zipped, readonly [readonly [1, number]]>('=');

      test('case 3', () => {
        expect(zipped).toStrictEqual([[1, 4]]);
      });
    }

    // testArrayEquality({
    //   testName: 'zip',
    //   target: zip([0, 1, 2, 3, 4], [5, 6, 7, 8, 9]),
    //   toBe: [
    //     [0, 5],
    //     [1, 6],
    //     [2, 7],
    //     [3, 8],
    //     [4, 9],
    //   ],
    // });

    // testArrayEquality({
    //   testName: 'zipArrays 2 arrays',
    //   target: zipArrays([0, 1, 2, 3, 4], [5, 6, 7, 8, 9]),
    //   toBe: [
    //     [0, 5],
    //     [1, 6],
    //     [2, 7],
    //     [3, 8],
    //     [4, 9],
    //   ],
    // });

    // testArrayEquality({
    //   testName: 'zipArrays 3 arrays',
    //   target: zipArrays(
    //     [0, 1, 2, 3, 4],
    //     [5, 6, 7, 8, 9, 999, 999],
    //     [10, 11, 12, 13, 14, 999]
    //   ),
    //   toBe: [
    //     [0, 5, 10],
    //     [1, 6, 11],
    //     [2, 7, 12],
    //     [3, 8, 13],
    //     [4, 9, 14],
    //   ],
    // });
  });
});

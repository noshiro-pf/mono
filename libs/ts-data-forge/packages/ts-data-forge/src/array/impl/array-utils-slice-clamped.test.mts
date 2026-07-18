import { asInt32, asUint32 } from '../../number/index.mjs';
import { sliceClamped } from './array-utils-slice-clamped.mjs';

describe('Arr', () => {
  describe(sliceClamped, () => {
    {
      const list: readonly number[] = [0, 1, 2, 3, 4] as const;

      test.each([
        {
          start: 0,
          end: 5,
          expected: [0, 1, 2, 3, 4],
        }, // normal
        {
          start: 0,
          end: 5,
          expected: [0, 1, 2, 3, 4],
        }, // one side overflow
        {
          start: -1,
          end: 5,
          expected: [0, 1, 2, 3, 4],
        }, // one side overflow
        {
          start: -1,
          end: 6,
          expected: [0, 1, 2, 3, 4],
        }, // both sides overflow
        {
          start: 0,
          end: 3,
          expected: [0, 1, 2],
        }, // normal
        {
          start: 1,
          end: 3,
          expected: [1, 2],
        }, // normal
        {
          start: -1,
          end: 3,
          expected: [0, 1, 2],
        }, // one side overflow
        {
          start: 3,
          end: 5,
          expected: [3, 4],
        }, // normal
        {
          start: 4,
          end: 3,
          expected: [],
        }, // start > end
        {
          start: 0,
          end: -1,
          expected: [],
        }, // start > end
        {
          start: -1,
          end: -2,
          expected: [],
        }, // start > end
        {
          start: 6,
          end: 9,
          expected: [],
        },
        {
          start: 6,
          end: 3,
          expected: [],
        },
      ] as const)('sliceClamped($start, $end)', ({ end, expected, start }) => {
        assert.deepStrictEqual(sliceClamped(list, start, end), expected);
      });
    }

    test('should be type error for index overflow for fixed length array', () => {
      {
        const array = [1, 2, 3, 4, 5] as const;

        // @ts-expect-error end index is out of bounds
        const result = sliceClamped(array, 0, 6);

        assert.deepStrictEqual(result, array);
      }

      {
        const array = [1, 2, 3, 4, 5] as const;

        // @ts-expect-error end index is out of bounds
        const result = sliceClamped(array, 0, -6);

        assert.deepStrictEqual(result, []);
      }

      {
        const array = [1, 2, 3, 4, 5] as const;

        // @ts-expect-error start index is out of bounds
        const result = sliceClamped(array, -6, 5);

        assert.deepStrictEqual(result, array);
      }

      {
        const array = [1, 2, 3, 4, 5] as const;

        // @ts-expect-error start index is out of bounds
        const result = sliceClamped(array, 6, 5);

        assert.deepStrictEqual(result, []);
      }
    });

    test('should slice with clamped indices', () => {
      const array = [1, 2, 3, 4, 5] as const;

      const result = sliceClamped(array, 1, 3);

      assert.deepStrictEqual(result, [2, 3]);
    });

    test('should clamp start index below 0', () => {
      const array = [1, 2, 3, 4, 5] as readonly number[];

      const result = sliceClamped(array, -10, 3);

      assert.deepStrictEqual(result, [1, 2, 3]);
    });

    test('should clamp end index above length', () => {
      const array = [1, 2, 3, 4, 5] as readonly number[];

      const result = sliceClamped(array, asUint32(2), asUint32(100));

      assert.deepStrictEqual(result, [3, 4, 5]);
    });

    test('should work with both indices out of range', () => {
      const array = [1, 2, 3] as readonly number[];

      const result = sliceClamped(array, asInt32(-10), asUint32(100));

      assert.deepStrictEqual(result, [1, 2, 3]);
    });

    test('should work with empty array', () => {
      const array: readonly number[] = [] as const;

      const result = sliceClamped(array, 0, 5);

      assert.deepStrictEqual(result, []);
    });

    test('should work with curried version', () => {
      const slice1to3 = sliceClamped(1, 3);

      const result = slice1to3([10, 20, 30, 40, 50]);

      assert.deepStrictEqual(result, [20, 30]);
    });
  });
});

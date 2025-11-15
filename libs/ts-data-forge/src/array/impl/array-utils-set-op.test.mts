import { expectType } from '../../expect-type.mjs';
import {
  eq,
  isSubset,
  isSuperset,
  setDifference,
  setIntersection,
  sortedNumSetDifference,
} from './array-utils-set-op.mjs';

describe('Arr set operations', () => {
  describe(eq, () => {
    {
      const xs = [1, 2, 3] as const;

      const ys = [1, 2, 3] as const;

      const result = eq(xs, ys);

      expectType<typeof result, boolean>('=');

      test('should return true for equal arrays of numbers', () => {
        expect(result).toBe(true);
      });
    }

    {
      const xs = [1, 2, 3] as const;

      const ys = [1, 2, 4] as const;

      const result = eq(xs, ys);

      expectType<typeof result, boolean>('=');

      test('should return false for different arrays of numbers', () => {
        expect(result).toBe(false);
      });
    }

    {
      const xs = [1, 2, 3] as const;

      const ys = [1, 2] as const;

      const result = eq(xs, ys);

      expectType<typeof result, boolean>('=');

      test('should return false for arrays of different lengths', () => {
        expect(result).toBe(false);
      });
    }

    {
      const xs = ['a', 'b'] as const;

      const ys = ['a', 'b'] as const;

      const result = eq(xs, ys);

      expectType<typeof result, boolean>('=');

      test('should return true for equal arrays of strings', () => {
        expect(result).toBe(true);
      });
    }

    {
      const xs = [] as const;

      const ys = [] as const;

      const result = eq(xs, ys);

      expectType<typeof result, boolean>('=');

      test('should return true for empty arrays', () => {
        expect(result).toBe(true);
      });
    }

    {
      const xs = [{ a: 1 }, { b: 2 }] as const;

      const ys = [{ a: 1 }, { b: 2 }] as const;

      // Default eq uses reference equality for objects
      const result = eq(xs, ys);

      expectType<typeof result, boolean>('=');

      test('should return false for arrays of objects with default equality (reference check)', () => {
        expect(result).toBe(false);
      });
    }

    {
      const objA = { a: 1 };

      const objB = { b: 2 };

      const xs = [objA, objB] as const;

      const ys = [objA, objB] as const;

      const result = eq(xs, ys);

      expectType<typeof result, boolean>('=');

      test('should return true for arrays of same object references', () => {
        expect(result).toBe(true);
      });
    }

    {
      const xs = [{ a: 1 }, { b: 2 }] as const;

      const ys = [{ a: 1 }, { b: 2 }] as const;

      const result = eq(
        xs,
        ys,
        (o1, o2) => JSON.stringify(o1) === JSON.stringify(o2),
      );

      expectType<typeof result, boolean>('=');

      test('should return true for arrays of objects with custom equality function', () => {
        expect(result).toBe(true);
      });
    }
  });

  describe(isSubset, () => {
    {
      const xs = [1, 2, 3] as const;

      const ys = [3, 2] as const;

      const result = isSubset(ys, xs);

      expectType<typeof result, boolean>('=');

      test('case 1', () => {
        expect(result).toBe(true);
      });
    }

    {
      const xs = [1, 2, 3] as const;

      const ys = [3, 2, 4] as const;

      const result = isSubset(ys, xs);

      expectType<typeof result, boolean>('=');

      test('case 2', () => {
        expect(result).toBe(false);
      });
    }
  });

  describe(isSuperset, () => {
    {
      const xs = [1, 2, 3] as const;

      const ys = [3, 2] as const;

      const result = isSuperset(ys, xs);

      expectType<typeof result, boolean>('=');

      test('case 1', () => {
        expect(result).toBe(false);
      });

      const result2 = isSuperset(xs, ys);

      test('case 2', () => {
        expect(result2).toBe(true);
      });
    }

    {
      const xs = [1, 2, 3] as const;

      const ys = [3, 2, 4] as const;

      const result = isSuperset(ys, xs);

      expectType<typeof result, boolean>('=');

      test('case 3', () => {
        expect(result).toBe(false);
      });
    }
  });

  describe(setIntersection, () => {
    {
      const xs = [1, 2, 3] as const;

      const ys = [2, 3, 4] as const;

      const result = setIntersection(xs, ys);

      expectType<typeof result, readonly (2 | 3)[]>('=');

      test('should return the intersection of two number arrays', () => {
        assert.deepStrictEqual(result, [2, 3]);
      });
    }

    {
      const xs = ['a', 'b', 'c'] as const;

      const ys = ['b', 'c', 'd'] as const;

      const result = setIntersection(xs, ys);

      expectType<typeof result, readonly ('b' | 'c')[]>('=');

      test('should return the intersection of two string arrays', () => {
        assert.deepStrictEqual(result, ['b', 'c']);
      });
    }

    {
      const xs = [1, 2, 3] as const;

      const ys = [4, 5, 6] as const;

      const result = setIntersection(xs, ys);

      expectType<typeof result, readonly never[]>('=');

      test('should return an empty array if there is no intersection', () => {
        assert.deepStrictEqual(result, []);
      });
    }

    {
      const xs = [1, 2, 3] as const;

      const ys = [] as const;

      const result = setIntersection(xs, ys);

      expectType<typeof result, readonly never[]>('=');

      test('should return an empty array if one array is empty', () => {
        assert.deepStrictEqual(result, []);
      });
    }

    {
      const xs = [] as const;

      const ys = [1, 2, 3] as const;

      const result = setIntersection(xs, ys);

      expectType<typeof result, readonly never[]>('=');

      test('should return an empty array if the first array is empty', () => {
        assert.deepStrictEqual(result, []);
      });
    }
  });

  describe(setDifference, () => {
    {
      const xs = [1, 2, 3] as const;

      const ys = [2, 3, 4] as const;

      const result = setDifference(xs, ys);

      expectType<typeof result, readonly (1 | 2 | 3 | 4)[]>('=');

      test('should return the difference xs - ys for number arrays', () => {
        assert.deepStrictEqual(result, [1]);
      });
    }

    {
      const xs = ['a', 'b', 'c'] as const;

      const ys = ['b', 'c', 'd'] as const;

      const result = setDifference(xs, ys);

      expectType<typeof result, readonly ('a' | 'b' | 'c' | 'd')[]>('=');

      test('should return the difference xs - ys for string arrays', () => {
        assert.deepStrictEqual(result, ['a']);
      });
    }

    {
      const xs = [1, 2, 3] as const;

      const ys = [1, 2, 3] as const;

      const result = setDifference(xs, ys);

      expectType<typeof result, readonly (1 | 2 | 3)[]>('=');

      test('should return an empty array if xs is a subset of ys', () => {
        assert.deepStrictEqual(result, []);
      });
    }

    {
      const xs = [1, 2, 3] as const;

      const ys = [4, 5, 6] as const;

      const result = setDifference(xs, ys);

      expectType<typeof result, readonly (1 | 2 | 3 | 4 | 5 | 6)[]>('=');

      test('should return xs if there is no intersection', () => {
        assert.deepStrictEqual(result, [1, 2, 3]);
      });
    }

    {
      const xs = [1, 2, 3] as const;

      const ys = [] as const;

      const result = setDifference(xs, ys);

      expectType<typeof result, readonly (1 | 2 | 3)[]>('=');

      test('should return xs if ys is empty', () => {
        assert.deepStrictEqual(result, [1, 2, 3]);
      });
    }

    {
      const xs = [] as const;

      const ys = [1, 2, 3] as const;

      const result = setDifference(xs, ys);

      expectType<typeof result, readonly (1 | 2 | 3)[]>('=');

      test('should return an empty array if xs is empty', () => {
        assert.deepStrictEqual(result, []);
      });
    }
  });

  describe(sortedNumSetDifference, () => {
    {
      const xs = [1, 2, 3, 5] as const;

      const ys = [2, 3, 4] as const;

      const result = sortedNumSetDifference(xs, ys);

      expectType<typeof result, readonly (1 | 2 | 3 | 4 | 5)[]>('=');

      test('should return the difference for sorted number arrays (xs - ys)', () => {
        assert.deepStrictEqual(result, [1, 5]);
      });
    }

    {
      const xs = [1, 2, 3] as const;

      const ys = [1, 2, 3] as const;

      const result = sortedNumSetDifference(xs, ys);

      expectType<typeof result, readonly (1 | 2 | 3)[]>('=');

      test('should return an empty array if sets are equal', () => {
        assert.deepStrictEqual(result, []);
      });
    }

    {
      const xs = [1, 2, 3] as const;

      const ys = [4, 5, 6] as const;

      const result = sortedNumSetDifference(xs, ys);

      expectType<typeof result, readonly (1 | 2 | 3 | 4 | 5 | 6)[]>('=');

      test('should return xs if no common elements', () => {
        assert.deepStrictEqual(result, [1, 2, 3]);
      });
    }

    {
      const xs = [4, 5, 6] as const;

      const ys = [1, 2, 3] as const;

      const result = sortedNumSetDifference(xs, ys);

      expectType<typeof result, readonly (1 | 2 | 3 | 4 | 5 | 6)[]>('=');

      test('should return xs if no common elements (ys < xs)', () => {
        assert.deepStrictEqual(result, [4, 5, 6]);
      });
    }

    {
      const xs = [1, 2, 3, 4, 5] as const;

      const ys = [2, 4] as const;

      const result = sortedNumSetDifference(xs, ys);

      expectType<typeof result, readonly (1 | 2 | 3 | 4 | 5)[]>('=');

      test('should return correct difference when ys is subset of xs', () => {
        assert.deepStrictEqual(result, [1, 3, 5]);
      });
    }

    {
      const xs = [2, 4] as const;

      const ys = [1, 2, 3, 4, 5] as const;

      const result = sortedNumSetDifference(xs, ys);

      expectType<typeof result, readonly (1 | 2 | 3 | 4 | 5)[]>('=');

      test('should return empty array when xs is subset of ys', () => {
        assert.deepStrictEqual(result, []);
      });
    }

    {
      const xs = [] as const;

      const ys = [1, 2, 3] as const;

      const result = sortedNumSetDifference(xs, ys);

      expectType<typeof result, readonly (1 | 2 | 3)[]>('='); // Type is `readonly number[]` due to `ys`

      test('should return an empty array if xs is empty', () => {
        assert.deepStrictEqual(result, []);
      });
    }

    {
      const xs = [1, 2, 3] as const;

      const ys = [] as const;

      const result = sortedNumSetDifference(xs, ys);

      expectType<typeof result, readonly (1 | 2 | 3)[]>('=');

      test('should return xs if ys is empty', () => {
        assert.deepStrictEqual(result, [1, 2, 3]);
      });
    }

    {
      const xs = [] as const;

      const ys = [] as const;

      const result = sortedNumSetDifference(xs, ys);

      expectType<typeof result, readonly never[]>('='); // Type is `readonly number[]`

      test('should return an empty array if both are empty', () => {
        assert.deepStrictEqual(result, []);
      });
    }
  });
});

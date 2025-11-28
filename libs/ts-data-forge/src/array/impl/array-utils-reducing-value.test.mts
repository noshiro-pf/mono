import { IMap } from '../../collections/index.mjs';
import { expectType } from '../../expect-type.mjs';
import { Optional, Result } from '../../functional/index.mjs';
import {
  count,
  countBy,
  foldl,
  foldr,
  join,
  max,
  maxBy,
  min,
  minBy,
  sum,
} from './array-utils-reducing-value.mjs';

describe('Arr reducing value', () => {
  describe(min, () => {
    {
      const xs = [3, 5, 4] as const;

      const result = min(xs);

      expectType<typeof result, Some<3 | 4 | 5>>('=');

      test('case 1', () => {
        assert.isTrue(Optional.isSome(result));

        if (Optional.isSome(result)) {
          expect(result.value).toBe(3);
        }
      });
    }

    {
      const xs = [3, 5, 4] as const;

      const result = min(xs, (a, b) => a - b);

      expectType<typeof result, Some<3 | 4 | 5>>('=');

      test('case 2', () => {
        assert.isTrue(Optional.isSome(result));

        if (Optional.isSome(result)) {
          expect(result.value).toBe(3);
        }
      });
    }

    {
      const xs: readonly (3 | 4 | 5)[] = [3, 5, 4] as const;

      const result = min(xs, (a, b) => a - b);

      expectType<typeof result, Optional<3 | 4 | 5>>('=');

      test('case 3', () => {
        assert.isTrue(Optional.isSome(result));

        if (Optional.isSome(result)) {
          expect(result.value).toBe(3);
        }
      });
    }
  });

  describe(max, () => {
    const xs = [3, 5, 4] as const;

    const result = max(xs, (a, b) => a - b);

    expectType<typeof result, Some<3 | 4 | 5>>('=');

    test('case 1', () => {
      assert.isTrue(Optional.isSome(result));

      if (Optional.isSome(result)) {
        expect(result.value).toBe(5);
      }
    });

    test('case 2: no comparator', () => {
      const res = max(xs);

      expectType<typeof res, Some<3 | 4 | 5>>('=');

      assert.isTrue(Optional.isSome(res));

      if (Optional.isSome(res)) {
        expect(res.value).toBe(5);
      }
    });

    test('case 3: readonly array', () => {
      const arr: readonly number[] = [1, 5, 2];

      const res = max(arr);

      expectType<typeof res, Optional<number>>('=');

      assert.isTrue(Optional.isSome(res));

      if (Optional.isSome(res)) {
        expect(res.value).toBe(5);
      }
    });

    test('case 4: empty array', () => {
      const arr: readonly number[] = [];

      const res = max(arr);

      expectType<typeof res, Optional<number>>('=');

      assert.isTrue(Optional.isNone(res));
    });
  });

  describe(minBy, () => {
    const xs = [
      { x: 5, y: 1 },
      { x: 4, y: 1 },
      { x: 6, y: 1 },
      { x: 3, y: 2 },
      { x: 1, y: 2 },
      { x: 2, y: 3 },
    ] as const;

    const result = minBy(xs, (a) => a.x);

    expectType<
      typeof result,
      Some<
        Readonly<
          | { x: 1; y: 2 }
          | { x: 2; y: 3 }
          | { x: 3; y: 2 }
          | { x: 4; y: 1 }
          | { x: 5; y: 1 }
          | { x: 6; y: 1 }
        >
      >
    >('=');

    test('case 1', () => {
      assert.isTrue(Optional.isSome(result));

      if (Optional.isSome(result)) {
        assert.deepStrictEqual(result.value, { x: 1, y: 2 });
      }
    });

    test('case 2: empty array', () => {
      const arr: readonly { x: number }[] = [];

      const res = minBy(arr, (a) => a.x);

      expectType<typeof res, Optional<{ x: number }>>('=');

      assert.isTrue(Optional.isNone(res));
    });

    test('case 3: custom comparator', () => {
      const arr = [
        { name: 'apple', score: 10 },
        { name: 'banana', score: 5 },
        { name: 'cherry', score: 12 },
      ] as const;

      const res = minBy(
        arr,
        (item) => item.name,
        (a, b) => a.localeCompare(b),
      );

      expectType<
        typeof res,
        Some<
          Readonly<
            | { name: 'apple'; score: 10 }
            | { name: 'banana'; score: 5 }
            | { name: 'cherry'; score: 12 }
          >
        >
      >('=');

      assert.isTrue(Optional.isSome(res));

      if (Optional.isSome(res)) {
        assert.deepStrictEqual(res.value, { name: 'apple', score: 10 });
      }
    });
  });

  describe(maxBy, () => {
    const xs = [
      { x: 5, y: 1 },
      { x: 4, y: 1 },
      { x: 6, y: 1 },
      { x: 3, y: 2 },
      { x: 1, y: 2 },
      { x: 2, y: 3 },
    ] as const;

    const result = maxBy(xs, (a) => a.x);

    expectType<
      typeof result,
      Some<
        Readonly<
          | { x: 1; y: 2 }
          | { x: 2; y: 3 }
          | { x: 3; y: 2 }
          | { x: 4; y: 1 }
          | { x: 5; y: 1 }
          | { x: 6; y: 1 }
        >
      >
    >('=');

    test('case 1', () => {
      assert.isTrue(Optional.isSome(result));

      if (Optional.isSome(result)) {
        assert.deepStrictEqual(result.value, { x: 6, y: 1 });
      }
    });

    test('case 2: empty array', () => {
      const arr: readonly { x: number }[] = [];

      const res = maxBy(arr, (a) => a.x);

      expectType<typeof res, Optional<{ x: number }>>('=');

      assert.isTrue(Optional.isNone(res));
    });

    test('case 3: custom comparator', () => {
      const arr = [
        { name: 'apple', score: 10 },
        { name: 'banana', score: 5 },
        { name: 'cherry', score: 12 },
      ] as const;

      const res = maxBy(
        arr,
        (item) => item.name,
        (a, b) => a.localeCompare(b),
      );

      expectType<
        typeof res,
        Some<
          Readonly<
            | { name: 'apple'; score: 10 }
            | { name: 'banana'; score: 5 }
            | { name: 'cherry'; score: 12 }
          >
        >
      >('=');

      assert.isTrue(Optional.isSome(res));

      if (Optional.isSome(res)) {
        assert.deepStrictEqual(res.value, { name: 'cherry', score: 12 });
      }
    });
  });

  describe(count, () => {
    const xs = [
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 3, y: 1 },
      { x: 1, y: 2 },
      { x: 2, y: 2 },
      { x: 1, y: 3 },
    ] as const;

    const result = count(xs, (a) => a.x === 2);

    expectType<typeof result, Uint32>('=');

    test('case 1', () => {
      expect(result).toBe(2);
    });

    test('case 2: empty array', () => {
      const arr: readonly number[] = [];

      const res = count(arr, (x) => x > 0);

      expectType<typeof res, Uint32>('=');

      expect(res).toBe(0);
    });

    test('should work with curried version', () => {
      const countEven = count((x: number) => x % 2 === 0);

      const res = countEven([1, 2, 3, 4, 5, 6]);

      expect(res).toBe(3);
    });
  });

  describe(countBy, () => {
    const xs = [
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 3, y: 1 },
      { x: 1, y: 2 },
      { x: 2, y: 2 },
      { x: 1, y: 3 },
    ] as const;

    const result = countBy(xs, (a) => a.x);

    expectType<typeof result, IMap<1 | 2 | 3, 0 | 1 | 2 | 3 | 4 | 5>>('=');

    test('case 1', () => {
      assert.deepStrictEqual(
        result,
        IMap.create<1 | 2 | 3, 0 | 1 | 2 | 3 | 4 | 5>([
          [1, 3],
          [2, 2],
          [3, 1],
        ]),
      );
    });

    test('case 2: empty array', () => {
      const arr: readonly { x: number }[] = [];

      const res = countBy(arr, (a) => a.x);

      expectType<typeof res, IMap<number, Uint32>>('=');

      expect(res.size).toBe(0);
    });

    test('should work with curried version', () => {
      const groupByParity = countBy((x: number) => x % 2);

      const res = groupByParity([1, 2, 3, 4, 5, 6]);

      const even = res.get(0);

      assert.isTrue(Optional.isSome(even));

      if (Optional.isSome(even)) {
        expect(even.value).toBe(3);
      }

      const odd = res.get(1);

      assert.isTrue(Optional.isSome(odd));

      if (Optional.isSome(odd)) {
        expect(odd.value).toBe(3);
      }
    });
  });

  describe(foldl, () => {
    test('empty array', () => {
      const result = foldl([], (acc, curr: number) => acc + curr, 0);

      expectType<typeof result, number>('=');

      expect(result).toBe(0);
    });

    test('sum numbers', () => {
      const result = foldl([1, 2, 3] as const, (acc, curr) => acc + curr, 0);

      expectType<typeof result, number>('=');

      expect(result).toBe(6);
    });

    test('concatenate strings', () => {
      const result = foldl(
        ['a', 'b', 'c'] as const,
        (acc, curr) => acc + curr,
        '',
      );

      expectType<typeof result, string>('=');

      expect(result).toBe('abc');
    });

    test('should work with curried version', () => {
      const sumReduce = foldl((acc: number, curr: number) => acc + curr, 0);

      const result = sumReduce([1, 2, 3, 4]);

      expect(result).toBe(10);
    });
  });

  describe(foldr, () => {
    test('empty array', () => {
      const result = foldr([], (acc, curr: number) => acc + curr, 0);

      expectType<typeof result, number>('=');

      expect(result).toBe(0);
    });

    test('subtract numbers from right', () => {
      // (1 - (2 - (3 - 0))) = 1 - (2 - 3) = 1 - (-1) = 2
      const result = foldr([1, 2, 3] as const, (acc, curr) => curr - acc, 0);

      expectType<typeof result, number>('=');

      expect(result).toBe(2); // 3 - (2 - (1 - 0)) = 3 - (2 - 1) = 3 - 1 = 2.  No, this is (acc, curr) => acc - curr.
      // The callback is (previousValue: S, currentValue: A) => S
      // So it's initialValue for S.
      // Iteration 1: prev = 0, curr = 3. Result = 3 - 0 = 3.
      // Iteration 2: prev = 3, curr = 2. Result = 2 - 3 = -1.
      // Iteration 3: prev = -1, curr = 1. Result = 1 - (-1) = 2.
    });

    test('concatenate strings from right', () => {
      const result = foldr(
        ['a', 'b', 'c'] as const,
        (acc, curr) => curr + acc,
        '',
      );

      expectType<typeof result, string>('=');

      expect(result).toBe('abc'); // c + (b + (a + "")) = cba. No, it's curr + acc.
      // Iteration 1: prev = "", curr = "c". Result = "c" + "" = "c".
      // Iteration 2: prev = "c", curr = "b". Result = "b" + "c" = "bc".
      // Iteration 3: prev = "bc", curr = "a". Result = "a" + "bc" = "abc".
    });

    test('should work with curried version', () => {
      const productReduce = foldr((acc: number, curr: number) => acc * curr, 1);

      const result = productReduce([2, 3, 4]);

      expect(result).toBe(24); // 1 * 4 * 3 * 2 = 24
    });
  });

  describe(sum, () => {
    test('empty array', () => {
      const result = sum([]);

      expectType<typeof result, 0>('=');

      expect(result).toBe(0);
    });

    test('one element array', () => {
      const result = sum([23]);

      expectType<typeof result, 23>('=');

      expect(result).toBe(23);
    });

    test('positive numbers', () => {
      const result = sum([1, 2, 3, 4, 5] as const);

      expectType<typeof result, number>('=');

      expect(result).toBe(15);
    });

    test('mixed numbers', () => {
      const result = sum([1, -2, 3, 0, -5] as const);

      expectType<typeof result, number>('=');

      expect(result).toBe(-3);
    });
  });

  describe(join, () => {
    test('should join array elements', () => {
      const arr = ['Hello', 'World'];

      const result = join(arr, ' ');

      assert.isTrue(Result.isOk(result));

      if (Result.isOk(result)) {
        expect(result.value).toBe('Hello World');
      }
    });

    test('should handle empty separator', () => {
      const arr = ['a', 'b', 'c'];

      const result = join(arr, '');

      assert.isTrue(Result.isOk(result));

      if (Result.isOk(result)) {
        expect(result.value).toBe('abc');
      }
    });

    test('should handle undefined separator', () => {
      const arr = ['a', 'b', 'c'];

      const result = join(arr);

      assert.isTrue(Result.isOk(result));

      if (Result.isOk(result)) {
        expect(result.value).toBe('a,b,c');
      }
    });

    test('should work with curried version', () => {
      const joinWithDash = join('-');

      const result = joinWithDash(['x', 'y', 'z']);

      assert.isTrue(Result.isOk(result));

      if (Result.isOk(result)) {
        expect(result.value).toBe('x-y-z');
      }
    });
  });
});

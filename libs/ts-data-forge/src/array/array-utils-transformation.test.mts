import { IMap } from '../collections/index.mjs';
import { expectType } from '../expect-type.mjs';
import { Optional } from '../functional/optional.mjs';
import { Arr } from './array-utils.mjs';

describe('Arr transformations', () => {
  describe('partition', () => {
    const xs = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

    {
      const result = Arr.partition(xs, 4);

      expectType<
        typeof result,
        readonly (readonly (
          | 1
          | 2
          | 3
          | 4
          | 5
          | 6
          | 7
          | 8
          | 9
          | 10
          | 11
          | 12
        )[])[]
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
        readonly (readonly (
          | 1
          | 2
          | 3
          | 4
          | 5
          | 6
          | 7
          | 8
          | 9
          | 10
          | 11
          | 12
        )[])[]
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

    {
      const result = Arr.partition(xs, 5);

      expectType<
        typeof result,
        readonly (readonly (
          | 1
          | 2
          | 3
          | 4
          | 5
          | 6
          | 7
          | 8
          | 9
          | 10
          | 11
          | 12
        )[])[]
      >('=');

      test('case 3', () => {
        expect(result).toStrictEqual([
          [1, 2, 3, 4, 5],
          [6, 7, 8, 9, 10],
          [11, 12],
        ]);
      });
    }

    test('should partition array into chunks', () => {
      const numbers = [1, 2, 3, 4, 5, 6];
      const result = Arr.partition(numbers, 2);

      expect(result).toStrictEqual([
        [1, 2],
        [3, 4],
        [5, 6],
      ]);
    });

    test('should handle arrays not evenly divisible by chunk size', () => {
      const numbers = [1, 2, 3, 4, 5];
      const result = Arr.partition(numbers, 2);

      expect(result).toStrictEqual([[1, 2], [3, 4], [5]]);
    });

    test('should work with chunk size < 2 (returns empty)', () => {
      const numbers = [1, 2, 3];
      const result = Arr.partition(numbers, 1);

      // According to docs, returns empty array if chunkSize < 2
      expect(result).toStrictEqual([]);
    });

    test('should work with chunk size larger than array', () => {
      const numbers = [1, 2];
      const result = Arr.partition(numbers, 5);

      expect(result).toStrictEqual([[1, 2]]);
    });

    test('should work with empty array', () => {
      const empty: readonly number[] = [];
      const result = Arr.partition(empty, 2);

      expect(result).toStrictEqual([]);
    });

    test('should partition array into chunks', () => {
      const numbers = [1, 2, 3, 4, 5, 6];
      const result = Arr.partition(numbers, 2);

      expect(result).toStrictEqual([
        [1, 2],
        [3, 4],
        [5, 6],
      ]);
    });

    test('should handle arrays not evenly divisible by chunk size', () => {
      const numbers = [1, 2, 3, 4, 5];
      const result = Arr.partition(numbers, 2);

      expect(result).toStrictEqual([[1, 2], [3, 4], [5]]);
    });

    test('should work with chunk size < 2 (returns empty)', () => {
      const numbers = [1, 2, 3];
      const result = Arr.partition(numbers, 1);

      // According to docs, returns empty array if chunkSize < 2
      expect(result).toStrictEqual([]);
    });

    test('should work with chunk size larger than array', () => {
      const numbers = [1, 2];
      const result = Arr.partition(numbers, 5);

      expect(result).toStrictEqual([[1, 2]]);
    });

    test('should work with empty array', () => {
      const empty: readonly number[] = [];
      const result = Arr.partition(empty, 2);

      expect(result).toStrictEqual([]);
    });
  });

  describe('toReversed', () => {
    {
      const xs = [1, 2, 3] as const;
      const result = xs.toReversed();

      expectType<typeof result, (1 | 2 | 3)[]>('=');

      test('case 1', () => {
        expect(result).toStrictEqual([3, 2, 1]);
      });
    }
  });

  describe('toSorted', () => {
    {
      const xs = [2, 1, 3] as const;
      const result = xs.toSorted();

      expectType<typeof result, (1 | 2 | 3)[]>('=');

      test('case 1', () => {
        expect(result).toStrictEqual([1, 2, 3]);
      });
    }
    {
      const xs = [2, 1, 3] as const;
      const result = xs.toSorted((a, b) => a - b);

      expectType<typeof result, (1 | 2 | 3)[]>('=');

      test('case 2', () => {
        expect(result).toStrictEqual([1, 2, 3]);
      });
    }
    {
      const xs = [2, 1, 3] as const;
      const result = xs.toSorted((a, b) => b - a);

      expectType<typeof result, (1 | 2 | 3)[]>('=');

      test('case 3', () => {
        expect(result).toStrictEqual([3, 2, 1]);
      });
    }
  });

  describe('toSortedBy', () => {
    {
      const xs = [{ v: 2 }, { v: 1 }, { v: 3 }] as const;
      const sorted = Arr.toSortedBy(xs, (x) => x.v);

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
      const sorted = Arr.toSortedBy(
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

    test('should sort by key function', () => {
      const people = [
        { name: 'Alice', age: 30 },
        { name: 'Bob', age: 20 },
        { name: 'Charlie', age: 25 },
      ];
      const result = Arr.toSortedBy(people, (person) => person.age);

      expect(result).toHaveLength(3);
      expect(result[0]?.name).toBe('Bob');
      expect(result[1]?.name).toBe('Charlie');
      expect(result[2]?.name).toBe('Alice');
    });

    test('should work with string sorting', () => {
      const words = ['banana', 'apple', 'cherry'];
      const result = Arr.toSortedBy(
        words,
        (word: string) => word,
        (a: string, b: string) => a.localeCompare(b),
      );
      expect(result).toStrictEqual(['apple', 'banana', 'cherry']);
    });

    test('should work with custom key extraction', () => {
      const items = ['hello', 'hi', 'welcome', 'bye'];
      const result = Arr.toSortedBy(items, (item) => item.length);
      expect(result).toStrictEqual(['hi', 'bye', 'hello', 'welcome']);
    });

    test('should work with empty array', () => {
      const empty: readonly { value: number }[] = [];
      const result = Arr.toSortedBy(empty, (item) => item.value);
      expect(result).toStrictEqual([]);
    });

    test('should sort by key function', () => {
      const people = [
        { name: 'Alice', age: 30 },
        { name: 'Bob', age: 20 },
        { name: 'Charlie', age: 25 },
      ];
      const result = Arr.toSortedBy(people, (person) => person.age);

      expect(result).toHaveLength(3);
      expect(result[0]?.name).toBe('Bob');
      expect(result[1]?.name).toBe('Charlie');
      expect(result[2]?.name).toBe('Alice');
    });

    test('should work with string sorting', () => {
      const words = ['banana', 'apple', 'cherry'];
      const result = Arr.toSortedBy(
        words,
        (word: string) => word,
        (a: string, b: string) => a.localeCompare(b),
      );
      expect(result).toStrictEqual(['apple', 'banana', 'cherry']);
    });

    test('should work with custom key extraction', () => {
      const items = ['hello', 'hi', 'welcome', 'bye'];
      const result = Arr.toSortedBy(items, (item) => item.length);
      expect(result).toStrictEqual(['hi', 'bye', 'hello', 'welcome']);
    });

    test('should work with empty array', () => {
      const empty: readonly { value: number }[] = [];
      const result = Arr.toSortedBy(empty, (item) => item.value);
      expect(result).toStrictEqual([]);
    });
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
        IMap.create<
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

    test('should group elements by key', () => {
      const array = [
        { type: 'fruit', name: 'apple' },
        { type: 'vegetable', name: 'carrot' },
        { type: 'fruit', name: 'banana' },
      ];
      const grouped = Arr.groupBy(array, (item) => item.type);

      expect(grouped.size).toBe(2);
      const fruits = grouped.get('fruit');
      const vegetables = grouped.get('vegetable');

      expect(Optional.isSome(fruits)).toBe(true);
      expect(Optional.isSome(vegetables)).toBe(true);

      if (Optional.isSome(fruits)) {
        expect(fruits.value).toHaveLength(2);
        expect(fruits.value[0]?.name).toBe('apple');
        expect(fruits.value[1]?.name).toBe('banana');
      }

      if (Optional.isSome(vegetables)) {
        expect(vegetables.value).toHaveLength(1);
        expect(vegetables.value[0]?.name).toBe('carrot');
      }
    });

    test('should work with numeric keys', () => {
      const numbers = [1, 2, 3, 4, 5, 6];
      const grouped = Arr.groupBy(numbers, (n) => n % 2);

      expect(grouped.size).toBe(2);
      const evens = grouped.get(0);
      const odds = grouped.get(1);

      if (Optional.isSome(evens)) {
        expect(evens.value).toStrictEqual([2, 4, 6]);
      }

      if (Optional.isSome(odds)) {
        expect(odds.value).toStrictEqual([1, 3, 5]);
      }
    });

    test('should work with empty array', () => {
      const empty: readonly number[] = [];
      const grouped = Arr.groupBy(empty, (n) => n % 2);
      expect(grouped.size).toBe(0);
    });

    test('should handle all elements in same group', () => {
      const array = [1, 2, 3, 4];
      const grouped = Arr.groupBy(array, () => 'all');

      expect(grouped.size).toBe(1);
      const all = grouped.get('all');

      if (Optional.isSome(all)) {
        expect(all.value).toStrictEqual([1, 2, 3, 4]);
      }
    });

    test('should group elements by key', () => {
      const array = [
        { type: 'fruit', name: 'apple' },
        { type: 'vegetable', name: 'carrot' },
        { type: 'fruit', name: 'banana' },
      ];
      const grouped = Arr.groupBy(array, (item) => item.type);

      expect(grouped.size).toBe(2);
      const fruits = grouped.get('fruit');
      const vegetables = grouped.get('vegetable');

      expect(Optional.isSome(fruits)).toBe(true);
      expect(Optional.isSome(vegetables)).toBe(true);

      if (Optional.isSome(fruits)) {
        expect(fruits.value).toHaveLength(2);
        expect(fruits.value[0]?.name).toBe('apple');
        expect(fruits.value[1]?.name).toBe('banana');
      }

      if (Optional.isSome(vegetables)) {
        expect(vegetables.value).toHaveLength(1);
        expect(vegetables.value[0]?.name).toBe('carrot');
      }
    });

    test('should work with numeric keys', () => {
      const numbers = [1, 2, 3, 4, 5, 6];
      const grouped = Arr.groupBy(numbers, (n) => n % 2);

      expect(grouped.size).toBe(2);
      const evens = grouped.get(0);
      const odds = grouped.get(1);

      if (Optional.isSome(evens)) {
        expect(evens.value).toStrictEqual([2, 4, 6]);
      }

      if (Optional.isSome(odds)) {
        expect(odds.value).toStrictEqual([1, 3, 5]);
      }
    });

    test('should work with empty array', () => {
      const empty: readonly number[] = [];
      const grouped = Arr.groupBy(empty, (n) => n % 2);
      expect(grouped.size).toBe(0);
    });

    test('should handle all elements in same group', () => {
      const array = [1, 2, 3, 4];
      const grouped = Arr.groupBy(array, () => 'all');

      expect(grouped.size).toBe(1);
      const all = grouped.get('all');

      if (Optional.isSome(all)) {
        expect(all.value).toStrictEqual([1, 2, 3, 4]);
      }
    });
  });

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

    test('should zip two arrays', () => {
      const arr1 = [1, 2, 3];
      const arr2 = ['a', 'b', 'c'];
      const result = Arr.zip(arr1, arr2);
      expect(result).toStrictEqual([
        [1, 'a'],
        [2, 'b'],
        [3, 'c'],
      ]);
    });

    test('should handle arrays of different lengths', () => {
      const arr1 = [1, 2, 3, 4];
      const arr2 = ['a', 'b'];
      const result = Arr.zip(arr1, arr2);
      expect(result).toStrictEqual([
        [1, 'a'],
        [2, 'b'],
      ]);
    });

    test('should work with empty arrays', () => {
      const arr1: readonly number[] = [];
      const arr2: readonly string[] = [];
      const result = Arr.zip(arr1, arr2);
      expect(result).toStrictEqual([]);
    });

    test('should handle one empty array', () => {
      const arr1 = [1, 2, 3];
      const arr2: readonly string[] = [];
      const result = Arr.zip(arr1, arr2);
      expect(result).toStrictEqual([]);
    });

    test('should zip two arrays', () => {
      const arr1 = [1, 2, 3];
      const arr2 = ['a', 'b', 'c'];
      const result = Arr.zip(arr1, arr2);
      expect(result).toStrictEqual([
        [1, 'a'],
        [2, 'b'],
        [3, 'c'],
      ]);
    });

    test('should handle arrays of different lengths', () => {
      const arr1 = [1, 2, 3, 4];
      const arr2 = ['a', 'b'];
      const result = Arr.zip(arr1, arr2);
      expect(result).toStrictEqual([
        [1, 'a'],
        [2, 'b'],
      ]);
    });

    test('should work with empty arrays', () => {
      const arr1: readonly number[] = [];
      const arr2: readonly string[] = [];
      const result = Arr.zip(arr1, arr2);
      expect(result).toStrictEqual([]);
    });

    test('should handle one empty array', () => {
      const arr1 = [1, 2, 3];
      const arr2: readonly string[] = [];
      const result = Arr.zip(arr1, arr2);
      expect(result).toStrictEqual([]);
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

  describe('uniq', () => {
    test('should remove duplicate primitives', () => {
      const array = [1, 2, 2, 3, 1, 4, 3];
      const result = Arr.uniq(array);
      expect(result).toStrictEqual([1, 2, 3, 4]);
    });

    test('should work with strings', () => {
      const array = ['a', 'b', 'a', 'c', 'b'];
      const result = Arr.uniq(array);
      expect(result).toStrictEqual(['a', 'b', 'c']);
    });

    test('should work with empty array', () => {
      const array: readonly number[] = [];
      const result = Arr.uniq(array);
      expect(result).toStrictEqual([]);
    });

    test('should preserve order of first occurrence', () => {
      const array = [3, 1, 2, 1, 3, 2];
      const result = Arr.uniq(array);
      expect(result).toStrictEqual([3, 1, 2]);
    });
  });

  describe('uniqBy', () => {
    test('should remove duplicates based on key function', () => {
      const array = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
        { id: 1, name: 'Alice Duplicate' },
        { id: 3, name: 'Charlie' },
      ];
      const result = Arr.uniqBy(array, (item) => item.id);

      expect(result).toHaveLength(3);
      expect(result[0]).toStrictEqual({ id: 1, name: 'Alice' });
      expect(result[1]).toStrictEqual({ id: 2, name: 'Bob' });
      expect(result[2]).toStrictEqual({ id: 3, name: 'Charlie' });
    });

    test('should work with string key function', () => {
      const words = ['hello', 'world', 'hi', 'welcome'];
      const result = Arr.uniqBy(words, (word) => word.length);

      expect(result).toHaveLength(3);
      expect(result).toContain('hello'); // length 5
      expect(result).toContain('hi'); // length 2
      expect(result).toContain('welcome'); // length 7
    });

    test('should work with empty array', () => {
      const empty: readonly { id: number }[] = [];
      const result = Arr.uniqBy(empty, (item) => item.id);
      expect(result).toStrictEqual([]);
    });
  });
});

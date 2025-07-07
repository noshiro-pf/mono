import { IMap } from '../collections/index.mjs';
import { expectType } from '../expect-type.mjs';
import { Optional } from '../functional/optional.mjs';
import { SafeUint } from '../number/index.mjs';
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
        ArrayOfLength<3, Readonly<{ v: 1 } | { v: 2 } | { v: 3 }>>
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
        ArrayOfLength<3, Readonly<{ v: 1 } | { v: 2 } | { v: 3 }>>
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

  describe('map', () => {
    const mapped = Arr.map([1, 2, 3], (x, i): number => x * x * i);

    expectType<typeof mapped, ArrayOfLength<3, number>>('=');

    test('case 1', () => {
      expect(mapped).toStrictEqual([0, 4, 18]);
    });

    test('should work with empty tuple', () => {
      const empty = [] as const;
      const mappedEmpty = Arr.map(empty, (x) => String(x));
      expectType<typeof mappedEmpty, readonly []>('=');
      expect(mappedEmpty).toStrictEqual([]);
    });

    test('should preserve tuple length with different types', () => {
      const mixed = [1, 'hello', true] as const;
      const mappedMixed = Arr.map(mixed, (x) => typeof x);
      expectType<typeof mappedMixed, readonly [string, string, string]>('<=');
      expect(mappedMixed).toStrictEqual(['number', 'string', 'boolean']);
    });

    test('should work with index parameter', () => {
      const tuple = ['a', 'b', 'c'] as const;
      const mappedWithIndex = Arr.map(tuple, (x, i) => `${i}:${x}`);
      expectType<typeof mappedWithIndex, readonly [string, string, string]>(
        '<=',
      );
      expect(mappedWithIndex).toStrictEqual(['0:a', '1:b', '2:c']);
    });
  });

  describe('toReversed', () => {
    {
      const result = Arr.toReversed([1, 2, 3]);

      expectType<typeof result, readonly [3, 2, 1]>('=');

      test('case 1', () => {
        expect(result).toStrictEqual([3, 2, 1]);
      });
    }

    test('should work with empty tuple', () => {
      const empty = [] as const;
      const reversed = Arr.toReversed(empty);
      expectType<typeof reversed, readonly []>('=');
      expect(reversed).toStrictEqual([]);
    });

    test('should work with single element', () => {
      const single = [42] as const;
      const reversed = Arr.toReversed(single);
      expectType<typeof reversed, readonly [42]>('=');
      expect(reversed).toStrictEqual([42]);
    });

    test('should preserve mixed types in reverse order', () => {
      const mixed = [1, 'hello', true, null] as const;
      const reversed = Arr.toReversed(mixed);
      expectType<typeof reversed, readonly [null, true, 'hello', 1]>('=');
      expect(reversed).toStrictEqual([null, true, 'hello', 1]);
    });
  });

  describe('filter', () => {
    test('should filter array with predicate', () => {
      const numbers = [1, 2, 3, 4, 5];
      const evens = Arr.filter(numbers, (n) => n % 2 === 0);
      expect(evens).toStrictEqual([2, 4]);
    });

    test('should work with type guards', () => {
      const mixed: (string | number | null)[] = [
        'hello',
        42,
        null,
        'world',
        123,
      ];
      const strings = Arr.filter(
        mixed,
        (x): x is string => typeof x === 'string',
      );
      expectType<typeof strings, readonly string[]>('=');
      expect(strings).toStrictEqual(['hello', 'world']);
    });

    test('should work with curried version', () => {
      const isPositive = (n: number): boolean => n > 0;
      const filterPositive = Arr.filter(isPositive);
      const result = filterPositive([-1, 2, -3, 4]);
      expect(result).toStrictEqual([2, 4]);
    });

    test('should work with curried type guards', () => {
      const isString = (x: unknown): x is string => typeof x === 'string';
      const filterStrings = Arr.filter(isString);
      const result = filterStrings(['a', 1, 'b', 2]);
      expectType<typeof result, readonly string[]>('=');
      expect(result).toStrictEqual(['a', 'b']);
    });

    test('should preserve array type with generic predicate', () => {
      const tuple = [1, 2, 3] as const;
      const filtered = Arr.filter(tuple, (x) => x > 1);
      expectType<typeof filtered, readonly (1 | 2 | 3)[]>('=');
      expect(filtered).toStrictEqual([2, 3]);
    });

    test('should work with empty array', () => {
      const empty: number[] = [];
      const result = Arr.filter(empty, (n) => n > 0);
      expect(result).toStrictEqual([]);
    });

    test('should pass index to predicate', () => {
      const numbers = [10, 20, 30, 40];
      const evenIndexes = Arr.filter(numbers, (_, i) => i % 2 === 0);
      expect(evenIndexes).toStrictEqual([10, 30]);
    });
  });

  describe('every', () => {
    test('should return true when all elements satisfy predicate', () => {
      const evens = [2, 4, 6, 8];
      const allEven = Arr.every(evens, (n) => n % 2 === 0);
      expect(allEven).toBe(true);
    });

    test('should return false when not all elements satisfy predicate', () => {
      const mixed = [2, 3, 4, 6];
      const allEven = Arr.every(mixed, (n) => n % 2 === 0);
      expect(allEven).toBe(false);
    });

    test('should work as type guard', () => {
      const mixed: (string | number)[] = ['hello', 'world'];
      if (Arr.every(mixed, (x): x is string => typeof x === 'string')) {
        // TypeScript narrows mixed to readonly string[] here
        expect(mixed.every((s) => typeof s === 'string')).toBe(true);
      }
    });

    test('should work with curried version', () => {
      const isPositive = (n: number): boolean => n > 0;
      const allPositive = Arr.every(isPositive);
      expect(allPositive([1, 2, 3])).toBe(true);
      expect(allPositive([1, -2, 3])).toBe(false);
    });

    test('should work with curried type guards', () => {
      const isString = (x: unknown): x is string => typeof x === 'string';
      const allStrings = Arr.every(isString);
      const data: unknown[] = ['a', 'b', 'c'];
      if (allStrings(data)) {
        // TypeScript narrows data to readonly string[] here
        expect(data.join('')).toBe('abc');
      }
    });

    test('should return true for empty array', () => {
      const empty: number[] = [];
      const result = Arr.every(empty, (n) => n > 0);
      expect(result).toBe(true);
    });

    test('should pass index to predicate', () => {
      const numbers = [0, 1, 2, 3];
      const indexMatchesValue = Arr.every(numbers, (val, idx) => val === idx);
      expect(indexMatchesValue).toBe(true);
    });
  });

  describe('some', () => {
    test('should return true when at least one element satisfies predicate', () => {
      const numbers = [1, 3, 5, 8];
      const hasEven = Arr.some(numbers, (n) => n % 2 === 0);
      expect(hasEven).toBe(true);
    });

    test('should return false when no elements satisfy predicate', () => {
      const odds = [1, 3, 5, 7];
      const hasEven = Arr.some(odds, (n) => n % 2 === 0);
      expect(hasEven).toBe(false);
    });

    test('should work with curried version', () => {
      const isNegative = (n: number): boolean => n < 0;
      const hasNegative = Arr.some(isNegative);
      expect(hasNegative([1, 2, -3])).toBe(true);
      expect(hasNegative([1, 2, 3])).toBe(false);
    });

    test('should return false for empty array', () => {
      const empty: number[] = [];
      const result = Arr.some(empty, (n) => n > 0);
      expect(result).toBe(false);
    });

    test('should pass index to predicate', () => {
      const numbers = [10, 10, 10, 30];
      const hasValueMatchingIndex = Arr.some(
        numbers,
        (val, idx) => val === idx * 10,
      );
      expect(hasValueMatchingIndex).toBe(true);
    });
  });

  describe('entries', () => {
    test('should return array of index-value pairs', () => {
      const fruits = ['apple', 'banana', 'cherry'];
      const entries = Array.from(Arr.entries(fruits));
      expect(entries).toStrictEqual([
        [0, 'apple'],
        [1, 'banana'],
        [2, 'cherry'],
      ]);
    });

    test('should work with tuples', () => {
      const tuple = [10, 20, 30] as const;
      const entries = Array.from(Arr.entries(tuple));
      expectType<typeof entries, (readonly [Uint32, 10 | 20 | 30])[]>('=');
      expect(entries).toStrictEqual([
        [0, 10],
        [1, 20],
        [2, 30],
      ]);
    });

    test('should work with empty array', () => {
      const empty: string[] = [];
      const entries = Array.from(Arr.entries(empty));
      expect(entries).toStrictEqual([]);
    });

    test('should preserve mixed types', () => {
      const mixed = [1, 'hello', true] as const;
      const entries = Array.from(Arr.entries(mixed));
      expectType<typeof entries, (readonly [Uint32, 1 | 'hello' | true])[]>(
        '=',
      );
      expect(entries).toStrictEqual([
        [0, 1],
        [1, 'hello'],
        [2, true],
      ]);
    });
  });

  describe('values', () => {
    test('should return copy of array values', () => {
      const numbers = [1, 2, 3];
      const values = Array.from(Arr.values(numbers));
      expect(values).toStrictEqual([1, 2, 3]);
      expect(values).not.toBe(numbers); // Should be a copy
    });

    test('should work with tuples', () => {
      const tuple = ['a', 'b', 'c'] as const;
      const values = Array.from(Arr.values(tuple));
      expectType<typeof values, ('a' | 'b' | 'c')[]>('=');
      expect(values).toStrictEqual(['a', 'b', 'c']);
    });

    test('should work with empty array', () => {
      const empty: number[] = [];
      const values = Array.from(Arr.values(empty));
      expect(values).toStrictEqual([]);
    });

    test('should preserve mixed types', () => {
      const mixed = [1, 'hello', null] as const;
      const values = Array.from(Arr.values(mixed));
      expectType<typeof values, (1 | 'hello' | null)[]>('=');
      expect(values).toStrictEqual([1, 'hello', null]);
    });
  });

  describe('indices', () => {
    test('should return array of indices', () => {
      const fruits = ['apple', 'banana', 'cherry'];
      const indices = Array.from(Arr.indices(fruits));
      expect(indices).toStrictEqual([0, 1, 2]);
    });

    test('should work with tuples', () => {
      const tuple = ['a', 'b'] as const;
      const indices = Array.from(Arr.indices(tuple));
      expectType<typeof indices, Uint32[]>('=');
      expect(indices).toStrictEqual([0, 1]);
    });

    test('should work with empty array', () => {
      const empty: string[] = [];
      const indices = Array.from(Arr.indices(empty));
      expect(indices).toStrictEqual([]);
    });

    test('should work with larger arrays', () => {
      const large = Array.from({ length: 5 }, () => 'x');
      const indices = Array.from(Arr.indices(large));
      expect(indices).toStrictEqual([0, 1, 2, 3, 4]);
    });
  });

  describe('findLast', () => {
    test('should find last element matching predicate', () => {
      const numbers = [1, 2, 3, 4, 5];
      const lastEven = Arr.findLast(numbers, (n) => n % 2 === 0);
      expect(Optional.isSome(lastEven)).toBe(true);
      expect(Optional.unwrap(lastEven)).toBe(4);
    });

    test('should return None when no element matches', () => {
      const odds = [1, 3, 5];
      const lastEven = Arr.findLast(odds, (n) => n % 2 === 0);
      expect(Optional.isNone(lastEven)).toBe(true);
    });

    test('should work with curried version', () => {
      const isPositive = (n: number): boolean => n > 0;
      const findLastPositive = Arr.findLast(isPositive);
      const result = findLastPositive([-1, 2, -3, 4]);
      expect(Optional.isSome(result)).toBe(true);
      expect(Optional.unwrap(result)).toBe(4);
    });

    test('should work with empty array', () => {
      const empty: number[] = [];
      const result = Arr.findLast(empty, (n) => n > 0);
      expect(Optional.isNone(result)).toBe(true);
    });

    test('should pass index and array to predicate', () => {
      const numbers = [10, 20, 30, 40];
      const lastWithIndex2 = Arr.findLast(numbers, (_, idx, arr) => {
        expect(arr).toBe(numbers);
        return idx === 2;
      });
      expect(Optional.unwrap(lastWithIndex2)).toBe(30);
    });

    test('should find last occurrence', () => {
      const numbers = [1, 2, 2, 3, 2, 4];
      const lastTwo = Arr.findLast(numbers, (n) => n === 2);
      expect(Optional.unwrap(lastTwo)).toBe(2);

      // Verify it's actually the last occurrence by checking behavior
      const index = numbers.lastIndexOf(2);
      expect(index).toBe(4); // Last 2 is at index 4
    });
  });

  describe('findLastIndex', () => {
    test('should find last index matching predicate', () => {
      const numbers = [1, 2, 3, 4, 2, 5];
      const lastTwoIndex = Arr.findLastIndex(numbers, (n) => n === 2);
      expect(lastTwoIndex).toBe(4);
    });

    test('should return -1 when no element matches', () => {
      const odds = [1, 3, 5];
      const lastEvenIndex = Arr.findLastIndex(odds, (n) => n % 2 === 0);
      expect(lastEvenIndex).toBe(-1);
    });

    test('should work with curried version', () => {
      const isPositive = (n: number): boolean => n > 0;
      const findLastPositiveIndex = Arr.findLastIndex(isPositive);
      const result = findLastPositiveIndex([-1, 2, -3, 4, -5]);
      expect(result).toBe(3); // index of last positive number (4)
    });

    test('should work with empty array', () => {
      const empty: number[] = [];
      const result = Arr.findLastIndex(empty, (n) => n > 0);
      expect(result).toBe(-1);
    });

    test('should pass index and array to predicate', () => {
      const numbers = [10, 20, 30, 40];
      const lastWithIndex2OrHigher = Arr.findLastIndex(
        numbers,
        (_, idx, arr) => {
          expect(arr).toBe(numbers);
          return idx >= 2;
        },
      );
      expect(lastWithIndex2OrHigher).toBe(3); // last index >= 2
    });

    test('should find last occurrence with complex conditions', () => {
      const data = [
        { id: 1, active: true },
        { id: 2, active: false },
        { id: 3, active: true },
        { id: 4, active: false },
        { id: 5, active: true },
      ];
      const lastActiveIndex = Arr.findLastIndex(data, (item) => item.active);
      expect(lastActiveIndex).toBe(4); // last active item
    });

    test('should work with tuples', () => {
      const tuple = [10, 20, 30, 20, 40] as const;
      const lastTwentyIndex = Arr.findLastIndex(tuple, (x) => x === 20);
      expect(lastTwentyIndex).toBe(3); // last occurrence of 20
    });

    test('should search from end to beginning', () => {
      // Verify search order by using side effects
      const numbers = [1, 2, 3, 4, 5];
      const searchOrder: number[] = [];

      Arr.findLastIndex(numbers, (val, idx) => {
        searchOrder.push(idx);
        return val === 3;
      });

      // Should search from end: 4, 3, 2 (stops at 2 when found)
      expect(searchOrder).toStrictEqual([4, 3, 2]);
    });

    test('should handle single element array', () => {
      const single = [42];
      const foundIndex = Arr.findLastIndex(single, (n) => n === 42);
      const notFoundIndex = Arr.findLastIndex(single, (n) => n === 0);

      expect(foundIndex).toBe(0);
      expect(notFoundIndex).toBe(-1);
    });

    test('should work with string arrays', () => {
      const words = ['hello', 'world', 'test', 'hello', 'end'];
      const lastHelloIndex = Arr.findLastIndex(
        words,
        (word) => word === 'hello',
      );
      expect(lastHelloIndex).toBe(3);
    });
  });

  describe('flat', () => {
    test('should flatten nested arrays with default depth 1', () => {
      const nested = [
        [1, 2],
        [3, 4],
        [5, 6],
      ];
      const flattened = Arr.flat(nested);
      expect(flattened).toStrictEqual([1, 2, 3, 4, 5, 6]);
    });

    test('should flatten with specified depth', () => {
      const deepNested = [1, [2, [3, 4]], 5];
      const flat1 = Arr.flat(deepNested, 1);
      const flat2 = Arr.flat(deepNested, 2);
      expect(flat1).toStrictEqual([1, 2, [3, 4], 5]);
      expect(flat2).toStrictEqual([1, 2, 3, 4, 5]);
    });

    test('should work with curried version', () => {
      const flattenOnce = Arr.flat(1);
      const result = flattenOnce([
        [1, 2],
        [3, 4],
      ]);
      expect(result).toStrictEqual([1, 2, 3, 4]);
    });

    test('should work with empty arrays', () => {
      const withEmpties = [[1], [], [2, 3]];
      const flattened = Arr.flat(withEmpties);
      expect(flattened).toStrictEqual([1, 2, 3]);
    });

    test('should work with depth 0', () => {
      const nested = [
        [1, 2],
        [3, 4],
      ];
      const unflattened = Arr.flat(nested, 0);
      expect(unflattened).toStrictEqual([
        [1, 2],
        [3, 4],
      ]);
    });

    test('should work with infinite depth', () => {
      const veryDeep = [1, [2, [3, [4, [5]]]]];
      const allFlat = Arr.flat(veryDeep, SafeUint.MAX_VALUE);
      expect(allFlat).toStrictEqual([1, 2, 3, 4, 5]);
    });
  });

  describe('flatMap', () => {
    test('should map and flatten results', () => {
      const words = ['hello', 'world'];
      const chars = Arr.flatMap(words, (word) => word.split(''));
      expect(chars).toStrictEqual([
        'h',
        'e',
        'l',
        'l',
        'o',
        'w',
        'o',
        'r',
        'l',
        'd',
      ]);
    });

    test('should work with curried version', () => {
      const splitWords = Arr.flatMap((word: string) => word.split(''));
      const result = splitWords(['foo', 'bar']);
      expect(result).toStrictEqual(['f', 'o', 'o', 'b', 'a', 'r']);
    });

    test('should work with numbers', () => {
      const numbers = [1, 2, 3];
      const doubled = Arr.flatMap(numbers, (n) => [n, n * 2]);
      expect(doubled).toStrictEqual([1, 2, 2, 4, 3, 6]);
    });

    test('should pass index to mapping function', () => {
      const numbers = [10, 20];
      const result = Arr.flatMap(numbers, (n, i) => [n, i]);
      expect(result).toStrictEqual([10, 0, 20, 1]);
    });

    test('should work with empty arrays', () => {
      const empty: string[] = [];
      const result = Arr.flatMap(empty, (s) => s.split(''));
      expect(result).toStrictEqual([]);
    });

    test('should handle mapping to empty arrays', () => {
      const numbers = [1, 2, 3];
      const result = Arr.flatMap(numbers, (n) => (n % 2 === 0 ? [n] : []));
      expect(result).toStrictEqual([2]);
    });

    test('should work with tuples', () => {
      const tuple = [1, 2] as const;
      const result = Arr.flatMap(tuple, (n) => [n, n]);
      expect(result).toStrictEqual([1, 1, 2, 2]);
    });
  });
});

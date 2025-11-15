import { IMap } from '../../collections/index.mjs';
import { expectType } from '../../expect-type.mjs';
import { Optional } from '../../functional/index.mjs';
import { SafeUint } from '../../number/index.mjs';
import {
  concat,
  filter,
  filterNot,
  flat,
  flatMap,
  groupBy,
  map,
  partition,
  scan,
  toReversed,
  toSorted,
  toSortedBy,
  uniq,
  uniqBy,
  zip,
} from './array-utils-transformation.mjs';

describe('Arr transformations', () => {
  describe(map, () => {
    const mapped = map([1, 2, 3], (x, i): number => x ** 2 * i);

    expectType<typeof mapped, ArrayOfLength<3, number>>('=');

    test('case 1', () => {
      assert.deepStrictEqual(mapped, [0, 4, 18]);
    });

    test('should work with empty tuple', () => {
      const empty = [] as const;

      const mappedEmpty = map(empty, (x) => String(x));

      expectType<typeof mappedEmpty, readonly []>('=');

      assert.deepStrictEqual(mappedEmpty, []);
    });

    test('should preserve tuple length with different types', () => {
      const mixed = [1, 'hello', true] as const;

      const mappedMixed = map(mixed, (x) => typeof x);

      expectType<typeof mappedMixed, readonly [string, string, string]>('<=');

      assert.deepStrictEqual(mappedMixed, ['number', 'string', 'boolean']);
    });

    test('should work with index parameter', () => {
      const tuple = ['a', 'b', 'c'] as const;

      const mappedWithIndex = map(tuple, (x, i) => `${i}:${x}`);

      expectType<typeof mappedWithIndex, readonly [string, string, string]>(
        '<=',
      );

      assert.deepStrictEqual(mappedWithIndex, ['0:a', '1:b', '2:c']);
    });
  });

  describe(scan, () => {
    test('should compute running sum', () => {
      const numbers = [1, 2, 3, 4];

      const runningSum = scan(numbers, (acc, curr) => acc + curr, 0);

      expectType<typeof runningSum, readonly [number, ...number[]]>('<=');

      assert.deepStrictEqual(runningSum, [0, 1, 3, 6, 10]);
    });

    test('should include initial value as first element', () => {
      const numbers = [10, 20, 30];

      const result = scan(numbers, (acc, curr) => acc + curr, 100);

      assert.deepStrictEqual(result, [100, 110, 130, 160]);

      expect(result).toHaveLength(4); // original length + 1
    });

    test('should work with curried version', () => {
      const scanSum = scan<number, number>((acc, curr) => acc + curr, 0);

      const result1 = scanSum([1, 2, 3]);

      const result2 = scanSum([5, 10]);

      assert.deepStrictEqual(result1, [0, 1, 3, 6]);

      assert.deepStrictEqual(result2, [0, 5, 15]);
    });

    test('should provide index to reducer', () => {
      const numbers = [10, 20, 30];

      const mut_indices: number[] = [];

      scan(
        numbers,
        (acc, curr, index) => {
          mut_indices.push(index);

          return acc + curr;
        },
        0,
      );

      assert.deepStrictEqual(mut_indices, [0, 1, 2]);
    });

    test('should work with empty array', () => {
      const empty: readonly number[] = [];

      const result = scan(empty, (acc, curr) => acc + curr, 42);

      assert.deepStrictEqual(result, [42]);
    });

    test('should work with different accumulator and element types', () => {
      const strings = ['a', 'b', 'c'];

      const result = scan(strings, (acc, curr) => acc + curr.length, 0);

      expectType<typeof result, readonly [number, ...number[]]>('<=');

      assert.deepStrictEqual(result, [0, 1, 2, 3]);
    });

    test('should compute running product', () => {
      const numbers = [2, 3, 4];

      const runningProduct = scan(numbers, (acc, curr) => acc * curr, 1);

      assert.deepStrictEqual(runningProduct, [1, 2, 6, 24]);
    });

    test('should work with objects', () => {
      const items = [{ value: 10 }, { value: 20 }, { value: 30 }] as const;

      const result = scan(items, (acc, curr) => acc + curr.value, 0);

      assert.deepStrictEqual(result, [0, 10, 30, 60]);
    });

    test('should preserve all intermediate values', () => {
      const numbers = [1, 2, 3];

      const result = scan(numbers, (acc, curr) => acc - curr, 10);

      // 10 -> 10-1=9 -> 9-2=7 -> 7-3=4
      assert.deepStrictEqual(result, [10, 9, 7, 4]);
    });
  });

  describe(toReversed, () => {
    {
      const xs = [1, 2, 3] as const;

      const _nativeResult = xs.toReversed();

      expectType<typeof _nativeResult, (1 | 2 | 3)[]>('=');

      const result = toReversed([1, 2, 3]);

      expectType<typeof result, readonly [3, 2, 1]>('=');

      test('case 1', () => {
        assert.deepStrictEqual(result, [3, 2, 1]);
      });
    }

    test('should work with empty tuple', () => {
      const empty = [] as const;

      const reversed = toReversed(empty);

      expectType<typeof reversed, readonly []>('=');

      assert.deepStrictEqual(reversed, []);
    });

    test('should work with single element', () => {
      const single = [42] as const;

      const reversed = toReversed(single);

      expectType<typeof reversed, readonly [42]>('=');

      assert.deepStrictEqual(reversed, [42]);
    });

    test('should preserve mixed types in reverse order', () => {
      const mixed = [1, 'hello', true, null] as const;

      const reversed = toReversed(mixed);

      expectType<typeof reversed, readonly [null, true, 'hello', 1]>('=');

      assert.deepStrictEqual(reversed, [null, true, 'hello', 1]);
    });
  });

  describe(toSorted, () => {
    {
      const xs = [2, 1, 3] as const;

      const result = toSorted(xs);

      expectType<typeof result, ArrayOfLength<3, 1 | 2 | 3>>('=');

      test('case 1', () => {
        assert.deepStrictEqual(result, [1, 2, 3]);
      });
    }

    {
      const xs = [2, 1, 3] as const;

      const result = toSorted(xs, (a, b) => a - b);

      expectType<typeof result, ArrayOfLength<3, 1 | 2 | 3>>('=');

      test('case 2', () => {
        assert.deepStrictEqual(result, [1, 2, 3]);
      });
    }

    {
      const xs = [2, 1, 3] as const;

      const result = toSorted(xs, (a, b) => b - a);

      expectType<typeof result, ArrayOfLength<3, 1 | 2 | 3>>('=');

      test('case 3', () => {
        assert.deepStrictEqual(result, [3, 2, 1]);
      });
    }
  });

  describe(toSortedBy, () => {
    {
      const xs = [{ v: 2 }, { v: 1 }, { v: 3 }] as const;

      const sorted = toSortedBy(xs, (x) => x.v);

      expectType<
        typeof sorted,
        ArrayOfLength<3, Readonly<{ v: 1 } | { v: 2 } | { v: 3 }>>
      >('=');

      test('case 1', () => {
        assert.deepStrictEqual(sorted, [{ v: 1 }, { v: 2 }, { v: 3 }]);
      });
    }

    {
      const xs = [{ v: 2 }, { v: 1 }, { v: 3 }] as const;

      const sorted = toSortedBy(
        xs,
        (x) => x.v,
        (a, b) => a - b,
      );

      expectType<
        typeof sorted,
        ArrayOfLength<3, Readonly<{ v: 1 } | { v: 2 } | { v: 3 }>>
      >('=');

      test('case 2', () => {
        assert.deepStrictEqual(sorted, [{ v: 1 }, { v: 2 }, { v: 3 }]);
      });
    }

    test('should sort by key function', () => {
      const people = [
        { name: 'Alice', age: 30 },
        { name: 'Bob', age: 20 },
        { name: 'Charlie', age: 25 },
      ];

      const result = toSortedBy(people, (person) => person.age);

      expect(result).toHaveLength(3);

      expect(result[0]?.name).toBe('Bob');

      expect(result[1]?.name).toBe('Charlie');

      expect(result[2]?.name).toBe('Alice');
    });

    test('should work with string sorting', () => {
      const words = ['banana', 'apple', 'cherry'];

      const result = toSortedBy(
        words,
        (word: string) => word,
        (a: string, b: string) => a.localeCompare(b),
      );

      assert.deepStrictEqual(result, ['apple', 'banana', 'cherry']);
    });

    test('should work with custom key extraction', () => {
      const items = ['hello', 'hi', 'welcome', 'bye'];

      const result = toSortedBy(items, (item) => item.length);

      assert.deepStrictEqual(result, ['hi', 'bye', 'hello', 'welcome']);
    });

    test('should work with empty array', () => {
      const empty: readonly { value: number }[] = [];

      const result = toSortedBy(empty, (item) => item.value);

      assert.deepStrictEqual(result, []);
    });

    test('toSortedBy should work with empty array', () => {
      const empty: readonly { value: number }[] = [];

      const result = toSortedBy(empty, (item) => item.value);

      assert.deepStrictEqual(result, []);
    });
  });

  describe(filter, () => {
    test('should filter array with predicate', () => {
      const numbers = [1, 2, 3, 4, 5];

      const evens = filter(numbers, (n) => n % 2 === 0);

      assert.deepStrictEqual(evens, [2, 4]);
    });

    test('should work with type guards', () => {
      const mixed: (string | number | null)[] = [
        'hello',
        42,
        null,
        'world',
        123,
      ];

      const strings = filter(mixed, (x): x is string => typeof x === 'string');

      expectType<typeof strings, readonly string[]>('=');

      assert.deepStrictEqual(strings, ['hello', 'world']);
    });

    test('should work with curried version', () => {
      const isPositive = (n: number): boolean => n > 0;

      const filterPositive = filter(isPositive);

      const result = filterPositive([-1, 2, -3, 4]);

      assert.deepStrictEqual(result, [2, 4]);
    });

    test('should work with curried type guards', () => {
      const isString = (x: unknown): x is string => typeof x === 'string';

      const filterStrings = filter(isString);

      const result = filterStrings(['a', 1, 'b', 2]);

      expectType<typeof result, readonly string[]>('=');

      assert.deepStrictEqual(result, ['a', 'b']);
    });

    test('should preserve array type with generic predicate', () => {
      const tuple = [1, 2, 3] as const;

      const filtered = filter(tuple, (x) => x > 1);

      expectType<typeof filtered, readonly (1 | 2 | 3)[]>('=');

      assert.deepStrictEqual(filtered, [2, 3]);
    });

    test('should work with empty array', () => {
      const empty: number[] = [];

      const result = filter(empty, (n) => n > 0);

      assert.deepStrictEqual(result, []);
    });

    test('should pass index to predicate', () => {
      const numbers = [10, 20, 30, 40];

      const evenIndexes = filter(numbers, (_, i) => i % 2 === 0);

      assert.deepStrictEqual(evenIndexes, [10, 30]);
    });
  });

  describe(filterNot, () => {
    const xs = [1, 2, 3] as const;

    const filtered = filterNot(xs, (x) => x % 2 === 0);

    expectType<typeof filtered, readonly (1 | 2 | 3)[]>('=');

    test('case 1', () => {
      assert.deepStrictEqual(filtered, [1, 3]);
    });
  });

  describe(uniq, () => {
    test('should remove duplicate primitives', () => {
      const array = [1, 2, 2, 3, 1, 4, 3];

      const result = uniq(array);

      assert.deepStrictEqual(result, [1, 2, 3, 4]);
    });

    test('should work with strings', () => {
      const array = ['a', 'b', 'a', 'c', 'b'];

      const result = uniq(array);

      assert.deepStrictEqual(result, ['a', 'b', 'c']);
    });

    test('should work with empty array', () => {
      const array: readonly number[] = [];

      const result = uniq(array);

      assert.deepStrictEqual(result, []);
    });

    test('should preserve order of first occurrence', () => {
      const array = [3, 1, 2, 1, 3, 2];

      const result = uniq(array);

      assert.deepStrictEqual(result, [3, 1, 2]);
    });
  });

  describe(uniqBy, () => {
    test('should remove duplicates based on key function', () => {
      const array = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
        { id: 1, name: 'Alice Duplicate' },
        { id: 3, name: 'Charlie' },
      ];

      const result = uniqBy(array, (item) => item.id);

      expect(result).toHaveLength(3);

      assert.deepStrictEqual(result[0], { id: 1, name: 'Alice' });

      assert.deepStrictEqual(result[1], { id: 2, name: 'Bob' });

      assert.deepStrictEqual(result[2], { id: 3, name: 'Charlie' });
    });

    test('should work with string key function', () => {
      const words = ['hello', 'world', 'hi', 'welcome'];

      const result = uniqBy(words, (word) => word.length);

      expect(result).toHaveLength(3);

      expect(result).toContain('hello'); // length 5

      expect(result).toContain('hi'); // length 2

      expect(result).toContain('welcome'); // length 7
    });

    test('should work with empty array', () => {
      const empty: readonly { id: number }[] = [];

      const result = uniqBy(empty, (item) => item.id);

      assert.deepStrictEqual(result, []);
    });
  });

  describe(flat, () => {
    test('should flatten nested arrays with default depth 1', () => {
      const nested = [
        [1, 2],
        [3, 4],
        [5, 6],
      ];

      const flattened = flat(nested);

      assert.deepStrictEqual(flattened, [1, 2, 3, 4, 5, 6]);
    });

    test('should flatten with specified depth', () => {
      const deepNested = [1, [2, [3, 4]], 5];

      const flat1 = flat(deepNested, 1);

      const flat2 = flat(deepNested, 2);

      assert.deepStrictEqual(flat1, [1, 2, [3, 4], 5]);

      assert.deepStrictEqual(flat2, [1, 2, 3, 4, 5]);
    });

    test('should work with curried version', () => {
      const flattenOnce = flat();

      const result = flattenOnce([
        [1, 2],
        [3, 4],
      ]);

      assert.deepStrictEqual(result, [1, 2, 3, 4]);
    });

    test('should work with empty arrays', () => {
      const withEmpties = [[1], [], [2, 3]];

      const flattened = flat(withEmpties);

      assert.deepStrictEqual(flattened, [1, 2, 3]);
    });

    test('should work with depth 0', () => {
      const nested = [
        [1, 2],
        [3, 4],
      ];

      const unflattened = flat(nested, 0);

      assert.deepStrictEqual(unflattened, [
        [1, 2],
        [3, 4],
      ]);
    });

    test('should work with infinite depth', () => {
      const veryDeep = [1, [2, [3, [4, [5]]]]];

      const allFlat = flat(veryDeep, SafeUint.MAX_VALUE);

      assert.deepStrictEqual(allFlat, [1, 2, 3, 4, 5]);
    });
  });

  describe(flatMap, () => {
    test('should map and flatten results', () => {
      const words = ['hello', 'world'];

      const chars = flatMap(words, (word) => word.split(''));

      assert.deepStrictEqual(chars, [
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
      const splitWords = flatMap((word: string) => word.split(''));

      const result = splitWords(['foo', 'bar']);

      assert.deepStrictEqual(result, ['f', 'o', 'o', 'b', 'a', 'r']);
    });

    test('should work with numbers', () => {
      const numbers = [1, 2, 3];

      const doubled = flatMap(numbers, (n) => [n, n * 2]);

      assert.deepStrictEqual(doubled, [1, 2, 2, 4, 3, 6]);
    });

    test('should pass index to mapping function', () => {
      const numbers = [10, 20];

      const result = flatMap(numbers, (n, i) => [n, i]);

      assert.deepStrictEqual(result, [10, 0, 20, 1]);
    });

    test('should work with empty arrays', () => {
      const empty: string[] = [];

      const result = flatMap(empty, (s) => s.split(''));

      assert.deepStrictEqual(result, []);
    });

    test('should handle mapping to empty arrays', () => {
      const numbers = [1, 2, 3];

      const result = flatMap(numbers, (n) => (n % 2 === 0 ? [n] : []));

      assert.deepStrictEqual(result, [2]);
    });

    test('should work with tuples', () => {
      const tuple = [1, 2] as const;

      const result = flatMap(tuple, (n) => [n, n]);

      assert.deepStrictEqual(result, [1, 1, 2, 2]);
    });
  });

  describe(partition, () => {
    const xs = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

    {
      const result = partition(xs, 4);

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
        assert.deepStrictEqual(result, [
          [1, 2, 3, 4],
          [5, 6, 7, 8],
          [9, 10, 11, 12],
        ]);
      });
    }

    {
      const result = partition(xs, 3);

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
        assert.deepStrictEqual(result, [
          [1, 2, 3],
          [4, 5, 6],
          [7, 8, 9],
          [10, 11, 12],
        ]);
      });
    }

    {
      const result = partition(xs, 5);

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
        assert.deepStrictEqual(result, [
          [1, 2, 3, 4, 5],
          [6, 7, 8, 9, 10],
          [11, 12],
        ]);
      });
    }

    test('should partition array into chunks', () => {
      const numbers = [1, 2, 3, 4, 5, 6];

      const result = partition(numbers, 2);

      assert.deepStrictEqual(result, [
        [1, 2],
        [3, 4],
        [5, 6],
      ]);
    });

    test('should handle arrays not evenly divisible by chunk size', () => {
      const numbers = [1, 2, 3, 4, 5];

      const result = partition(numbers, 2);

      assert.deepStrictEqual(result, [[1, 2], [3, 4], [5]]);
    });

    test('should work with chunk size < 2 (returns empty)', () => {
      const numbers = [1, 2, 3];

      const result = partition(numbers, 1);

      // According to docs, returns empty array if chunkSize < 2
      assert.deepStrictEqual(result, []);
    });

    test('should work with chunk size larger than array', () => {
      const numbers = [1, 2];

      const result = partition(numbers, 5);

      assert.deepStrictEqual(result, [[1, 2]]);
    });

    test('partition should work with empty array', () => {
      const empty: readonly number[] = [];

      const result = partition(empty, 2);

      assert.deepStrictEqual(result, []);
    });
  });

  describe(concat, () => {
    const xs = [1, 2, 3] as const;

    const ys = [4, 5] as const;

    const result = concat(xs, ys);

    expectType<typeof result, readonly [1, 2, 3, 4, 5]>('=');

    test('case 1', () => {
      assert.deepStrictEqual(result, [1, 2, 3, 4, 5]);
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

  describe(groupBy, () => {
    const xs = [
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 3, y: 1 },
      { x: 1, y: 2 },
      { x: 2, y: 2 },
      { x: 1, y: 3 },
    ] as const;

    const result = groupBy(xs, (a) => a.x);

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
      assert.deepStrictEqual(
        result,
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

      const grouped = groupBy(array, (item) => item.type);

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

      const grouped = groupBy(numbers, (n) => n % 2);

      expect(grouped.size).toBe(2);

      const evens = grouped.get(0);

      const odds = grouped.get(1);

      if (Optional.isSome(evens)) {
        assert.deepStrictEqual(evens.value, [2, 4, 6]);
      }

      if (Optional.isSome(odds)) {
        assert.deepStrictEqual(odds.value, [1, 3, 5]);
      }
    });

    test('should work with empty array', () => {
      const empty: readonly number[] = [];

      const grouped = groupBy(empty, (n) => n % 2);

      expect(grouped.size).toBe(0);
    });

    test('should handle all elements in same group', () => {
      const array = [1, 2, 3, 4];

      const grouped = groupBy(array, () => 'all');

      expect(grouped.size).toBe(1);

      const all = grouped.get('all');

      if (Optional.isSome(all)) {
        assert.deepStrictEqual(all.value, [1, 2, 3, 4]);
      }
    });
  });

  describe(zip, () => {
    {
      const xs = [1, 2, 3] as const;

      const ys = [4, 5, 6] as const;

      const zipped = zip(xs, ys);

      expectType<
        typeof zipped,
        readonly [readonly [1, 4], readonly [2, 5], readonly [3, 6]]
      >('=');

      test('case 1', () => {
        assert.deepStrictEqual(zipped, [
          [1, 4],
          [2, 5],
          [3, 6],
        ]);
      });
    }

    {
      const xs: readonly number[] = [1, 2, 3];

      const ys: readonly number[] = [4];

      const zipped = zip(xs, ys);

      expectType<typeof zipped, readonly (readonly [number, number])[]>('=');

      test('case 2', () => {
        assert.deepStrictEqual(zipped, [[1, 4]]);
      });
    }

    {
      const xs = [1] as const;

      const ys: readonly number[] = [4, 5, 6];

      const zipped = zip(xs, ys);

      expectType<typeof zipped, readonly [readonly [1, number]]>('=');

      test('case 3', () => {
        assert.deepStrictEqual(zipped, [[1, 4]]);
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

      const result = zip(arr1, arr2);

      assert.deepStrictEqual(result, [
        [1, 'a'],
        [2, 'b'],
        [3, 'c'],
      ]);
    });

    test('should handle arrays of different lengths', () => {
      const arr1 = [1, 2, 3, 4];

      const arr2 = ['a', 'b'];

      const result = zip(arr1, arr2);

      assert.deepStrictEqual(result, [
        [1, 'a'],
        [2, 'b'],
      ]);
    });

    test('should work with empty arrays', () => {
      const arr1: readonly number[] = [];

      const arr2: readonly string[] = [];

      const result = zip(arr1, arr2);

      assert.deepStrictEqual(result, []);
    });

    test('should handle one empty array', () => {
      const arr1 = [1, 2, 3];

      const arr2: readonly string[] = [];

      const result = zip(arr1, arr2);

      assert.deepStrictEqual(result, []);
    });
  });
});

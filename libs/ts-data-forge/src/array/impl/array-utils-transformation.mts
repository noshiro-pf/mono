import { IMap } from '../../collections/index.mjs';
import { expectType } from '../../expect-type.mjs';
import { asPositiveUint32, asUint32, Uint32 } from '../../number/index.mjs';
import { castMutable, tp } from '../../others/index.mjs';
import { newArray, seq } from './array-utils-creation.mjs';
import { size } from './array-utils-size.mjs';

/**
 * Creates a new array by transforming each element with a mapping function.
 *
 * @example
 *
 * ```ts
 * const numbers = [1, 2, 3] as const;
 *
 * const doubled = Arr.map(numbers, (value) => value * 2);
 *
 * const indexed = Arr.map<number, string>((value, index) => `${index}:${value}`)(
 *   numbers,
 * );
 *
 * assert.deepStrictEqual(doubled, [2, 4, 6]);
 *
 * assert.deepStrictEqual(indexed, ['0:1', '1:2', '2:3']);
 * ```
 */
export function map<const Ar extends readonly unknown[], B>(
  array: Ar,
  mapFn: (a: Ar[number], index: ArrayIndex<Ar>) => B,
): Readonly<{ [K in keyof Ar]: B }>;

// curried version
export function map<A, B>(
  mapFn: (a: A, index: SizeType.Arr) => B,
): <const Ar extends readonly A[]>(
  array: Ar,
) => Readonly<{ [K in keyof Ar]: B }>;

export function map<A, B>(
  ...args:
    | readonly [array: readonly A[], mapFn: (a: A, index: SizeType.Arr) => B]
    | readonly [mapFn: (a: A, index: SizeType.Arr) => B]
): readonly B[] | ((array: readonly A[]) => readonly B[]) {
  switch (args.length) {
    case 2: {
      const [array, mapFn] = args;

      // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      return array.map(mapFn as never);
    }

    case 1: {
      const [mapFn] = args;

      return (array: readonly A[]) => map(array, mapFn);
    }
  }
}

/**
 * Returns an array of successively reduced values from an array.
 *
 * @example
 *
 * ```ts
 * const changes = [5, -2, 3] as const;
 *
 * const runningTotals = Arr.scan(changes, (total, change) => total + change, 0);
 *
 * const runningTotalsFromCurried = Arr.scan(
 *   (total: number, change: number) => total + change,
 *   10,
 * )([-5, 15]);
 *
 * const expectedTotals = [0, 5, 3, 6] as const;
 *
 * const expectedCurriedTotals = [10, 5, 20] as const;
 *
 * assert.deepStrictEqual(runningTotals, expectedTotals);
 *
 * assert.deepStrictEqual(runningTotalsFromCurried, expectedCurriedTotals);
 * ```
 */
export function scan<const Ar extends readonly unknown[], S>(
  array: Ar,
  reducer: (
    accumulator: S,
    currentValue: Ar[number],
    currentIndex: ArrayIndex<Ar>,
  ) => S,
  init: S,
): NonEmptyArray<S>;

export function scan<E, S>(
  reducer: (accumulator: S, currentValue: E, currentIndex: SizeType.Arr) => S,
  init: S,
): (array: readonly E[]) => NonEmptyArray<S>;

export function scan<E, S>(
  ...args:
    | readonly [
        array: readonly E[],
        reducer: (
          accumulator: S,
          currentValue: E,
          currentIndex: SizeType.Arr,
        ) => S,
        init: S,
      ]
    | readonly [
        reducer: (
          accumulator: S,
          currentValue: E,
          currentIndex: SizeType.Arr,
        ) => S,
        init: S,
      ]
): NonEmptyArray<S> | ((array: readonly E[]) => NonEmptyArray<S>) {
  switch (args.length) {
    case 3: {
      const [array, reducer, init] = args;

      const mut_result: MutableNonEmptyArray<S> = castMutable(
        newArray<S, PositiveUint32>(asPositiveUint32(array.length + 1), init),
      );

      let mut_acc = init;

      for (const [index, value] of array.entries()) {
        mut_acc = reducer(mut_acc, value, asUint32(index));

        mut_result[index + 1] = mut_acc;
      }

      return mut_result;
    }

    case 2: {
      const [reducer, init] = args;

      return (array) => scan(array, reducer, init);
    }
  }
}

/**
 * Reverses an array.
 *
 * @example
 *
 * ```ts
 * const tuple = [1, 'two', true] as const;
 *
 * const reversed = Arr.toReversed(tuple);
 *
 * const expected = [true, 'two', 1] as const;
 *
 * assert.deepStrictEqual(reversed, expected);
 * ```
 */
export const toReversed = <const Ar extends readonly unknown[]>(
  array: Ar,
): List.Reverse<Ar> =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  array.toReversed() as never;

/**
 * Sorts an array.
 *
 * @example
 *
 * ```ts
 * const numbers = [3, 1, 2] as const;
 *
 * const words = ['banana', 'apple', 'cherry'] as const;
 *
 * const ascendingNumbers = Arr.toSorted(numbers);
 *
 * const alphabetical = Arr.toSorted(words, (left, right) =>
 *   left.localeCompare(right),
 * );
 *
 * const expectedNumbers = [1, 2, 3] as const;
 *
 * const expectedWords = ['apple', 'banana', 'cherry'] as const;
 *
 * assert.deepStrictEqual(ascendingNumbers, expectedNumbers);
 *
 * assert.deepStrictEqual(alphabetical, expectedWords);
 * ```
 */
export const toSorted = <const Ar extends readonly unknown[]>(
  ...[array, comparator]: Ar extends readonly number[]
    ? readonly [
        array: Ar,
        // If the array elements are mapped to numbers, comparator is optional.
        comparator?: (x: Ar[number], y: Ar[number]) => number,
      ]
    : readonly [array: Ar, comparator: (x: Ar[number], y: Ar[number]) => number]
): IsFixedLengthList<Ar> extends true
  ? ArrayOfLength<Ar['length'], Ar[number]>
  : Ar extends NonEmptyArray<unknown>
    ? NonEmptyArray<Ar[number]>
    : readonly Ar[number][] =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  array.toSorted(
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    (comparator as ((x: unknown, y: unknown) => number) | undefined) ??
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      ((x, y) => (x as number) - (y as number)),
  ) as never;

/**
 * Sorts an array by a mapped value.
 *
 * @example
 *
 * ```ts
 * const projects = [
 *   { name: 'compiler', issues: 7 },
 *   { name: 'docs', issues: 2 },
 *   { name: 'ui', issues: 5 },
 * ] as const;
 *
 * const byIssueCount = Arr.toSortedBy(projects, (project) => project.issues);
 *
 * const byIssueCountDescending = Arr.toSortedBy(
 *   projects,
 *   (project) => project.issues,
 *   (left, right) => right - left,
 * );
 *
 * const expectedByIssues = [
 *   { name: 'docs', issues: 2 },
 *   { name: 'ui', issues: 5 },
 *   { name: 'compiler', issues: 7 },
 * ] as const;
 *
 * const expectedByIssueCountDescending = [
 *   { name: 'compiler', issues: 7 },
 *   { name: 'ui', issues: 5 },
 *   { name: 'docs', issues: 2 },
 * ] as const;
 *
 * assert.deepStrictEqual(byIssueCount, expectedByIssues);
 *
 * assert.deepStrictEqual(byIssueCountDescending, expectedByIssueCountDescending);
 * ```
 */
export function toSortedBy<const Ar extends readonly unknown[]>(
  array: Ar,
  comparatorValueMapper: (value: Ar[number]) => number,
  // If the array elements are mapped to numbers, comparator is optional.
  comparator?: (x: number, y: number) => number,
): IsFixedLengthList<Ar> extends true
  ? ArrayOfLength<Ar['length'], Ar[number]>
  : Ar extends NonEmptyArray<unknown>
    ? NonEmptyArray<Ar[number]>
    : readonly Ar[number][];

export function toSortedBy<const Ar extends readonly unknown[], const V>(
  array: Ar,
  comparatorValueMapper: (value: Ar[number]) => V,
  comparator: (x: V, y: V) => number,
): IsFixedLengthList<Ar> extends true
  ? ArrayOfLength<Ar['length'], Ar[number]>
  : Ar extends NonEmptyArray<unknown>
    ? NonEmptyArray<Ar[number]>
    : readonly Ar[number][];

export function toSortedBy<E, const V>(
  array: readonly E[],
  comparatorValueMapper: (value: E) => V,
  comparator?: (x: V, y: V) => number,
): readonly E[] {
  return array.toSorted((x, y) =>
    comparator === undefined
      ? // This branch assumes V is number if comparator is undefined.
        // The overloads should handle this, but explicit cast might be needed if V is not number.
        // eslint-disable-next-line total-functions/no-unsafe-type-assertion
        (comparatorValueMapper(x) as number) -
        // eslint-disable-next-line total-functions/no-unsafe-type-assertion
        (comparatorValueMapper(y) as number)
      : comparator(comparatorValueMapper(x), comparatorValueMapper(y)),
  );
}

/**
 * Filters an array based on a predicate function.
 *
 * @example
 *
 * ```ts
 * const numbers = [1, 2, 3, 4] as const;
 *
 * const evens = Arr.filter(numbers, (value) => value % 2 === 0);
 *
 * const greaterThanTwo = Arr.filter<number>((value) => value > 2)(numbers);
 *
 * assert.deepStrictEqual(evens, [2, 4]);
 *
 * assert.deepStrictEqual(greaterThanTwo, [3, 4]);
 * ```
 */
// Type guard overloads
export function filter<
  const Ar extends readonly unknown[],
  S extends Ar[number],
>(
  array: Ar,
  predicate: (a: Ar[number], index: ArrayIndex<Ar>) => a is S,
): readonly S[];

export function filter<E, S extends E>(
  predicate: (a: E, index: SizeType.Arr) => a is S,
): (array: readonly E[]) => readonly S[];

// Regular boolean predicate overloads
export function filter<const Ar extends readonly unknown[]>(
  array: Ar,
  predicate: (a: Ar[number], index: ArrayIndex<Ar>) => boolean,
): readonly Ar[number][];

export function filter<E>(
  predicate: (a: E, index: SizeType.Arr) => boolean,
): (array: readonly E[]) => readonly E[];

export function filter<E>(
  ...args:
    | readonly [
        array: readonly E[],
        predicate: (a: E, index: SizeType.Arr) => boolean,
      ]
    | readonly [predicate: (a: E, index: SizeType.Arr) => boolean]
): readonly E[] | ((array: readonly E[]) => readonly E[]) {
  switch (args.length) {
    case 2: {
      const [array, predicate] = args;

      return array.filter((a, i) => predicate(a, asUint32(i)));
    }

    case 1: {
      const [predicate] = args;

      return (array) => filter(array, predicate);
    }
  }
}

/**
 * Filters an array by excluding elements for which the predicate returns true.
 *
 * @example
 *
 * ```ts
 * const names = ['Ada', 'Grace', 'Linus'] as const;
 *
 * const notAda = Arr.filterNot(names, (name) => name === 'Ada');
 *
 * const notShort = Arr.filterNot<string>((name) => name.length <= 4)(names);
 *
 * assert.deepStrictEqual(notAda, ['Grace', 'Linus']);
 *
 * assert.deepStrictEqual(notShort, ['Grace', 'Linus']);
 * ```
 */
export function filterNot<const Ar extends readonly unknown[]>(
  array: Ar,
  predicate: (a: Ar[number], index: ArrayIndex<Ar>) => boolean,
): readonly Ar[number][];

export function filterNot<E>(
  predicate: (a: E, index: SizeType.Arr) => boolean,
): (array: readonly E[]) => readonly E[];

export function filterNot<E>(
  ...args:
    | readonly [
        array: readonly E[],
        predicate: (a: E, index: SizeType.Arr) => boolean,
      ]
    | readonly [predicate: (a: E, index: SizeType.Arr) => boolean]
): readonly E[] | ((array: readonly E[]) => readonly E[]) {
  switch (args.length) {
    case 2: {
      const [array, predicate] = args;

      return array.filter((a, i) => !predicate(a, asUint32(i)));
    }

    case 1: {
      const [predicate] = args;

      return (array) => filterNot(array, predicate);
    }
  }
}

/**
 * Creates a new array with unique elements.
 *
 * @example
 *
 * ```ts
 * const letters = ['a', 'b', 'a', 'c', 'b'] as const;
 *
 * const uniqueLetters = Arr.uniq(letters);
 *
 * const expected = ['a', 'b', 'c'] as const;
 *
 * assert.deepStrictEqual(uniqueLetters, expected);
 * ```
 */
export const uniq = <const Ar extends readonly Primitive[]>(
  array: Ar,
): Ar extends NonEmptyArray<unknown>
  ? NonEmptyArray<Ar[number]>
  : readonly Ar[number][] =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  Array.from(new Set(array)) as never;

/**
 * Creates a new array with unique elements based on a mapped value.
 *
 * @example
 *
 * ```ts
 * const people = [
 *   { id: 1, name: 'Ada' },
 *   { id: 2, name: 'Brian' },
 *   { id: 1, name: 'Alan' },
 *   { id: 3, name: 'Grace' },
 * ] as const;
 *
 * const uniqueById = Arr.uniqBy(people, (person) => person.id);
 *
 * const expected = [
 *   { id: 1, name: 'Ada' },
 *   { id: 2, name: 'Brian' },
 *   { id: 3, name: 'Grace' },
 * ] as const;
 *
 * assert.deepStrictEqual(uniqueById, expected);
 * ```
 */
export const uniqBy = <
  const Ar extends readonly unknown[],
  P extends Primitive,
>(
  array: Ar,
  mapFn: (value: Ar[number]) => P,
): Ar extends NonEmptyArray<unknown>
  ? NonEmptyArray<Ar[number]>
  : readonly Ar[number][] => {
  const mut_mappedValues = new Set<P>();

  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  return array.filter((val) => {
    const mappedValue = mapFn(val);

    if (mut_mappedValues.has(mappedValue)) return false;

    mut_mappedValues.add(mappedValue);

    return true;
  }) satisfies readonly Ar[number][] as never;
};

/**
 * Flattens nested arrays up to the specified depth.
 *
 * @example
 *
 * ```ts
 * const nested = [
 *   [1, 2],
 *   [3, 4],
 * ] as const;
 *
 * const flatOnce = Arr.flat(nested, 1);
 *
 * const flatCurried = Arr.flat()(nested);
 *
 * assert.deepStrictEqual(flatOnce, [1, 2, 3, 4]);
 *
 * assert.deepStrictEqual(flatCurried, [1, 2, 3, 4]);
 * ```
 */
export function flat<
  const Ar extends readonly unknown[],
  D extends SafeUintWithSmallInt = 1,
>(array: Ar, depth?: D): readonly FlatArray<Ar, D>[];

export function flat<D extends SafeUintWithSmallInt = 1>(
  depth?: number,
): <const Ar extends readonly unknown[]>(
  array: Ar,
) => readonly FlatArray<Ar, D>[];

export function flat<E, D extends SafeUintWithSmallInt = 1>(
  ...args: readonly [array: readonly E[], depth?: D] | readonly [depth?: D]
): readonly unknown[] | ((array: readonly unknown[]) => readonly unknown[]) {
  switch (args.length) {
    case 2: {
      const [array, depth] = args;

      return array.flat(depth);
    }

    case 1: {
      const [arrayOrDepth] = args;

      if (typeof arrayOrDepth === 'number') {
        const depth = arrayOrDepth as SafeUintWithSmallInt | undefined;

        return (array) => flat(array, depth);
      } else if (arrayOrDepth === undefined) {
        return (array) => flat(array, 1);
      } else {
        expectType<typeof arrayOrDepth, readonly E[]>('=');

        return arrayOrDepth.flat();
      }
    }

    case 0:
      return (array) => flat(array, 1);
  }
}

/**
 * Maps each element and flattens the result.
 *
 * @example
 *
 * ```ts
 * const words = ['Ada', 'AI'] as const;
 *
 * const characters = Arr.flatMap(words, (word) => word.split(''));
 *
 * const labeled = Arr.flatMap<string, string>((word, index) =>
 *   word.split('').map((char) => `${index}-${char}`),
 * )(words);
 *
 * assert.deepStrictEqual(characters, ['A', 'd', 'a', 'A', 'I']);
 *
 * assert.deepStrictEqual(labeled, ['0-A', '0-d', '0-a', '1-A', '1-I']);
 * ```
 */
export function flatMap<const Ar extends readonly unknown[], B>(
  array: Ar,
  mapFn: (a: Ar[number], index: ArrayIndex<Ar>) => readonly B[],
): readonly B[];

export function flatMap<A, B>(
  mapFn: (a: A, index: SizeType.Arr) => readonly B[],
): (array: readonly A[]) => readonly B[];

export function flatMap<A, B>(
  ...args:
    | readonly [
        array: readonly A[],
        mapFn: (a: A, index: SizeType.Arr) => readonly B[],
      ]
    | readonly [mapFn: (a: A, index: SizeType.Arr) => readonly B[]]
): readonly B[] | ((array: readonly A[]) => readonly B[]) {
  switch (args.length) {
    case 2: {
      const [array, mapFn] = args;

      return array.flatMap((a, i) => mapFn(a, asUint32(i)));
    }

    case 1: {
      const [mapFn] = args;

      return (array: readonly A[]) => flatMap(array, mapFn);
    }
  }
}

/**
 * Partitions an array into sub-arrays of a specified size.
 *
 * @example
 *
 * ```ts
 * const values = [1, 2, 3, 4, 5] as const;
 *
 * const pairs = Arr.partition(values, 2);
 *
 * const triples = Arr.partition(3)(values);
 *
 * const expectedPairs = [[1, 2], [3, 4], [5]] as const;
 *
 * assert.deepStrictEqual(pairs, expectedPairs);
 *
 * assert.deepStrictEqual(triples, [
 *   [1, 2, 3],
 *   [4, 5],
 * ]);
 *
 * const pairs2 = Arr.chunk([1, 2, 3, 4, 5, 6], 2);
 *
 * assert.deepStrictEqual(pairs2, [
 *   [1, 2],
 *   [3, 4],
 *   [5, 6],
 * ]);
 * ```
 */
export function partition<
  N extends WithSmallInt<PositiveInt & SizeType.Arr>,
  E,
>(array: readonly E[], chunkSize: N): readonly (readonly E[])[];

export function partition<N extends WithSmallInt<PositiveInt & SizeType.Arr>>(
  chunkSize: N,
): <E>(array: readonly E[]) => readonly (readonly E[])[];

export function partition<
  N extends WithSmallInt<PositiveInt & SizeType.Arr>,
  E,
>(
  ...args:
    | readonly [array: readonly E[], chunkSize: N]
    | readonly [chunkSize: N]
):
  | readonly (readonly E[])[]
  | ((array: readonly E[]) => readonly (readonly E[])[]) {
  switch (args.length) {
    case 2: {
      const [array, chunkSize] = args;

      return chunkSize < 2
        ? []
        : // eslint-disable-next-line total-functions/no-partial-division
          seq(asUint32(Math.ceil(array.length / chunkSize))).map((i: Uint32) =>
            array.slice(chunkSize * i, chunkSize * (i + 1)),
          );
    }

    case 1: {
      const [chunkSize] = args;

      return (array) => partition(array, chunkSize);
    }
  }
}

/**
 * Concatenates two arrays.
 *
 * @example
 *
 * ```ts
 * const numbers = [1, 2] as const;
 *
 * const words = ['three', 'four'] as const;
 *
 * const combined = Arr.concat(numbers, words);
 *
 * const expectedCombined = [1, 2, 'three', 'four'] as const;
 *
 * assert.deepStrictEqual(combined, expectedCombined);
 * ```
 */
export const concat = <
  const Ar1 extends readonly unknown[],
  const Ar2 extends readonly unknown[],
>(
  array1: Ar1,
  array2: Ar2,
): readonly [...Ar1, ...Ar2] => [...array1, ...array2];

/**
 * Groups elements by a key derived from each element.
 *
 * @example
 *
 * ```ts
 * const animals = ['ant', 'bat', 'cat', 'dove'] as const;
 *
 * const groupedByLength = Arr.groupBy(animals, (animal) => animal.length);
 *
 * const groupedByFirstLetter = Arr.groupBy((animal: string) => animal[0])(
 *   animals,
 * );
 *
 * assert.deepStrictEqual(
 *   groupedByLength.get(3),
 *   Optional.some(['ant', 'bat', 'cat'] as const),
 * );
 *
 * assert.deepStrictEqual(
 *   groupedByLength.get(4),
 *   Optional.some(['dove'] as const),
 * );
 *
 * assert.deepStrictEqual(groupedByLength.get(5), Optional.none);
 *
 * assert.deepStrictEqual(
 *   groupedByFirstLetter.get('a'),
 *   Optional.some(['ant'] as const),
 * );
 *
 * assert.deepStrictEqual(
 *   groupedByFirstLetter.get('d'),
 *   Optional.some(['dove'] as const),
 * );
 * ```
 */
export function groupBy<
  const Ar extends readonly unknown[],
  G extends MapSetKeyType,
>(
  array: Ar,
  grouper: (value: Ar[number], index: ArrayIndex<Ar>) => G,
): IMap<G, readonly Ar[number][]>;

export function groupBy<E, G extends MapSetKeyType>(
  grouper: (value: E, index: SizeType.Arr) => G,
): (array: readonly E[]) => IMap<G, readonly E[]>;

export function groupBy<E, G extends MapSetKeyType>(
  ...args:
    | readonly [
        array: readonly E[],
        grouper: (value: E, index: SizeType.Arr) => G,
      ]
    | readonly [grouper: (value: E, index: SizeType.Arr) => G]
): IMap<G, readonly E[]> | ((array: readonly E[]) => IMap<G, readonly E[]>) {
  switch (args.length) {
    case 2: {
      const [array, grouper] = args;

      const mut_groups = new Map<G, E[]>(); // Store mutable arrays internally

      for (const [index, e] of array.entries()) {
        const key = grouper(e, asUint32(index)); // Ensure index is treated as SizeType.Arr

        const mut_group = mut_groups.get(key);

        if (mut_group !== undefined) {
          mut_group.push(e);
        } else {
          mut_groups.set(key, [e]);
        }
      }

      // Cast to IMap<G, readonly A[]> for the public interface
      return IMap.create<G, readonly E[]>(mut_groups);
    }

    case 1: {
      const [grouper] = args;

      return (array: readonly E[]) => groupBy(array, grouper);
    }
  }
}

/**
 * Creates an array of tuples by pairing corresponding elements from two arrays.
 *
 * @example
 *
 * ```ts
 * const letters = ['a', 'b', 'c'] as const;
 *
 * const numbers = [1, 2, 3] as const;
 *
 * const pairs = Arr.zip(letters, numbers);
 *
 * const expectedPairs = [
 *   ['a', 1],
 *   ['b', 2],
 *   ['c', 3],
 * ] as const;
 *
 * assert.deepStrictEqual(pairs, expectedPairs);
 * ```
 */
export const zip = <
  const Ar1 extends readonly unknown[],
  const Ar2 extends readonly unknown[],
>(
  array1: Ar1,
  array2: Ar2,
): List.Zip<Ar1, Ar2> =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  seq(Uint32.min(size(array1), size(array2))).map((i: Uint32) =>
    // Non-null assertion is safe here because `i` is always within bounds of both arrays up to the length of the shorter one.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    tp(array1[i]!, array2[i]!),
  ) as unknown as List.Zip<Ar1, Ar2>;

/**
 * Alias for `partition`.
 *
 * @see {@link partition}
 */
export const chunk = partition;

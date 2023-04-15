import { IMap } from '../collections';
import { Result } from '../functional';
import { Num } from '../num';
import { MutableMap, MutableSet, tp } from '../others';

// copied from node_modules/typescript/lib/lib.es2019.array.d.ts and modified
// type FlatArrayDepth =
//   | 0
//   | 1
//   | 2
//   | 3
//   | 4
//   | 5
//   | 6
//   | 7
//   | 8
//   | 9
//   | 10
//   | 11
//   | 12
//   | 13
//   | 14
//   | 15
//   | 16
//   | 17
//   | 18
//   | 19
//   | 20;
// type FlatArrayDepthOption = [
//   -1,
//   0,
//   1,
//   2,
//   3,
//   4,
//   5,
//   6,
//   7,
//   8,
//   9,
//   10,
//   11,
//   12,
//   13,
//   14,
//   15,
//   16,
//   17,
//   18,
//   19,
//   20
// ];
// type ReadonlyFlatArray<Arr, Depth extends FlatArrayDepth> = {
//   done: Arr;
//   recur: Arr extends readonly (infer InnerArr)[]
//     ? FlatArray<InnerArr, FlatArrayDepthOption[Depth]>
//     : Readonly<Arr>;
// }[Depth extends -1 ? 'done' : 'recur'];

// eslint-disable-next-line no-restricted-globals
const ArrayFrom = Array.from;

const isArray = (a: unknown): a is readonly unknown[] =>
  // eslint-disable-next-line no-restricted-globals
  Array.isArray(a);

const isEmpty = <T>(list: readonly T[]): list is readonly [] =>
  list.length === 0;

const isNonEmpty = <T>(list: readonly T[]): list is NonEmptyArray<T> =>
  list.length > 0;

const isArrayOfLength1 = <T>(
  array: readonly T[]
): array is ArrayOfLength<1, T> => array.length === 1;

const isArrayOfLength2 = <T>(
  array: readonly T[]
): array is ArrayOfLength<2, T> => array.length === 2;

const isArrayOfLength3 = <T>(
  array: readonly T[]
): array is ArrayOfLength<3, T> => array.length === 3;

const isArrayOfLength4 = <T>(
  array: readonly T[]
): array is ArrayOfLength<4, T> => array.length === 4;

const isArrayOfLength5 = <T>(
  array: readonly T[]
): array is ArrayOfLength<5, T> => array.length === 5;

const isArrayOfLength6 = <T>(
  array: readonly T[]
): array is ArrayOfLength<6, T> => array.length === 6;

const isArrayOfLength1OrMore = <T>(
  array: readonly T[]
): array is ArrayAtLeastLen<1, T> => array.length >= 1;

const isArrayOfLength2OrMore = <T>(
  array: readonly T[]
): array is ArrayAtLeastLen<2, T> => array.length >= 2;

const isArrayOfLength3OrMore = <T>(
  array: readonly T[]
): array is ArrayAtLeastLen<3, T> => array.length >= 3;

const isArrayOfLength4OrMore = <T>(
  array: readonly T[]
): array is ArrayAtLeastLen<4, T> => array.length >= 4;

const isArrayOfLength5OrMore = <T>(
  array: readonly T[]
): array is ArrayAtLeastLen<5, T> => array.length >= 5;

const isArrayOfLength6OrMore = <T>(
  array: readonly T[]
): array is ArrayAtLeastLen<6, T> => array.length >= 6;

// eslint-disable-next-line @typescript-eslint/no-shadow
const length = <T extends readonly unknown[]>(list: T): Length<T> & number =>
  list.length;

const size = length;

/**
 * Creates an array from an iterable object.
 * @param iterable An iterable object to convert to an array.
 */
const from: <T>(
  iterable: Iterable<T> | Readonly<ArrayLike<T>>
) => readonly T[] = ArrayFrom;

const asMut = <T extends readonly unknown[]>(list: T): Writable<T> =>
  list as Writable<T>;

/**
 * Creates an array from an iterable object.
 * @param iterable An iterable object to convert to an array.
 * @param mapfn A mapping function to call on every element of the array.
 * @param thisArg Value of 'this' used to invoke the mapfn.
 */
const fromMapped: <T, U>(
  iterable: Iterable<T> | Readonly<ArrayLike<T>>,
  mapfn: (v: T, k: number) => U
) => readonly U[] = ArrayFrom;

type Index1000 = Index<1000>;

function zeros<N extends Index1000>(
  len: N
): Result<ArrayOfLength<N, 0>, string>;
function zeros(len: number): Result<readonly 0[], string>;
function zeros(len: number): Result<readonly 0[], string> {
  return !Num.isUint32(len)
    ? Result.err('len should be uint32')
    : Result.ok(
        // eslint-disable-next-line functional/immutable-data
        ArrayFrom<0>({ length: len }).fill(0)
      );
}

function zerosUnwrapped<N extends Index1000>(len: N): ArrayOfLength<N, 0>;
function zerosUnwrapped(len: number): readonly 0[];
function zerosUnwrapped(len: number): readonly 0[] {
  return Result.unwrapThrow(zeros(len));
}

function seq<N extends Index1000>(len: N): Result<Seq<N>, string>;
function seq(len: number): Result<readonly number[], string>;
function seq(len: number): Result<readonly number[], string> {
  return !Num.isUint32(len)
    ? Result.err('len should be uint32')
    : Result.ok(ArrayFrom({ length: len }, (_, i) => i));
}

function seqUnwrapped<N extends Index1000>(len: N): Seq<N>;
function seqUnwrapped(len: number): readonly number[];
function seqUnwrapped(len: number): readonly number[] {
  return Result.unwrapThrow(seq(len));
}

function newArray<T, N extends Index1000>(
  len: N,
  init: T
): Result<ArrayOfLength<N, T>, string>;
function newArray<T>(len: number, init: T): Result<readonly T[], string>;
function newArray<T>(len: number, init: T): Result<readonly T[], string> {
  return !Num.isUint32(len)
    ? Result.err('len should be uint32')
    : Result.ok(ArrayFrom({ length: len }, () => init));
}

function newArrayUnwrapped<T, N extends Index1000>(
  len: N,
  init: T
): ArrayOfLength<N, T>;
function newArrayUnwrapped<T>(len: number, init: T): readonly T[];
function newArrayUnwrapped<T>(len: number, init: T): readonly T[] {
  return Result.unwrapThrow(newArray(len, init));
}

const range = (
  start: number,
  end: number,
  step: number = 1
): Result<readonly number[], string> =>
  Result.map(seq(end - start), (l) => l.map((n) => n * step + start));

const rangeUnwrapped = (
  start: number,
  end: number,
  step: number = 1
): readonly number[] => Result.unwrapThrow(range(start, end, step));

const copy = <T extends readonly unknown[]>(list: T): T => list.slice() as T;

const slice = <T>(
  list: readonly T[],
  start: number,
  end: number
): readonly T[] => {
  const startClamped = Num.clamp(0, list.length)(start);
  const endClamped = Num.clamp(startClamped, list.length)(end);

  return list.slice(startClamped, endClamped);
};

function head(list: readonly []): undefined;
function head<H, L extends readonly unknown[]>(list: readonly [H, ...L]): H;
function head<T>(list: NonEmptyArray<T>): T;
function head<T>(list: readonly T[]): T | undefined;
function head<T>(list: readonly T[]): T | undefined {
  return isEmpty(list) ? undefined : list[0];
}

const first = head;

function last(list: readonly []): undefined;
function last<H extends readonly unknown[], L>(list: readonly [...H, L]): L;
function last<T>(list: NonEmptyArray<T>): T;
function last<T>(list: readonly T[]): T | undefined;
function last<T>(list: readonly T[]): T | undefined {
  return list.at(-1);
}

const tail = <T extends readonly unknown[]>(list: T): ListType.Tail<T> =>
  list.slice(1) as ListType.Tail<T>;

const rest = tail;
const shift = tail;

const butLast = <T extends readonly unknown[]>(list: T): ListType.ButLast<T> =>
  (isEmpty(list) ? [] : list.slice(0, -1)) as ListType.ButLast<T>;

const take = <T extends readonly unknown[], N extends number>(
  list: T,
  num: N
): ListType.Take<N, T> => slice(list, 0, num) as ListType.Take<N, T>;

const takeLast = <T extends readonly unknown[], N extends number>(
  list: T,
  num: N
): ListType.TakeLast<N, T> =>
  slice(list, size(list) - num, size(list)) as ListType.TakeLast<N, T>;

const skip = <T extends readonly unknown[], N extends number>(
  list: T,
  num: N
): ListType.Skip<N, T> => slice(list, num, size(list)) as ListType.Skip<N, T>;

const skipLast = <T extends readonly unknown[], N extends number>(
  list: T,
  num: N
): ListType.SkipLast<N, T> =>
  slice(list, 0, size(list) - num) as ListType.SkipLast<N, T>;

const pop = butLast;

/**
 * Returns the item located at the specified index.
 * @param index The zero-based index of the desired code unit. A negative index will count back from the last item.
 */
const at = <A>(list: readonly A[], index: number): A | undefined =>
  list.at(index);

function every<A, B extends A>(
  list: readonly A[],
  predicate: (value: A, index: number) => value is B
): list is readonly B[];
function every<A>(
  list: readonly A[],
  predicate: (value: A, index: number) => boolean
): boolean;
function every<A>(
  list: readonly A[],
  predicate: (value: A, index: number) => boolean
): boolean {
  return list.every(predicate);
}

const some = <A>(
  list: readonly A[],
  predicate: (value: A, index: number) => boolean
): boolean => list.some(predicate);

const map = <T extends readonly unknown[], B>(
  list: T,
  mapFn: (a: T[number], index: number) => B
): { readonly [K in keyof T]: B } =>
  list.map(mapFn as (a: unknown, index: number) => B) as {
    readonly [K in keyof T]: B;
  };

// TODO: support tuple type
const flat = <T extends readonly unknown[], D extends number = 1>(
  list: T,
  depth: D = 1 as D
): readonly FlatArray<T, D>[] => list.flat(depth);

const flatMap = <T extends readonly unknown[], M>(
  list: T,
  mapper: (value: T[number], key: number) => readonly M[]
): readonly M[] =>
  list.flatMap(mapper as (value: T[number], key: number) => readonly M[]);

// TODO: add an overload of NonEmpty case
const zip = <T1 extends readonly unknown[], T2 extends readonly unknown[]>(
  list1: T1,
  list2: T2
): ListType.Zip<T1, T2> => {
  const len = Math.min(list1.length, list2.length);

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return seqUnwrapped(len).map((i) => tp(list1[i]!, list2[i]!));
};

function filter<T, S extends T>(
  list: readonly T[],
  predicate: (value: T, index: number) => value is S
): readonly S[];
function filter<T>(
  list: readonly T[],
  predicate: (value: T, index: number) => boolean
): readonly T[];
function filter<T>(
  list: readonly T[],
  predicate: (value: T, index: number) => boolean
): readonly T[] {
  return list.filter(predicate);
}

const filterNot = <T extends readonly unknown[]>(
  list: T,
  predicate: (a: T[number], index: number) => boolean
): readonly T[number][] => list.filter((a, i) => !predicate(a as T[number], i));

// TODO: improve type
const set = <T extends readonly unknown[], N>(
  list: T,
  index: number,
  newValue: N
): { readonly [K in keyof T]: N | T[K] } =>
  map(list, (a, i) => (i === index ? newValue : a)) as {
    readonly [K in keyof T]: N | T[K];
  };

// TODO: improve type
const update = <T extends readonly unknown[], N>(
  list: T,
  index: number,
  updater: (prev: T[number]) => N
): { readonly [K in keyof T]: N | T[K] } =>
  map(list, (a, i) => (i === index ? updater(a) : a)) as {
    readonly [K in keyof T]: N | T[K];
  };

// TODO: improve type
const insert = <A>(
  list: readonly A[],
  index: number,
  newValue: A
): readonly A[] => {
  const mut_temp = ArrayFrom(list);

  mut_temp.splice(index, 0, newValue);

  return mut_temp;
};

const remove = <A>(list: readonly A[], index: number): readonly A[] => {
  const mut_temp = ArrayFrom(list);

  mut_temp.splice(index, 1);

  return mut_temp;
};

const push = <T extends readonly unknown[], N = T>(
  list: T,
  value: N
): readonly [...T, N] => [...list, value];

const unshift = <T extends readonly unknown[], N = T>(
  list: T,
  value: N
): readonly [N, ...T] => [value, ...list];

const concat = <T1 extends readonly unknown[], T2 extends readonly unknown[]>(
  list1: T1,
  list2: T2
): readonly [...T1, ...T2] => [...list1, ...list2];

const partition = <N extends number, T>(
  list: readonly T[],
  n: N
): readonly ArrayOfLength<N, T>[] =>
  seqUnwrapped(Math.ceil(list.length / n)).map(
    (i: number) =>
      list.slice(n * i, n * (i + 1)) as unknown as ArrayOfLength<N, T>
  );

const reverse = <T extends readonly unknown[]>(list: T): ListType.Reverse<T> =>
  // eslint-disable-next-line functional/immutable-data
  ArrayFrom(list).reverse() as ListType.Reverse<T>;

function sort<T extends readonly number[]>(
  list: T,
  comparator?: (x: T[number], y: T[number]) => number
): { readonly [K in keyof T]: T[number] };
function sort<T extends readonly unknown[]>(
  list: T,
  comparator: (x: T[number], y: T[number]) => number
): { readonly [K in keyof T]: T[number] };
function sort<T extends readonly unknown[]>(
  list: T,
  comparator?: (x: T[number], y: T[number]) => number
): { readonly [K in keyof T]: T[number] } {
  const cmp = comparator ?? ((x, y) => (x as number) - (y as number));

  // eslint-disable-next-line functional/immutable-data
  return ArrayFrom(list).sort(cmp) as {
    readonly [K in keyof T]: T[number];
  };
}

function sortBy<T extends readonly unknown[]>(
  list: T,
  comparatorValueMapper: (value: T[number]) => number,
  comparator?: (x: number, y: number) => number
): { readonly [K in keyof T]: T[number] };
function sortBy<T extends readonly unknown[], B>(
  list: T,
  comparatorValueMapper: (value: T[number]) => B,
  comparator: (x: B, y: B) => number
): { readonly [K in keyof T]: T[number] };
function sortBy<T extends readonly unknown[], B>(
  list: T,
  comparatorValueMapper: (value: T[number]) => B,
  comparator?: (x: B, y: B) => number
): { readonly [K in keyof T]: T[number] } {
  return sort(list, (x, y) =>
    comparator === undefined
      ? (comparatorValueMapper(x) as unknown as number) -
        (comparatorValueMapper(y) as unknown as number)
      : comparator(comparatorValueMapper(x), comparatorValueMapper(y))
  );
}

const includes = <A>(list: readonly A[], searchElement: A): boolean =>
  list.includes(searchElement);

// eslint-disable-next-line @typescript-eslint/no-shadow
const find = <A>(
  list: readonly A[],
  predicate: (value: A, index: number) => boolean
): A | undefined =>
  list.find(predicate as (value: A, index: number) => boolean);

const findIndex = <A>(
  list: readonly A[],
  predicate: (value: A, index: number) => boolean
): number => list.findIndex(predicate as (value: A, index: number) => boolean);

function min<T extends readonly [number, ...(readonly number[])]>(
  list: T,
  comparator?: (x: T[number], y: T[number]) => number
): T[number];
function min<T extends readonly number[]>(
  list: T,
  comparator?: (x: T[number], y: T[number]) => number
): T[number] | undefined;
function min<T extends readonly [unknown, ...(readonly unknown[])]>(
  list: T,
  comparator: (x: T[number], y: T[number]) => number
): T[number];
function min<T extends readonly unknown[]>(
  list: T,
  comparator: (x: T[number], y: T[number]) => number
): T[number] | undefined;
function min<T extends readonly unknown[]>(
  list: T,
  comparator?: (x: T[number], y: T[number]) => number
): T[number] | undefined {
  const cmp = comparator ?? ((x, y) => (x as number) - (y as number));

  return isEmpty(list)
    ? undefined
    : list.reduce((mx, curr) => (cmp(mx, curr) < 0 ? mx : curr), list[0]);
}

function max<T extends readonly [number, ...(readonly number[])]>(
  list: T,
  comparator?: (x: T[number], y: T[number]) => number
): T[number];
function max<T extends readonly number[]>(
  list: T,
  comparator?: (x: T[number], y: T[number]) => number
): T[number] | undefined;
function max<T extends readonly [unknown, ...(readonly unknown[])]>(
  list: T,
  comparator: (x: T[number], y: T[number]) => number
): T[number];
function max<T extends readonly unknown[]>(
  list: T,
  comparator: (x: T[number], y: T[number]) => number
): T[number] | undefined;
function max<T extends readonly unknown[]>(
  list: T,
  comparator?: (x: T[number], y: T[number]) => number
): T[number] | undefined {
  const cmp = comparator ?? ((x, y) => (x as number) - (y as number));

  return min(list, (x, y) => -cmp(x, y));
}

function minBy<T extends readonly [unknown, ...(readonly unknown[])]>(
  list: T,
  comparatorValueMapper: (value: T[number]) => number,
  comparator?: (x: number, y: number) => number
): T[number];
function minBy<T extends readonly unknown[]>(
  list: T,
  comparatorValueMapper: (value: T[number]) => number,
  comparator?: (x: number, y: number) => number
): T[number] | undefined;
function minBy<T extends readonly [unknown, ...(readonly unknown[])], B>(
  list: T,
  comparatorValueMapper: (value: T[number]) => B,
  comparator: (x: B, y: B) => number
): T[number];
function minBy<T extends readonly unknown[], B>(
  list: T,
  comparatorValueMapper: (value: T[number]) => B,
  comparator: (x: B, y: B) => number
): T[number] | undefined;
function minBy<T extends readonly unknown[], B>(
  list: T,
  comparatorValueMapper: (value: T[number]) => B,
  comparator?: (x: B, y: B) => number
): T[number] | undefined {
  return min(list, (x, y) =>
    comparator === undefined
      ? (comparatorValueMapper(x) as unknown as number) -
        (comparatorValueMapper(y) as unknown as number)
      : comparator(comparatorValueMapper(x), comparatorValueMapper(y))
  );
}

function maxBy<T extends readonly [unknown, ...(readonly unknown[])]>(
  list: T,
  comparatorValueMapper: (value: T[number]) => number,
  comparator?: (x: number, y: number) => number
): T[number];
function maxBy<T extends readonly unknown[]>(
  list: T,
  comparatorValueMapper: (value: T[number]) => number,
  comparator?: (x: number, y: number) => number
): T[number] | undefined;
function maxBy<T extends readonly [unknown, ...(readonly unknown[])], B>(
  list: T,
  comparatorValueMapper: (value: T[number]) => B,
  comparator: (x: B, y: B) => number
): T[number];
function maxBy<T extends readonly unknown[], B>(
  list: T,
  comparatorValueMapper: (value: T[number]) => B,
  comparator: (x: B, y: B) => number
): T[number] | undefined;
function maxBy<T extends readonly unknown[], B>(
  list: T,
  comparatorValueMapper: (value: T[number]) => B,
  comparator?: (x: B, y: B) => number
): T[number] | undefined {
  return max(list, (x, y) =>
    comparator === undefined
      ? (comparatorValueMapper(x) as unknown as number) -
        (comparatorValueMapper(y) as unknown as number)
      : comparator(comparatorValueMapper(x), comparatorValueMapper(y))
  );
}

const sum = (list: readonly number[]): number =>
  list.reduce((prev, curr) => prev + curr, 0);

const foldl = <T extends readonly unknown[], S>(
  list: T,
  callbackfn: (
    previousValue: S,
    currentValue: T[number],
    currentIndex: number
  ) => S,
  initialValue: S
): S =>
  list.reduce(
    callbackfn as (
      previousValue: S,
      currentValue: T[number],
      currentIndex: number
    ) => S,
    initialValue
  );

const reduce = foldl;

const foldr = <T extends readonly unknown[], S>(
  list: T,
  callbackfn: (
    previousValue: S,
    currentValue: T[number],
    currentIndex: number
  ) => S,
  initialValue: S
): S =>
  list.reduceRight(
    callbackfn as (
      previousValue: S,
      currentValue: T[number],
      currentIndex: number
    ) => S,
    initialValue
  );

const reduceRight = foldr;

const scan = <A, B>(
  list: NonEmptyArray<A> | readonly A[],
  reducer: Reducer<B, A>,
  init: B
): NonEmptyArray<B> => {
  const mut_result: B[] = ArrayFrom(
    newArrayUnwrapped<B>(list.length + 1, init)
  );

  let mut_acc = init;

  for (const [index, value] of list.entries()) {
    mut_acc = reducer(mut_acc, value);
    mut_result[index + 1] = mut_acc;
  }

  return mut_result as readonly B[] as NonEmptyArray<B>;
};

const count = <A>(
  list: readonly A[],
  predicate: (value: A, index: number) => boolean = () => true
): number =>
  list.reduce<number>(
    (acc, curr, index) => (predicate(curr, index) ? acc + 1 : acc),
    0
  );

const countBy = <T extends readonly unknown[], G extends Primitive>(
  list: T,
  grouper: (value: T[number], index: number) => G
): IMap<G, number> => {
  const mut_groups = new MutableMap<G, number>();

  for (const [index, e] of list.entries()) {
    const key = grouper(e, index);
    const curr = mut_groups.get(key) ?? 0;

    mut_groups.set(key, curr + 1);
  }

  return IMap.new(mut_groups);
};

const groupBy = <T extends readonly unknown[], G extends Primitive>(
  list: T,
  grouper: (value: T[number], index: number) => G
): IMap<G, readonly T[number][]> => {
  const mut_groups = new MutableMap<G, T[number][]>();

  for (const [index, e] of list.entries()) {
    const key = grouper(e, index);

    if (mut_groups.has(key)) {
      const mut_g = mut_groups.get(key);

      mut_g?.push(e);
    } else {
      mut_groups.set(key, [e]);
    }
  }

  return IMap.new<G, readonly T[number][]>(mut_groups);
};

/**
 * @desc copy and return unique list
 * @param list target list
 */
function uniq<T>(list: NonEmptyArray<T>): NonEmptyArray<T>;
function uniq<T>(list: readonly T[]): readonly T[];
function uniq<T>(list: readonly T[]): readonly T[] {
  return ArrayFrom(new MutableSet(list));
}

/**
 * @desc copy and return unique list
 * @param list target list
 * @param mapFn perform identity check after mapping by the map function
 */
function uniqBy<A, B>(
  list: NonEmptyArray<A>,
  mapFn: (value: A) => B
): NonEmptyArray<A>;
function uniqBy<A, B>(list: readonly A[], mapFn: (value: A) => B): readonly A[];
function uniqBy<A, B>(
  list: readonly A[],
  mapFn: (value: A) => B
): readonly A[] {
  const mut_mappedValues = new MutableSet();

  return list.filter((val) => {
    const mappedValue = mapFn(val);

    if (mut_mappedValues.has(mappedValue)) return false;
    mut_mappedValues.add(mappedValue);

    return true;
  });
}

const indexIsInRange = <T>(list: readonly T[], index: number): boolean =>
  Num.isUint32(index) && 0 <= index && index < list.length;

const eq = <T>(list1: readonly T[], list2: readonly T[]): boolean =>
  list1.length === list2.length && list1.every((v, i) => v === list2[i]);

/** @returns list1 ⊂ list2 */
const isSubset = <A extends Primitive, B extends Primitive = A>(
  list1: readonly A[],
  list2: readonly B[]
): boolean => list1.every((a) => list2.includes(a as A & B));

/** @returns list1 ⊃ list2 */
const isSuperset = <A extends Primitive, B extends Primitive = A>(
  list1: readonly A[],
  list2: readonly B[]
): boolean => isSubset(list2, list1);

const setIntersection = <A extends Primitive, B extends Primitive = A>(
  list1: readonly A[],
  list2: readonly B[]
): readonly (A & B)[] =>
  list1.filter((e) => list2.includes(e as A & B)) as readonly (A & B)[];

const setDifference = <A extends Primitive>(
  list1: readonly A[],
  list2: readonly A[]
): readonly A[] => list1.filter((e) => !list2.includes(e));

const sortedNumSetDifference = <T extends number>(
  sortedList1: readonly T[],
  sortedList2: readonly T[]
): readonly T[] => {
  const mut_result: T[] = [];
  let mut_it1 = 0; // iterator for sortedArray1
  let mut_it2 = 0; // iterator for sortedArray2
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  let mut_val1: T = sortedList1[mut_it1]!;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  let mut_val2: T = sortedList2[mut_it2]!;

  while (mut_it1 < sortedList1.length && mut_it2 < sortedList2.length) {
    if (mut_val1 === mut_val2) {
      mut_it1 += 1;
      mut_it2 += 1;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      mut_val1 = sortedList1[mut_it1]!;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      mut_val2 = sortedList2[mut_it2]!;
    } else if (mut_val1 < mut_val2) {
      mut_result.push(mut_val1);
      mut_it1 += 1;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      mut_val1 = sortedList1[mut_it1]!;
    } else {
      mut_it2 += 1;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      mut_val2 = sortedList2[mut_it2]!;
    }
  }
  for (; mut_it1 < sortedList1.length; mut_it1 += 1) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    mut_result.push(sortedList1[mut_it1]!);
  }

  return mut_result;
};

export const ArrayUtils = {
  isArray,
  isEmpty,
  isNonEmpty,
  isArrayOfLength1,
  isArrayOfLength2,
  isArrayOfLength3,
  isArrayOfLength4,
  isArrayOfLength5,
  isArrayOfLength6,
  isArrayOfLength1OrMore,
  isArrayOfLength2OrMore,
  isArrayOfLength3OrMore,
  isArrayOfLength4OrMore,
  isArrayOfLength5OrMore,
  isArrayOfLength6OrMore,
  length,
  size,
  from,
  asMut,
  fromMapped,
  range,
  rangeUnwrapped,
  copy,
  slice,
  first,
  tail,
  rest,
  shift,
  butLast,
  take,
  takeLast,
  skip,
  skipLast,
  pop,
  at,
  some,
  map,
  flat,
  flatMap,
  zip,
  filterNot,
  set,
  update,
  insert,
  remove,
  push,
  unshift,
  concat,
  partition,
  reverse,
  includes,
  find,
  findIndex,
  sum,
  foldl,
  reduce,
  foldr,
  reduceRight,
  scan,
  count,
  countBy,
  groupBy,
  indexIsInRange,
  eq,
  isSubset,
  isSuperset,
  setIntersection,
  setDifference,
  sortedNumSetDifference,
  zeros,
  zerosUnwrapped,
  seq,
  seqUnwrapped,
  newArray,
  newArrayUnwrapped,
  head,
  last,
  every,
  filter,
  sort,
  sortBy,
  min,
  max,
  minBy,
  maxBy,
  uniq,
  uniqBy,
} as const;

export const Arr = ArrayUtils;

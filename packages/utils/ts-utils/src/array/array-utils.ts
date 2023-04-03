import { IMap } from '../collections';
import { Num, toUint32, Uint32 } from '../num';
import { MutableMap, MutableSet, tp } from '../others';

/**
 * Uint32 などの branded type にキャストせずに array index として使える数値の型定義。
 * あまり大きくすると型計算が重くなるので注意。
 */

type SmallUint = Uint9;
type SmallInt = Int9;

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
const length = <T extends readonly unknown[]>(list: T): Length<T> & Uint32 =>
  toUint32(list.length);

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
  mapfn: (v: T, k: Uint32) => U
) => readonly U[] = ArrayFrom;

function zeros<N extends SmallUint>(len: N): ArrayOfLength<N, 0>;
function zeros(len: Uint32): readonly 0[];
function zeros(len: SmallUint | Uint32): readonly 0[] {
  // eslint-disable-next-line functional/immutable-data
  return ArrayFrom<0>({ length: len }).fill(0);
}

function seq<N extends SmallUint>(len: N): Seq<N>;
function seq(len: Uint32): readonly Uint32[];
function seq(len: SmallUint | Uint32): readonly Uint32[] {
  return ArrayFrom({ length: len }, (_, i) => toUint32(i));
}

function newArray<T, N extends SmallUint>(len: N, init: T): ArrayOfLength<N, T>;
function newArray<T>(len: Uint32, init: T): readonly T[];
function newArray<T>(len: SmallUint | Uint32, init: T): readonly T[] {
  return ArrayFrom({ length: len }, () => init);
}

// TODO: improve return type
function range<S extends SmallUint, E extends SmallUint>(
  start: S,
  end: E
): readonly UintRange<S, E>[];
function range(
  start: SmallUint | Uint32,
  end: SmallUint | Uint32,
  step?: PositiveInt32 | StrictExclude<SmallUint, 0>
): readonly Uint32[];
function range(
  start: SmallUint | Uint32,
  end: SmallUint | Uint32,
  step: PositiveInt32 | StrictExclude<SmallUint, 0> = 1
): readonly Uint32[] {
  const sz = Uint32.floor(Uint32.div(Uint32.sub0(end, start), step));
  return seq(sz).map((n) => toUint32(n * step + start));
}

const copy = <T extends readonly unknown[]>(list: T): T => list.slice() as T;

const slice = <T>(
  list: readonly T[],
  start: SafeInt | SmallInt,
  end: SafeInt | SmallInt
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

function take<T extends readonly unknown[], N extends SmallUint>(
  list: T,
  num: N
): ListType.Take<N, T>;
function take<T extends readonly unknown[]>(
  list: T,
  num: Uint32
): readonly T[number][];
function take<T extends readonly unknown[]>(
  list: T,
  num: SmallUint | Uint32
): readonly T[number][] {
  return slice(list, 0, num);
}

function takeLast<T extends readonly unknown[], N extends SmallUint>(
  list: T,
  num: N
): ListType.TakeLast<N, T>;
function takeLast<T extends readonly unknown[]>(
  list: T,
  num: Uint32
): readonly T[number][];
function takeLast<T extends readonly unknown[]>(
  list: T,
  num: SmallUint | Uint32
): readonly T[number][] {
  return slice(list, Uint32.sub(size(list), num), size(list));
}

function skip<T extends readonly unknown[], N extends SmallUint>(
  list: T,
  num: N
): ListType.Skip<N, T>;
function skip<T extends readonly unknown[]>(
  list: T,
  num: Uint32
): readonly T[number][];
function skip<T extends readonly unknown[]>(
  list: T,
  num: SmallUint | Uint32
): readonly T[number][] {
  return slice(list, num, size(list));
}

function skipLast<T extends readonly unknown[], N extends SmallUint>(
  list: T,
  num: N
): ListType.SkipLast<N, T>;
function skipLast<T extends readonly unknown[]>(
  list: T,
  num: Uint32
): readonly T[number][];
function skipLast<T extends readonly unknown[]>(
  list: T,
  num: SmallUint | Uint32
): readonly T[number][] {
  return slice(list, 0, Uint32.sub(size(list), num));
}

const pop = butLast;

/**
 * Returns the item located at the specified index.
 * @param index The zero-based index of the desired code unit. A negative index will count back from the last item.
 */
const at = <A>(list: readonly A[], index: SafeInt | SmallInt): A | undefined =>
  list.at(index);

function every<A, B extends A>(
  list: readonly A[],
  predicate: (value: A, index: Uint32) => value is B
): list is readonly B[];
function every<A>(
  list: readonly A[],
  predicate: (value: A, index: Uint32) => boolean
): boolean;
function every<A>(
  list: readonly A[],
  predicate: (value: A, index: Uint32) => boolean
): boolean {
  return list.every(predicate as (value: A, index: number) => boolean);
}

const some = <A>(
  list: readonly A[],
  predicate: (value: A, index: Uint32) => boolean
): boolean => list.some(predicate as (value: A, index: number) => boolean);

const map = <T extends readonly unknown[], B>(
  list: T,
  mapFn: (a: T[number], index: Uint32) => B
): { readonly [K in keyof T]: B } =>
  list.map(mapFn as (a: unknown, index: number) => B) as {
    readonly [K in keyof T]: B;
  };

// TODO: support tuple type
function flat<T extends readonly unknown[]>(
  list: T
): readonly FlatArray<T, 1>[];
function flat<T extends readonly unknown[], D extends number>(
  list: T,
  depth: D
): readonly FlatArray<T, D>[];
function flat<T extends readonly unknown[], D extends number>(
  list: T,
  depth: D = 1 as D
): readonly FlatArray<T, D>[] {
  return list.flat(depth);
}

const flatMap = <T extends readonly unknown[], M>(
  list: T,
  mapper: (value: T[number], key: number) => readonly M[]
): readonly M[] =>
  list.flatMap(mapper as (value: T[number], key: number) => readonly M[]);

// TODO: add an overload of NonEmpty case
const zip = <T1 extends readonly unknown[], T2 extends readonly unknown[]>(
  list1: T1,
  list2: T2
): ListType.Zip<T1, T2> =>
  seq(Uint32.min(length(list1), length(list2))).map((i) =>
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    tp(list1[i]!, list2[i]!)
  );

function filter<T, S extends T>(
  list: readonly T[],
  predicate: (value: T, index: Uint32) => value is S
): readonly S[];
function filter<T>(
  list: readonly T[],
  predicate: (value: T, index: Uint32) => boolean
): readonly T[];
function filter<T>(
  list: readonly T[],
  predicate: (value: T, index: Uint32) => boolean
): readonly T[] {
  return list.filter(predicate as (value: T, index: number) => boolean);
}

const filterNot = <T extends readonly unknown[]>(
  list: T,
  predicate: (a: T[number], index: Uint32) => boolean
): readonly T[number][] =>
  list.filter(
    (a, i) => !(predicate as (value: unknown, index: number) => boolean)(a, i)
  );

// TODO: improve type (use Index<Length<T>>)
const set = <T extends readonly unknown[], N>(
  list: T,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  index: Uint32 | (Index<Length<T>> & SmallUint),
  newValue: N
): { readonly [K in keyof T]: N | T[K] } =>
  map(list, (a, i) => (i === index ? newValue : a)) as {
    readonly [K in keyof T]: N | T[K];
  };

// TODO: improve type
const update = <T extends readonly unknown[], N>(
  list: T,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  index: Uint32 | (Index<Length<T>> & SmallUint),
  updater: (prev: T[number]) => N
): { readonly [K in keyof T]: N | T[K] } =>
  map(list, (a, i) => (i === index ? updater(a) : a)) as {
    readonly [K in keyof T]: N | T[K];
  };

// TODO: improve type
const insert = <A>(
  list: readonly A[],
  index: SafeInt | SmallInt,
  newValue: A
): readonly A[] => {
  const mut_temp = ArrayFrom(list);

  mut_temp.splice(index, 0, newValue);

  return mut_temp;
};

const remove = <A>(
  list: readonly A[],
  index: SafeInt | SmallInt
): readonly A[] => {
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

const partition = <N extends PositiveInt32 | StrictExclude<SmallUint, 0>, T>(
  list: readonly T[],
  n: N
): readonly ArrayOfLength<N, T>[] =>
  seq(Uint32.div(length(list), n)).map(
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
  predicate: (value: A, index: Uint32) => boolean
): A | undefined =>
  list.find(predicate as (value: A, index: number) => boolean);

const findIndex = <A extends readonly unknown[]>(
  list: A,
  predicate: (value: A[number], index: Uint32) => boolean
): IndexOfTuple<A> | -1 =>
  list.findIndex(
    predicate as (value: A[number], index: number) => boolean
  ) as IndexOfTuple<A>;

const indexOf = <A extends readonly unknown[]>(
  list: A,
  searchElement: A[number],
  fromIndex?: IndexOfTuple<A> | undefined
): IndexOfTuple<A> | -1 =>
  list.indexOf(searchElement, fromIndex) as IndexOfTuple<A>;

const lastIndexOf = <A extends readonly unknown[]>(
  list: A,
  searchElement: A[number],
  fromIndex?: IndexOfTuple<A> | undefined
): IndexOfTuple<A> | -1 =>
  list.lastIndexOf(searchElement, fromIndex) as IndexOfTuple<A>;

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
    newArray<B>(toUint32(list.length + 1), init)
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
  predicate: (value: A, index: Uint32) => boolean = () => true
): Uint32 =>
  list.reduce<Uint32>(
    (acc, curr, index) =>
      (predicate as (value: A, idx: number) => boolean)(curr, index)
        ? Uint32.add(acc, 1)
        : acc,
    toUint32(0)
  );

const countBy = <T extends readonly unknown[], G extends Primitive>(
  list: T,
  grouper: (value: T[number], index: Uint32) => G
): IMap<G, Uint32> => {
  const mut_groups = new MutableMap<G, Uint32>();

  for (const [index, e] of list.entries()) {
    const key = grouper(e, toUint32(index));
    const curr = mut_groups.get(key) ?? 0;

    mut_groups.set(key, Uint32.add(curr, 1));
  }

  return IMap.new(mut_groups);
};

const groupBy = <T extends readonly unknown[], G extends Primitive>(
  list: T,
  grouper: (value: T[number], index: Uint32) => G
): IMap<G, readonly T[number][]> => {
  const mut_groups = new MutableMap<G, T[number][]>();

  for (const [index, e] of list.entries()) {
    const key = grouper(e, toUint32(index));

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

const indexIsInRange = <T>(
  list: readonly T[],
  index: SmallUint | Uint32
): boolean => Num.isInRange(0, list.length)(index);

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
  indexOf,
  lastIndexOf,
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
  seq,
  newArray,
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

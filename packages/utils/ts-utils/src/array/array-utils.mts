import { IMap } from '../collections/index.mjs';
import { range as rangeIterator } from '../iterator/index.mjs';
import { Num, Uint32, toUint32 } from '../num/index.mjs';
import { idfn, tp } from '../others/index.mjs';

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

const isEmpty = <A,>(list: readonly A[]): list is readonly [] =>
  list.length === 0;

const isNonEmpty = <A,>(list: readonly A[]): list is NonEmptyArray<A> =>
  list.length > 0;

const isArrayOfLength1 = <A,>(
  array: readonly A[],
): array is ArrayOfLength<1, A> => array.length === 1;

const isArrayOfLength2 = <A,>(
  array: readonly A[],
): array is ArrayOfLength<2, A> => array.length === 2;

const isArrayOfLength3 = <A,>(
  array: readonly A[],
): array is ArrayOfLength<3, A> => array.length === 3;

const isArrayOfLength4 = <A,>(
  array: readonly A[],
): array is ArrayOfLength<4, A> => array.length === 4;

const isArrayOfLength5 = <A,>(
  array: readonly A[],
): array is ArrayOfLength<5, A> => array.length === 5;

const isArrayOfLength6 = <A,>(
  array: readonly A[],
): array is ArrayOfLength<6, A> => array.length === 6;

const isArrayOfLength1OrMore = <A,>(
  array: readonly A[],
): array is ArrayAtLeastLen<1, A> => array.length >= 1;

const isArrayOfLength2OrMore = <A,>(
  array: readonly A[],
): array is ArrayAtLeastLen<2, A> => array.length >= 2;

const isArrayOfLength3OrMore = <A,>(
  array: readonly A[],
): array is ArrayAtLeastLen<3, A> => array.length >= 3;

const isArrayOfLength4OrMore = <A,>(
  array: readonly A[],
): array is ArrayAtLeastLen<4, A> => array.length >= 4;

const isArrayOfLength5OrMore = <A,>(
  array: readonly A[],
): array is ArrayAtLeastLen<5, A> => array.length >= 5;

const isArrayOfLength6OrMore = <A,>(
  array: readonly A[],
): array is ArrayAtLeastLen<6, A> => array.length >= 6;

function length<T extends NonEmptyArray<unknown>>(
  list: T,
): IntersectBrand<PositiveNumber, NumberType.ArraySize>;
function length<T extends readonly unknown[]>(list: T): NumberType.ArraySize;
function length<T extends readonly unknown[]>(list: T): NumberType.ArraySize {
  return toUint32(list.length);
}

const size = length;

const asMut: <T extends readonly unknown[]>(list: T) => Writable<T> = idfn;

function zeros<N extends SmallUint>(len: N): ArrayOfLength<N, 0>;
function zeros(len: WithSmallInt<PositiveInt & Uint32>): NonEmptyArray<0>;
function zeros(len: Uint32WithSmallInt): readonly 0[];
function zeros(len: Uint32WithSmallInt): readonly 0[] {
  return Array.from<0, 0>({ length: len }, () => 0);
}

function seq<N extends SmallUint>(len: N): Seq<N>;
function seq(
  len: NumberType.ArraySizeArgPositive,
): NonEmptyArray<NumberType.ArraySize>;
function seq(
  len: NumberType.ArraySizeArgNonNegative,
): readonly NumberType.ArraySize[];
function seq(
  len: NumberType.ArraySizeArgNonNegative,
): readonly NumberType.ArraySize[] {
  return Array.from({ length: len }, (_, i) => i);
}

function newArray<V, N extends SmallUint>(len: N, init: V): ArrayOfLength<N, V>;
function newArray<V>(
  len: NumberType.ArraySizeArgPositive,
  init: V,
): NonEmptyArray<V>;
function newArray<V>(
  len: NumberType.ArraySizeArgNonNegative,
  init: V,
): readonly V[];
function newArray<V>(
  len: NumberType.ArraySizeArgNonNegative,
  init: V,
): readonly V[] {
  return Array.from({ length: len }, () => init);
}

type LEQ = {
  readonly [N in SmallUint]: Index<N>;
};

type RangeList<S extends SmallUint, E extends SmallUint> =
  BoolOr<IsUnion<S>, IsUnion<E>> extends true
    ? readonly RelaxedExclude<LEQ[E], LEQ[Min<S>]>[] // union に対して Seq で型計算すると、結果が正しくないので、その回避のため
    : ListType.Skip<S, Seq<E>>;

function range<S extends SmallUint, E extends SmallUint>(
  start: S,
  end: E,
  step?: 1,
): RangeList<S, E>;

function range(
  start: SafeUintWithSmallInt,
  end: SafeUintWithSmallInt,
  step?: PositiveSafeIntWithSmallInt,
): readonly SafeUint[];

function range(
  start: SafeIntWithSmallInt,
  end: SafeIntWithSmallInt,
  step?: NonZeroSafeIntWithSmallInt,
): readonly SafeInt[];

function range(
  start: SafeIntWithSmallInt,
  end: SafeIntWithSmallInt,
  step: NonZeroSafeIntWithSmallInt = 1,
): readonly SafeInt[] {
  return Array.from(rangeIterator(start, end, step));
}

const copy = <T extends readonly unknown[]>(list: T): T =>
  // eslint-disable-next-line no-restricted-syntax
  list.slice() as T;

const sliceClamped = <T,>(
  list: readonly T[],
  start: NumberType.ArraySizeArg,
  end: NumberType.ArraySizeArg,
): readonly T[] => {
  const startClamped = Num.clamp<NumberType.ArraySizeArg>(
    0,
    length(list),
  )(start);
  const endClamped = Num.clamp<NumberType.ArraySizeArg>(
    startClamped,
    length(list),
  )(end);

  return list.slice(startClamped, endClamped);
};

function head(list: readonly []): undefined;
function head<H, L extends readonly unknown[]>(list: readonly [H, ...L]): H;
function head<A>(list: NonEmptyArray<A>): A;
function head<A>(list: readonly A[]): A | undefined;
function head<A>(list: readonly A[]): A | undefined {
  return list.at(0);
}

const first = head;

function last(list: readonly []): undefined;
function last<H extends readonly unknown[], L>(list: readonly [...H, L]): L;
function last<A>(list: NonEmptyArray<A>): A;
function last<A>(list: readonly A[]): A | undefined;
function last<A>(list: readonly A[]): A | undefined {
  return list.at(-1);
}

const tail = <T extends readonly unknown[]>(list: T): ListType.Tail<T> =>
  // eslint-disable-next-line no-restricted-syntax
  list.slice(1) as ListType.Tail<T>;

const rest = tail;
const shift = tail;

const butLast = <T extends readonly unknown[]>(list: T): ListType.ButLast<T> =>
  // eslint-disable-next-line no-restricted-syntax
  (isEmpty(list) ? [] : list.slice(0, -1)) as ListType.ButLast<T>;

function take<T extends readonly unknown[], N extends SmallUint>(
  list: T,
  num: N,
): ListType.Take<N, T>;
function take<A>(
  list: NonEmptyArray<A>,
  num: WithSmallInt<Uint32>,
): NonEmptyArray<A>;
function take<A>(list: readonly A[], num: Uint32WithSmallInt): readonly A[];
function take<A>(list: readonly A[], num: Uint32WithSmallInt): readonly A[] {
  return sliceClamped(list, 0, num);
}

function takeLast<T extends readonly unknown[], N extends SmallUint>(
  list: T,
  num: N,
): ListType.TakeLast<N, T>;
function takeLast<A>(
  list: NonEmptyArray<A>,
  num: NumberType.ArraySizeArgPositive,
): NonEmptyArray<A>;
function takeLast<A>(
  list: readonly A[],
  num: NumberType.ArraySizeArgNonNegative,
): readonly A[];
function takeLast<A>(
  list: readonly A[],
  num: NumberType.ArraySizeArgNonNegative,
): readonly A[] {
  return sliceClamped(list, Uint32.sub(size(list), num), size(list));
}

function skip<T extends readonly unknown[], N extends SmallUint>(
  list: T,
  num: N,
): ListType.Skip<N, T>;
function skip<A>(
  list: NonEmptyArray<A>,
  num: NumberType.ArraySizeArgPositive,
): NonEmptyArray<A>;
function skip<A>(
  list: readonly A[],
  num: NumberType.ArraySizeArgNonNegative,
): readonly A[];
function skip<A>(
  list: readonly A[],
  num: NumberType.ArraySizeArgNonNegative,
): readonly A[] {
  return sliceClamped(list, num, size(list));
}

function skipLast<T extends readonly unknown[], N extends SmallUint>(
  list: T,
  num: N,
): ListType.SkipLast<N, T>;
function skipLast<A>(
  list: NonEmptyArray<A>,
  num: NumberType.ArraySizeArgPositive,
): NonEmptyArray<A>;
function skipLast<A>(
  list: readonly A[],
  num: NumberType.ArraySizeArgNonNegative,
): readonly A[];
function skipLast<A>(
  list: readonly A[],
  num: NumberType.ArraySizeArgNonNegative,
): readonly A[] {
  return sliceClamped(list, 0, Uint32.sub(size(list), num));
}

const pop = butLast;

const flatMap = <A, M>(
  list: readonly A[],
  mapper: (value: A, key: NumberType.ArraySize) => readonly M[],
): readonly M[] => list.flatMap(mapper);

// TODO: add an overload of NonEmpty case
const zip = <T1 extends readonly unknown[], T2 extends readonly unknown[]>(
  list1: T1,
  list2: T2,
): ListType.Zip<T1, T2> =>
  // eslint-disable-next-line no-restricted-syntax
  seq(Uint32.min(length(list1), length(list2))).map((i) =>
    tp(list1[i], list2[i]),
  ) as ListType.Zip<T1, T2>;

const filterNot = <A,>(
  list: readonly A[],
  predicate: (a: A, index: NumberType.ArraySize) => boolean,
): readonly A[] => list.filter((a, i) => !predicate(a, i));

const set = <A, U>(
  list: readonly A[],
  index: Uint32WithSmallInt,
  newValue: U,
): readonly (A | U)[] => list.map((a, i) => (i === index ? newValue : a));

const update = <A, U>(
  list: readonly A[],
  index: NumberType.ArraySizeArgNonNegative,
  updater: (prev: A) => U,
): readonly (A | U)[] => list.map((a, i) => (i === index ? updater(a) : a));

// TODO: improve type
const inserted = <A,>(
  list: readonly A[],
  index: NumberType.ArraySizeArg,
  newValue: A,
): readonly A[] => {
  const mut_temp = asMut(Array.from(list));

  mut_temp.splice(index, 0, newValue);

  return mut_temp;
};

const removed = <A,>(
  list: readonly A[],
  index: NumberType.ArraySizeArg,
): readonly A[] => {
  const mut_temp = asMut(Array.from(list));

  mut_temp.splice(index, 1);

  return mut_temp;
};

const pushed = <T extends readonly unknown[], V = T>(
  list: T,
  value: V,
): readonly [...T, V] => [...list, value];

const unshifted = <T extends readonly unknown[], V = T>(
  list: T,
  value: V,
): readonly [V, ...T] => [value, ...list];

const concat = <T1 extends readonly unknown[], T2 extends readonly unknown[]>(
  list1: T1,
  list2: T2,
): readonly [...T1, ...T2] => [...list1, ...list2];

const partition = <N extends WithSmallInt<PositiveInt & Uint32>, A>(
  list: readonly A[],
  n: N,
): readonly ArrayOfLength<N, A>[] =>
  seq(Uint32.div(length(list), n)).map(
    (i) =>
      // eslint-disable-next-line no-restricted-syntax
      list.slice(
        Uint32.mul(n, i),
        Uint32.mul(n, Uint32.add(i, 1)),
      ) as ArrayOfLength<N, A>,
  );

function sorted<N extends number>(list: readonly N[]): readonly N[];
function sorted<A>(
  list: readonly A[],
  comparator: (x: A, y: A) => number,
): readonly A[];
function sorted<A>(
  list: readonly A[],
  comparator?: (x: A, y: A) => number,
): readonly A[] {
  // eslint-disable-next-line no-restricted-syntax
  const cmp = comparator ?? ((x, y) => (x as number) - (y as number));

  return list.toSorted(cmp);
}

function sortedBy<A>(
  list: readonly A[],
  comparatorValueMapper: (value: A) => number,
  comparator?: (x: number, y: number) => number,
): readonly A[];
function sortedBy<A, B>(
  list: readonly A[],
  comparatorValueMapper: (value: A) => B,
  comparator: (x: B, y: B) => number,
): readonly A[];
function sortedBy<A, B>(
  list: readonly A[],
  comparatorValueMapper: (value: A) => B,
  comparator?: (x: B, y: B) => number,
): readonly A[] {
  return sorted(list, (x, y) =>
    comparator === undefined
      ? // eslint-disable-next-line no-restricted-syntax
        (comparatorValueMapper(x) as number) -
        // eslint-disable-next-line no-restricted-syntax
        (comparatorValueMapper(y) as number)
      : comparator(comparatorValueMapper(x), comparatorValueMapper(y)),
  );
}

function min<N extends number>(
  list: NonEmptyArray<N>,
  comparator?: (x: N, y: N) => number,
): N;
function min<N extends number>(
  list: readonly N[],
  comparator?: (x: N, y: N) => number,
): N | undefined;
function min<A>(list: NonEmptyArray<A>, comparator: (x: A, y: A) => number): A;
function min<A>(
  list: readonly A[],
  comparator: (x: A, y: A) => number,
): A | undefined;
function min<A>(
  list: readonly A[],
  comparator?: (x: A, y: A) => number,
): A | undefined {
  const cmp = comparator ?? ((x, y) => Num.from(x) - Num.from(y));

  return isNonEmpty(list)
    ? list.reduce((mx, curr) => (cmp(mx, curr) < 0 ? mx : curr), list[0])
    : undefined;
}

function max<N extends number>(
  list: NonEmptyArray<N>,
  comparator?: (x: N, y: N) => number,
): N;
function max<N extends number>(
  list: readonly N[],
  comparator?: (x: N, y: N) => number,
): N | undefined;
function max<A>(list: NonEmptyArray<A>, comparator: (x: A, y: A) => number): A;
function max<A>(
  list: readonly A[],
  comparator: (x: A, y: A) => number,
): A | undefined;
function max<A>(
  list: readonly A[],
  comparator?: (x: A, y: A) => number,
): A | undefined {
  const cmp = comparator ?? ((x, y) => Num.from(x) - Num.from(y));

  return min(list, (x, y) => -cmp(x, y));
}

function minBy<A>(
  list: NonEmptyArray<A>,
  comparatorValueMapper: (value: A) => number,
  comparator?: (x: number, y: number) => number,
): A;
function minBy<A>(
  list: readonly A[],
  comparatorValueMapper: (value: A) => number,
  comparator?: (x: number, y: number) => number,
): A | undefined;
function minBy<A, B>(
  list: NonEmptyArray<A>,
  comparatorValueMapper: (value: A) => B,
  comparator: (x: B, y: B) => number,
): A;
function minBy<A, B>(
  list: readonly A[],
  comparatorValueMapper: (value: A) => B,
  comparator: (x: B, y: B) => number,
): A | undefined;
function minBy<A, B>(
  list: readonly A[],
  comparatorValueMapper: (value: A) => B,
  comparator?: (x: B, y: B) => number,
): A | undefined {
  return min(list, (x, y) =>
    comparator === undefined
      ? Num.from(comparatorValueMapper(x)) - Num.from(comparatorValueMapper(y))
      : comparator(comparatorValueMapper(x), comparatorValueMapper(y)),
  );
}

function maxBy<A>(
  list: NonEmptyArray<A>,
  comparatorValueMapper: (value: A) => number,
  comparator?: (x: number, y: number) => number,
): A;
function maxBy<A>(
  list: readonly A[],
  comparatorValueMapper: (value: A) => number,
  comparator?: (x: number, y: number) => number,
): A | undefined;
function maxBy<A, B>(
  list: NonEmptyArray<A>,
  comparatorValueMapper: (value: A) => B,
  comparator: (x: B, y: B) => number,
): A;
function maxBy<A, B>(
  list: readonly A[],
  comparatorValueMapper: (value: A) => B,
  comparator: (x: B, y: B) => number,
): A | undefined;
function maxBy<A, B>(
  list: readonly A[],
  comparatorValueMapper: (value: A) => B,
  comparator?: (x: B, y: B) => number,
): A | undefined {
  return max(list, (x, y) =>
    comparator === undefined
      ? Num.from(comparatorValueMapper(x)) - Num.from(comparatorValueMapper(y))
      : comparator(comparatorValueMapper(x), comparatorValueMapper(y)),
  );
}

const sum = (list: readonly number[]): number =>
  list.reduce((prev, curr) => prev + curr, 0);

const foldl = <A, S>(
  list: readonly A[],
  callbackfn: (
    previousValue: S,
    currentValue: A,
    currentIndex: NumberType.ArraySize,
  ) => S,
  initialValue: S,
): S => list.reduce(callbackfn, initialValue);

const reduce = foldl;

const foldr = <A, S>(
  list: readonly A[],
  callbackfn: (
    previousValue: S,
    currentValue: A,
    currentIndex: NumberType.ArraySize,
  ) => S,
  initialValue: S,
): S => list.reduceRight(callbackfn, initialValue);

const reduceRight = foldr;

const scan = <A, B>(
  list: NonEmptyArray<A> | readonly A[],
  reducer: Reducer<B, A>,
  init: B,
): NonEmptyArray<B> => {
  const mut_result: B[] = asMut(
    Array.from({ length: list.length + 1 }, () => init),
  );

  let mut_acc = init;

  for (const [index, value] of list.entries()) {
    mut_acc = reducer(mut_acc, value);
    mut_result[index + 1] = mut_acc;
  }

  // eslint-disable-next-line no-restricted-syntax
  return mut_result as MutableNonEmptyArray<B>;
};

const count = <A,>(
  list: readonly A[],
  predicate: (value: A, index: NumberType.ArraySize) => boolean = () => true,
): NumberType.ArraySize =>
  list.reduce<NumberType.ArraySize>(
    (acc, curr, index) => (predicate(curr, index) ? Uint32.add(acc, 1) : acc),
    toUint32(0),
  );

const countBy = <A, G extends Primitive>(
  list: readonly A[],
  grouper: (value: A, index: NumberType.ArraySize) => G,
): IMap<G, NumberType.ArraySize> => {
  // eslint-disable-next-line no-restricted-globals
  const mut_groups = new Map<G, NumberType.ArraySize>();

  for (const [index, e] of list.entries()) {
    const key = grouper(e, index);
    const curr = mut_groups.get(key) ?? 0;

    mut_groups.set(key, Uint32.add(curr, 1));
  }

  return IMap.new(mut_groups);
};

const groupBy = <A, G extends Primitive>(
  list: readonly A[],
  grouper: (value: A, index: NumberType.ArraySize) => G,
): IMap<G, readonly A[]> => {
  // eslint-disable-next-line no-restricted-globals
  const mut_groups = new Map<G, A[]>();

  for (const [index, e] of list.entries()) {
    const key = grouper(e, index);

    if (mut_groups.has(key)) {
      const mut_g = mut_groups.get(key);

      mut_g?.push(e);
    } else {
      mut_groups.set(key, [e]);
    }
  }

  return IMap.new<G, readonly A[]>(mut_groups);
};

/**
 * Copy and return unique list
 *
 * @param list Target list
 */
function uniq<A>(list: NonEmptyArray<A>): NonEmptyArray<A>;
function uniq<A>(list: readonly A[]): readonly A[];
function uniq<A>(list: readonly A[]): readonly A[] {
  // eslint-disable-next-line no-restricted-globals
  return Array.from(new Set(list));
}

/**
 * Copy and return unique list
 *
 * @param list Target list
 * @param mapFn Perform identity check after mapping by the map function
 */
function uniqBy<A, B>(
  list: NonEmptyArray<A>,
  mapFn: (value: A) => B,
): NonEmptyArray<A>;
function uniqBy<A, B>(list: readonly A[], mapFn: (value: A) => B): readonly A[];
function uniqBy<A, B>(
  list: readonly A[],
  mapFn: (value: A) => B,
): readonly A[] {
  // eslint-disable-next-line no-restricted-globals
  const mut_mappedValues = new Set<B>();

  return list.filter((val) => {
    const mappedValue = mapFn(val);

    if (mut_mappedValues.has(mappedValue)) return false;
    mut_mappedValues.add(mappedValue);

    return true;
  });
}

const indexIsInRange = <T,>(
  list: readonly T[],
  index: Uint32WithSmallInt,
): boolean => Num.isInRange(0, list.length)(index);

const eq = <T,>(list1: readonly T[], list2: readonly T[]): boolean =>
  list1.length === list2.length && list1.every((v, i) => v === list2[i]);

/** @returns `list1` ⊂ `list2` */
const isSubset = <A extends Primitive, B extends Primitive = A>(
  list1: readonly A[],
  list2: readonly B[],
  // eslint-disable-next-line no-restricted-syntax
): boolean => list1.every((a) => list2.includes(a as A & B));

/** @returns `list1` ⊃ `list2` */
const isSuperset = <A extends Primitive, B extends Primitive = A>(
  list1: readonly A[],
  list2: readonly B[],
): boolean => isSubset(list2, list1);

const setIntersection = <A extends Primitive, B extends Primitive = A>(
  list1: readonly A[],
  list2: readonly B[],
): readonly (A & B)[] =>
  // eslint-disable-next-line no-restricted-syntax
  list1.filter((e) => list2.includes(e as A & B)) as (A & B)[];

const setDifference = <A extends Primitive>(
  list1: readonly A[],
  list2: readonly A[],
): readonly A[] => list1.filter((e) => !list2.includes(e));

const sortedNumSetDifference = <T extends number>(
  sortedList1: readonly T[],
  sortedList2: readonly T[],
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
  asMut,
  range,
  copy,
  sliceClamped,
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
  flatMap,
  zip,
  filterNot,
  set,
  update,
  inserted,
  removed,
  pushed,
  unshifted,
  concat,
  partition,
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
  sorted,
  sortedBy,
  min,
  max,
  minBy,
  maxBy,
  uniq,
  uniqBy,
} as const;

export const Arr = ArrayUtils; // alias

import { IMap } from '../collections';
import { expectType } from '../expect-type';
import { range as rangeIterator } from '../iterator';
import { Num, SafeUint, toSafeUint } from '../num';
import { MutableMap, MutableSet, idfn, tp } from '../others';

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

const isEmpty = <A>(list: readonly A[]): list is readonly [] =>
  list.length === 0;

const isNonEmpty = <A>(list: readonly A[]): list is NonEmptyArray<A> =>
  list.length > 0;

const isArrayOfLength1 = <A>(
  array: readonly A[]
): array is ArrayOfLength<1, A> => array.length === 1;

const isArrayOfLength2 = <A>(
  array: readonly A[]
): array is ArrayOfLength<2, A> => array.length === 2;

const isArrayOfLength3 = <A>(
  array: readonly A[]
): array is ArrayOfLength<3, A> => array.length === 3;

const isArrayOfLength4 = <A>(
  array: readonly A[]
): array is ArrayOfLength<4, A> => array.length === 4;

const isArrayOfLength5 = <A>(
  array: readonly A[]
): array is ArrayOfLength<5, A> => array.length === 5;

const isArrayOfLength6 = <A>(
  array: readonly A[]
): array is ArrayOfLength<6, A> => array.length === 6;

const isArrayOfLength1OrMore = <A>(
  array: readonly A[]
): array is ArrayAtLeastLen<1, A> => array.length >= 1;

const isArrayOfLength2OrMore = <A>(
  array: readonly A[]
): array is ArrayAtLeastLen<2, A> => array.length >= 2;

const isArrayOfLength3OrMore = <A>(
  array: readonly A[]
): array is ArrayAtLeastLen<3, A> => array.length >= 3;

const isArrayOfLength4OrMore = <A>(
  array: readonly A[]
): array is ArrayAtLeastLen<4, A> => array.length >= 4;

const isArrayOfLength5OrMore = <A>(
  array: readonly A[]
): array is ArrayAtLeastLen<5, A> => array.length >= 5;

const isArrayOfLength6OrMore = <A>(
  array: readonly A[]
): array is ArrayAtLeastLen<6, A> => array.length >= 6;

// eslint-disable-next-line @typescript-eslint/no-shadow
function length<T extends NonEmptyArray<unknown>>(
  list: T
): Exclude<SmallUint, 0> | IntersectBrand<NonZeroSafeIntBrand, SafeUintBrand>;
function length<T extends readonly unknown[]>(list: T): SafeUint;
function length<T extends readonly unknown[]>(
  list: T
): IntersectBrand<NonZeroSafeIntBrand, SafeUintBrand> | SafeUint {
  return toSafeUint(list.length);
}

expectType<
  IntersectBrand<NonZeroSafeIntBrand, SafeUintBrand>,
  Brand<number, 'Finite' | 'Int' | 'NonNegative' | 'SafeInt', 'NaN' | 'Zero'>
>('=');

const size = length;

const asMut: <T extends readonly unknown[]>(list: T) => Writable<T> = idfn;

function zeros<N extends SmallUint>(len: N): ArrayOfLength<N, 0>;
function zeros(len: SafeUint): readonly 0[];
function zeros(len: SafeUint): readonly 0[] {
  // eslint-disable-next-line functional/immutable-data
  return Array.from<0>({ length: len }).fill(0);
}

function seq<N extends SmallUint>(len: N): Seq<N>;
function seq(len: SafeUint): readonly SafeUint[];
function seq(len: SafeUint): readonly SafeUint[] {
  return Array.from({ length: len }, (_, i) => i);
}

function newArray<V, N extends SmallUint>(len: N, init: V): ArrayOfLength<N, V>;
function newArray<V>(len: SafeUint, init: V): readonly V[];
function newArray<V>(len: SafeUint, init: V): readonly V[] {
  return Array.from({ length: len }, () => init);
}

type LEQ = {
  readonly [N in SmallUint]: Index<N>;
};

type RangeList<S extends SmallUint, E extends SmallUint> = BoolOr<
  IsUnion<S>,
  IsUnion<E>
> extends true
  ? readonly RelaxedExclude<LEQ[E], LEQ[Min<S>]>[] // union に対して Seq で型計算すると、結果が正しくないので、その回避のため
  : ListType.Skip<S, Seq<E>>;

function range<S extends SmallUint, E extends SmallUint>(
  start: S,
  end: E,
  step?: 1
): RangeList<S, E>;

function range(
  start: SafeUint,
  end: SafeUint,
  step?: Exclude<SmallInt, 0> | IntersectBrand<SafeUintBrand, NonZeroNumber>
): readonly SafeUint[];

function range(
  start: SafeInt,
  end: SafeInt,
  step?: Exclude<SmallInt, 0> | IntersectBrand<SafeIntBrand, NonZeroNumber>
): readonly SafeInt[];

function range(
  start: SafeInt,
  end: SafeInt,
  step: Exclude<SmallInt, 0> | IntersectBrand<SafeIntBrand, NonZeroNumber> = 1
): readonly SafeInt[] {
  return Array.from(rangeIterator(start, end, step));
}

const copy = <T extends readonly unknown[]>(list: T): T => list.slice() as T;

const sliceClamped = <T>(
  list: readonly T[],
  start: SafeInt,
  end: SafeInt
): readonly T[] => {
  const startClamped = Num.clamp<SafeInt>(0, length(list))(start);
  const endClamped = Num.clamp<SafeInt>(startClamped, length(list))(end);

  return list.slice(startClamped, endClamped);
};

function head(list: readonly []): undefined;
function head<H, L extends readonly unknown[]>(list: readonly [H, ...L]): H;
function head<A>(list: NonEmptyArray<A>): A;
function head<A>(list: readonly A[]): A | undefined;
function head<A>(list: readonly A[]): A | undefined {
  return isEmpty(list) ? undefined : list[0];
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
  list.slice(1) as ListType.Tail<T>;

const rest = tail;
const shift = tail;

const butLast = <T extends readonly unknown[]>(list: T): ListType.ButLast<T> =>
  (isEmpty(list) ? [] : list.slice(0, -1)) as ListType.ButLast<T>;

function take<T extends readonly unknown[], N extends SmallUint>(
  list: T,
  num: N
): ListType.Take<N, T>;
function take<A>(list: readonly A[], num: SafeUint): readonly A[];
function take<A>(list: readonly A[], num: SafeUint | SmallUint): readonly A[] {
  return sliceClamped(list, 0, num);
}

function takeLast<T extends readonly unknown[], N extends SmallUint>(
  list: T,
  num: N
): ListType.TakeLast<N, T>;
function takeLast<A>(list: readonly A[], num: SafeUint): readonly A[];
function takeLast<A>(
  list: readonly A[],
  num: SafeUint | SmallUint
): readonly A[] {
  return sliceClamped(list, SafeUint.sub(size(list), num), size(list));
}

function skip<T extends readonly unknown[], N extends SmallUint>(
  list: T,
  num: N
): ListType.Skip<N, T>;
function skip<A>(list: readonly A[], num: SafeUint): readonly A[];
function skip<A>(list: readonly A[], num: SafeUint | SmallUint): readonly A[] {
  return sliceClamped(list, num, size(list));
}

function skipLast<T extends readonly unknown[], N extends SmallUint>(
  list: T,
  num: N
): ListType.SkipLast<N, T>;
function skipLast<A>(list: readonly A[], num: SafeUint): readonly A[];
function skipLast<A>(
  list: readonly A[],
  num: SafeUint | SmallUint
): readonly A[] {
  return sliceClamped(list, 0, SafeUint.sub(size(list), num));
}

const pop = butLast;

const flatMap = <A, M>(
  list: readonly A[],
  mapper: (value: A, key: SafeUint) => readonly M[]
): readonly M[] => list.flatMap(mapper);

// TODO: add an overload of NonEmpty case
const zip = <T1 extends readonly unknown[], T2 extends readonly unknown[]>(
  list1: T1,
  list2: T2
): ListType.Zip<T1, T2> =>
  // eslint-disable-next-line no-restricted-syntax
  seq(SafeUint.min(length(list1), length(list2))).map((i) =>
    tp(list1[i], list2[i])
  ) as ListType.Zip<T1, T2>;

const filterNot = <A>(
  list: readonly A[],
  predicate: (a: A, index: SafeUint) => boolean
): readonly A[] => list.filter((a, i) => !predicate(a, i));

const set = <A, U>(
  list: readonly A[],
  index: SafeUint,
  newValue: U
): readonly (A | U)[] => list.map((a, i) => (i === index ? newValue : a));

const update = <A, U>(
  list: readonly A[],
  index: SafeUint,
  updater: (prev: A) => U
): readonly (A | U)[] => list.map((a, i) => (i === index ? updater(a) : a));

// TODO: improve type
const inserted = <A>(
  list: readonly A[],
  index: SafeInt,
  newValue: A
): readonly A[] => {
  const mut_temp = Array.from(list);

  mut_temp.splice(index, 0, newValue);

  return mut_temp;
};

const removed = <A>(
  list: readonly A[],
  index: SafeInt | SmallInt
): readonly A[] => {
  const mut_temp = Array.from(list);

  mut_temp.splice(index, 1);

  return mut_temp;
};

const pushed = <T extends readonly unknown[], V = T>(
  list: T,
  value: V
): readonly [...T, V] => [...list, value];

const unshifted = <T extends readonly unknown[], V = T>(
  list: T,
  value: V
): readonly [V, ...T] => [value, ...list];

const concat = <T1 extends readonly unknown[], T2 extends readonly unknown[]>(
  list1: T1,
  list2: T2
): readonly [...T1, ...T2] => [...list1, ...list2];

const partition = <
  N extends
    | Exclude<SmallUint, 0>
    | IntersectBrand<SafeUintBrand, NonZeroNumber>,
  A
>(
  list: readonly A[],
  n: N
): readonly ArrayOfLength<N, A>[] =>
  seq(SafeUint.div(length(list), n)).map(
    (i) =>
      list.slice(
        SafeUint.mul(n, i),
        SafeUint.mul(n, SafeUint.add(i, 1))
      ) as unknown as ArrayOfLength<N, A>
  );

const reversed = <A>(list: readonly A[]): readonly A[] =>
  // eslint-disable-next-line functional/immutable-data
  Array.from(list).reverse();

function sorted<N extends number>(list: readonly N[]): readonly N[];
function sorted<A>(
  list: readonly A[],
  comparator: (x: A, y: A) => number
): readonly A[];
function sorted<A>(
  list: readonly A[],
  comparator?: (x: A, y: A) => number
): readonly A[] {
  const cmp = comparator ?? ((x, y) => (x as number) - (y as number));

  return Array.from(list).sort(cmp);
}

function sortedBy<A>(
  list: readonly A[],
  comparatorValueMapper: (value: A) => number,
  comparator?: (x: number, y: number) => number
): readonly A[];
function sortedBy<A, B>(
  list: readonly A[],
  comparatorValueMapper: (value: A) => B,
  comparator: (x: B, y: B) => number
): readonly A[];
function sortedBy<A, B>(
  list: readonly A[],
  comparatorValueMapper: (value: A) => B,
  comparator?: (x: B, y: B) => number
): readonly A[] {
  return sorted(list, (x, y) =>
    comparator === undefined
      ? (comparatorValueMapper(x) as unknown as number) -
        (comparatorValueMapper(y) as unknown as number)
      : comparator(comparatorValueMapper(x), comparatorValueMapper(y))
  );
}

function min<N extends number>(
  list: NonEmptyArray<N>,
  comparator?: (x: N, y: N) => number
): N;
function min<N extends number>(
  list: readonly N[],
  comparator?: (x: N, y: N) => number
): N | undefined;
function min<A>(list: NonEmptyArray<A>, comparator: (x: A, y: A) => number): A;
function min<A>(
  list: readonly A[],
  comparator: (x: A, y: A) => number
): A | undefined;
function min<A>(
  list: readonly A[],
  comparator?: (x: A, y: A) => number
): A | undefined {
  const cmp = comparator ?? ((x, y) => Num.from(x) - Num.from(y));

  return isNonEmpty(list)
    ? list.reduce((mx, curr) => (cmp(mx, curr) < 0 ? mx : curr), list[0])
    : undefined;
}

function max<N extends number>(
  list: NonEmptyArray<N>,
  comparator?: (x: N, y: N) => number
): N;
function max<N extends number>(
  list: readonly N[],
  comparator?: (x: N, y: N) => number
): N | undefined;
function max<A>(list: NonEmptyArray<A>, comparator: (x: A, y: A) => number): A;
function max<A>(
  list: readonly A[],
  comparator: (x: A, y: A) => number
): A | undefined;
function max<A>(
  list: readonly A[],
  comparator?: (x: A, y: A) => number
): A | undefined {
  const cmp = comparator ?? ((x, y) => Num.from(x) - Num.from(y));

  return min(list, (x, y) => -cmp(x, y));
}

function minBy<A>(
  list: NonEmptyArray<A>,
  comparatorValueMapper: (value: A) => number,
  comparator?: (x: number, y: number) => number
): A;
function minBy<A>(
  list: readonly A[],
  comparatorValueMapper: (value: A) => number,
  comparator?: (x: number, y: number) => number
): A | undefined;
function minBy<A, B>(
  list: NonEmptyArray<A>,
  comparatorValueMapper: (value: A) => B,
  comparator: (x: B, y: B) => number
): A;
function minBy<A, B>(
  list: readonly A[],
  comparatorValueMapper: (value: A) => B,
  comparator: (x: B, y: B) => number
): A | undefined;
function minBy<A, B>(
  list: readonly A[],
  comparatorValueMapper: (value: A) => B,
  comparator?: (x: B, y: B) => number
): A | undefined {
  return min(list, (x, y) =>
    comparator === undefined
      ? Num.from(comparatorValueMapper(x)) - Num.from(comparatorValueMapper(y))
      : comparator(comparatorValueMapper(x), comparatorValueMapper(y))
  );
}

function maxBy<A>(
  list: NonEmptyArray<A>,
  comparatorValueMapper: (value: A) => number,
  comparator?: (x: number, y: number) => number
): A;
function maxBy<A>(
  list: readonly A[],
  comparatorValueMapper: (value: A) => number,
  comparator?: (x: number, y: number) => number
): A | undefined;
function maxBy<A, B>(
  list: NonEmptyArray<A>,
  comparatorValueMapper: (value: A) => B,
  comparator: (x: B, y: B) => number
): A;
function maxBy<A, B>(
  list: readonly A[],
  comparatorValueMapper: (value: A) => B,
  comparator: (x: B, y: B) => number
): A | undefined;
function maxBy<A, B>(
  list: readonly A[],
  comparatorValueMapper: (value: A) => B,
  comparator?: (x: B, y: B) => number
): A | undefined {
  return max(list, (x, y) =>
    comparator === undefined
      ? Num.from(comparatorValueMapper(x)) - Num.from(comparatorValueMapper(y))
      : comparator(comparatorValueMapper(x), comparatorValueMapper(y))
  );
}

const sum = (list: readonly number[]): number =>
  list.reduce((prev, curr) => prev + curr, 0);

const foldl = <A, S>(
  list: readonly A[],
  callbackfn: (previousValue: S, currentValue: A, currentIndex: SafeUint) => S,
  initialValue: S
): S => list.reduce(callbackfn, initialValue);

const reduce = foldl;

const foldr = <A, S>(
  list: readonly A[],
  callbackfn: (previousValue: S, currentValue: A, currentIndex: SafeUint) => S,
  initialValue: S
): S => list.reduceRight(callbackfn, initialValue);

const reduceRight = foldr;

const scan = <A, B>(
  list: NonEmptyArray<A> | readonly A[],
  reducer: Reducer<B, A>,
  init: B
): NonEmptyArray<B> => {
  const mut_result: B[] = Array.from({ length: list.length + 1 }, () => init);

  let mut_acc = init;

  for (const [index, value] of list.entries()) {
    mut_acc = reducer(mut_acc, value);
    mut_result[index + 1] = mut_acc;
  }

  return mut_result as readonly B[] as NonEmptyArray<B>;
};

const count = <A>(
  list: readonly A[],
  predicate: (value: A, index: SafeUint) => boolean = () => true
): SafeUint =>
  list.reduce<SafeUint>(
    (acc, curr, index) =>
      (predicate as (value: A, idx: number) => boolean)(curr, index)
        ? SafeUint.add(acc, 1)
        : acc,
    0
  );

const countBy = <A, G extends Primitive>(
  list: readonly A[],
  grouper: (value: A, index: SafeUint) => G
): IMap<G, SafeUint> => {
  const mut_groups = new MutableMap<G, SafeUint>();

  for (const [index, e] of list.entries()) {
    const key = grouper(e, index);
    const curr = mut_groups.get(key) ?? 0;

    mut_groups.set(key, SafeUint.add(curr, 1));
  }

  return IMap.new(mut_groups);
};

const groupBy = <A, G extends Primitive>(
  list: readonly A[],
  grouper: (value: A, index: SafeUint) => G
): IMap<G, readonly A[]> => {
  const mut_groups = new MutableMap<G, A[]>();

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
 * @desc copy and return unique list
 * @param list target list
 */
function uniq<A>(list: NonEmptyArray<A>): NonEmptyArray<A>;
function uniq<A>(list: readonly A[]): readonly A[];
function uniq<A>(list: readonly A[]): readonly A[] {
  return Array.from(new MutableSet(list));
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

const indexIsInRange = <T>(list: readonly T[], index: SafeUint): boolean =>
  Num.isInRange(0, list.length)(index);

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
  reversed,
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

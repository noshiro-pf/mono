import { assertType } from '../assert-type';
import { pipe, Result } from '../functional';
import { Num } from '../num';
import { MutableMap, MutableSet, tp } from '../others';
import { IMap } from './imap';

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

export namespace IList {
  // eslint-disable-next-line no-restricted-globals
  const ArrayFrom = Array.from;

  export const isArray = (a: unknown): a is readonly unknown[] =>
    // eslint-disable-next-line no-restricted-globals
    Array.isArray(a);

  export const isEmpty = <T>(list: readonly T[]): list is readonly [] =>
    list.length === 0;

  export const isNonEmpty = <T>(list: readonly T[]): list is NonEmptyArray<T> =>
    list.length > 0;

  export const isArrayOfLength1 = <T>(
    array: readonly T[]
  ): array is ArrayOfLength<1, T> => array.length === 1;

  export const isArrayOfLength2 = <T>(
    array: readonly T[]
  ): array is ArrayOfLength<2, T> => array.length === 2;

  export const isArrayOfLength3 = <T>(
    array: readonly T[]
  ): array is ArrayOfLength<3, T> => array.length === 3;

  export const isArrayOfLength4 = <T>(
    array: readonly T[]
  ): array is ArrayOfLength<4, T> => array.length === 4;

  export const isArrayOfLength5 = <T>(
    array: readonly T[]
  ): array is ArrayOfLength<5, T> => array.length === 5;

  export const isArrayOfLength6 = <T>(
    array: readonly T[]
  ): array is ArrayOfLength<6, T> => array.length === 6;

  export const isArrayOfLength1OrMore = <T>(
    array: readonly T[]
  ): array is ArrayAtLeastLen<1, T> => array.length >= 1;

  export const isArrayOfLength2OrMore = <T>(
    array: readonly T[]
  ): array is ArrayAtLeastLen<2, T> => array.length >= 2;

  export const isArrayOfLength3OrMore = <T>(
    array: readonly T[]
  ): array is ArrayAtLeastLen<3, T> => array.length >= 3;

  export const isArrayOfLength4OrMore = <T>(
    array: readonly T[]
  ): array is ArrayAtLeastLen<4, T> => array.length >= 4;

  export const isArrayOfLength5OrMore = <T>(
    array: readonly T[]
  ): array is ArrayAtLeastLen<5, T> => array.length >= 5;

  export const isArrayOfLength6OrMore = <T>(
    array: readonly T[]
  ): array is ArrayAtLeastLen<6, T> => array.length >= 6;

  // eslint-disable-next-line @typescript-eslint/no-shadow
  export const length = <T extends readonly unknown[]>(
    list: T
  ): Length<T> & number => list.length;

  export const size = length;

  /**
   * Creates an array from an iterable object.
   * @param iterable An iterable object to convert to an array.
   */
  export const from: <T>(
    iterable: Iterable<T> | Readonly<ArrayLike<T>>
  ) => readonly T[] = ArrayFrom;

  export const asMut = <T>(list: readonly T[]): T[] => list as T[];

  /**
   * Creates an array from an iterable object.
   * @param iterable An iterable object to convert to an array.
   * @param mapfn A mapping function to call on every element of the array.
   * @param thisArg Value of 'this' used to invoke the mapfn.
   */
  export const fromMapped: <T, U>(
    iterable: Iterable<T> | Readonly<ArrayLike<T>>,
    mapfn: (v: T, k: number) => U
  ) => readonly U[] = ArrayFrom;

  type Index1000 = Index<1000>;

  export function zeros<N extends Index1000>(
    len: N
  ): Result<ArrayOfLength<N, 0>, string>;
  export function zeros(len: number): Result<readonly 0[], string>;
  export function zeros(len: number): Result<readonly 0[], string> {
    return !Num.isUint32(len)
      ? Result.err('len should be uint32')
      : Result.ok(
          // eslint-disable-next-line functional/immutable-data
          ArrayFrom<0>({ length: len }).fill(0)
        );
  }

  export function zerosUnwrapped<N extends Index1000>(
    len: N
  ): ArrayOfLength<N, 0>;
  export function zerosUnwrapped(len: number): readonly 0[];
  export function zerosUnwrapped(len: number): readonly 0[] {
    return Result.unwrapThrow(zeros(len));
  }

  export function seq<N extends Index1000>(len: N): Result<Seq<N>, string>;
  export function seq(len: number): Result<readonly number[], string>;
  export function seq(len: number): Result<readonly number[], string> {
    return pipe(zeros(len)).chain(Result.map((l) => map(l, (_, i) => i))).value;
  }

  export function seqUnwrapped<N extends Index1000>(len: N): Seq<N>;
  export function seqUnwrapped(len: number): readonly number[];
  export function seqUnwrapped(len: number): readonly number[] {
    return Result.unwrapThrow(seq(len));
  }

  export function newArray<T, N extends Index1000>(
    len: N,
    init: T
  ): Result<ArrayOfLength<N, T>, string>;
  export function newArray<T>(
    len: number,
    init: T
  ): Result<readonly T[], string>;
  export function newArray<T>(
    len: number,
    init: T
  ): Result<readonly T[], string> {
    return pipe(zeros(len)).chain(Result.map((l) => l.map(() => init))).value;
  }

  export function newArrayThrow<T, N extends Index1000>(
    len: number,
    init: T
  ): ArrayOfLength<N, T>;
  export function newArrayThrow<T>(len: number, init: T): readonly T[];
  export function newArrayThrow<T>(len: number, init: T): readonly T[] {
    return Result.unwrapThrow(newArray(len, init));
  }

  export const range = (
    start: number,
    end: number,
    step: number = 1
  ): Result<readonly number[], string> =>
    pipe(seq(end - start)).chain(
      Result.map((l) => l.map((n) => n * step + start))
    ).value;

  export const rangeThrow = (
    start: number,
    end: number,
    step: number = 1
  ): readonly number[] => Result.unwrapThrow(range(start, end, step));

  export const copy = <T extends readonly unknown[]>(list: T): T =>
    list.slice() as T;
  {
    const ar = [1, 2, 3] as const;
    const ar2 = copy(ar);

    assertType<TypeEq<typeof ar2, readonly [1, 2, 3]>>();
  }

  export const slice = <T>(
    list: readonly T[],
    start: number,
    end: number
  ): readonly T[] => {
    const startClamped = Num.clamp(0, list.length)(start);
    const endClamped = Num.clamp(startClamped, list.length)(end);

    return list.slice(startClamped, endClamped);
  };

  export function head(list: readonly []): undefined;
  export function head<H, L extends readonly unknown[]>(
    list: readonly [H, ...L]
  ): H;
  export function head<T>(list: NonEmptyArray<T>): T;
  export function head<T>(list: readonly T[]): T | undefined;
  export function head<T>(list: readonly T[]): T | undefined {
    return isEmpty(list) ? undefined : list[0];
  }

  export const first = head;

  export function last(list: readonly []): undefined;
  export function last<H extends readonly unknown[], L>(
    list: readonly [...H, L]
  ): L;
  export function last<T>(list: NonEmptyArray<T>): T;
  export function last<T>(list: readonly T[]): T | undefined;
  export function last<T>(list: readonly T[]): T | undefined {
    return list.at(-1);
  }

  export const tail = <T extends readonly unknown[]>(
    list: T
  ): ListType.Tail<T> => list.slice(1) as ListType.Tail<T>;

  export const rest = tail;
  export const shift = tail;

  export const butLast = <T extends readonly unknown[]>(
    list: T
  ): ListType.ButLast<T> =>
    (isEmpty(list) ? [] : list.slice(0, -1)) as ListType.ButLast<T>;

  export const take = <T extends readonly unknown[], N extends number>(
    list: T,
    num: N
  ): ListType.Take<N, T> => slice(list, 0, num) as ListType.Take<N, T>;

  export const takeLast = <T extends readonly unknown[], N extends number>(
    list: T,
    num: N
  ): ListType.TakeLast<N, T> =>
    slice(list, size(list) - num, size(list)) as ListType.TakeLast<N, T>;

  export const skip = <T extends readonly unknown[], N extends number>(
    list: T,
    num: N
  ): ListType.Skip<N, T> => slice(list, num, size(list)) as ListType.Skip<N, T>;

  export const skipLast = <T extends readonly unknown[], N extends number>(
    list: T,
    num: N
  ): ListType.SkipLast<N, T> =>
    slice(list, 0, size(list) - num) as ListType.SkipLast<N, T>;

  export const pop = butLast;

  export function every<A, B extends A>(
    list: readonly A[],
    predicate: (value: A, index: number) => value is B
  ): list is readonly B[];
  export function every<A>(
    list: readonly A[],
    predicate: (value: A, index: number) => boolean
  ): boolean;
  export function every<A>(
    list: readonly A[],
    predicate: (value: A, index: number) => boolean
  ): boolean {
    return list.every(predicate);
  }

  export const some = <A>(
    list: readonly A[],
    predicate: (value: A, index: number) => boolean
  ): boolean => list.some(predicate);

  export const map = <T extends readonly unknown[], B>(
    list: T,
    mapFn: (a: T[number], index: number) => B
  ): { readonly [K in keyof T]: B } =>
    list.map(mapFn as (a: unknown, index: number) => B) as {
      readonly [K in keyof T]: B;
    };

  // TODO: support tuple type
  export const flat = <T extends readonly unknown[], D extends number = 1>(
    list: T,
    depth: D = 1 as D
  ): readonly FlatArray<T, D>[] => list.flat(depth);

  export const flatMap = <T extends readonly unknown[], M>(
    list: T,
    mapper: (value: T[number], key: number) => readonly M[]
  ): readonly M[] =>
    list.flatMap(mapper as (value: T[number], key: number) => readonly M[]);

  // TODO: add an overload of NonEmpty case
  export const zip = <
    T1 extends readonly unknown[],
    T2 extends readonly unknown[]
  >(
    list1: T1,
    list2: T2
  ): ListType.Zip<T1, T2> => {
    const len = Math.min(list1.length, list2.length);

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return seqUnwrapped(len).map((i) => tp(list1[i]!, list2[i]!));
  };

  export function filter<T, S extends T>(
    list: readonly T[],
    predicate: (value: T, index: number) => value is S
  ): readonly S[];
  export function filter<T>(
    list: readonly T[],
    predicate: (value: T, index: number) => boolean
  ): readonly T[];
  export function filter<T>(
    list: readonly T[],
    predicate: (value: T, index: number) => boolean
  ): readonly T[] {
    return list.filter(predicate);
  }

  {
    const a = [1, 2, 3] as const;
    const r = filter(a, (x): x is 1 => x === 1);

    assertType<TypeEq<typeof r, readonly 1[]>>();
  }

  export const filterNot = <T extends readonly unknown[]>(
    list: T,
    predicate: (a: T[number], index: number) => boolean
  ): readonly T[number][] =>
    list.filter((a, i) => !predicate(a as T[number], i));

  // TODO: improve type
  export const set = <T extends readonly unknown[], N>(
    list: T,
    index: number,
    newValue: N
  ): { readonly [K in keyof T]: N | T[K] } =>
    map(list, (a, i) => (i === index ? newValue : a)) as {
      readonly [K in keyof T]: N | T[K];
    };

  // TODO: improve type
  export const update = <T extends readonly unknown[], N>(
    list: T,
    index: number,
    updater: (prev: T[number]) => N
  ): { readonly [K in keyof T]: N | T[K] } =>
    map(list, (a, i) => (i === index ? updater(a) : a)) as {
      readonly [K in keyof T]: N | T[K];
    };

  // TODO: improve type
  export const insert = <A>(
    list: readonly A[],
    index: number,
    newValue: A
  ): readonly A[] => {
    const mut_temp = ArrayFrom(list);

    mut_temp.splice(index, 0, newValue);

    return mut_temp;
  };

  export const remove = <A>(
    list: readonly A[],
    index: number
  ): readonly A[] => {
    // eslint-disable-next-line no-restricted-globals
    const mut_temp = ArrayFrom(list);

    mut_temp.splice(index, 1);

    return mut_temp;
  };

  export const push = <T extends readonly unknown[], N = T>(
    list: T,
    value: N
  ): readonly [...T, N] => [...list, value];

  export const unshift = <T extends readonly unknown[], N = T>(
    list: T,
    value: N
  ): readonly [N, ...T] => [value, ...list];

  export const concat = <
    T1 extends readonly unknown[],
    T2 extends readonly unknown[]
  >(
    list1: T1,
    list2: T2
  ): readonly [...T1, ...T2] => [...list1, ...list2];

  export const partition = <N extends number, T>(
    list: readonly T[],
    n: N
  ): readonly ArrayOfLength<N, T>[] =>
    seqUnwrapped(Math.ceil(list.length / n)).map(
      (i: number) =>
        list.slice(n * i, n * (i + 1)) as unknown as ArrayOfLength<N, T>
    );

  export const reverse = <T extends readonly unknown[]>(
    list: T
  ): ListType.Reverse<T> =>
    // eslint-disable-next-line functional/immutable-data
    ArrayFrom(list).reverse() as ListType.Reverse<T>;

  export function sort<T extends readonly number[]>(
    list: T,
    comparator?: (x: T[number], y: T[number]) => number
  ): { readonly [K in keyof T]: T[number] };
  export function sort<T extends readonly unknown[]>(
    list: T,
    comparator: (x: T[number], y: T[number]) => number
  ): { readonly [K in keyof T]: T[number] };
  export function sort<T extends readonly unknown[]>(
    list: T,
    comparator?: (x: T[number], y: T[number]) => number
  ): { readonly [K in keyof T]: T[number] } {
    const cmp = comparator ?? ((x, y) => (x as number) - (y as number));

    // eslint-disable-next-line functional/immutable-data
    return ArrayFrom(list).sort(cmp) as {
      readonly [K in keyof T]: T[number];
    };
  }

  export function sortBy<T extends readonly unknown[]>(
    list: T,
    comparatorValueMapper: (value: T[number]) => number,
    comparator?: (x: number, y: number) => number
  ): { readonly [K in keyof T]: T[number] };
  export function sortBy<T extends readonly unknown[], B>(
    list: T,
    comparatorValueMapper: (value: T[number]) => B,
    comparator: (x: B, y: B) => number
  ): { readonly [K in keyof T]: T[number] };
  export function sortBy<T extends readonly unknown[], B>(
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

  export const includes = <A>(list: readonly A[], searchElement: A): boolean =>
    list.includes(searchElement);

  // eslint-disable-next-line @typescript-eslint/no-shadow
  export const find = <A>(
    list: readonly A[],
    predicate: (value: A, index: number) => boolean
  ): A | undefined =>
    list.find(predicate as (value: A, index: number) => boolean);

  export function min<T extends readonly [number, ...(readonly number[])]>(
    list: T,
    comparator?: (x: T[number], y: T[number]) => number
  ): T[number];
  export function min<T extends readonly number[]>(
    list: T,
    comparator?: (x: T[number], y: T[number]) => number
  ): T[number] | undefined;
  export function min<T extends readonly [unknown, ...(readonly unknown[])]>(
    list: T,
    comparator: (x: T[number], y: T[number]) => number
  ): T[number];
  export function min<T extends readonly unknown[]>(
    list: T,
    comparator: (x: T[number], y: T[number]) => number
  ): T[number] | undefined;
  export function min<T extends readonly unknown[]>(
    list: T,
    comparator?: (x: T[number], y: T[number]) => number
  ): T[number] | undefined {
    const cmp = comparator ?? ((x, y) => (x as number) - (y as number));

    return isEmpty(list)
      ? undefined
      : list.reduce((mx, curr) => (cmp(mx, curr) < 0 ? mx : curr), list[0]);
  }

  export function max<T extends readonly [number, ...(readonly number[])]>(
    list: T,
    comparator?: (x: T[number], y: T[number]) => number
  ): T[number];
  export function max<T extends readonly number[]>(
    list: T,
    comparator?: (x: T[number], y: T[number]) => number
  ): T[number] | undefined;
  export function max<T extends readonly [unknown, ...(readonly unknown[])]>(
    list: T,
    comparator: (x: T[number], y: T[number]) => number
  ): T[number];
  export function max<T extends readonly unknown[]>(
    list: T,
    comparator: (x: T[number], y: T[number]) => number
  ): T[number] | undefined;
  export function max<T extends readonly unknown[]>(
    list: T,
    comparator?: (x: T[number], y: T[number]) => number
  ): T[number] | undefined {
    const cmp = comparator ?? ((x, y) => (x as number) - (y as number));

    return min(list, (x, y) => -cmp(x, y));
  }

  export function minBy<T extends readonly [unknown, ...(readonly unknown[])]>(
    list: T,
    comparatorValueMapper: (value: T[number]) => number,
    comparator?: (x: number, y: number) => number
  ): T[number];
  export function minBy<T extends readonly unknown[]>(
    list: T,
    comparatorValueMapper: (value: T[number]) => number,
    comparator?: (x: number, y: number) => number
  ): T[number] | undefined;
  export function minBy<
    T extends readonly [unknown, ...(readonly unknown[])],
    B
  >(
    list: T,
    comparatorValueMapper: (value: T[number]) => B,
    comparator: (x: B, y: B) => number
  ): T[number];
  export function minBy<T extends readonly unknown[], B>(
    list: T,
    comparatorValueMapper: (value: T[number]) => B,
    comparator: (x: B, y: B) => number
  ): T[number] | undefined;
  export function minBy<T extends readonly unknown[], B>(
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

  export function maxBy<T extends readonly [unknown, ...(readonly unknown[])]>(
    list: T,
    comparatorValueMapper: (value: T[number]) => number,
    comparator?: (x: number, y: number) => number
  ): T[number];
  export function maxBy<T extends readonly unknown[]>(
    list: T,
    comparatorValueMapper: (value: T[number]) => number,
    comparator?: (x: number, y: number) => number
  ): T[number] | undefined;
  export function maxBy<
    T extends readonly [unknown, ...(readonly unknown[])],
    B
  >(
    list: T,
    comparatorValueMapper: (value: T[number]) => B,
    comparator: (x: B, y: B) => number
  ): T[number];
  export function maxBy<T extends readonly unknown[], B>(
    list: T,
    comparatorValueMapper: (value: T[number]) => B,
    comparator: (x: B, y: B) => number
  ): T[number] | undefined;
  export function maxBy<T extends readonly unknown[], B>(
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

  export const sum = (list: readonly number[]): number =>
    list.reduce((prev, curr) => prev + curr, 0);

  export const foldl = <T extends readonly unknown[], S>(
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

  export const reduce = foldl;

  export const foldr = <T extends readonly unknown[], S>(
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

  export const reduceRight = foldr;

  export const scan = <A, B>(
    list: NonEmptyArray<A> | readonly A[],
    reducer: ReducerType<B, A>,
    init: B
  ): NonEmptyArray<B> => {
    const mut_result: B[] = ArrayFrom(newArrayThrow<B>(list.length + 1, init));

    let mut_acc = init;

    for (const [index, value] of list.entries()) {
      mut_acc = reducer(mut_acc, value);
      mut_result[index + 1] = mut_acc;
    }

    return mut_result as readonly B[] as NonEmptyArray<B>;
  };

  export const count = <A>(
    list: readonly A[],
    predicate: (value: A, index: number) => boolean = () => true
  ): number =>
    list.reduce<number>(
      (acc, curr, index) => (predicate(curr, index) ? acc + 1 : acc),
      0
    );

  export const countBy = <T extends readonly unknown[], G extends Primitive>(
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

  export const groupBy = <T extends readonly unknown[], G extends Primitive>(
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
   * @param mapFn perform identity check after mapping by the map function
   */
  export function uniq<T>(list: NonEmptyArray<T>): NonEmptyArray<T>;
  export function uniq<T>(list: readonly T[]): readonly T[];
  export function uniq<T>(list: readonly T[]): readonly T[] {
    return ArrayFrom(new MutableSet(list));
  }

  export function uniqBy<A, B>(
    list: NonEmptyArray<A>,
    mapFn: (value: A) => B
  ): NonEmptyArray<A>;
  export function uniqBy<A, B>(
    list: readonly A[],
    mapFn: (value: A) => B
  ): readonly A[];
  export function uniqBy<A, B>(
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

  export const indexIsInRange = <T>(
    list: readonly T[],
    index: number
  ): boolean => Num.isUint32(index) && 0 <= index && index < list.length;

  export const eq = <T>(list1: readonly T[], list2: readonly T[]): boolean =>
    list1.length === list2.length && list1.every((v, i) => v === list2[i]);

  /** @returns list1 ⊂ list2 */
  export const isSubset = <A extends Primitive, B extends Primitive = A>(
    list1: readonly A[],
    list2: readonly B[]
  ): boolean => list1.every((a) => list2.includes(a as A & B));

  /** @returns list1 ⊃ list2 */
  export const isSuperset = <A extends Primitive, B extends Primitive = A>(
    list1: readonly A[],
    list2: readonly B[]
  ): boolean => isSubset(list2, list1);

  export const setIntersection = <A extends Primitive, B extends Primitive = A>(
    list1: readonly A[],
    list2: readonly B[]
  ): readonly (A & B)[] =>
    list1.filter((e) => list2.includes(e as A & B)) as readonly (A & B)[];

  export const setDifference = <A extends Primitive>(
    list1: readonly A[],
    list2: readonly A[]
  ): readonly A[] => list1.filter((e) => !list2.includes(e));

  export const sortedNumSetDifference = <T extends number>(
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
}

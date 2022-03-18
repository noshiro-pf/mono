import { pipe, Result } from '../functional';
import { clamp } from '../num';
import { ituple } from '../others';
import type {
  ReadonlyListButLast,
  ReadonlyListReverse,
  ReadonlyListSkip,
  ReadonlyListSkipLast,
  ReadonlyListTail,
  ReadonlyListTake,
  ReadonlyListTakeLast,
  ReadonlyListZip,
} from '../types';
import { assertType } from '../types';
import { isUint32 } from '../validator';
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
  export const isEmpty = <T>(list: readonly T[]): list is readonly [] =>
    list.length === 0;

  export const isNonEmpty = <T>(
    list: readonly T[]
  ): list is ReadonlyNonEmptyArray<T> => list.length > 0;

  // eslint-disable-next-line @typescript-eslint/no-shadow
  export const length = <T extends readonly unknown[]>(
    list: T
  ): Length<T> & number => list.length;

  export const size = length;

  export const zeros = (len: number): Result<readonly 0[], string> =>
    !isUint32(len)
      ? Result.err('len should be uint32')
      : Result.ok(new Array<0>(len).fill(0));

  export const zerosThrow = (len: number): readonly 0[] =>
    Result.unwrapThrow(zeros(len));

  export const seq = (len: number): Result<readonly number[], string> =>
    pipe(zeros(len)).chain(Result.map((l) => l.map((_, i) => i))).value;

  export const seqThrow = (len: number): readonly number[] =>
    Result.unwrapThrow(seq(len));

  export const newArray = <T>(
    len: number,
    init: T
  ): Result<readonly T[], string> =>
    pipe(zeros(len)).chain(Result.map((l) => l.map(() => init))).value;

  export const newArrayThrow = <T>(len: number, init: T): readonly T[] =>
    Result.unwrapThrow(newArray(len, init));

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
    const startClamped = clamp(0, list.length)(start);
    const endClamped = clamp(startClamped, list.length)(end);
    return list.slice(startClamped, endClamped);
  };

  export function head(list: readonly []): undefined;
  export function head<H, L extends readonly unknown[]>(
    list: readonly [H, ...L]
  ): H;
  export function head<T>(list: ReadonlyNonEmptyArray<T>): T;
  export function head<T>(list: readonly T[]): T | undefined;
  export function head<T>(list: readonly T[]): T | undefined {
    return isEmpty(list) ? undefined : list[0];
  }

  export const first = head;

  export function last(list: readonly []): undefined;
  export function last<H extends readonly unknown[], L>(
    list: readonly [...H, L]
  ): L;
  export function last<T>(list: ReadonlyNonEmptyArray<T>): T;
  export function last<T>(list: readonly T[]): T | undefined;
  export function last<T>(list: readonly T[]): T | undefined {
    return isEmpty(list) ? undefined : list[list.length - 1];
  }

  export const tail = <T extends readonly unknown[]>(
    list: T
  ): ReadonlyListTail<T> => list.slice(1) as ReadonlyListTail<T>;

  export const rest = tail;
  export const shift = tail;

  export const butLast = <T extends readonly unknown[]>(
    list: T
  ): ReadonlyListButLast<T> =>
    (isEmpty(list) ? [] : list.slice(0, -1)) as ReadonlyListButLast<T>;

  export const take = <T extends readonly unknown[], N extends number>(
    list: T,
    num: N
  ): ReadonlyListTake<N, T> => slice(list, 0, num) as ReadonlyListTake<N, T>;

  export const takeLast = <T extends readonly unknown[], N extends number>(
    list: T,
    num: N
  ): ReadonlyListTakeLast<N, T> =>
    slice(list, size(list) - num, size(list)) as ReadonlyListTakeLast<N, T>;

  export const skip = <T extends readonly unknown[], N extends number>(
    list: T,
    num: N
  ): ReadonlyListSkip<N, T> =>
    slice(list, num, size(list)) as ReadonlyListSkip<N, T>;

  export const skipLast = <T extends readonly unknown[], N extends number>(
    list: T,
    num: N
  ): ReadonlyListSkipLast<N, T> =>
    slice(list, 0, size(list) - num) as ReadonlyListSkipLast<N, T>;

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
  ): boolean => list.some(predicate as (value: A, index: number) => boolean);

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

  // // TODO: add an overload of NonEmpty case
  export const zip = <
    T1 extends readonly unknown[],
    T2 extends readonly unknown[]
  >(
    list1: T1,
    list2: T2
  ): ReadonlyListZip<T1, T2> => {
    const len = Math.min(list1.length, list2.length);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return seqThrow(len).map((i) => ituple(list1[i]!, list2[i]!));
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
    const mut_temp = Array.from(list);
    mut_temp.splice(index, 0, newValue);
    return mut_temp;
  };

  export const remove = <A>(
    list: readonly A[],
    index: number
  ): readonly A[] => {
    const mut_temp = Array.from(list);
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
  ): readonly ReadonlyArrayOfLength<N, T>[] =>
    seqThrow(Math.ceil(list.length / n)).map(
      (i: number) =>
        list.slice(n * i, n * (i + 1)) as unknown as ReadonlyArrayOfLength<N, T>
    );

  export const reverse = <T extends readonly unknown[]>(
    list: T
  ): ReadonlyListReverse<T> =>
    Array.from(list).reverse() as readonly unknown[] as ReadonlyListReverse<T>;

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
    return Array.from(list).sort(cmp) as readonly unknown[] as {
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
    list: ReadonlyNonEmptyArray<A> | readonly A[],
    reducer: ReducerType<B, A>,
    init: B
  ): ReadonlyNonEmptyArray<B> => {
    const mut_result: B[] = Array.from(newArrayThrow<B>(list.length + 1, init));

    let acc = init;
    for (const [index, value] of list.entries()) {
      acc = reducer(acc, value);
      mut_result[index + 1] = acc;
    }

    return mut_result as readonly B[] as ReadonlyNonEmptyArray<B>;
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
    const groups = new Map<G, number>();
    for (const [index, e] of list.entries()) {
      const key = grouper(e, index);
      const curr = groups.get(key) ?? 0;
      groups.set(key, curr + 1);
    }
    return IMap.new(groups);
  };

  export const groupBy = <T extends readonly unknown[], G extends Primitive>(
    list: T,
    grouper: (value: T[number], index: number) => G
  ): IMap<G, readonly T[number][]> => {
    const mut_groups = new Map<G, T[number][]>();
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
  export function uniq<T>(
    list: ReadonlyNonEmptyArray<T>
  ): ReadonlyNonEmptyArray<T>;
  export function uniq<T>(list: readonly T[]): readonly T[];
  export function uniq<T>(list: readonly T[]): readonly T[] {
    return Array.from(new Set(list));
  }

  export function uniqBy<A, B>(
    list: ReadonlyNonEmptyArray<A>,
    mapFn: (value: A) => B
  ): ReadonlyNonEmptyArray<A>;
  export function uniqBy<A, B>(
    list: readonly A[],
    mapFn: (value: A) => B
  ): readonly A[];
  export function uniqBy<A, B>(
    list: readonly A[],
    mapFn: (value: A) => B
  ): readonly A[] {
    const mappedValues = new Set();
    return list.filter((val) => {
      const mappedValue = mapFn(val);
      if (mappedValues.has(mappedValue)) return false;
      mappedValues.add(mappedValue);
      return true;
    });
  }

  export const indexIsInRange = <T>(
    list: readonly T[],
    index: number
  ): boolean => isUint32(index) && 0 <= index && index < list.length;

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

  export const setDifference = <T extends Primitive>(
    sortedList1: readonly T[],
    sortedList2: readonly T[]
  ): readonly T[] => {
    const mut_result: T[] = [];
    let it1 = 0; // iterator for sortedArray1
    let it2 = 0; // iterator for sortedArray2
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    let val1: T = sortedList1[it1]!;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    let val2: T = sortedList2[it2]!;
    while (it1 < sortedList1.length && it2 < sortedList2.length) {
      if (val1 === val2) {
        it1 += 1;
        it2 += 1;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        val1 = sortedList1[it1]!;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        val2 = sortedList2[it2]!;
      } else if (val1 < val2) {
        mut_result.push(val1);
        it1 += 1;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        val1 = sortedList1[it1]!;
      } else {
        it2 += 1;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        val2 = sortedList2[it2]!;
      }
    }
    for (; it1 < sortedList1.length; it1 += 1) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      mut_result.push(sortedList1[it1]!);
    }
    return mut_result;
  };
}

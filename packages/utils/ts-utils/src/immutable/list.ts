import { seq } from '../array';
import { clamp } from '../num';
import { ituple } from '../others';
import type {
  Length,
  PrimitiveType,
  ReadonlyListButLast,
  ReadonlyListReverse,
  ReadonlyListTail,
  ReadonlyListZip,
  TypeEq,
  uint32,
} from '../types';
import { assertType } from '../types';

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
  export const isEmpty = (list: readonly unknown[]): list is readonly [] =>
    list.length === 0;

  // eslint-disable-next-line @typescript-eslint/no-shadow
  export const length = <T extends readonly unknown[]>(list: T): Length<T> =>
    list.length;

  export const size = length;

  export const slice = <T>(
    list: readonly T[],
    start: uint32,
    end: uint32
  ): readonly T[] => {
    const startClamped = clamp(0, list.length)(start);
    const endClamped = clamp(startClamped, list.length)(end);
    return list.slice(startClamped, endClamped);
  };

  export const head = <H, R extends readonly unknown[]>(
    list: readonly [H, ...R]
  ): H => list[0];

  export const first = head;

  export const last = <H extends readonly unknown[], L>(
    list: readonly [...H, L]
  ): L => list[list.length - 1] as L;

  export const tail = <T extends readonly unknown[]>(
    list: T
  ): ReadonlyListTail<T> => list.slice(1) as unknown as ReadonlyListTail<T>;

  export const rest = tail;
  export const shift = tail;

  export const butLast = <T extends readonly unknown[]>(
    list: T
  ): ReadonlyListButLast<T> =>
    (isEmpty(list)
      ? []
      : list.slice(0, -1)) as unknown as ReadonlyListButLast<T>;

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
    predicate: (value: A, index: uint32) => boolean
  ): boolean => list.some(predicate as (value: A, index: number) => boolean);

  export const map = <T extends readonly unknown[], B>(
    list: T,
    mapFn: (a: T[number], index: uint32) => B
  ): { readonly [K in keyof T]: B } =>
    list.map(mapFn as (a: unknown, index: number) => B) as unknown as {
      readonly [K in keyof T]: B;
    };

  // TODO: support tuple type
  export const flat = <T extends readonly unknown[], D extends number = 1>(
    list: T,
    depth: D = 1 as D
  ): readonly FlatArray<T, D>[] => list.flat(depth);

  export const flatMap = <T extends readonly unknown[], M>(
    list: T,
    mapper: (value: T[number], key: uint32) => readonly M[]
  ): readonly M[] =>
    list.flatMap(mapper as (value: T[number], key: number) => readonly M[]);

  export const zip = <
    T1 extends readonly unknown[],
    T2 extends readonly unknown[]
  >(
    list1: T1,
    list2: T2
  ): ReadonlyListZip<T1, T2> => {
    const len = Math.min(list1.length, list2.length) as uint32;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return seq(len).map((i) => ituple(list1[i]!, list2[i]!));
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
    predicate: (a: T[number], index: uint32) => boolean
  ): readonly T[number][] =>
    list.filter((a, i) => !predicate(a as T[number], i as uint32));

  // TODO: improve type
  export const set = <T extends readonly unknown[], N>(
    list: T,
    index: uint32,
    newValue: N
  ): { [K in keyof T]: N | T[K] } =>
    map(list, (a, i) => (i === index ? newValue : a)) as {
      [K in keyof T]: N | T[K];
    };

  // TODO: improve type
  export const update = <T extends readonly unknown[], N>(
    list: T,
    index: uint32,
    updater: (prev: T[number]) => N
  ): { [K in keyof T]: N | T[K] } =>
    map(list, (a, i) => (i === index ? updater(a) : a)) as {
      [K in keyof T]: N | T[K];
    };

  // TODO: improve type
  export const insert = <A>(
    list: readonly A[],
    index: uint32,
    newValue: A
  ): readonly A[] =>
    list.flatMap((a, i) => (i === index ? [newValue, a] : [a])) as readonly A[];

  export const remove = <A>(list: readonly A[], index: uint32): readonly A[] =>
    list.flatMap((a, i) => (i === index ? [] : [a]));

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

  export const reverse = <T extends readonly unknown[]>(
    list: T
  ): ReadonlyListReverse<T> =>
    list.slice().reverse() as unknown as ReadonlyListReverse<T>;

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
    return list.slice().sort(cmp) as unknown as {
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
    predicate: (value: A, index: uint32) => boolean
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

  export const foldl = <T extends readonly unknown[], S>(
    list: T,
    callbackfn: (
      previousValue: S,
      currentValue: T[number],
      currentIndex: uint32
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
      currentIndex: uint32
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

  export const count = <A>(
    list: readonly A[],
    predicate: (value: A, index: uint32) => boolean = () => true
  ): uint32 =>
    list.reduce<uint32>(
      (sum, curr, index) =>
        predicate(curr, index as uint32)
          ? (((sum as number) + 1) as uint32)
          : sum,
      // eslint-disable-next-line @typescript-eslint/prefer-reduce-type-parameter
      0 as uint32
    );

  export const countBy = <
    T extends readonly unknown[],
    G extends PrimitiveType
  >(
    list: T,
    grouper: (value: T[number], index: uint32) => G
  ): ReadonlyMap<G, uint32> => {
    const groups = new Map<G, number>();
    for (const [index, e] of list.entries()) {
      const key = grouper(e, index as uint32);
      const curr = groups.get(key) ?? 0;
      groups.set(key, curr + 1);
    }
    return groups as Map<G, uint32>;
  };

  export const groupBy = <
    T extends readonly unknown[],
    G extends PrimitiveType
  >(
    list: T,
    grouper: (value: T[number], index: uint32) => G
  ): ReadonlyMap<G, readonly T[number][]> => {
    const groups = new Map<G, T[number][]>();
    for (const [index, e] of list.entries()) {
      const key = grouper(e, index as uint32);
      if (groups.has(key)) {
        groups.get(key)?.push(e);
      } else {
        groups.set(key, [e]);
      }
    }
    return groups;
  };

  /**
   * @description true if `list1` is subset of `list2`
   */
  export const isSubset = <A, B = A>(
    list1: readonly A[],
    list2: readonly B[]
  ): boolean => list1.every((a) => list2.includes(a as unknown as B));

  /**
   * @description true if `list1` is superset of `list2`
   */
  export const isSuperset = <A, B = A>(
    list1: readonly A[],
    list2: readonly B[]
  ): boolean => isSubset(list2, list1);
}

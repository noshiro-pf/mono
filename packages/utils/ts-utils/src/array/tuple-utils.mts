import { Num } from '../num/index.mjs';

function length<const T extends readonly unknown[]>(list: T): Length<T> {
  return list.length;
}

const reversed = <const T extends readonly unknown[]>(
  tpl: T,
): Tuple.Reverse<T> =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, total-functions/no-unsafe-type-assertion
  tpl.toReversed() as unknown as Tuple.Reverse<T>;

type MapNumberToArraySearchResult<T> = T extends number
  ? TypeEq<T, number> extends true
    ? NumberType.ArraySearchResult
    : T
  : T;

type IndexOfTupleRefined<T extends readonly unknown[]> =
  MapNumberToArraySearchResult<IndexOfTuple<T>>;

const findIndex = <const T extends readonly unknown[]>(
  tpl: T,
  predicate: (value: T[number], index: NumberType.ArraySize) => boolean,
): IndexOfTupleRefined<T> | -1 =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  tpl.findIndex(
    predicate as (value: T[number], index: NumberType.ArraySize) => boolean,
  ) as IndexOfTupleRefined<T> | -1;

const indexOf = <const T extends readonly unknown[]>(
  tpl: T,
  searchElement: T[number],
  fromIndex?: IndexOfTupleRefined<T>,
): IndexOfTupleRefined<T> | -1 =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  tpl.indexOf(searchElement, fromIndex) as
    | MapNumberToArraySearchResult<IndexOfTuple<T>>
    | -1;

const lastIndexOf = <const T extends readonly unknown[]>(
  tpl: T,
  searchElement: T[number],
  fromIndex?: IndexOfTupleRefined<T>,
): IndexOfTupleRefined<T> | -1 =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  tpl.lastIndexOf(searchElement, fromIndex) as IndexOfTupleRefined<T>;

const map = <const T extends readonly unknown[], const B>(
  tpl: T,
  mapFn: (a: T[number], index: NumberType.ArraySize) => B,
): { readonly [K in keyof T]: B } =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  tpl.map(mapFn as (a: unknown, index: NumberType.ArraySize) => B) as {
    readonly [K in keyof T]: B;
  };

const set = <const T extends readonly unknown[], const N>(
  tpl: T,
  index: Index<Length<T>>,
  newValue: N,
): { readonly [K in keyof T]: N | T[K] } =>
  map(tpl, (a, i) => (i === index ? newValue : a)) as {
    readonly [K in keyof T]: N | T[K];
  };

// TODO: improve type
const update = <const T extends readonly unknown[], const N>(
  tpl: T,

  index: NumberType.ArraySize | (Index<Length<T>> & SmallUint),
  updater: (prev: T[number]) => N,
): { readonly [K in keyof T]: N | T[K] } =>
  map(tpl, (a, i) => (i === index ? updater(a) : a)) as {
    readonly [K in keyof T]: N | T[K];
  };

function sorted<const T extends readonly number[]>(
  tpl: T,
): { readonly [K in keyof T]: T[number] };
function sorted<const T extends readonly unknown[]>(
  tpl: T,
  // eslint-disable-next-line @typescript-eslint/unified-signatures
  comparator: (x: T[number], y: T[number]) => number,
): { readonly [K in keyof T]: T[number] };
function sorted<const T extends readonly unknown[]>(
  tpl: T,
  comparator?: (x: T[number], y: T[number]) => number,
): { readonly [K in keyof T]: T[number] } {
  const cmp = comparator ?? ((x, y) => Num.from(x) - Num.from(y));

  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  return tpl.toSorted(cmp) as {
    readonly [K in keyof T]: T[number];
  };
}

function sortedBy<const T extends readonly unknown[]>(
  tpl: T,
  comparatorValueMapper: (value: T[number]) => number,
  comparator?: (x: number, y: number) => number,
): { readonly [K in keyof T]: T[number] };
function sortedBy<const T extends readonly unknown[], const B>(
  tpl: T,
  comparatorValueMapper: (value: T[number]) => B,
  comparator: (x: B, y: B) => number,
): { readonly [K in keyof T]: T[number] };
function sortedBy<const T extends readonly unknown[], const B>(
  tpl: T,
  comparatorValueMapper: (value: T[number]) => B,
  comparator?: (x: B, y: B) => number,
): { readonly [K in keyof T]: T[number] } {
  return sorted(tpl, (x, y) =>
    comparator === undefined
      ? // eslint-disable-next-line total-functions/no-unsafe-type-assertion
        (comparatorValueMapper(x) as number) -
        // eslint-disable-next-line total-functions/no-unsafe-type-assertion
        (comparatorValueMapper(y) as number)
      : comparator(comparatorValueMapper(x), comparatorValueMapper(y)),
  );
}

export const Tpl = {
  length,
  reversed,
  findIndex,
  indexOf,
  lastIndexOf,
  map,
  set,
  update,
  sorted,
  sortedBy,
} as const;

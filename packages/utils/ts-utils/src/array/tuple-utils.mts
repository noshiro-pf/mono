import { Num } from '../num/index.mjs';

function length<T extends readonly unknown[]>(list: T): Length<T> {
  return list.length;
}

const reversed = <T extends readonly unknown[]>(tpl: T): Tuple.Reverse<T> =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, no-restricted-syntax
  tpl.toReversed() as unknown as Tuple.Reverse<T>;

const findIndex = <T extends readonly unknown[]>(
  tpl: T,
  predicate: (value: T[number], index: NumberType.ArraySize) => boolean,
): IndexOfTuple<T> | -1 =>
  // eslint-disable-next-line no-restricted-syntax
  tpl.findIndex(
    // eslint-disable-next-line no-restricted-syntax
    predicate as (value: T[number], index: NumberType.ArraySize) => boolean,
  ) as IndexOfTuple<T>;

const indexOf = <T extends readonly unknown[]>(
  tpl: T,
  searchElement: T[number],
  fromIndex?: IndexOfTuple<T> | undefined,
): IndexOfTuple<T> | -1 =>
  // eslint-disable-next-line no-restricted-syntax
  tpl.indexOf(searchElement, fromIndex) as IndexOfTuple<T>;

const lastIndexOf = <T extends readonly unknown[]>(
  tpl: T,
  searchElement: T[number],
  fromIndex?: IndexOfTuple<T> | undefined,
): IndexOfTuple<T> | -1 =>
  // eslint-disable-next-line no-restricted-syntax
  tpl.lastIndexOf(searchElement, fromIndex) as IndexOfTuple<T>;

const map = <T extends readonly unknown[], B>(
  tpl: T,
  mapFn: (a: T[number], index: NumberType.ArraySize) => B,
): { readonly [K in keyof T]: B } =>
  // eslint-disable-next-line no-restricted-syntax
  tpl.map(mapFn as (a: unknown, index: NumberType.ArraySize) => B) as {
    readonly [K in keyof T]: B;
  };

const set = <T extends readonly unknown[], N>(
  tpl: T,
  index: Index<Length<T>>,
  newValue: N,
): { readonly [K in keyof T]: N | T[K] } =>
  // eslint-disable-next-line no-restricted-syntax
  map(tpl, (a, i) => (i === index ? newValue : a)) as {
    readonly [K in keyof T]: N | T[K];
  };

// TODO: improve type
const update = <T extends readonly unknown[], N>(
  tpl: T,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  index: NumberType.ArraySize | (Index<Length<T>> & SmallUint),
  updater: (prev: T[number]) => N,
): { readonly [K in keyof T]: N | T[K] } =>
  // eslint-disable-next-line no-restricted-syntax
  map(tpl, (a, i) => (i === index ? updater(a) : a)) as {
    readonly [K in keyof T]: N | T[K];
  };

function sorted<T extends readonly number[]>(
  tpl: T,
): { readonly [K in keyof T]: T[number] };
function sorted<T extends readonly unknown[]>(
  tpl: T,
  // eslint-disable-next-line @typescript-eslint/unified-signatures
  comparator: (x: T[number], y: T[number]) => number,
): { readonly [K in keyof T]: T[number] };
function sorted<T extends readonly unknown[]>(
  tpl: T,
  comparator?: (x: T[number], y: T[number]) => number,
): { readonly [K in keyof T]: T[number] } {
  const cmp = comparator ?? ((x, y) => Num.from(x) - Num.from(y));

  // eslint-disable-next-line no-restricted-syntax
  return Array.from(tpl).sort(cmp) as {
    readonly [K in keyof T]: T[number];
  };
}

function sortedBy<T extends readonly unknown[]>(
  tpl: T,
  comparatorValueMapper: (value: T[number]) => number,
  comparator?: (x: number, y: number) => number,
): { readonly [K in keyof T]: T[number] };
function sortedBy<T extends readonly unknown[], B>(
  tpl: T,
  comparatorValueMapper: (value: T[number]) => B,
  comparator: (x: B, y: B) => number,
): { readonly [K in keyof T]: T[number] };
function sortedBy<T extends readonly unknown[], B>(
  tpl: T,
  comparatorValueMapper: (value: T[number]) => B,
  comparator?: (x: B, y: B) => number,
): { readonly [K in keyof T]: T[number] } {
  return sorted(tpl, (x, y) =>
    comparator === undefined
      ? // eslint-disable-next-line no-restricted-syntax
        (comparatorValueMapper(x) as number) -
        // eslint-disable-next-line no-restricted-syntax
        (comparatorValueMapper(y) as number)
      : comparator(comparatorValueMapper(x), comparatorValueMapper(y)),
  );
}

export const TupleUtils = {
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

export const Tpl = TupleUtils; // alias

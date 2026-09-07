// Every readonly spelling is accepted; none is normalized (D-45).
type Numbers = readonly number[];

type Letters = ReadonlyArray<string>;

type Pair = readonly [number, string];

type Point = { readonly x: number; readonly y: number };

type Shallow = Readonly<{ x: number; y: number }>;

type Deep = DeepReadonly<{ xs: number[]; nested: { ys: string[] } }>;

interface Named {
  readonly name: string;
}

type Dictionary = { readonly [key: string]: number };

type Frozen<T> = { readonly [K in keyof T]: T[K] };

type Index = ReadonlyMap<string, number>;

type Tags = ReadonlySet<string>;

type Table = ReadonlyRecord<string, number>;

type AlsoTable = Readonly<Record<string, number>>;

type Options = Readonly<{ mut_scratch: number[]; label: string }>;

// The codemod's exclusions: `mut_` names and `Mutable<>` are deliberate.
type mut_Buffer = number[];

const mut_scratch: number[] = [];

// (A parameter is readonly whatever its name — see require-readonly-parameter.)

type Editable = Mutable<{ x: number }>;

export const first = (xs: readonly number[]): number => xs[0] ?? 0;

export type {
  Numbers,
  Letters,
  Pair,
  Point,
  Shallow,
  Deep,
  Named,
  Dictionary,
  Frozen,
  Index,
  Tags,
  Table,
  AlsoTable,
  Options,
  mut_Buffer,
  Editable,
};

export { mut_scratch };

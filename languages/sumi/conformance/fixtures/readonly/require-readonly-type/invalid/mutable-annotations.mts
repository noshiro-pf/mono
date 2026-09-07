// @sumi-expect readonly/require-readonly-type
type Numbers = number[];

// @sumi-expect readonly/require-readonly-type
type Pair = [number, string];

type Point = {
  // @sumi-expect readonly/require-readonly-type
  x: number;
  readonly y: number;
};

interface Named {
  // @sumi-expect readonly/require-readonly-type
  name: string;
}

type Dictionary = {
  // @sumi-expect readonly/require-readonly-type
  [key: string]: number;
};

// @sumi-expect readonly/require-readonly-type
type Loose<T> = { -readonly [K in keyof T]: T[K] };

// @sumi-expect readonly/require-readonly-type
type Items = Array<number>;

// @sumi-expect readonly/require-readonly-type
type Index = Map<string, number>;

// @sumi-expect readonly/require-readonly-type
type Tags = Set<string>;

// @sumi-expect readonly/require-readonly-type
type Table = Record<string, number>;

// @sumi-expect readonly/require-readonly-type
export const first = (): number[] => [1];

export type { Numbers, Pair, Point, Named, Dictionary, Loose, Items, Index, Tags, Table };

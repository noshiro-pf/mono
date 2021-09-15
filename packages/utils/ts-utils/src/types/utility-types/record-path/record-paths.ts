import type { IsNotFixedLengthList } from '../is-fixed-length-list';
import type { ReadonlyRecordBase } from '../readonly-record-base';
import { assertType } from '../test-type';
import type { ToNumber } from '../to-number';
import type { Prefixes } from './prefix';

export type FullPaths<R> = R extends readonly unknown[]
  ? FullPathsImplListCase<R>
  : R extends ReadonlyRecordBase
  ? FullPathsImplRecordCase<R>
  : readonly [];

type FullPathsImplListCase<
  T extends readonly unknown[],
  PathHead extends keyof T = keyof T
> = T extends readonly []
  ? readonly []
  : IsNotFixedLengthList<T> extends true
  ? readonly []
  : PathHead extends keyof T
  ? PathHead extends `${number}`
    ? readonly [ToNumber<PathHead>, ...FullPaths<T[PathHead]>]
    : never
  : never;

type FullPathsImplRecordCase<
  R extends ReadonlyRecordBase,
  PathHead extends keyof R = keyof R
> = string extends PathHead
  ? readonly []
  : PathHead extends keyof R
  ? readonly [PathHead, ...FullPaths<R[PathHead]>]
  : never;

export type FullPathsWithIndex<R> = R extends readonly unknown[]
  ? FullPathsWithIndexImplListCase<R>
  : R extends ReadonlyRecordBase
  ? FullPathsWithIndexImplRecordCase<R>
  : readonly [];

type FullPathsWithIndexImplListCase<
  T extends readonly unknown[],
  PathHead extends keyof T = keyof T
> = T extends readonly []
  ? readonly []
  : IsNotFixedLengthList<T> extends true
  ? readonly [number, ...FullPathsWithIndex<T[number]>]
  : PathHead extends keyof T
  ? PathHead extends `${number}`
    ? readonly [ToNumber<PathHead>, ...FullPathsWithIndex<T[PathHead]>]
    : never
  : never;

type FullPathsWithIndexImplRecordCase<
  R extends ReadonlyRecordBase,
  PathHead extends keyof R = keyof R
> = PathHead extends keyof R
  ? readonly [PathHead, ...FullPathsWithIndex<R[PathHead]>]
  : never;

type R0 = DeepReadonly<{
  x: {
    a: 1;
    b: { x: [number, ...string[]] }[];
  };
  y: {
    c: {
      d: { x: number }[];
      4: 5;
    };
    g: [{ x: number }, ...{ y: string[] }[]];
    h: (a: number) => string;
    i: (a: string) => number;
  };
  z: [1, 2, { e: 3; f: [6, 7] }];
}>;

type K0 = FullPaths<R0>;
assertType<
  TypeEq<
    K0,
    | readonly ['x', 'a']
    | readonly ['x', 'b']
    | readonly ['y', 'c', 'd']
    | readonly ['y', 'c', 4]
    | readonly ['y', 'g']
    | readonly ['y', 'h']
    | readonly ['y', 'i']
    | readonly ['z', 0]
    | readonly ['z', 1]
    | readonly ['z', 2, 'e']
    | readonly ['z', 2, 'f', 0]
    | readonly ['z', 2, 'f', 1]
  >
>();

type K1 = FullPathsWithIndex<R0>;
assertType<
  TypeEq<
    K1,
    | readonly ['x', 'a']
    | readonly ['x', 'b', number, 'x', number]
    | readonly ['y', 'c', 'd', number, 'x']
    | readonly ['y', 'c', 4]
    | readonly ['y', 'g', number, 'x']
    | readonly ['y', 'g', number, 'y', number]
    | readonly ['y', 'h']
    | readonly ['y', 'i']
    | readonly ['z', 0]
    | readonly ['z', 1]
    | readonly ['z', 2, 'e']
    | readonly ['z', 2, 'f', 0]
    | readonly ['z', 2, 'f', 1]
  >
>();

type K2 = FullPathsWithIndex<[]>;
assertType<TypeEq<K2, readonly []>>();
assertType<TypeEq<FullPathsWithIndex<Record<1, unknown>>, readonly [1]>>();

export type PathsWithIndex<R> = Prefixes<FullPathsWithIndex<R>>;
export type Paths<R> = Prefixes<FullPaths<R>>;

type K3 = PathsWithIndex<R0>;
assertType<
  TypeEq<
    K3,
    | readonly ['x', 'a']
    | readonly ['x', 'b', number, 'x', number]
    | readonly ['x', 'b', number, 'x']
    | readonly ['x', 'b', number]
    | readonly ['x', 'b']
    | readonly ['x']
    | readonly ['y', 'c', 'd', number, 'x']
    | readonly ['y', 'c', 'd', number]
    | readonly ['y', 'c', 'd']
    | readonly ['y', 'c', 4]
    | readonly ['y', 'c']
    | readonly ['y', 'g', number, 'x']
    | readonly ['y', 'g', number, 'y', number]
    | readonly ['y', 'g', number, 'y']
    | readonly ['y', 'g', number]
    | readonly ['y', 'g']
    | readonly ['y', 'h']
    | readonly ['y', 'i']
    | readonly ['y']
    | readonly ['z', 0]
    | readonly ['z', 1]
    | readonly ['z', 2, 'e']
    | readonly ['z', 2, 'f', 0]
    | readonly ['z', 2, 'f', 1]
    | readonly ['z', 2, 'f']
    | readonly ['z', 2]
    | readonly ['z']
    | readonly []
  >
>();

type K4 = Paths<R0>;
assertType<
  TypeEq<
    K4,
    | readonly ['x', 'a']
    | readonly ['x', 'b']
    | readonly ['x']
    | readonly ['y', 'c', 'd']
    | readonly ['y', 'c', 4]
    | readonly ['y', 'c']
    | readonly ['y', 'g']
    | readonly ['y', 'h']
    | readonly ['y', 'i']
    | readonly ['y']
    | readonly ['z', 0]
    | readonly ['z', 1]
    | readonly ['z', 2, 'e']
    | readonly ['z', 2, 'f', 0]
    | readonly ['z', 2, 'f', 1]
    | readonly ['z', 2, 'f']
    | readonly ['z', 2]
    | readonly ['z']
    | readonly []
  >
>();

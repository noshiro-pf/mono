import {
  type DeepReadonly,
  type LeafPaths,
  type LeafPathsWithIndex,
  type Paths,
  type PathsWithIndex,
  type TypeEq,
} from '../../src';
import { assertType } from '../assert-type';

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

type K0 = LeafPaths<R0>;
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

type K1 = LeafPathsWithIndex<R0>;
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

type K2 = LeafPathsWithIndex<[]>;
assertType<TypeEq<K2, readonly []>>();
assertType<TypeEq<LeafPathsWithIndex<Record<1, unknown>>, readonly [1]>>();

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

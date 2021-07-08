import type { DeepReadonly } from '../deep';
import type { TypeEq } from '../test-type';
import { assertType } from '../test-type';
import type { Paths, PathsWithIndex } from './record-paths';

export type RecordValueAtPath<
  R,
  Path extends Paths<R>
> = Path extends readonly [infer Head, ...infer Rest]
  ? Head extends keyof R
    ? Rest extends Paths<R[Head]>
      ? RecordValueAtPath<R[Head], Rest>
      : never
    : never
  : R;

export type RecordValueAtPathWithIndex<
  R,
  Path extends PathsWithIndex<R>
> = RecordValueAtPathWithIndexImpl<R, Path>;

type RecordValueAtPathWithIndexImpl<
  R,
  Path extends PathsWithIndex<R>,
  LastPathElement = never
> = Path extends readonly [infer Head, ...infer Rest]
  ? Head extends keyof R
    ? Rest extends PathsWithIndex<R[Head]>
      ? RecordValueAtPathWithIndexImpl<R[Head], Rest, Head>
      : never
    : never
  : number extends LastPathElement
  ? R | undefined
  : string extends LastPathElement
  ? R | undefined
  : R;

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

assertType<TypeEq<RecordValueAtPath<R0, readonly []>, R0>>();
assertType<
  TypeEq<
    RecordValueAtPath<R0, readonly ['x']>,
    DeepReadonly<{ a: 1; b: { x: [number, ...string[]] }[] }>
  >
>();
assertType<TypeEq<RecordValueAtPath<R0, readonly ['x', 'a']>, 1>>();
assertType<
  TypeEq<
    RecordValueAtPath<R0, readonly ['x', 'b']>,
    DeepReadonly<{ x: [number, ...string[]] }[]>
  >
>();
assertType<
  TypeEq<
    RecordValueAtPath<R0, readonly ['y']>,
    DeepReadonly<{
      c: {
        d: { x: number }[];
        4: 5;
      };
      g: [{ x: number }, ...{ y: string[] }[]];
      h: (a: number) => string;
      i: (a: string) => number;
    }>
  >
>();
assertType<
  TypeEq<
    RecordValueAtPath<R0, readonly ['y', 'c']>,
    DeepReadonly<{
      d: { x: number }[];
      4: 5;
    }>
  >
>();
assertType<
  TypeEq<
    RecordValueAtPath<R0, readonly ['y', 'c', 'd']>,
    DeepReadonly<{ x: number }[]>
  >
>();
assertType<
  TypeEq<
    RecordValueAtPath<R0, readonly ['y', 'g']>,
    DeepReadonly<[{ x: number }, ...{ y: string[] }[]]>
  >
>();
assertType<
  TypeEq<RecordValueAtPath<R0, readonly ['y', 'h']>, (a: number) => string>
>();
assertType<
  TypeEq<RecordValueAtPath<R0, readonly ['y', 'i']>, (a: string) => number>
>();
assertType<
  TypeEq<
    RecordValueAtPath<R0, readonly ['z']>,
    DeepReadonly<[1, 2, { e: 3; f: [6, 7] }]>
  >
>();
assertType<TypeEq<RecordValueAtPath<R0, readonly ['z', 0]>, 1>>();
assertType<TypeEq<RecordValueAtPath<R0, readonly ['z', 1]>, 2>>();
assertType<
  TypeEq<
    RecordValueAtPath<R0, readonly ['z', 2]>,
    DeepReadonly<{ e: 3; f: [6, 7] }>
  >
>();
assertType<TypeEq<RecordValueAtPath<R0, readonly ['z', 2, 'e']>, 3>>();
assertType<
  TypeEq<RecordValueAtPath<R0, readonly ['z', 2, 'f']>, readonly [6, 7]>
>();
assertType<TypeEq<RecordValueAtPath<R0, readonly ['z', 2, 'f', 0]>, 6>>();
assertType<TypeEq<RecordValueAtPath<R0, readonly ['z', 2, 'f', 1]>, 7>>();

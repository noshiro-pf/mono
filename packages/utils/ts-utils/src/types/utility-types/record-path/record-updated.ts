import type { DeepReadonly } from '../deep';
import type { IndexOfTuple } from '../index-of-tuple';
import type { ReadonlyRecordBase } from '../readonly-record-base';
import type { TypeEq } from '../test-type';
import { assertType } from '../test-type';
import type { ReadonlyTupleSet } from '../tuple';
import type { Paths } from './record-paths';

export type RecordUpdated<
  R,
  Path extends Paths<R>,
  ValueAfter
> = Path extends readonly []
  ? ValueAfter
  : R extends readonly unknown[]
  ? RecordUpdatedImplTupleCase<R, Path, ValueAfter>
  : R extends ReadonlyRecordBase
  ? RecordUpdatedImplRecordCase<R, Path, ValueAfter>
  : R;

type RecordUpdatedImplRecordCase<
  R extends ReadonlyRecordBase,
  Path extends Paths<R>,
  ValueAfter
> = Path extends readonly [infer Head, ...infer Rest]
  ? Head extends keyof R
    ? Rest extends Paths<R[Head]>
      ? {
          readonly [Key in keyof R]: Key extends Head
            ? RecordUpdated<R[Head], Rest, ValueAfter>
            : R[Key];
        }
      : never
    : never
  : never;

type RecordUpdatedImplTupleCase<
  T extends readonly unknown[],
  Path extends Paths<T>,
  ValueAfter
> = Path extends readonly [infer Head, ...infer Rest]
  ? Head extends IndexOfTuple<T>
    ? Rest extends Paths<T[Head]>
      ? ReadonlyTupleSet<T, Head, RecordUpdated<T[Head], Rest, ValueAfter>>
      : never
    : never
  : never;

assertType<TypeEq<RecordUpdated<0, readonly [], 'changed'>, 'changed'>>();

assertType<
  TypeEq<RecordUpdated<readonly [], readonly [], 'changed'>, 'changed'>
>();

assertType<
  TypeEq<RecordUpdated<readonly [0, 1, 2], readonly [], 'changed'>, 'changed'>
>();

assertType<
  TypeEq<
    RecordUpdated<readonly [0, 1, 2], readonly [1], 'changed'>,
    readonly [0, 'changed', 2]
  >
>();

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

assertType<TypeEq<RecordUpdated<R0, readonly [], 'changed'>, 'changed'>>();
assertType<TypeEq<RecordUpdated<R0, readonly [], never>, never>>();

assertType<
  TypeEq<
    RecordUpdated<R0, readonly ['x'], 'changed'>,
    DeepReadonly<{
      x: 'changed';
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
    }>
  >
>();

assertType<
  TypeEq<
    RecordUpdated<R0, readonly ['x', 'a'], 'changed'>,
    DeepReadonly<{
      x: {
        a: 'changed';
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
    }>
  >
>();

assertType<
  TypeEq<
    RecordUpdated<R0, readonly ['x', 'b'], 'changed'>,
    DeepReadonly<{
      x: {
        a: 1;
        b: 'changed';
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
    }>
  >
>();

assertType<
  TypeEq<
    RecordUpdated<R0, readonly ['y'], 'changed'>,
    DeepReadonly<{
      x: {
        a: 1;
        b: { x: [number, ...string[]] }[];
      };
      y: 'changed';
      z: [1, 2, { e: 3; f: [6, 7] }];
    }>
  >
>();

assertType<
  TypeEq<
    RecordUpdated<R0, readonly ['y', 'c'], 'changed'>,
    DeepReadonly<{
      x: {
        a: 1;
        b: { x: [number, ...string[]] }[];
      };
      y: {
        c: 'changed';
        g: [{ x: number }, ...{ y: string[] }[]];
        h: (a: number) => string;
        i: (a: string) => number;
      };
      z: [1, 2, { e: 3; f: [6, 7] }];
    }>
  >
>();

assertType<
  TypeEq<
    RecordUpdated<R0, readonly ['y', 'c', 'd'], 'changed'>,
    DeepReadonly<{
      x: {
        a: 1;
        b: { x: [number, ...string[]] }[];
      };
      y: {
        c: {
          d: 'changed';
          4: 5;
        };
        g: [{ x: number }, ...{ y: string[] }[]];
        h: (a: number) => string;
        i: (a: string) => number;
      };
      z: [1, 2, { e: 3; f: [6, 7] }];
    }>
  >
>();

assertType<
  TypeEq<
    RecordUpdated<R0, readonly ['y', 'c', 4], 'changed'>,
    DeepReadonly<{
      x: {
        a: 1;
        b: { x: [number, ...string[]] }[];
      };
      y: {
        c: {
          d: { x: number }[];
          4: 'changed';
        };
        g: [{ x: number }, ...{ y: string[] }[]];
        h: (a: number) => string;
        i: (a: string) => number;
      };
      z: [1, 2, { e: 3; f: [6, 7] }];
    }>
  >
>();

assertType<
  TypeEq<
    RecordUpdated<R0, readonly ['y', 'g'], 'changed'>,
    DeepReadonly<{
      x: {
        a: 1;
        b: { x: [number, ...string[]] }[];
      };
      y: {
        c: {
          d: { x: number }[];
          4: 5;
        };
        g: 'changed';
        h: (a: number) => string;
        i: (a: string) => number;
      };
      z: [1, 2, { e: 3; f: [6, 7] }];
    }>
  >
>();

assertType<
  TypeEq<
    RecordUpdated<R0, readonly ['z'], 'changed'>,
    DeepReadonly<{
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
      z: 'changed';
    }>
  >
>();

assertType<
  TypeEq<
    RecordUpdated<R0, readonly ['z', 0], 'changed'>,
    DeepReadonly<{
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
      z: ['changed', 2, { e: 3; f: [6, 7] }];
    }>
  >
>();

assertType<
  TypeEq<
    RecordUpdated<R0, readonly ['z', 1], 'changed'>,
    DeepReadonly<{
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
      z: [1, 'changed', { e: 3; f: [6, 7] }];
    }>
  >
>();

assertType<
  TypeEq<
    RecordUpdated<R0, readonly ['z', 2], 'changed'>,
    DeepReadonly<{
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
      z: [1, 2, 'changed'];
    }>
  >
>();

assertType<
  TypeEq<
    RecordUpdated<R0, readonly ['z', 2, 'e'], 'changed'>,
    DeepReadonly<{
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
      z: [1, 2, { e: 'changed'; f: [6, 7] }];
    }>
  >
>();

assertType<
  TypeEq<
    RecordUpdated<R0, readonly ['z', 2, 'f'], 'changed'>,
    DeepReadonly<{
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
      z: [1, 2, { e: 3; f: 'changed' }];
    }>
  >
>();

assertType<
  TypeEq<
    RecordUpdated<R0, readonly ['z', 2, 'f', 0], 'changed'>,
    DeepReadonly<{
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
      z: [1, 2, { e: 3; f: ['changed', 7] }];
    }>
  >
>();

assertType<
  TypeEq<
    RecordUpdated<R0, readonly ['z', 2, 'f', 1], 'changed'>,
    DeepReadonly<{
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
      z: [1, 2, { e: 3; f: [6, 'changed'] }];
    }>
  >
>();

import type { DeepReadonly } from './deep';
import type { Paths } from './record-path';
import type { TypeEq } from './test-type';
import { assertType } from './test-type';

export type RecordUpdated<R, Path extends Paths<R>, ValueAfter> =
  Path extends readonly [infer Head, ...infer Rest]
    ? Head extends keyof R
      ? Rest extends Paths<R[Head]>
        ? {
            [Key in keyof R]: Key extends Head
              ? RecordUpdated<R[Head], Rest, ValueAfter>
              : R[Key];
          }
        : never
      : never
    : ValueAfter;

const rcd = {
  x: {
    a: 1,
    b: 2,
  },
  y: {
    c: {
      d: 3,
      4: 5,
    },
  },
  z: [1, 2, 4],
} as const;

assertType<
  TypeEq<
    RecordUpdated<typeof rcd, readonly ['y', 'c', 'd'], 'updated'>,
    DeepReadonly<{
      x: {
        a: 1;
        b: 2;
      };
      y: {
        c: {
          d: 'updated';
          4: 5;
        };
      };
      z: [1, 2, 4];
    }>
  >
>();

assertType<
  TypeEq<
    RecordUpdated<typeof rcd, readonly ['y', 'c'], 'updated'>,
    DeepReadonly<{
      x: {
        a: 1;
        b: 2;
      };
      y: {
        c: 'updated';
      };
      z: [1, 2, 4];
    }>
  >
>();

assertType<
  TypeEq<
    RecordUpdated<typeof rcd, readonly ['y', 'c'], 0>,
    DeepReadonly<{
      x: {
        a: 1;
        b: 2;
      };
      y: {
        c: 0;
      };
      z: [1, 2, 4];
    }>
  >
>();

assertType<
  TypeEq<
    RecordUpdated<typeof rcd, readonly ['z'], readonly [9, 9, 9]>,
    DeepReadonly<{
      x: {
        a: 1;
        b: 2;
      };
      y: {
        c: {
          d: 3;
          4: 5;
        };
      };
      z: [9, 9, 9];
    }>
  >
>();

assertType<TypeEq<RecordUpdated<typeof rcd, readonly [], 0>, 0>>();

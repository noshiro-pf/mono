import type { TypeEq } from '../test-type';
import { assertType } from '../test-type';
import type { Paths } from './record-paths';

export type RecordValueAtPath<R, Path extends Paths<R>> =
  Path extends readonly [infer Head, ...infer Rest]
    ? Head extends keyof R
      ? Rest extends Paths<R[Head]>
        ? RecordValueAtPath<R[Head], Rest>
        : never
      : never
    : R;

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
    RecordValueAtPath<typeof rcd, readonly ['y', 'c']>,
    Readonly<{ d: 3; 4: 5 }>
  >
>();

assertType<TypeEq<RecordValueAtPath<typeof rcd, readonly ['y', 'c', 4]>, 5>>();

assertType<
  TypeEq<RecordValueAtPath<typeof rcd, readonly ['z']>, readonly [1, 2, 4]>
>();

assertType<TypeEq<RecordValueAtPath<typeof rcd, readonly []>, typeof rcd>>();

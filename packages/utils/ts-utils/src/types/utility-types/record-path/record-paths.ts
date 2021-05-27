import type { uint32 } from '../phantomic-types';
import type { RecordKeyType } from '../record-key-type';
import type { TypeEq } from '../test-type';
import { assertType } from '../test-type';
import type { Prefixes } from './prefix';

export type FullPaths<R> = R extends readonly unknown[]
  ? readonly [uint32]
  : R extends Record<RecordKeyType, unknown>
  ? keyof R extends infer PathHead
    ? PathHead extends keyof R
      ? readonly [PathHead, ...FullPaths<R[PathHead]>]
      : readonly []
    : readonly []
  : readonly [];

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
    FullPaths<typeof rcd>,
    | readonly ['x', 'a']
    | readonly ['x', 'b']
    | readonly ['y', 'c', 'd']
    | readonly ['y', 'c', 4]
    | readonly ['z', uint32]
  >
>();

assertType<TypeEq<FullPaths<[]>, readonly [uint32]>>();
assertType<TypeEq<FullPaths<Record<1, unknown>>, readonly [1]>>();

export type Paths<R> = Prefixes<FullPaths<R>>;

assertType<
  TypeEq<
    Paths<typeof rcd>,
    | readonly ['x', 'a']
    | readonly ['x', 'b']
    | readonly ['x']
    | readonly ['y', 'c', 'd']
    | readonly ['y', 'c', 4]
    | readonly ['y', 'c']
    | readonly ['y']
    | readonly ['z', uint32]
    | readonly ['z']
    | readonly []
  >
>();

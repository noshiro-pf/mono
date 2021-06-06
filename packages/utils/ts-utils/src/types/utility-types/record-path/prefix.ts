import type { TypeEq } from '../test-type';
import { assertType } from '../test-type';

export type Prefixes<L extends readonly unknown[]> = L extends readonly [
  infer Head,
  ...infer Rest
]
  ? readonly [] | readonly [Head, ...Prefixes<Rest>]
  : readonly [];

assertType<
  TypeEq<
    Prefixes<readonly [1, 2, 3]>,
    readonly [] | readonly [1, 2, 3] | readonly [1, 2] | readonly [1]
  >
>();

assertType<TypeEq<Prefixes<[]>, readonly []>>();

import { type Variable } from './variable';

export type NumberTerm<S extends Variable, Z extends Variable> = readonly [
  'lambda',
  S,
  readonly ['lambda', Z, NumberTermBody<S, Z>]
];

export type NumberTermBody<S extends Variable, Z extends Variable> =
  | Z
  | readonly [S, NumberTermBody<S, Z>];

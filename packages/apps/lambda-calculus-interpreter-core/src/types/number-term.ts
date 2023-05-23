import { expectType } from '@noshiro/ts-utils';
import { type LambdaTerm } from './lambda-term';
import { type Variable } from './variable';

export type NumberTerm<S extends Variable, Z extends Variable> = readonly [
  'lambda',
  S,
  readonly ['lambda', Z, NumberTermBody<S, Z>]
];

export type NumberTermBody<S extends Variable, Z extends Variable> =
  | Z
  | readonly [S, NumberTermBody<S, Z>];

['lambda', 's', ['lambda', 'z', 'z']] as const satisfies NumberTerm<'s', 'z'>;

['lambda', 's', ['lambda', 'z', ['s', 'z']]] as const satisfies NumberTerm<
  's',
  'z'
>;

[
  'lambda',
  's',
  ['lambda', 'z', ['s', ['s', 'z']]],
] as const satisfies NumberTerm<'s', 'z'>;

[
  'lambda',
  's',
  ['lambda', 'z', ['s', ['s', ['s', 'z']]]],
] as const satisfies NumberTerm<'s', 'z'>;

expectType<NumberTerm<'s', 'z'>, LambdaTerm>('<=');
expectType<NumberTerm<'s', 'z'>, LambdaTerm>('<=');

expectType<'z', NumberTermBody<'s', 'z'>>('<=');
expectType<['s', 'z'], NumberTermBody<'s', 'z'>>('<=');
expectType<['s', ['s', 'z']], NumberTermBody<'s', 'z'>>('<=');
expectType<['s', ['s', ['s', 'z']]], NumberTermBody<'s', 'z'>>('<=');

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

const l0 = ['lambda', 's', ['lambda', 'z', 'z']] as const;
const l1 = ['lambda', 's', ['lambda', 'z', ['s', 'z']]] as const;
const l2 = ['lambda', 's', ['lambda', 'z', ['s', ['s', 'z']]]] as const;
const l3 = ['lambda', 's', ['lambda', 'z', ['s', ['s', ['s', 'z']]]]] as const;

expectType<NumberTerm<'s', 'z'>, LambdaTerm>('<=');
expectType<NumberTerm<'s', 'z'>, LambdaTerm>('<=');

expectType<'z', NumberTermBody<'s', 'z'>>('<=');
expectType<['s', 'z'], NumberTermBody<'s', 'z'>>('<=');
expectType<['s', ['s', 'z']], NumberTermBody<'s', 'z'>>('<=');
expectType<['s', ['s', ['s', 'z']]], NumberTermBody<'s', 'z'>>('<=');

expectType<typeof l0, NumberTerm<'s', 'z'>>('<=');
expectType<typeof l1, NumberTerm<'s', 'z'>>('<=');
expectType<typeof l2, NumberTerm<'s', 'z'>>('<=');
expectType<typeof l3, NumberTerm<'s', 'z'>>('<=');

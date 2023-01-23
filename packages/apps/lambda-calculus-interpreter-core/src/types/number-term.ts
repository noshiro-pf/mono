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

assertType<TypeExtends<NumberTerm<'s', 'z'>, LambdaTerm>>();
assertType<TypeExtends<NumberTerm<'s', 'z'>, LambdaTerm>>();

assertType<TypeExtends<'z', NumberTermBody<'s', 'z'>>>();
assertType<TypeExtends<['s', 'z'], NumberTermBody<'s', 'z'>>>();
assertType<TypeExtends<['s', ['s', 'z']], NumberTermBody<'s', 'z'>>>();
assertType<TypeExtends<['s', ['s', ['s', 'z']]], NumberTermBody<'s', 'z'>>>();

assertType<TypeExtends<typeof l0, NumberTerm<'s', 'z'>>>();
assertType<TypeExtends<typeof l1, NumberTerm<'s', 'z'>>>();
assertType<TypeExtends<typeof l2, NumberTerm<'s', 'z'>>>();
assertType<TypeExtends<typeof l3, NumberTerm<'s', 'z'>>>();

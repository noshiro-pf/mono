import { assertNotType, assertType, TypeExtends } from '@noshiro/ts-utils';
import { Variable } from './variable';

export type LambdaTerm = Variable | LambdaApplication | LambdaAbstraction;
export type LambdaApplication = readonly [LambdaTerm, LambdaTerm];
export type LambdaAbstraction = readonly ['lambda', Variable, LambdaTerm];

const l1 = 'x';
const l2 = ['x', 'x'] as const;
const l3 = ['x', ['y', 'y']] as const;
const l4 = [
  ['x', ['y', 'y']],
  ['x', ['y', 'y']],
] as const;
const l5 = ['lambda', 'x', ['x', ['y', 'y']]] as const;

assertType<TypeExtends<typeof l1, LambdaTerm>>();
assertType<TypeExtends<typeof l1, Variable>>();
assertNotType<TypeExtends<typeof l1, LambdaApplication>>();
assertNotType<TypeExtends<typeof l1, LambdaAbstraction>>();

assertType<TypeExtends<typeof l2, LambdaTerm>>();
assertNotType<TypeExtends<typeof l2, Variable>>();
assertType<TypeExtends<typeof l2, LambdaApplication>>();
assertNotType<TypeExtends<typeof l2, LambdaAbstraction>>();

assertType<TypeExtends<typeof l3, LambdaTerm>>();
assertNotType<TypeExtends<typeof l3, Variable>>();
assertType<TypeExtends<typeof l3, LambdaApplication>>();
assertNotType<TypeExtends<typeof l3, LambdaAbstraction>>();

assertType<TypeExtends<typeof l4, LambdaTerm>>();
assertNotType<TypeExtends<typeof l4, Variable>>();
assertType<TypeExtends<typeof l4, LambdaApplication>>();
assertNotType<TypeExtends<typeof l4, LambdaAbstraction>>();

assertType<TypeExtends<typeof l5, LambdaTerm>>();
assertNotType<TypeExtends<typeof l5, Variable>>();
assertNotType<TypeExtends<typeof l5, LambdaApplication>>();
assertType<TypeExtends<typeof l5, LambdaAbstraction>>();

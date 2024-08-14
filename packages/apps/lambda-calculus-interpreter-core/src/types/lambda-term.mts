import { type Variable } from './variable.mjs';

export type LambdaTerm = Variable | LambdaApplication | LambdaAbstraction;

export type LambdaApplication = readonly [LambdaTerm, LambdaTerm];

export type LambdaAbstraction = readonly ['lambda', Variable, LambdaTerm];

import { type Variable } from './variable';

// eslint-disable-next-line @typescript-eslint/sort-type-constituents
export type LambdaTerm = Variable | LambdaApplication | LambdaAbstraction;

export type LambdaApplication = readonly [LambdaTerm, LambdaTerm];

export type LambdaAbstraction = readonly ['lambda', Variable, LambdaTerm];

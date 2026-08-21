import { type Variable } from './variable.mjs';

export type LambdaTerm = Variable | LambdaApplication | LambdaAbstraction;

// `FixedLengthTuple<2, LambdaTerm>` is what the rule asks for, and its autofix
// will write it — but the type is recursive, and going through the helper
// leaves TypeScript unable to resolve it. Every use then reads as an error type
// to the typed linter, which reported 47 of them the first time `lint:fix` made
// this change.
// eslint-disable-next-line ts-type-forge/prefer-canonical-length-constrained-tuple
export type LambdaApplication = readonly [LambdaTerm, LambdaTerm];

export type LambdaAbstraction = readonly ['lambda', Variable, LambdaTerm];

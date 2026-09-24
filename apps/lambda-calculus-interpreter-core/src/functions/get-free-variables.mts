import { type LambdaTerm, type Variable } from '../types/index.mjs';
import { isAbstraction, isApplication } from './is-lambda-term.mjs';
import { isVariable } from './is-variable.mjs';

export const getFreeVariables = (term: LambdaTerm): readonly Variable[] =>
  isVariable(term)
    ? ([term] as const)
    : isAbstraction(term)
      ? getFreeVariables(term[2]).filter((ch) => ch !== term[1])
      : isApplication(term)
        ? ([
            ...getFreeVariables(term[0]),
            ...getFreeVariables(term[1]),
          ] as const)
        : ([] as const);

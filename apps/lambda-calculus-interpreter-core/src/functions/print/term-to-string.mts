import { type LambdaTerm } from '../../types/index.mjs';
import { isAbstraction, isApplication } from '../is-lambda-term.mjs';
import { isVariable } from '../is-variable.mjs';
import { hasMacro } from './has-macro.mjs';
import { toMacroString } from './to-macro-string.mjs';

export const termToString = (term: LambdaTerm): string =>
  hasMacro(term)
    ? toMacroString(term)
    : isVariable(term)
      ? term
      : isApplication(term)
        ? (`(${termToString(term[0])} ${termToString(term[1])})` as const)
        : isAbstraction(term)
          ? (`(λ${term[1]}.${termToString(term[2])})` as const)
          : '';

import { type LambdaTerm } from '../../types/index.mjs';
import { isAbstraction, isApplication } from '../is-lambda-term.mjs';
import { isVariable } from '../is-variable.mjs';
import { hasMacro } from './has-macro.mjs';
import { toMacroString } from './to-macro-string.mjs';

export const termToString = (term: LambdaTerm): string => {
  if (hasMacro(term)) return toMacroString(term);
  if (isVariable(term)) return term;
  if (isApplication(term)) {
    return `(${termToString(term[0])} ${termToString(term[1])})`;
  }
  if (isAbstraction(term)) {
    return `(λ${term[1]}.${termToString(term[2])})`;
  }
  return '';
};

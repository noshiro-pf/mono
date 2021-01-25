import { LambdaTerm } from '../../types/lambda-term';
import { isAbstraction } from '../is-abstraction';
import { isApplication } from '../is-application';
import { isVariable } from '../is-variable';
import { hasMacro } from './has-macro';
import { toMacroString } from './to-macro-string';

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

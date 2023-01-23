import { type LambdaTerm, type Variable } from '../types';
import { isAbstraction, isApplication } from './is-lambda-term';
import { isVariable } from './is-variable';

export const getFreeVariables = (term: LambdaTerm): readonly Variable[] => {
  if (isVariable(term)) return [term];
  if (isAbstraction(term)) {
    return getFreeVariables(term[2]).filter((ch) => ch !== term[1]);
  }
  if (isApplication(term)) {
    return [...getFreeVariables(term[0]), ...getFreeVariables(term[1])];
  }
  return [];
};

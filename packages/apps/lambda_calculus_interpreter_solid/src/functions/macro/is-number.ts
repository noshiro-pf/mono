import { LambdaTerm } from '../../types/lambda-term';
import { NumberTerm } from '../../types/number-term';
import { Variable } from '../../types/variable';
import { isAbstraction } from '../is-abstraction';
import { isApplication } from '../is-application';
import { isVariable } from '../is-variable';

export const isNumber = (
  term: LambdaTerm
): term is NumberTerm<Variable, Variable> => {
  // 2 = ['lambda', 's', ['lambda', 'z', ['s', ['s', 'z'] ] ] ]
  if (!isAbstraction(term)) return false;
  if (!isAbstraction(term[2])) return false;
  const s = term[1];
  const z = term[2][1];
  if (s === z) return false;
  const body = term[2][2];
  const sub = (t: LambdaTerm): boolean => {
    if (isVariable(t)) return t === z;
    if (isApplication(t)) {
      return t[0] === s && sub(t[1]);
    }
    return false;
  };
  // ToDo
  return sub(body);
};

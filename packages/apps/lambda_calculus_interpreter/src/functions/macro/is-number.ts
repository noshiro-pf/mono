import { isAbstraction } from '../is-abstraction';
import { isApplication } from '../is-application';
import { isVariable } from '../is-variable';

export const isNumber = (term: any): boolean => {
  // 2 = ['lambda', 's', ['lambda', 'z', ['s', ['s', 'z'] ] ] ]
  if (!isAbstraction(term)) return false;
  if (!isAbstraction(term[2])) return false;
  const s = term[1];
  const z = term[2][1];
  const body = term[2][2];
  const sub = (t: any): boolean => {
    if (isVariable(t)) return t === z;
    if (isApplication(t)) {
      return t[0] === s && sub(t[1]);
    }
    return false;
  };
  // ToDo
  return sub(body);
};

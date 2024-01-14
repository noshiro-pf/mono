import {
  type LambdaTerm,
  type NumberTermBody,
  type Variable,
} from '../../../types/index.mjs';
import { isVariable } from '../../is-variable.mjs';
import { isNumber } from './is-number.mjs';

const counter = (t: NumberTermBody<Variable, Variable>): number =>
  isVariable(t) ? 0 : 1 + counter(t[1]);

export const toNumber = (term: LambdaTerm): number | undefined => {
  if (!isNumber(term)) return undefined;
  // const s = term[1];
  // const z = term[2][1];
  const body = term[2][2];
  return counter(body);
};

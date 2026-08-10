import { type LambdaTerm } from '../../types/index.mjs';
import { isAlphaEqual } from '../is-alpha-equal.mjs';
import { isNumber, PLUS, SUCC } from '../parser/index.mjs';

export const hasMacro = (term: LambdaTerm): boolean => {
  // ToDo
  if (isAlphaEqual(term, PLUS)) return true;
  if (isAlphaEqual(term, SUCC)) return true;
  if (isNumber(term)) return true;
  return false;
};

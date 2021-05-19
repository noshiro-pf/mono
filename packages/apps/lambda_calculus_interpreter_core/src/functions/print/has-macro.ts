import type { LambdaTerm } from '../../types';
import { isAlphaEqual } from '../is-alpha-equal';
import { isNumber, PLUS, SUCC } from '../parser';

export const hasMacro = (term: LambdaTerm): boolean => {
  // ToDo
  if (isAlphaEqual(term, PLUS)) return true;
  if (isAlphaEqual(term, SUCC)) return true;
  if (isNumber(term)) return true;
  return false;
};

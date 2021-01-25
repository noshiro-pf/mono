import { LambdaTerm } from '../../types/lambda-term';
import { isAlphaEqual } from '../is-alpha-equal';
import { isNumber } from '../macro/is-number';
import { PLUS } from '../macro/plus';
import { SUCC } from '../macro/succ';

export const hasMacro = (term: LambdaTerm): boolean => {
  // ToDo
  if (isAlphaEqual(term, PLUS)) return true;
  if (isAlphaEqual(term, SUCC)) return true;
  if (isNumber(term)) return true;
  return false;
};

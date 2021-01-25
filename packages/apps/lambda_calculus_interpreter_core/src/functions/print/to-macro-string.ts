import { LambdaTerm } from '../../types/lambda-term';
import { isAlphaEqual } from '../is-alpha-equal';
import { isNumber } from '../macro/is-number';
import { PLUS } from '../macro/plus';
import { SUCC } from '../macro/succ';
import { toNumber } from '../macro/to-number';

export const toMacroString = (term: LambdaTerm): string => {
  if (isAlphaEqual(term, PLUS)) return '+';
  if (isAlphaEqual(term, SUCC)) return 'SUCC';
  if (isNumber(term)) return (toNumber(term) ?? 0).toString();
  return '[ERROR]';
};

import { type LambdaTerm } from '../../types';
import { isAlphaEqual } from '../is-alpha-equal';
import { isNumber, PLUS, SUCC, toNumber } from '../parser';

export const toMacroString = (term: LambdaTerm): string => {
  if (isAlphaEqual(term, PLUS)) return '+';
  if (isAlphaEqual(term, SUCC)) return 'SUCC';
  if (isNumber(term)) return (toNumber(term) ?? 0).toString();
  return '[ERROR]';
};

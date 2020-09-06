import { isAlphaEqual } from '../is-alpha-equal';
import { isNumber } from '../macro/is-number';
import { toNumber } from '../macro/to-number';
import { parse } from '../parser/parse';

export const toMacroString = (term: any): string => {
  if (isAlphaEqual(term, parse('PLUS'))) return '+';
  if (isAlphaEqual(term, parse('SUCC'))) return 'SUCC';
  if (isNumber(term)) return (toNumber(term) || 0).toString();
  return '[ERROR]';
};

import { isAlphaEqual } from '../is-alpha-equal';
import { isNumber } from '../macro/is-number';
import { parse } from '../parser/parse';

export const hasMacro = (term: any): boolean => {
  // ToDo
  if (isAlphaEqual(term, parse('PLUS'))) return true;
  if (isAlphaEqual(term, parse('SUCC'))) return true;
  if (isNumber(term)) return true;
  return false;
};

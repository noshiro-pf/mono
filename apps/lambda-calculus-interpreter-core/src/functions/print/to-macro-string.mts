import { type LambdaTerm } from '../../types/index.mjs';
import { isAlphaEqual } from '../is-alpha-equal.mjs';
import { isNumber, PLUS, SUCC, toNumber } from '../parser/index.mjs';

export const toMacroString = (term: LambdaTerm): string => {
  if (isAlphaEqual(term, PLUS)) return '+';

  if (isAlphaEqual(term, SUCC)) return 'SUCC';

  return isNumber(term) ? (toNumber(term) ?? 0).toString() : '[ERROR]';
};

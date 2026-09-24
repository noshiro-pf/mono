import { type LambdaTerm } from '../../types/index.mjs';
import { isAlphaEqual } from '../is-alpha-equal.mjs';
import { isNumber, PLUS, SUCC, toNumber } from '../parser/index.mjs';

export const toMacroString = (term: LambdaTerm): string =>
  isAlphaEqual(term, PLUS)
    ? '+'
    : isAlphaEqual(term, SUCC)
      ? 'SUCC'
      : isNumber(term)
        ? (toNumber(term) ?? 0).toString()
        : '[ERROR]';

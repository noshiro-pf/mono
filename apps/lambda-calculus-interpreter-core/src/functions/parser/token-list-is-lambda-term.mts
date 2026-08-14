import { Arr, asUint32, Optional, range, Uint32 } from 'ts-data-forge';
import { isVariable } from '../is-variable.mjs';

export const tokensRepresentsLambdaTerm = (
  tokens: readonly string[],
): boolean => {
  /* e ::= x | (lambda x.e) | (e e) */
  if (tokens.length < 1) return false;

  /* x? */
  if (Arr.isFixedLengthArray(1, tokens)) return isVariable(tokens[0]);

  /* (lambda x.e)? */
  if (
    tokens[0] === '(' &&
    tokens[1] === 'lambda' &&
    isVariable(tokens[2]) &&
    tokens[3] === '.' &&
    tokensRepresentsLambdaTerm(tokens.slice(4, -1)) &&
    Optional.toNullable(Arr.last(tokens)) === ')'
  )
    return true;

  /* (e e)? */
  if (tokens[0] === '(' && Optional.toNullable(Arr.last(tokens)) === ')') {
    for (const sep of range(1, Uint32.sub(Arr.length(tokens), 1))) {
      if (
        tokensRepresentsLambdaTerm(tokens.slice(1, asUint32(sep))) &&
        tokensRepresentsLambdaTerm(tokens.slice(asUint32(sep), -1))
      )
        return true;
    }

    return false;
  }

  return false;
};

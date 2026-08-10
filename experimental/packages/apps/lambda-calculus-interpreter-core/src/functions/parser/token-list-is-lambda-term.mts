import { Arr, range, toUint32, Uint32 } from '@noshiro/ts-utils';
import { isVariable } from '../is-variable.mjs';

export const tokensRepresentsLambdaTerm = (
  tokens: readonly string[],
): boolean => {
  /* e ::= x | (lambda x.e) | (e e) */
  if (tokens.length < 1) return false;

  /* x? */
  if (tokens.length === 1) return isVariable(tokens[0]);

  /* (lambda x.e)? */
  if (
    tokens[0] === '(' &&
    tokens[1] === 'lambda' &&
    isVariable(tokens[2]) &&
    tokens[3] === '.' &&
    tokensRepresentsLambdaTerm(tokens.slice(4, -1)) &&
    Arr.last(tokens) === ')'
  )
    return true;

  /* (e e)? */
  if (tokens[0] === '(' && Arr.last(tokens) === ')') {
    for (const sep of range(1, Uint32.sub(Arr.length(tokens), 1))) {
      if (
        tokensRepresentsLambdaTerm(tokens.slice(1, toUint32(sep))) &&
        tokensRepresentsLambdaTerm(tokens.slice(toUint32(sep), -1))
      )
        return true;
    }
    return false;
  }

  return false;
};

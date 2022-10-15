import { isVariable } from '../is-variable';

export const tokensRepresentsLambdaTerm = (
  tokens: readonly string[]
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
    IList.last(tokens) === ')'
  )
    return true;

  /* (e e)? */
  if (tokens[0] === '(' && IList.last(tokens) === ')') {
    for (const sep of range(1, tokens.length - 1)) {
      if (
        tokensRepresentsLambdaTerm(tokens.slice(1, sep)) &&
        tokensRepresentsLambdaTerm(tokens.slice(sep, -1))
      )
        return true;
    }
    return false;
  }

  return false;
};

import { LAMBDA } from '../../constants/lambda';
import { isVariable } from '../is-variable';

export const tokenListIsLambdaTerm = (tokens: string[]): boolean => {
  /* e ::= x | (lambda x.e) | (e e) */
  if (!tokens || tokens.length < 1) return false;

  /* x? */
  if (tokens.length === 1) return isVariable(tokens[0]);

  /* (lambda x.e)? */
  if (
    tokens[0] === '(' &&
    tokens[1] === LAMBDA &&
    isVariable(tokens[2]) &&
    tokens[3] === '.' &&
    tokenListIsLambdaTerm(tokens.slice(4, tokens.length - 1)) &&
    tokens[tokens.length - 1] === ')'
  )
    return true;

  /* (e e)? */
  if (tokens[0] === '(' && tokens[tokens.length - 1] === ')') {
    for (let sep = 1; sep < tokens.length - 1; ++sep) {
      if (
        tokenListIsLambdaTerm(tokens.slice(1, sep)) &&
        tokenListIsLambdaTerm(tokens.slice(sep, tokens.length - 1))
      )
        return true;
    }
    return false;
  }

  return false;
};

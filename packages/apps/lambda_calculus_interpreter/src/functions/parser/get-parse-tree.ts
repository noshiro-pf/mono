import { LAMBDA } from '../../constants/lambda';
import { isVariable } from '../is-variable';
import { tokenListIsLambdaTerm } from './token-list-is-lambda-term';

/**
 * e ::= x | (lambda x.e) | (e e)
 * */
export const getParseTree = (tokens: string[]): any => {
  if (!tokens || tokens.length < 1) {
    console.error(`invalid tokens passed: "${JSON.stringify(tokens)}"`);
    return undefined;
  }

  /* x? */
  if (tokens.length === 1) return tokens[0];

  /* (lambda x.e)? */
  if (
    tokens[0] === '(' &&
    tokens[1] === LAMBDA &&
    isVariable(tokens[2]) &&
    tokens[3] === '.' &&
    tokenListIsLambdaTerm(tokens.slice(4, tokens.length - 1)) &&
    tokens[tokens.length - 1] === ')'
  ) {
    return [
      LAMBDA,
      tokens[2],
      getParseTree(tokens.slice(4, tokens.length - 1)),
    ];
  }

  /* (e e)? */
  if (tokens[0] === '(' && tokens[tokens.length - 1] === ')') {
    for (let sep = 1; sep < tokens.length - 1; ++sep) {
      const leftTokens = tokens.slice(1, sep);
      const rightTokens = tokens.slice(sep, tokens.length - 1);
      if (
        tokenListIsLambdaTerm(leftTokens) &&
        tokenListIsLambdaTerm(rightTokens)
      ) {
        return [getParseTree(leftTokens), getParseTree(rightTokens)];
      }
    }
  }

  return tokens;
};

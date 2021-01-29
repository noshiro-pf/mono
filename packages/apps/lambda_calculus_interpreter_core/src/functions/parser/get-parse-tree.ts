import { isArrayOfLength3OrMore, isArrayOfLength6OrMore } from '@mono/ts-utils';
import { LambdaTerm } from '../../types/lambda-term';
import { isVariable } from '../is-variable';
import { tokensRepresentsLambdaTerm } from './token-list-is-lambda-term';

/**
 * e ::= x | (lambda x.e) | (e e)
 * */
export const getParseTree = (tokens: string[]): LambdaTerm | undefined => {
  if (tokens.length < 1) {
    console.error(`invalid tokens passed: "${JSON.stringify(tokens)}"`);
    return undefined;
  }

  /* x? */
  if (tokens.length === 1 && isVariable(tokens[0])) return tokens[0];

  /* (lambda x.e)? */
  if (
    isArrayOfLength6OrMore(tokens) &&
    tokens[0] === '(' &&
    tokens[1] === 'lambda' &&
    isVariable(tokens[2]) &&
    tokens[3] === '.' &&
    tokensRepresentsLambdaTerm(tokens.slice(4, tokens.length - 1)) &&
    tokens[tokens.length - 1] === ')'
  ) {
    const body = getParseTree(tokens.slice(4, tokens.length - 1));
    if (body === undefined) return undefined;
    return ['lambda', tokens[2], body];
  }

  /* (e e)? */
  if (
    isArrayOfLength3OrMore(tokens) &&
    tokens[0] === '(' &&
    tokens[tokens.length - 1] === ')'
  ) {
    for (let sep = 1; sep < tokens.length - 1; sep += 1) {
      const leftTokens = tokens.slice(1, sep);
      const rightTokens = tokens.slice(sep, tokens.length - 1);
      if (
        tokensRepresentsLambdaTerm(leftTokens) &&
        tokensRepresentsLambdaTerm(rightTokens)
      ) {
        const left = getParseTree(leftTokens);
        const right = getParseTree(rightTokens);
        if (left === undefined || right === undefined) return undefined;
        return [left, right];
      }
    }
  }

  return undefined;
};

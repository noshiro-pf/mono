import { Arr, Json, range, Result, toUint32, Uint32 } from '@noshiro/ts-utils';
import { type LambdaTerm } from '../../types/index.mjs';
import { isVariable } from '../is-variable.mjs';
import { tokensRepresentsLambdaTerm } from './token-list-is-lambda-term.mjs';

/** `e ::= x | (lambda x.e) | (e e)` */
export const getParseTree = (
  tokens: readonly string[],
): LambdaTerm | undefined => {
  if (tokens.length < 1) {
    console.error(
      `invalid tokens passed: "${Result.unwrapThrow(Json.stringify(tokens))}"`,
    );
    return undefined;
  }

  /* x? */
  if (tokens.length === 1 && isVariable(tokens[0])) return tokens[0];

  /* (lambda x.e)? */
  if (
    Arr.isArrayOfLength6OrMore(tokens) &&
    tokens[0] === '(' &&
    tokens[1] === 'lambda' &&
    isVariable(tokens[2]) &&
    tokens[3] === '.' &&
    tokensRepresentsLambdaTerm(tokens.slice(4, -1)) &&
    Arr.last(tokens) === ')'
  ) {
    const body = getParseTree(tokens.slice(4, -1));
    if (body === undefined) return undefined;
    return ['lambda', tokens[2], body];
  }

  /* (e e)? */
  if (
    Arr.isArrayOfLength3OrMore(tokens) &&
    tokens[0] === '(' &&
    Arr.last(tokens) === ')'
  ) {
    for (const sep of range(1, Uint32.sub(Arr.length(tokens), 1))) {
      const leftTokens = tokens.slice(1, toUint32(sep));
      const rightTokens = tokens.slice(toUint32(sep), -1);
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

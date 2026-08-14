import {
  Arr,
  asUint32,
  Json,
  Optional,
  range,
  Result,
  Uint32,
} from 'ts-data-forge';
import { type LambdaTerm } from '../../types/index.mjs';
import { hasMinLength } from '../../utils/index.mjs';
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
  if (Arr.isFixedLengthArray(1, tokens) && isVariable(tokens[0]))
    return tokens[0];

  /* (lambda x.e)? */
  if (
    hasMinLength(tokens, 6) &&
    tokens[0] === '(' &&
    tokens[1] === 'lambda' &&
    isVariable(tokens[2]) &&
    tokens[3] === '.' &&
    tokensRepresentsLambdaTerm(tokens.slice(4, -1)) &&
    Optional.toNullable(Arr.last(tokens)) === ')'
  ) {
    const body = getParseTree(tokens.slice(4, -1));

    if (body === undefined) return undefined;

    return ['lambda', tokens[2], body];
  }

  /* (e e)? */
  if (
    hasMinLength(tokens, 3) &&
    tokens[0] === '(' &&
    Optional.toNullable(Arr.last(tokens)) === ')'
  ) {
    for (const sep of range(1, Uint32.sub(Arr.length(tokens), 1))) {
      const leftTokens = tokens.slice(1, asUint32(sep));

      const rightTokens = tokens.slice(asUint32(sep), -1);

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

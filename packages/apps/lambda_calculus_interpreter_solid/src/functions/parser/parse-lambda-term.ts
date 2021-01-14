import { LambdaTerm } from '../../types/lambda-term';
import { expandShortcuts } from './expand-shortcut';
import { getParseTree } from './get-parse-tree';
import { splitToTokens } from './split-to-tokens';
import { tokensRepresentsLambdaTerm } from './token-list-is-lambda-term';

export const parseLambdaTerm = (input: string): LambdaTerm | undefined => {
  if (input.length === 0) return undefined;
  const tokens = splitToTokens(input);
  const converted = expandShortcuts(tokens);
  if (!tokensRepresentsLambdaTerm(converted)) return undefined;
  return getParseTree(converted);
};

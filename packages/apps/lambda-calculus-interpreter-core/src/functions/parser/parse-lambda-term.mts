import { type LambdaTerm } from '../../types/index.mjs';
import { expandShortcuts } from './expand-shortcut.mjs';
import { getParseTree } from './get-parse-tree.mjs';
import { splitToTokens } from './split-to-tokens.mjs';
import { tokensRepresentsLambdaTerm } from './token-list-is-lambda-term.mjs';

export const parseLambdaTerm = (input: string): LambdaTerm | undefined => {
  if (input.length === 0) return undefined;
  const tokens = splitToTokens(input);
  const converted = expandShortcuts(tokens);
  if (!tokensRepresentsLambdaTerm(converted)) return undefined;
  return getParseTree(converted);
};

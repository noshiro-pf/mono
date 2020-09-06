import { expandShortcuts } from './expand-shortcut';
import { getParseTree } from './get-parse-tree';
import { splitToTokens } from './split-to-tokens';
import { tokenListIsLambdaTerm } from './token-list-is-lambda-term';

export const parse = (input: string): undefined | string | any[] => {
  if (input.length === 0) return undefined;
  const tokens = splitToTokens(input);
  const converted = expandShortcuts(tokens);
  if (!tokenListIsLambdaTerm(converted)) return undefined;
  return getParseTree(converted);
};

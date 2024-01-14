import { splitToTokens } from '../split-to-tokens.mjs';

const numberStr = (n: Uint): string =>
  `(lambda s.(lambda z. ${'(s'.repeat(n)} z${')'.repeat(n)}))`;

export const numberLambdaTerm = (n: Uint): readonly string[] =>
  splitToTokens(numberStr(n));

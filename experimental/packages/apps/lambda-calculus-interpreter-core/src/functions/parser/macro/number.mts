import { splitToTokens } from '../split-to-tokens.mjs';

const numberStr = (n: SafeUint): string =>
  `(lambda s.(lambda z. ${'(s'.repeat(n)} z${')'.repeat(n)}))`;

export const numberLambdaTerm = (n: SafeUint): readonly string[] =>
  splitToTokens(numberStr(n));

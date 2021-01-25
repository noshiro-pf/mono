import { splitToTokens } from '../parser/split-to-tokens';

const numberStr = (n: number): string =>
  `(lambda s.(lambda z. ${'(s'.repeat(n)} z${')'.repeat(n)}))`;

export const numberLambdaTerm = (n: number): string[] =>
  splitToTokens(numberStr(n));

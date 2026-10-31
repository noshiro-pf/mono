import type { SafeUint } from 'ts-type-forge';
import { splitToTokens } from '../split-to-tokens.mjs';

export const numberLambdaTerm = (n: SafeUint): readonly string[] =>
  splitToTokens(numberStr(n));

const numberStr = (n: SafeUint): string =>
  `(lambda s.(lambda z. ${'(s'.repeat(n)} z${')'.repeat(n)}))` as const;

import { type ESLintPlugin } from '../../../types/index.mjs';
import { noExpectToStrictEqualRule } from './no-expect-to-strict-equal.mjs';

export const vitestCodingStyleRules = {
  'no-expect-to-strict-equal': noExpectToStrictEqualRule,
} as const satisfies ESLintPlugin['rules'];

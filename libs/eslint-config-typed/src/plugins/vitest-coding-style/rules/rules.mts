import { type ESLintPlugin } from '../../../types/index.mjs';
import { noExpectToStrictEqualRule } from './no-expect-to-strict-equal.mjs';
import { preferAssertNotOkOverAssertIsNotOkRule } from './prefer-assert-not-ok-over-assert-is-not-ok.mjs';
import { preferAssertNotOkOverExpectFalseRule } from './prefer-assert-not-ok-over-expect-false.mjs';
import { preferAssertOverAssertOkRule } from './prefer-assert-over-assert-ok.mjs';
import { preferAssertOverExpectTrueRule } from './prefer-assert-over-expect-true.mjs';

export const vitestCodingStyleRules = {
  'no-expect-to-strict-equal': noExpectToStrictEqualRule,

  'prefer-assert-over-assert-ok': preferAssertOverAssertOkRule,
  'prefer-assert-not-ok-over-assert-is-not-ok':
    preferAssertNotOkOverAssertIsNotOkRule,

  'prefer-assert-over-expect-true': preferAssertOverExpectTrueRule,
  'prefer-assert-not-ok-over-expect-false':
    preferAssertNotOkOverExpectFalseRule,
} as const satisfies ESLintPlugin['rules'];

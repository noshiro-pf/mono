import { type ESLintPlugin } from '../../../types/index.mjs';
import { noExpectToStrictEqualRule } from './no-expect-to-strict-equal.mjs';
import { preferAssertDeepStrictEqualOverDeepEqualRule } from './prefer-assert-deep-strict-equal-over-deep-equal.mjs';
import { preferAssertIsFalseOverNegatedAssertIsTrueRule } from './prefer-assert-is-false-over-assert-negation.mjs';
import { preferAssertIsFalseOverAssertNotOkRule } from './prefer-assert-is-false-over-assert-not-ok.mjs';
import { preferAssertIsFalseOverExpectFalseRule } from './prefer-assert-is-false-over-expect-false.mjs';
import { preferAssertIsTrueOverNegatedAssertIsFalseRule } from './prefer-assert-is-true-over-assert-negated-is-false.mjs';
import { preferAssertIsTrueOverAssertRule } from './prefer-assert-is-true-over-assert.mjs';
import { preferAssertIsTrueOverExpectTrueRule } from './prefer-assert-is-true-over-expect-true.mjs';

export const vitestCodingStyleRules = {
  'no-expect-to-strict-equal': noExpectToStrictEqualRule,

  'prefer-assert-deep-strict-equal-over-deep-equal':
    preferAssertDeepStrictEqualOverDeepEqualRule,

  'prefer-assert-is-true-over-assert': preferAssertIsTrueOverAssertRule,
  'prefer-assert-is-false-over-assert-not-ok':
    preferAssertIsFalseOverAssertNotOkRule,

  'prefer-assert-is-true-over-expect-true':
    preferAssertIsTrueOverExpectTrueRule,
  'prefer-assert-is-false-over-expect-false':
    preferAssertIsFalseOverExpectFalseRule,

  'prefer-assert-is-false-over-negated-assert-is-true':
    preferAssertIsFalseOverNegatedAssertIsTrueRule,
  'prefer-assert-is-true-over-negated-assert-is-false':
    preferAssertIsTrueOverNegatedAssertIsFalseRule,
} as const satisfies ESLintPlugin['rules'];

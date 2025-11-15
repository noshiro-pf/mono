/* cSpell:disable */
import { type Linter } from 'eslint';

namespace Abs {
  export type RuleEntry = Linter.StringSeverity;
}

namespace NoStaticInfinityCalculations {
  export type RuleEntry = Linter.StringSeverity;
}

namespace NoStaticNanCalculations {
  export type RuleEntry = Linter.StringSeverity;
}

namespace PreferExponentiationOperator {
  export type RuleEntry = Linter.StringSeverity;
}

namespace PreferMathCbrt {
  export type RuleEntry = Linter.StringSeverity;
}

namespace PreferMathE {
  export type RuleEntry = Linter.StringSeverity;
}

namespace PreferMathHypot {
  export type RuleEntry = Linter.StringSeverity;
}

namespace PreferMathLn10 {
  export type RuleEntry = Linter.StringSeverity;
}

namespace PreferMathLn2 {
  export type RuleEntry = Linter.StringSeverity;
}

namespace PreferMathLog10 {
  export type RuleEntry = Linter.StringSeverity;
}

namespace PreferMathLog10E {
  export type RuleEntry = Linter.StringSeverity;
}

namespace PreferMathLog2 {
  export type RuleEntry = Linter.StringSeverity;
}

namespace PreferMathLog2E {
  export type RuleEntry = Linter.StringSeverity;
}

namespace PreferMathPi {
  export type RuleEntry = Linter.StringSeverity;
}

namespace PreferMathSqrt {
  export type RuleEntry = Linter.StringSeverity;
}

namespace PreferMathSqrt1_2 {
  export type RuleEntry = Linter.StringSeverity;
}

namespace PreferMathSqrt2 {
  export type RuleEntry = Linter.StringSeverity;
}

namespace PreferMathSumPrecise {
  export type RuleEntry = Linter.StringSeverity;
}

namespace PreferMathTrunc {
  export type RuleEntry = Linter.StringSeverity;
}

namespace PreferNumberEpsilon {
  export type RuleEntry = Linter.StringSeverity;
}

namespace PreferNumberIsFinite {
  export type RuleEntry = Linter.StringSeverity;
}

namespace PreferNumberIsInteger {
  export type RuleEntry = Linter.StringSeverity;
}

namespace PreferNumberIsNan {
  export type RuleEntry = Linter.StringSeverity;
}

namespace PreferNumberIsSafeInteger {
  export type RuleEntry = Linter.StringSeverity;
}

namespace PreferNumberMaxSafeInteger {
  export type RuleEntry = Linter.StringSeverity;
}

namespace PreferNumberMaxValue {
  export type RuleEntry = Linter.StringSeverity;
}

namespace PreferNumberMinSafeInteger {
  export type RuleEntry = Linter.StringSeverity;
}

namespace PreferNumberMinValue {
  export type RuleEntry = Linter.StringSeverity;
}

export type EslintMathRules = {
  readonly 'math/abs': Abs.RuleEntry;
  readonly 'math/no-static-infinity-calculations': NoStaticInfinityCalculations.RuleEntry;
  readonly 'math/no-static-nan-calculations': NoStaticNanCalculations.RuleEntry;
  readonly 'math/prefer-exponentiation-operator': PreferExponentiationOperator.RuleEntry;
  readonly 'math/prefer-math-cbrt': PreferMathCbrt.RuleEntry;
  readonly 'math/prefer-math-e': PreferMathE.RuleEntry;
  readonly 'math/prefer-math-hypot': PreferMathHypot.RuleEntry;
  readonly 'math/prefer-math-ln10': PreferMathLn10.RuleEntry;
  readonly 'math/prefer-math-ln2': PreferMathLn2.RuleEntry;
  readonly 'math/prefer-math-log10': PreferMathLog10.RuleEntry;
  readonly 'math/prefer-math-log10e': PreferMathLog10E.RuleEntry;
  readonly 'math/prefer-math-log2': PreferMathLog2.RuleEntry;
  readonly 'math/prefer-math-log2e': PreferMathLog2E.RuleEntry;
  readonly 'math/prefer-math-pi': PreferMathPi.RuleEntry;
  readonly 'math/prefer-math-sqrt': PreferMathSqrt.RuleEntry;
  readonly 'math/prefer-math-sqrt1-2': PreferMathSqrt1_2.RuleEntry;
  readonly 'math/prefer-math-sqrt2': PreferMathSqrt2.RuleEntry;
  readonly 'math/prefer-math-sum-precise': PreferMathSumPrecise.RuleEntry;
  readonly 'math/prefer-math-trunc': PreferMathTrunc.RuleEntry;
  readonly 'math/prefer-number-epsilon': PreferNumberEpsilon.RuleEntry;
  readonly 'math/prefer-number-is-finite': PreferNumberIsFinite.RuleEntry;
  readonly 'math/prefer-number-is-integer': PreferNumberIsInteger.RuleEntry;
  readonly 'math/prefer-number-is-nan': PreferNumberIsNan.RuleEntry;
  readonly 'math/prefer-number-is-safe-integer': PreferNumberIsSafeInteger.RuleEntry;
  readonly 'math/prefer-number-max-safe-integer': PreferNumberMaxSafeInteger.RuleEntry;
  readonly 'math/prefer-number-max-value': PreferNumberMaxValue.RuleEntry;
  readonly 'math/prefer-number-min-safe-integer': PreferNumberMinSafeInteger.RuleEntry;
  readonly 'math/prefer-number-min-value': PreferNumberMinValue.RuleEntry;
};

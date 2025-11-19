/* cSpell:disable */
import { type Linter } from 'eslint';

type SpreadOptionsIfIsArray<
  T extends readonly [Linter.StringSeverity, unknown],
> = T[1] extends readonly unknown[]
  ? readonly [Linter.StringSeverity, ...T[1]]
  : T;

/**
 * Enforce the conversion to absolute values to be the method you prefer
 *
 * @link https://ota-meshi.github.io/eslint-plugin-math/rules/abs.html
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | deprecated     | false      |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 *  ```
 */
namespace Abs {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "prefer": {
   *         "type": "string",
   *         "enum": [
   *           "Math.abs",
   *           "expression"
   *         ]
   *       },
   *       "aggressive": {
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    prefer?: 'Math.abs' | 'expression';
    aggressive?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Disallow static calculations that result in infinity
 *
 * @link https://ota-meshi.github.io/eslint-plugin-math/rules/no-static-infinity-calculations.html
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | deprecated     | false      |
 *  | hasSuggestions | true       |
 *  ```
 */
namespace NoStaticInfinityCalculations {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow static calculations that result in NaN
 *
 * @link https://ota-meshi.github.io/eslint-plugin-math/rules/no-static-nan-calculations.html
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | deprecated     | false      |
 *  | hasSuggestions | true       |
 *  ```
 */
namespace NoStaticNanCalculations {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce the use of exponentiation (`**`) operator instead of other
 * calculations
 *
 * @link https://ota-meshi.github.io/eslint-plugin-math/rules/prefer-exponentiation-operator.html
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | deprecated     | false      |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 *  ```
 */
namespace PreferExponentiationOperator {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce the use of Math.cbrt() instead of other cube root calculations
 *
 * @link https://ota-meshi.github.io/eslint-plugin-math/rules/prefer-math-cbrt.html
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | deprecated     | false      |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 *  ```
 */
namespace PreferMathCbrt {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce the use of Math.E instead of other ways
 *
 * @link https://ota-meshi.github.io/eslint-plugin-math/rules/prefer-math-e.html
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | deprecated     | false      |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 *  ```
 */
namespace PreferMathE {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce the use of Math.hypot() instead of other hypotenuse calculations
 *
 * @link https://ota-meshi.github.io/eslint-plugin-math/rules/prefer-math-hypot.html
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | deprecated     | false      |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 *  ```
 */
namespace PreferMathHypot {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce the use of Math.LN10 instead of other ways
 *
 * @link https://ota-meshi.github.io/eslint-plugin-math/rules/prefer-math-ln10.html
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | deprecated     | false      |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 *  ```
 */
namespace PreferMathLn10 {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce the use of Math.LN2 instead of other ways
 *
 * @link https://ota-meshi.github.io/eslint-plugin-math/rules/prefer-math-ln2.html
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | deprecated     | false      |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 *  ```
 */
namespace PreferMathLn2 {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce the use of Math.log10() instead of other calculation methods.
 *
 * @link https://ota-meshi.github.io/eslint-plugin-math/rules/prefer-math-log10.html
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | deprecated     | false      |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 *  ```
 */
namespace PreferMathLog10 {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce the use of Math.LOG10E instead of other ways
 *
 * @link https://ota-meshi.github.io/eslint-plugin-math/rules/prefer-math-log10e.html
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | deprecated     | false      |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 *  ```
 */
namespace PreferMathLog10e {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce the use of Math.log2() instead of other calculation methods.
 *
 * @link https://ota-meshi.github.io/eslint-plugin-math/rules/prefer-math-log2.html
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | deprecated     | false      |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 *  ```
 */
namespace PreferMathLog2 {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce the use of Math.LOG2E instead of other ways
 *
 * @link https://ota-meshi.github.io/eslint-plugin-math/rules/prefer-math-log2e.html
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | deprecated     | false      |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 *  ```
 */
namespace PreferMathLog2e {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce the use of Math.PI instead of literal number
 *
 * @link https://ota-meshi.github.io/eslint-plugin-math/rules/prefer-math-pi.html
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | deprecated     | false      |
 *  | fixable        | code       |
 *  | hasSuggestions | false      |
 *  ```
 */
namespace PreferMathPi {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce the use of Math.sqrt() instead of other square root calculations
 *
 * @link https://ota-meshi.github.io/eslint-plugin-math/rules/prefer-math-sqrt.html
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | deprecated     | false      |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 *  ```
 */
namespace PreferMathSqrt {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce the use of Math.SQRT1_2 instead of other ways
 *
 * @link https://ota-meshi.github.io/eslint-plugin-math/rules/prefer-math-sqrt1-2.html
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | deprecated     | false      |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 *  ```
 */
namespace PreferMathSqrt12 {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce the use of Math.SQRT2 instead of other ways
 *
 * @link https://ota-meshi.github.io/eslint-plugin-math/rules/prefer-math-sqrt2.html
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | deprecated     | false      |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 *  ```
 */
namespace PreferMathSqrt2 {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce the use of Math.sumPrecise() instead of other summation methods
 *
 * @link https://ota-meshi.github.io/eslint-plugin-math/rules/prefer-math-sum-precise.html
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | deprecated     | false      |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 *  ```
 */
namespace PreferMathSumPrecise {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "aggressive": {
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    aggressive?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Enforce the use of Math.trunc() instead of other truncations
 *
 * @link https://ota-meshi.github.io/eslint-plugin-math/rules/prefer-math-trunc.html
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | deprecated     | false      |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 *  ```
 */
namespace PreferMathTrunc {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "reportBitwise": {
   *         "type": "boolean",
   *         "default": true
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /** @default true */
    reportBitwise?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Enforce the use of Number.EPSILON instead of other ways
 *
 * @link https://ota-meshi.github.io/eslint-plugin-math/rules/prefer-number-epsilon.html
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | deprecated     | false      |
 *  | fixable        | code       |
 *  | hasSuggestions | false      |
 *  ```
 */
namespace PreferNumberEpsilon {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce the use of Number.isFinite() instead of other checking ways
 *
 * @link https://ota-meshi.github.io/eslint-plugin-math/rules/prefer-number-is-finite.html
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | deprecated     | false      |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 *  ```
 */
namespace PreferNumberIsFinite {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce the use of Number.isInteger() instead of other checking ways
 *
 * @link https://ota-meshi.github.io/eslint-plugin-math/rules/prefer-number-is-integer.html
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | deprecated     | false      |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 *  ```
 */
namespace PreferNumberIsInteger {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce the use of Number.isNaN() instead of other checking ways
 *
 * @link https://ota-meshi.github.io/eslint-plugin-math/rules/prefer-number-is-nan.html
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | deprecated     | false      |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 *  ```
 */
namespace PreferNumberIsNan {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce the use of Number.isSafeInteger() instead of other checking ways
 *
 * @link https://ota-meshi.github.io/eslint-plugin-math/rules/prefer-number-is-safe-integer.html
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | deprecated     | false      |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 *  ```
 */
namespace PreferNumberIsSafeInteger {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce the use of Number.MAX_SAFE_INTEGER instead of other ways
 *
 * @link https://ota-meshi.github.io/eslint-plugin-math/rules/prefer-number-max-safe-integer.html
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | deprecated     | false      |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 *  ```
 */
namespace PreferNumberMaxSafeInteger {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce the use of Number.MAX_VALUE instead of literal number
 *
 * @link https://ota-meshi.github.io/eslint-plugin-math/rules/prefer-number-max-value.html
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | deprecated     | false      |
 *  | fixable        | code       |
 *  | hasSuggestions | false      |
 *  ```
 */
namespace PreferNumberMaxValue {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce the use of Number.MIN_SAFE_INTEGER instead of other ways
 *
 * @link https://ota-meshi.github.io/eslint-plugin-math/rules/prefer-number-min-safe-integer.html
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | deprecated     | false      |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 *  ```
 */
namespace PreferNumberMinSafeInteger {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce the use of Number.MIN_VALUE instead of literal number
 *
 * @link https://ota-meshi.github.io/eslint-plugin-math/rules/prefer-number-min-value.html
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | deprecated     | false      |
 *  | fixable        | code       |
 *  | hasSuggestions | false      |
 *  ```
 */
namespace PreferNumberMinValue {
  export type RuleEntry = Linter.StringSeverity;
}

export type EslintMathRules = Readonly<{
  'math/abs': Abs.RuleEntry;
  'math/no-static-infinity-calculations': NoStaticInfinityCalculations.RuleEntry;
  'math/no-static-nan-calculations': NoStaticNanCalculations.RuleEntry;
  'math/prefer-exponentiation-operator': PreferExponentiationOperator.RuleEntry;
  'math/prefer-math-cbrt': PreferMathCbrt.RuleEntry;
  'math/prefer-math-e': PreferMathE.RuleEntry;
  'math/prefer-math-hypot': PreferMathHypot.RuleEntry;
  'math/prefer-math-ln10': PreferMathLn10.RuleEntry;
  'math/prefer-math-ln2': PreferMathLn2.RuleEntry;
  'math/prefer-math-log10': PreferMathLog10.RuleEntry;
  'math/prefer-math-log10e': PreferMathLog10e.RuleEntry;
  'math/prefer-math-log2': PreferMathLog2.RuleEntry;
  'math/prefer-math-log2e': PreferMathLog2e.RuleEntry;
  'math/prefer-math-pi': PreferMathPi.RuleEntry;
  'math/prefer-math-sqrt': PreferMathSqrt.RuleEntry;
  'math/prefer-math-sqrt1-2': PreferMathSqrt12.RuleEntry;
  'math/prefer-math-sqrt2': PreferMathSqrt2.RuleEntry;
  'math/prefer-math-sum-precise': PreferMathSumPrecise.RuleEntry;
  'math/prefer-math-trunc': PreferMathTrunc.RuleEntry;
  'math/prefer-number-epsilon': PreferNumberEpsilon.RuleEntry;
  'math/prefer-number-is-finite': PreferNumberIsFinite.RuleEntry;
  'math/prefer-number-is-integer': PreferNumberIsInteger.RuleEntry;
  'math/prefer-number-is-nan': PreferNumberIsNan.RuleEntry;
  'math/prefer-number-is-safe-integer': PreferNumberIsSafeInteger.RuleEntry;
  'math/prefer-number-max-safe-integer': PreferNumberMaxSafeInteger.RuleEntry;
  'math/prefer-number-max-value': PreferNumberMaxValue.RuleEntry;
  'math/prefer-number-min-safe-integer': PreferNumberMinSafeInteger.RuleEntry;
  'math/prefer-number-min-value': PreferNumberMinValue.RuleEntry;
}>;

export type EslintMathRulesOption = Readonly<{
  'math/abs': Abs.Options;
  'math/prefer-math-sum-precise': PreferMathSumPrecise.Options;
  'math/prefer-math-trunc': PreferMathTrunc.Options;
}>;

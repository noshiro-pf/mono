/* cSpell:disable */
import { type Linter } from 'eslint';

/**
 * Disallow `expect().toStrictEqual()` in favor of `assert.deepStrictEqual()`.
 *
 * ```md
 * | key        | value      |
 * | :--------- | :--------- |
 * | type       | suggestion |
 * | deprecated | false      |
 * | fixable    | code       |
 * ```
 */
namespace NoExpectToStrictEqual {
  export type RuleEntry = Linter.StringSeverity;
}

export type EslintVitestCodingStyleRules = Readonly<{
  'vitest-coding-style/no-expect-to-strict-equal': NoExpectToStrictEqual.RuleEntry;
}>;

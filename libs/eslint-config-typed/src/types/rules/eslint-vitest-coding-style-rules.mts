/* cSpell:disable */
import { type Linter } from 'eslint';

/**
 * Disallow `expect(X).toStrictEqual(Y)` in favor of `assert.deepStrictEqual(X,
 * Y)`, as the former also checks type equality between X and Y.
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

/**
 * Prefer assert(X) over assert.ok(X), assert.isOk(X).
 *
 * ```md
 * | key        | value      |
 * | :--------- | :--------- |
 * | type       | suggestion |
 * | deprecated | false      |
 * | fixable    | code       |
 * ```
 */
namespace PreferAssertOverAssertOk {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Prefer assert.notOk(X) over assert.isNotOk(X).
 *
 * ```md
 * | key        | value      |
 * | :--------- | :--------- |
 * | type       | suggestion |
 * | deprecated | false      |
 * | fixable    | code       |
 * ```
 */
namespace PreferAssertNotOkOverAssertIsNotOk {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Prefer assert(X) over expect(X).toBe(true) (only if X is boolean)
 *
 * ```md
 * | key        | value      |
 * | :--------- | :--------- |
 * | type       | suggestion |
 * | deprecated | false      |
 * | fixable    | code       |
 * ```
 */
namespace PreferAssertOverExpectTrue {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Prefer assert.notOk(X) over expect(X).toBe(false) (only if X is boolean)
 *
 * ```md
 * | key        | value      |
 * | :--------- | :--------- |
 * | type       | suggestion |
 * | deprecated | false      |
 * | fixable    | code       |
 * ```
 */
namespace PreferAssertNotOkOverExpectFalse {
  export type RuleEntry = Linter.StringSeverity;
}

export type EslintVitestCodingStyleRules = Readonly<{
  'vitest-coding-style/no-expect-to-strict-equal': NoExpectToStrictEqual.RuleEntry;
  'vitest-coding-style/prefer-assert-over-assert-ok': PreferAssertOverAssertOk.RuleEntry;
  'vitest-coding-style/prefer-assert-not-ok-over-assert-is-not-ok': PreferAssertNotOkOverAssertIsNotOk.RuleEntry;
  'vitest-coding-style/prefer-assert-over-expect-true': PreferAssertOverExpectTrue.RuleEntry;
  'vitest-coding-style/prefer-assert-not-ok-over-expect-false': PreferAssertNotOkOverExpectFalse.RuleEntry;
}>;

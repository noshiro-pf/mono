/* cSpell:disable */
import { type Linter } from 'eslint';

/**
 * @description Disallow `expect(X).toStrictEqual(Y)` in favor of `assert.deepStrictEqual(X, Y)`, as the former also checks type equality between X and Y.
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  | fixable    | code       |
 *  ```
 */
namespace NoExpectToStrictEqual {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prefer assert.deepStrictEqual(X) over assert.deepEqual(X).
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  | fixable    | code       |
 *  ```
 */
namespace PreferAssertDeepStrictEqualOverDeepEqual {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prefer assert.isTrue(X) over assert(X), assert.isOk(X), assert.ok(X).
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  | fixable    | code       |
 *  ```
 */
namespace PreferAssertIsTrueOverAssert {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prefer assert.isFalse(X) over assert.isNotOk(X), assert.notOk(X).
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  | fixable    | code       |
 *  ```
 */
namespace PreferAssertIsFalseOverAssertNotOk {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prefer assert.isTrue(X) over expect(X).toBe(true) (only if X is boolean)
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  | fixable    | code       |
 *  ```
 */
namespace PreferAssertIsTrueOverExpectTrue {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prefer assert.isFalse(X) over expect(X).toBe(false) (only if X is boolean)
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  | fixable    | code       |
 *  ```
 */
namespace PreferAssertIsFalseOverExpectFalse {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prefer assert.isFalse(X) over assert.isTrue(!X).
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  | fixable    | code       |
 *  ```
 */
namespace PreferAssertIsFalseOverNegatedAssertIsTrue {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prefer assert.isTrue(X) over assert.isFalse(!X).
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  | fixable    | code       |
 *  ```
 */
namespace PreferAssertIsTrueOverNegatedAssertIsFalse {
  export type RuleEntry = Linter.StringSeverity;
}

export type EslintVitestCodingStyleRules = Readonly<{
  'vitest-coding-style/no-expect-to-strict-equal': NoExpectToStrictEqual.RuleEntry;
  'vitest-coding-style/prefer-assert-deep-strict-equal-over-deep-equal': PreferAssertDeepStrictEqualOverDeepEqual.RuleEntry;
  'vitest-coding-style/prefer-assert-is-true-over-assert': PreferAssertIsTrueOverAssert.RuleEntry;
  'vitest-coding-style/prefer-assert-is-false-over-assert-not-ok': PreferAssertIsFalseOverAssertNotOk.RuleEntry;
  'vitest-coding-style/prefer-assert-is-true-over-expect-true': PreferAssertIsTrueOverExpectTrue.RuleEntry;
  'vitest-coding-style/prefer-assert-is-false-over-expect-false': PreferAssertIsFalseOverExpectFalse.RuleEntry;
  'vitest-coding-style/prefer-assert-is-false-over-negated-assert-is-true': PreferAssertIsFalseOverNegatedAssertIsTrue.RuleEntry;
  'vitest-coding-style/prefer-assert-is-true-over-negated-assert-is-false': PreferAssertIsTrueOverNegatedAssertIsFalse.RuleEntry;
}>;

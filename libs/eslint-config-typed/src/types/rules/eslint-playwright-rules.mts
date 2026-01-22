/* cSpell:disable */
import { type Linter } from 'eslint';

type SpreadOptionsIfIsArray<
  T extends readonly [Linter.StringSeverity, unknown],
> = T[1] extends readonly unknown[]
  ? readonly [Linter.StringSeverity, ...T[1]]
  : T;

/**
 * Enforces a blank line between Playwright test blocks (e.g., test, test.step,
 * test.beforeEach, etc.).
 *
 * @link https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/consistent-spacing-between-blocks.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | deprecated  | false      |
 *  | fixable     | whitespace |
 *  | recommended | true       |
 *  ```
 */
namespace ConsistentSpacingBetweenBlocks {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce assertion to be made in a test body
 *
 * @link https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/expect-expect.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | deprecated  | false   |
 *  | recommended | true    |
 *  ```
 */
namespace ExpectExpect {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "additionalProperties": false,
   *     "properties": {
   *       "assertFunctionNames": {
   *         "type": "array",
   *         "items": {
   *           "type": "string"
   *         }
   *       },
   *       "assertFunctionPatterns": {
   *         "type": "array",
   *         "items": {
   *           "type": "string"
   *         }
   *       }
   *     },
   *     "type": "object"
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    assertFunctionNames?: readonly string[];
    assertFunctionPatterns?: readonly string[];
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Enforces a maximum number assertion calls in a test body
 *
 * @link https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/max-expects.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | recommended | false      |
 *  ```
 */
namespace MaxExpects {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "additionalProperties": false,
   *     "properties": {
   *       "max": {
   *         "minimum": 1,
   *         "type": "integer"
   *       }
   *     },
   *     "type": "object"
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    max?: number;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Enforces a maximum depth to nested describe calls
 *
 * @link https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/max-nested-describe.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | recommended | true       |
 *  ```
 */
namespace MaxNestedDescribe {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "additionalProperties": false,
   *     "properties": {
   *       "max": {
   *         "minimum": 0,
   *         "type": "integer"
   *       }
   *     },
   *     "type": "object"
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    max?: number;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Identify false positives when async Playwright APIs are not properly awaited.
 *
 * @link https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/missing-playwright-await.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | deprecated  | false   |
 *  | fixable     | code    |
 *  | recommended | true    |
 *  ```
 */
namespace MissingPlaywrightAwait {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "additionalProperties": false,
   *     "properties": {
   *       "customMatchers": {
   *         "items": {
   *           "type": "string"
   *         },
   *         "type": "array"
   *       }
   *     },
   *     "type": "object"
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    customMatchers?: readonly string[];
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Disallow commented out tests
 *
 * @link https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/no-commented-out-tests.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | deprecated  | false   |
 *  | recommended | true    |
 *  ```
 */
namespace NoCommentedOutTests {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow calling `expect` conditionally
 *
 * @link https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/no-conditional-expect.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | deprecated  | false   |
 *  | recommended | true    |
 *  ```
 */
namespace NoConditionalExpect {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow conditional logic in tests
 *
 * @link https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/no-conditional-in-test.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | deprecated  | false   |
 *  | recommended | true    |
 *  ```
 */
namespace NoConditionalInTest {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow duplicate setup and teardown hooks
 *
 * @link https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/no-duplicate-hooks.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | recommended | false      |
 *  ```
 */
namespace NoDuplicateHooks {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * The use of ElementHandle is discouraged, use Locator instead
 *
 * @link https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/no-element-handle.md
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | deprecated     | false      |
 *  | hasSuggestions | true       |
 *  | recommended    | true       |
 *  ```
 */
namespace NoElementHandle {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * The use of `page.$eval` and `page.$$eval` are discouraged, use
 * `locator.evaluate` or `locator.evaluateAll` instead
 *
 * @link https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/no-eval.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | deprecated  | false   |
 *  | recommended | true    |
 *  ```
 */
namespace NoEval {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Prevent usage of `.only()` focus test annotation
 *
 * @link https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/no-focused-test.md
 *
 *  ```md
 *  | key            | value   |
 *  | :------------- | :------ |
 *  | type           | problem |
 *  | deprecated     | false   |
 *  | hasSuggestions | true    |
 *  | recommended    | true    |
 *  ```
 */
namespace NoFocusedTest {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Prevent usage of `{ force: true }` option.
 *
 * @link https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/no-force-option.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | recommended | true       |
 *  ```
 */
namespace NoForceOption {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallows the usage of getByTitle()
 *
 * @link https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/no-get-by-title.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | recommended | false      |
 *  ```
 */
namespace NoGetByTitle {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow setup and teardown hooks
 *
 * @link https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/no-hooks.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | recommended | false      |
 *  ```
 */
namespace NoHooks {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "additionalProperties": false,
   *     "properties": {
   *       "allow": {
   *         "contains": [
   *           "beforeAll",
   *           "beforeEach",
   *           "afterAll",
   *           "afterEach"
   *         ],
   *         "type": "array"
   *       }
   *     },
   *     "type": "object"
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    allow?: readonly unknown[];
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Disallow nested `test.step()` methods
 *
 * @link https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/no-nested-step.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | deprecated  | false   |
 *  | recommended | true    |
 *  ```
 */
namespace NoNestedStep {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Prevent usage of the networkidle option
 *
 * @link https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/no-networkidle.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | deprecated  | false   |
 *  | recommended | true    |
 *  ```
 */
namespace NoNetworkidle {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow usage of nth methods
 *
 * @link https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/no-nth-methods.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | deprecated  | false   |
 *  | recommended | true    |
 *  ```
 */
namespace NoNthMethods {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Prevent usage of page.pause()
 *
 * @link https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/no-page-pause.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | deprecated  | false   |
 *  | recommended | true    |
 *  ```
 */
namespace NoPagePause {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallows the usage of raw locators
 *
 * @link https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/no-raw-locators.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | recommended | false      |
 *  ```
 */
namespace NoRawLocators {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "additionalProperties": false,
   *     "properties": {
   *       "allowed": {
   *         "items": {
   *           "type": "string"
   *         },
   *         "type": "array"
   *       }
   *     },
   *     "type": "object"
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    allowed?: readonly string[];
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Disallows the usage of specific locator methods
 *
 * @link https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/no-restricted-locators.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | recommended | false      |
 *  ```
 */
namespace NoRestrictedLocators {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "items": {
   *       "oneOf": [
   *         {
   *           "type": "string"
   *         },
   *         {
   *           "additionalProperties": false,
   *           "properties": {
   *             "message": {
   *               "type": "string"
   *             },
   *             "type": {
   *               "type": "string"
   *             }
   *           },
   *           "required": [
   *             "type"
   *           ],
   *           "type": "object"
   *         }
   *       ]
   *     },
   *     "type": "array"
   *   }
   * ]
   * ```
   */
  export type Options = readonly (
    | string
    | Readonly<{
        message?: string;
        type: string;
      }>
  )[];

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Disallow specific matchers & modifiers
 *
 * @link https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/no-restricted-matchers.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | recommended | false      |
 *  ```
 */
namespace NoRestrictedMatchers {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "additionalProperties": {
   *       "type": [
   *         "string",
   *         "null"
   *       ]
   *     },
   *     "type": "object"
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<Record<string, string | null>>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Prevent usage of the `.skip()` skip test annotation.
 *
 * @link https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/no-skipped-test.md
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | deprecated     | false      |
 *  | hasSuggestions | true       |
 *  | recommended    | true       |
 *  ```
 */
namespace NoSkippedTest {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "additionalProperties": false,
   *     "properties": {
   *       "allowConditional": {
   *         "default": false,
   *         "type": "boolean"
   *       }
   *     },
   *     "type": "object"
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /** @default false */
    allowConditional?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Prevent usage of the `.slow()` slow test annotation.
 *
 * @link https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/no-slowed-test.md
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | deprecated     | false      |
 *  | hasSuggestions | true       |
 *  | recommended    | false      |
 *  ```
 */
namespace NoSlowedTest {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "additionalProperties": false,
   *     "properties": {
   *       "allowConditional": {
   *         "default": false,
   *         "type": "boolean"
   *       }
   *     },
   *     "type": "object"
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /** @default false */
    allowConditional?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Disallow using `expect` outside of `test` blocks
 *
 * @link https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/no-standalone-expect.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | fixable     | code       |
 *  | recommended | false      |
 *  ```
 */
namespace NoStandaloneExpect {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Prevent unsafe variable references in page.evaluate() and
 * page.addInitScript()
 *
 * @link https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/no-unsafe-references.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | deprecated  | false   |
 *  | fixable     | code    |
 *  | recommended | true    |
 *  ```
 */
namespace NoUnsafeReferences {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow usage of page locators that are not used
 *
 * @link https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/no-unused-locators.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | deprecated  | false   |
 *  | recommended | true    |
 *  ```
 */
namespace NoUnusedLocators {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow unnecessary awaits for Playwright methods
 *
 * @link https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/no-useless-await.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | deprecated  | false   |
 *  | fixable     | code    |
 *  | recommended | true    |
 *  ```
 */
namespace NoUselessAwait {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow usage of 'not' matchers when a more specific matcher exists
 *
 * @link https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/no-useless-not.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | deprecated  | false   |
 *  | fixable     | code    |
 *  | recommended | true    |
 *  ```
 */
namespace NoUselessNot {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Prevent usage of page.waitForNavigation()
 *
 * @link https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/no-wait-for-navigation.md
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | deprecated     | false      |
 *  | hasSuggestions | true       |
 *  | recommended    | true       |
 *  ```
 */
namespace NoWaitForNavigation {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Prevent usage of page.waitForSelector()
 *
 * @link https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/no-wait-for-selector.md
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | deprecated     | false      |
 *  | hasSuggestions | true       |
 *  | recommended    | true       |
 *  ```
 */
namespace NoWaitForSelector {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Prevent usage of page.waitForTimeout()
 *
 * @link https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/no-wait-for-timeout.md
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | deprecated     | false      |
 *  | hasSuggestions | true       |
 *  | recommended    | true       |
 *  ```
 */
namespace NoWaitForTimeout {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Suggest using the built-in comparison matchers
 *
 * @link https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/prefer-comparison-matcher.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | fixable     | code       |
 *  | recommended | false      |
 *  ```
 */
namespace PreferComparisonMatcher {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Suggest using the built-in equality matchers
 *
 * @link https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/prefer-equality-matcher.md
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | deprecated     | false      |
 *  | hasSuggestions | true       |
 *  | recommended    | false      |
 *  ```
 */
namespace PreferEqualityMatcher {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Prefer having hooks in a consistent order
 *
 * @link https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/prefer-hooks-in-order.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | recommended | false      |
 *  ```
 */
namespace PreferHooksInOrder {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Suggest having hooks before any test cases
 *
 * @link https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/prefer-hooks-on-top.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | recommended | false      |
 *  ```
 */
namespace PreferHooksOnTop {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Suggest locators over page methods
 *
 * @link https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/prefer-locator.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | recommended | false      |
 *  ```
 */
namespace PreferLocator {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce lowercase test names
 *
 * @link https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/prefer-lowercase-title.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | fixable     | code       |
 *  | recommended | false      |
 *  ```
 */
namespace PreferLowercaseTitle {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "additionalProperties": false,
   *     "properties": {
   *       "allowedPrefixes": {
   *         "additionalItems": false,
   *         "items": {
   *           "type": "string"
   *         },
   *         "type": "array"
   *       },
   *       "ignore": {
   *         "additionalItems": false,
   *         "items": {
   *           "enum": [
   *             "test.describe",
   *             "test"
   *           ]
   *         },
   *         "type": "array"
   *       },
   *       "ignoreTopLevelDescribe": {
   *         "default": false,
   *         "type": "boolean"
   *       }
   *     },
   *     "type": "object"
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    allowedPrefixes?: readonly string[];
    ignore?: readonly ('test.describe' | 'test')[];
    /** @default false */
    ignoreTopLevelDescribe?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Prefer native locator functions
 *
 * @link https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/prefer-native-locators.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | fixable     | code       |
 *  | recommended | false      |
 *  ```
 */
namespace PreferNativeLocators {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "additionalProperties": false,
   *     "properties": {
   *       "testIdAttribute": {
   *         "default": "data-testid",
   *         "type": "string"
   *       }
   *     },
   *     "type": "object"
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /** @default 'data-testid' */
    testIdAttribute?: string;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Suggest using `toStrictEqual()`
 *
 * @link https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/prefer-strict-equal.md
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | deprecated     | false      |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 *  | recommended    | false      |
 *  ```
 */
namespace PreferStrictEqual {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Suggest using `toBe()` for primitive literals
 *
 * @link https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/prefer-to-be.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | fixable     | code       |
 *  | recommended | false      |
 *  ```
 */
namespace PreferToBe {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Suggest using toContain()
 *
 * @link https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/prefer-to-contain.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | fixable     | code       |
 *  | recommended | false      |
 *  ```
 */
namespace PreferToContain {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Suggest using `toHaveCount()`
 *
 * @link https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/prefer-to-have-count.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | fixable     | code       |
 *  | recommended | false      |
 *  ```
 */
namespace PreferToHaveCount {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Suggest using `toHaveLength()`
 *
 * @link https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/prefer-to-have-length.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | fixable     | code       |
 *  | recommended | false      |
 *  ```
 */
namespace PreferToHaveLength {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Prefer web first assertions
 *
 * @link https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/prefer-web-first-assertions.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | fixable     | code       |
 *  | recommended | true       |
 *  ```
 */
namespace PreferWebFirstAssertions {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Require setup and teardown code to be within a hook
 *
 * @link https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/require-hook.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | recommended | false      |
 *  ```
 */
namespace RequireHook {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "additionalProperties": false,
   *     "properties": {
   *       "allowedFunctionCalls": {
   *         "items": {
   *           "type": "string"
   *         },
   *         "type": "array"
   *       }
   *     },
   *     "type": "object"
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    allowedFunctionCalls?: readonly string[];
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Require all assertions to use `expect.soft`
 *
 * @link https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/require-soft-assertions.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | fixable     | code       |
 *  | recommended | false      |
 *  ```
 */
namespace RequireSoftAssertions {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Require a message for `toThrow()`
 *
 * @link https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/require-to-throw-message.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | recommended | false      |
 *  ```
 */
namespace RequireToThrowMessage {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Require test cases and hooks to be inside a `test.describe` block
 *
 * @link https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/require-top-level-describe.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | recommended | false      |
 *  ```
 */
namespace RequireTopLevelDescribe {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "additionalProperties": false,
   *     "properties": {
   *       "maxTopLevelDescribes": {
   *         "minimum": 1,
   *         "type": "number"
   *       }
   *     },
   *     "type": "object"
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    maxTopLevelDescribes?: number;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Enforce valid `describe()` callback
 *
 * @link https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/valid-describe-callback.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | deprecated  | false   |
 *  | recommended | true    |
 *  ```
 */
namespace ValidDescribeCallback {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce valid `expect()` usage
 *
 * @link https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/valid-expect.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | deprecated  | false   |
 *  | recommended | true    |
 *  ```
 */
namespace ValidExpect {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "additionalProperties": false,
   *     "properties": {
   *       "maxArgs": {
   *         "minimum": 1,
   *         "type": "number"
   *       },
   *       "minArgs": {
   *         "minimum": 1,
   *         "type": "number"
   *       }
   *     },
   *     "type": "object"
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    maxArgs?: number;
    minArgs?: number;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Require promises that have expectations in their chain to be valid
 *
 * @link https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/valid-expect-in-promise.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | recommended | true       |
 *  ```
 */
namespace ValidExpectInPromise {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce valid tag format in Playwright test blocks and titles
 *
 * ```md
 * | key         | value   |
 * | :---------- | :------ |
 * | type        | problem |
 * | deprecated  | false   |
 * | recommended | true    |
 * ```
 */
namespace ValidTestTags {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "additionalProperties": false,
   *     "properties": {
   *       "allowedTags": {
   *         "items": {
   *           "oneOf": [
   *             {
   *               "type": "string"
   *             },
   *             {
   *               "additionalProperties": false,
   *               "properties": {
   *                 "source": {
   *                   "type": "string"
   *                 }
   *               },
   *               "type": "object"
   *             }
   *           ]
   *         },
   *         "type": "array"
   *       },
   *       "disallowedTags": {
   *         "items": {
   *           "oneOf": [
   *             {
   *               "type": "string"
   *             },
   *             {
   *               "additionalProperties": false,
   *               "properties": {
   *                 "source": {
   *                   "type": "string"
   *                 }
   *               },
   *               "type": "object"
   *             }
   *           ]
   *         },
   *         "type": "array"
   *       }
   *     },
   *     "type": "object"
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    allowedTags?: readonly (
      | string
      | Readonly<{
          source?: string;
        }>
    )[];
    disallowedTags?: readonly (
      | string
      | Readonly<{
          source?: string;
        }>
    )[];
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Enforce valid titles
 *
 * @link https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/valid-title.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | fixable     | code       |
 *  | recommended | true       |
 *  ```
 */
namespace ValidTitle {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "additionalProperties": false,
   *     "type": "object",
   *     "definitions": {
   *       "PatternOrPatternArray": {
   *         "oneOf": [
   *           {
   *             "type": "string"
   *           },
   *           {
   *             "additionalItems": false,
   *             "items": {
   *               "type": "string"
   *             },
   *             "maxItems": 2,
   *             "minItems": 1,
   *             "type": "array"
   *           }
   *         ]
   *       },
   *       "MustMatchType": {
   *         "oneOf": [
   *           {
   *             "$ref": "#/definitions/PatternOrPatternArray"
   *           },
   *           {
   *             "type": "object",
   *             "properties": {
   *               "describe": {
   *                 "$ref": "#/definitions/PatternOrPatternArray"
   *               },
   *               "test": {
   *                 "$ref": "#/definitions/PatternOrPatternArray"
   *               },
   *               "step": {
   *                 "$ref": "#/definitions/PatternOrPatternArray"
   *               }
   *             },
   *             "additionalProperties": false
   *           }
   *         ]
   *       }
   *     },
   *     "properties": {
   *       "disallowedWords": {
   *         "items": {
   *           "type": "string"
   *         },
   *         "type": "array"
   *       },
   *       "ignoreSpaces": {
   *         "default": false,
   *         "type": "boolean"
   *       },
   *       "ignoreTypeOfDescribeName": {
   *         "default": false,
   *         "type": "boolean"
   *       },
   *       "ignoreTypeOfStepName": {
   *         "default": true,
   *         "type": "boolean"
   *       },
   *       "ignoreTypeOfTestName": {
   *         "default": false,
   *         "type": "boolean"
   *       },
   *       "mustMatch": {
   *         "$ref": "#/definitions/MustMatchType"
   *       },
   *       "mustNotMatch": {
   *         "$ref": "#/definitions/MustMatchType"
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type MustMatchType =
    | PatternOrPatternArray
    | Readonly<{
        describe?: PatternOrPatternArray;
        test?: PatternOrPatternArray;
        step?: PatternOrPatternArray;
      }>;

  export type PatternOrPatternArray =
    | string
    | readonly [string]
    | readonly [string, string];

  export type Options = Readonly<{
    disallowedWords?: readonly string[];
    /** @default false */
    ignoreSpaces?: boolean;
    /** @default false */
    ignoreTypeOfDescribeName?: boolean;
    /** @default true */
    ignoreTypeOfStepName?: boolean;
    /** @default false */
    ignoreTypeOfTestName?: boolean;
    mustMatch?: MustMatchType;
    mustNotMatch?: MustMatchType;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

export type EslintPlaywrightRules = Readonly<{
  'playwright/consistent-spacing-between-blocks': ConsistentSpacingBetweenBlocks.RuleEntry;
  'playwright/expect-expect': ExpectExpect.RuleEntry;
  'playwright/max-expects': MaxExpects.RuleEntry;
  'playwright/max-nested-describe': MaxNestedDescribe.RuleEntry;
  'playwright/missing-playwright-await': MissingPlaywrightAwait.RuleEntry;
  'playwright/no-commented-out-tests': NoCommentedOutTests.RuleEntry;
  'playwright/no-conditional-expect': NoConditionalExpect.RuleEntry;
  'playwright/no-conditional-in-test': NoConditionalInTest.RuleEntry;
  'playwright/no-duplicate-hooks': NoDuplicateHooks.RuleEntry;
  'playwright/no-element-handle': NoElementHandle.RuleEntry;
  'playwright/no-eval': NoEval.RuleEntry;
  'playwright/no-focused-test': NoFocusedTest.RuleEntry;
  'playwright/no-force-option': NoForceOption.RuleEntry;
  'playwright/no-get-by-title': NoGetByTitle.RuleEntry;
  'playwright/no-hooks': NoHooks.RuleEntry;
  'playwright/no-nested-step': NoNestedStep.RuleEntry;
  'playwright/no-networkidle': NoNetworkidle.RuleEntry;
  'playwright/no-nth-methods': NoNthMethods.RuleEntry;
  'playwright/no-page-pause': NoPagePause.RuleEntry;
  'playwright/no-raw-locators': NoRawLocators.RuleEntry;
  'playwright/no-restricted-locators': NoRestrictedLocators.RuleEntry;
  'playwright/no-restricted-matchers': NoRestrictedMatchers.RuleEntry;
  'playwright/no-skipped-test': NoSkippedTest.RuleEntry;
  'playwright/no-slowed-test': NoSlowedTest.RuleEntry;
  'playwright/no-standalone-expect': NoStandaloneExpect.RuleEntry;
  'playwright/no-unsafe-references': NoUnsafeReferences.RuleEntry;
  'playwright/no-unused-locators': NoUnusedLocators.RuleEntry;
  'playwright/no-useless-await': NoUselessAwait.RuleEntry;
  'playwright/no-useless-not': NoUselessNot.RuleEntry;
  'playwright/no-wait-for-navigation': NoWaitForNavigation.RuleEntry;
  'playwright/no-wait-for-selector': NoWaitForSelector.RuleEntry;
  'playwright/no-wait-for-timeout': NoWaitForTimeout.RuleEntry;
  'playwright/prefer-comparison-matcher': PreferComparisonMatcher.RuleEntry;
  'playwright/prefer-equality-matcher': PreferEqualityMatcher.RuleEntry;
  'playwright/prefer-hooks-in-order': PreferHooksInOrder.RuleEntry;
  'playwright/prefer-hooks-on-top': PreferHooksOnTop.RuleEntry;
  'playwright/prefer-locator': PreferLocator.RuleEntry;
  'playwright/prefer-lowercase-title': PreferLowercaseTitle.RuleEntry;
  'playwright/prefer-native-locators': PreferNativeLocators.RuleEntry;
  'playwright/prefer-strict-equal': PreferStrictEqual.RuleEntry;
  'playwright/prefer-to-be': PreferToBe.RuleEntry;
  'playwright/prefer-to-contain': PreferToContain.RuleEntry;
  'playwright/prefer-to-have-count': PreferToHaveCount.RuleEntry;
  'playwright/prefer-to-have-length': PreferToHaveLength.RuleEntry;
  'playwright/prefer-web-first-assertions': PreferWebFirstAssertions.RuleEntry;
  'playwright/require-hook': RequireHook.RuleEntry;
  'playwright/require-soft-assertions': RequireSoftAssertions.RuleEntry;
  'playwright/require-to-throw-message': RequireToThrowMessage.RuleEntry;
  'playwright/require-top-level-describe': RequireTopLevelDescribe.RuleEntry;
  'playwright/valid-describe-callback': ValidDescribeCallback.RuleEntry;
  'playwright/valid-expect': ValidExpect.RuleEntry;
  'playwright/valid-expect-in-promise': ValidExpectInPromise.RuleEntry;
  'playwright/valid-test-tags': ValidTestTags.RuleEntry;
  'playwright/valid-title': ValidTitle.RuleEntry;
}>;

export type EslintPlaywrightRulesOption = Readonly<{
  'playwright/expect-expect': ExpectExpect.Options;
  'playwright/max-expects': MaxExpects.Options;
  'playwright/max-nested-describe': MaxNestedDescribe.Options;
  'playwright/missing-playwright-await': MissingPlaywrightAwait.Options;
  'playwright/no-hooks': NoHooks.Options;
  'playwright/no-raw-locators': NoRawLocators.Options;
  'playwright/no-restricted-locators': NoRestrictedLocators.Options;
  'playwright/no-restricted-matchers': NoRestrictedMatchers.Options;
  'playwright/no-skipped-test': NoSkippedTest.Options;
  'playwright/no-slowed-test': NoSlowedTest.Options;
  'playwright/prefer-lowercase-title': PreferLowercaseTitle.Options;
  'playwright/prefer-native-locators': PreferNativeLocators.Options;
  'playwright/require-hook': RequireHook.Options;
  'playwright/require-top-level-describe': RequireTopLevelDescribe.Options;
  'playwright/valid-expect': ValidExpect.Options;
  'playwright/valid-test-tags': ValidTestTags.Options;
  'playwright/valid-title': ValidTitle.Options;
}>;

/* cSpell:disable */
import { type Linter } from 'eslint';

type SpreadOptionsIfIsArray<
  T extends readonly [Linter.StringSeverity, unknown],
> = T[1] extends readonly unknown[]
  ? readonly [Linter.StringSeverity, ...T[1]]
  : T;

/**
 * Enforce `test` and `it` usage conventions
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v29.2.1/docs/rules/consistent-test-it.md
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  | fixable    | code       |
 *  ```
 */
namespace ConsistentTestIt {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "fn": {
   *         "type": "string",
   *         "enum": [
   *           "it",
   *           "test"
   *         ]
   *       },
   *       "withinDescribe": {
   *         "type": "string",
   *         "enum": [
   *           "it",
   *           "test"
   *         ]
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    fn?: 'it' | 'test';
    withinDescribe?: 'it' | 'test';
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Enforce assertion to be made in a test body
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v29.2.1/docs/rules/expect-expect.md
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  ```
 */
namespace ExpectExpect {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "assertFunctionNames": {
   *         "type": "array",
   *         "items": {
   *           "type": "string"
   *         }
   *       },
   *       "additionalTestBlockFunctions": {
   *         "type": "array",
   *         "items": {
   *           "type": "string"
   *         }
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    assertFunctionNames?: readonly string[];
    additionalTestBlockFunctions?: readonly string[];
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Enforces a maximum number assertion calls in a test body
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v29.2.1/docs/rules/max-expects.md
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  ```
 */
namespace MaxExpects {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "max": {
   *         "type": "integer",
   *         "minimum": 1
   *       }
   *     },
   *     "additionalProperties": false
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
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v29.2.1/docs/rules/max-nested-describe.md
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  ```
 */
namespace MaxNestedDescribe {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "max": {
   *         "type": "integer",
   *         "minimum": 0
   *       }
   *     },
   *     "additionalProperties": false
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
 * Disallow alias methods
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v29.2.1/docs/rules/no-alias-methods.md
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  | fixable    | code       |
 *  ```
 */
namespace NoAliasMethods {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow commented out tests
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v29.2.1/docs/rules/no-commented-out-tests.md
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  ```
 */
namespace NoCommentedOutTests {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow calling `expect` conditionally
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v29.2.1/docs/rules/no-conditional-expect.md
 *
 *  ```md
 *  | key        | value   |
 *  | :--------- | :------ |
 *  | type       | problem |
 *  | deprecated | false   |
 *  ```
 */
namespace NoConditionalExpect {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow conditional logic in tests
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v29.2.1/docs/rules/no-conditional-in-test.md
 *
 *  ```md
 *  | key        | value   |
 *  | :--------- | :------ |
 *  | type       | problem |
 *  | deprecated | false   |
 *  ```
 */
namespace NoConditionalInTest {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow confusing usages of jest.setTimeout
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v29.2.1/docs/rules/no-confusing-set-timeout.md
 *
 *  ```md
 *  | key        | value   |
 *  | :--------- | :------ |
 *  | type       | problem |
 *  | deprecated | false   |
 *  ```
 */
namespace NoConfusingSetTimeout {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow use of deprecated functions
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v29.2.1/docs/rules/no-deprecated-functions.md
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  | fixable    | code       |
 *  ```
 */
namespace NoDeprecatedFunctions {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow disabled tests
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v29.2.1/docs/rules/no-disabled-tests.md
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  ```
 */
namespace NoDisabledTests {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow using a callback in asynchronous tests and hooks
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v29.2.1/docs/rules/no-done-callback.md
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | deprecated     | false      |
 *  | hasSuggestions | true       |
 *  ```
 */
namespace NoDoneCallback {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow duplicate setup and teardown hooks
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v29.2.1/docs/rules/no-duplicate-hooks.md
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  ```
 */
namespace NoDuplicateHooks {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow using `exports` in files containing tests
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v29.2.1/docs/rules/no-export.md
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  ```
 */
namespace NoExport {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow focused tests
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v29.2.1/docs/rules/no-focused-tests.md
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | deprecated     | false      |
 *  | hasSuggestions | true       |
 *  ```
 */
namespace NoFocusedTests {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow setup and teardown hooks
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v29.2.1/docs/rules/no-hooks.md
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  ```
 */
namespace NoHooks {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "allow": {
   *         "type": "array",
   *         "contains": [
   *           "beforeAll",
   *           "beforeEach",
   *           "afterAll",
   *           "afterEach"
   *         ]
   *       }
   *     },
   *     "additionalProperties": false
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
 * Disallow identical titles
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v29.2.1/docs/rules/no-identical-title.md
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  ```
 */
namespace NoIdenticalTitle {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow string interpolation inside snapshots
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v29.2.1/docs/rules/no-interpolation-in-snapshots.md
 *
 *  ```md
 *  | key        | value   |
 *  | :--------- | :------ |
 *  | type       | problem |
 *  | deprecated | false   |
 *  ```
 */
namespace NoInterpolationInSnapshots {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow Jasmine globals
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v29.2.1/docs/rules/no-jasmine-globals.md
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  | fixable    | code       |
 *  ```
 */
namespace NoJasmineGlobals {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow large snapshots
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v29.2.1/docs/rules/no-large-snapshots.md
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  ```
 */
namespace NoLargeSnapshots {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "maxSize": {
   *         "type": "number"
   *       },
   *       "inlineMaxSize": {
   *         "type": "number"
   *       },
   *       "allowedSnapshots": {
   *         "type": "object",
   *         "additionalProperties": {
   *           "type": "array"
   *         }
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    maxSize?: number;
    inlineMaxSize?: number;
    allowedSnapshots?: Readonly<Record<string, readonly unknown[]>>;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Disallow manually importing from `__mocks__`
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v29.2.1/docs/rules/no-mocks-import.md
 *
 *  ```md
 *  | key        | value   |
 *  | :--------- | :------ |
 *  | type       | problem |
 *  | deprecated | false   |
 *  ```
 */
namespace NoMocksImport {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow specific `jest.` methods
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v29.2.1/docs/rules/no-restricted-jest-methods.md
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  ```
 */
namespace NoRestrictedJestMethods {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": {
   *       "type": [
   *         "string",
   *         "null"
   *       ]
   *     }
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
 * Disallow specific matchers & modifiers
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v29.2.1/docs/rules/no-restricted-matchers.md
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  ```
 */
namespace NoRestrictedMatchers {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": {
   *       "type": [
   *         "string",
   *         "null"
   *       ]
   *     }
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
 * Disallow using `expect` outside of `it` or `test` blocks
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v29.2.1/docs/rules/no-standalone-expect.md
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  ```
 */
namespace NoStandaloneExpect {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "additionalTestBlockFunctions": {
   *         "type": "array",
   *         "items": {
   *           "type": "string"
   *         }
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    additionalTestBlockFunctions?: readonly string[];
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Require using `.only` and `.skip` over `f` and `x`
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v29.2.1/docs/rules/no-test-prefixes.md
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  | fixable    | code       |
 *  ```
 */
namespace NoTestPrefixes {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow explicitly returning from tests
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v29.2.1/docs/rules/no-test-return-statement.md
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  ```
 */
namespace NoTestReturnStatement {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow using `jest.mock()` factories without an explicit type parameter
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v29.2.1/docs/rules/no-untyped-mock-factory.md
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  | fixable    | code       |
 *  ```
 */
namespace NoUntypedMockFactory {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce padding around `afterAll` blocks
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v29.2.1/docs/rules/padding-around-after-all-blocks.md
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  | fixable    | whitespace |
 *  ```
 */
namespace PaddingAroundAfterAllBlocks {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce padding around `afterEach` blocks
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v29.2.1/docs/rules/padding-around-after-each-blocks.md
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  | fixable    | whitespace |
 *  ```
 */
namespace PaddingAroundAfterEachBlocks {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce padding around Jest functions
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v29.2.1/docs/rules/padding-around-all.md
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  | fixable    | whitespace |
 *  ```
 */
namespace PaddingAroundAll {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce padding around `beforeAll` blocks
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v29.2.1/docs/rules/padding-around-before-all-blocks.md
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  | fixable    | whitespace |
 *  ```
 */
namespace PaddingAroundBeforeAllBlocks {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce padding around `beforeEach` blocks
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v29.2.1/docs/rules/padding-around-before-each-blocks.md
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  | fixable    | whitespace |
 *  ```
 */
namespace PaddingAroundBeforeEachBlocks {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce padding around `describe` blocks
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v29.2.1/docs/rules/padding-around-describe-blocks.md
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  | fixable    | whitespace |
 *  ```
 */
namespace PaddingAroundDescribeBlocks {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce padding around `expect` groups
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v29.2.1/docs/rules/padding-around-expect-groups.md
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  | fixable    | whitespace |
 *  ```
 */
namespace PaddingAroundExpectGroups {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce padding around `test` and `it` blocks
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v29.2.1/docs/rules/padding-around-test-blocks.md
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  | fixable    | whitespace |
 *  ```
 */
namespace PaddingAroundTestBlocks {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Suggest using `toBeCalledWith()` or `toHaveBeenCalledWith()`
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v29.2.1/docs/rules/prefer-called-with.md
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  ```
 */
namespace PreferCalledWith {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Suggest using the built-in comparison matchers
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v29.2.1/docs/rules/prefer-comparison-matcher.md
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  | fixable    | code       |
 *  ```
 */
namespace PreferComparisonMatcher {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Prefer using `.each` rather than manual loops
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v29.2.1/docs/rules/prefer-each.md
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  ```
 */
namespace PreferEach {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Prefer having the last statement in a test be an assertion
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v29.2.1/docs/rules/prefer-ending-with-an-expect.md
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  ```
 */
namespace PreferEndingWithAnExpect {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "assertFunctionNames": {
   *         "type": "array",
   *         "items": {
   *           "type": "string"
   *         }
   *       },
   *       "additionalTestBlockFunctions": {
   *         "type": "array",
   *         "items": {
   *           "type": "string"
   *         }
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    assertFunctionNames?: readonly string[];
    additionalTestBlockFunctions?: readonly string[];
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Suggest using the built-in equality matchers
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v29.2.1/docs/rules/prefer-equality-matcher.md
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | deprecated     | false      |
 *  | hasSuggestions | true       |
 *  ```
 */
namespace PreferEqualityMatcher {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Suggest using `expect.assertions()` OR `expect.hasAssertions()`
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v29.2.1/docs/rules/prefer-expect-assertions.md
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | deprecated     | false      |
 *  | hasSuggestions | true       |
 *  ```
 */
namespace PreferExpectAssertions {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "onlyFunctionsWithAsyncKeyword": {
   *         "type": "boolean"
   *       },
   *       "onlyFunctionsWithExpectInLoop": {
   *         "type": "boolean"
   *       },
   *       "onlyFunctionsWithExpectInCallback": {
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    onlyFunctionsWithAsyncKeyword?: boolean;
    onlyFunctionsWithExpectInLoop?: boolean;
    onlyFunctionsWithExpectInCallback?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Prefer `await expect(...).resolves` over `expect(await ...)` syntax
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v29.2.1/docs/rules/prefer-expect-resolves.md
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  | fixable    | code       |
 *  ```
 */
namespace PreferExpectResolves {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Prefer having hooks in a consistent order
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v29.2.1/docs/rules/prefer-hooks-in-order.md
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  ```
 */
namespace PreferHooksInOrder {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Suggest having hooks before any test cases
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v29.2.1/docs/rules/prefer-hooks-on-top.md
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  ```
 */
namespace PreferHooksOnTop {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Prefer importing Jest globals
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v29.2.1/docs/rules/prefer-importing-jest-globals.md
 *
 *  ```md
 *  | key        | value   |
 *  | :--------- | :------ |
 *  | type       | problem |
 *  | deprecated | false   |
 *  | fixable    | code    |
 *  ```
 */
namespace PreferImportingJestGlobals {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "types": {
   *         "type": "array",
   *         "items": {
   *           "type": "string",
   *           "enum": [
   *             "hook",
   *             "describe",
   *             "test",
   *             "expect",
   *             "jest",
   *             "unknown"
   *           ]
   *         }
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    types?: readonly (
      | 'hook'
      | 'describe'
      | 'test'
      | 'expect'
      | 'jest'
      | 'unknown'
    )[];
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Prefer `jest.mocked()` over `fn as jest.Mock`
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v29.2.1/docs/rules/prefer-jest-mocked.md
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  | fixable    | code       |
 *  ```
 */
namespace PreferJestMocked {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce lowercase test names
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v29.2.1/docs/rules/prefer-lowercase-title.md
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  | fixable    | code       |
 *  ```
 */
namespace PreferLowercaseTitle {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "ignore": {
   *         "type": "array",
   *         "items": {
   *           "type": "string",
   *           "enum": [
   *             "describe",
   *             "test",
   *             "it"
   *           ]
   *         },
   *         "additionalItems": false
   *       },
   *       "allowedPrefixes": {
   *         "type": "array",
   *         "items": {
   *           "type": "string"
   *         },
   *         "additionalItems": false
   *       },
   *       "ignoreTopLevelDescribe": {
   *         "type": "boolean",
   *         "default": false
   *       },
   *       "ignoreTodos": {
   *         "type": "boolean",
   *         "default": false
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    ignore?: readonly ('describe' | 'test' | 'it')[];
    allowedPrefixes?: readonly string[];
    /** @default false */
    ignoreTopLevelDescribe?: boolean;
    /** @default false */
    ignoreTodos?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Prefer mock resolved/rejected shorthands for promises
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v29.2.1/docs/rules/prefer-mock-promise-shorthand.md
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  | fixable    | code       |
 *  ```
 */
namespace PreferMockPromiseShorthand {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Prefer including a hint with external snapshots
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v29.2.1/docs/rules/prefer-snapshot-hint.md
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  ```
 */
namespace PreferSnapshotHint {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "string",
   *     "enum": [
   *       "always",
   *       "multi"
   *     ]
   *   }
   * ]
   * ```
   */
  export type Options = 'always' | 'multi';

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Suggest using `jest.spyOn()`
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v29.2.1/docs/rules/prefer-spy-on.md
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  | fixable    | code       |
 *  ```
 */
namespace PreferSpyOn {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Suggest using `toStrictEqual()`
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v29.2.1/docs/rules/prefer-strict-equal.md
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | deprecated     | false      |
 *  | hasSuggestions | true       |
 *  ```
 */
namespace PreferStrictEqual {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Suggest using `toBe()` for primitive literals
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v29.2.1/docs/rules/prefer-to-be.md
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  | fixable    | code       |
 *  ```
 */
namespace PreferToBe {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Suggest using `toContain()`
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v29.2.1/docs/rules/prefer-to-contain.md
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  | fixable    | code       |
 *  ```
 */
namespace PreferToContain {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Suggest using `toHaveLength()`
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v29.2.1/docs/rules/prefer-to-have-length.md
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  | fixable    | code       |
 *  ```
 */
namespace PreferToHaveLength {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Suggest using `test.todo`
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v29.2.1/docs/rules/prefer-todo.md
 *
 *  ```md
 *  | key        | value  |
 *  | :--------- | :----- |
 *  | type       | layout |
 *  | deprecated | false  |
 *  | fixable    | code   |
 *  ```
 */
namespace PreferTodo {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Require setup and teardown code to be within a hook
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v29.2.1/docs/rules/require-hook.md
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  ```
 */
namespace RequireHook {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "allowedFunctionCalls": {
   *         "type": "array",
   *         "items": {
   *           "type": "string"
   *         }
   *       }
   *     },
   *     "additionalProperties": false
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
 * Require a message for `toThrow()`
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v29.2.1/docs/rules/require-to-throw-message.md
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  ```
 */
namespace RequireToThrowMessage {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Require test cases and hooks to be inside a `describe` block
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v29.2.1/docs/rules/require-top-level-describe.md
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  ```
 */
namespace RequireTopLevelDescribe {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "maxNumberOfTopLevelDescribes": {
   *         "type": "number",
   *         "minimum": 1
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    maxNumberOfTopLevelDescribes?: number;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Enforce unbound methods are called with their expected scope
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v29.2.1/docs/rules/unbound-method.md
 *
 *  ```md
 *  | key                  | value       |
 *  | :------------------- | :---------- |
 *  | type                 | problem     |
 *  | deprecated           | false       |
 *  | recommended          | recommended |
 *  | requiresTypeChecking | true        |
 *  ```
 */
namespace UnboundMethod {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "ignoreStatic": {
   *         "type": "boolean",
   *         "description": "Whether to skip checking whether `static` methods are correctly bound."
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /** Whether to skip checking whether `static` methods are correctly bound. */
    ignoreStatic?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Enforce valid `describe()` callback
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v29.2.1/docs/rules/valid-describe-callback.md
 *
 *  ```md
 *  | key        | value   |
 *  | :--------- | :------ |
 *  | type       | problem |
 *  | deprecated | false   |
 *  ```
 */
namespace ValidDescribeCallback {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Require promises that have expectations in their chain to be valid
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v29.2.1/docs/rules/valid-expect-in-promise.md
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  ```
 */
namespace ValidExpectInPromise {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce valid `expect()` usage
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v29.2.1/docs/rules/valid-expect.md
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  | fixable    | code       |
 *  ```
 */
namespace ValidExpect {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "alwaysAwait": {
   *         "type": "boolean",
   *         "default": false
   *       },
   *       "asyncMatchers": {
   *         "type": "array",
   *         "items": {
   *           "type": "string"
   *         }
   *       },
   *       "minArgs": {
   *         "type": "number",
   *         "minimum": 0
   *       },
   *       "maxArgs": {
   *         "type": "number",
   *         "minimum": 1
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /** @default false */
    alwaysAwait?: boolean;
    asyncMatchers?: readonly string[];
    minArgs?: number;
    maxArgs?: number;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Disallow mocking of non-existing module paths
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v29.2.1/docs/rules/valid-mock-module-path.md
 *
 *  ```md
 *  | key        | value   |
 *  | :--------- | :------ |
 *  | type       | problem |
 *  | deprecated | false   |
 *  ```
 */
namespace ValidMockModulePath {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "moduleFileExtensions": {
   *         "type": "array",
   *         "items": {
   *           "type": "string"
   *         },
   *         "additionalItems": false
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    moduleFileExtensions?: readonly string[];
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Enforce valid titles
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v29.2.1/docs/rules/valid-title.md
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  | fixable    | code       |
 *  ```
 */
namespace ValidTitle {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "ignoreSpaces": {
   *         "type": "boolean",
   *         "default": false
   *       },
   *       "ignoreTypeOfDescribeName": {
   *         "type": "boolean",
   *         "default": false
   *       },
   *       "ignoreTypeOfTestName": {
   *         "type": "boolean",
   *         "default": false
   *       },
   *       "disallowedWords": {
   *         "type": "array",
   *         "items": {
   *           "type": "string"
   *         }
   *       }
   *     },
   *     "patternProperties": {
   *       "^must(?:Not)?Match$": {
   *         "oneOf": [
   *           {
   *             "type": "string"
   *           },
   *           {
   *             "type": "array",
   *             "items": {
   *               "type": "string"
   *             },
   *             "minItems": 1,
   *             "maxItems": 2,
   *             "additionalItems": false
   *           },
   *           {
   *             "type": "object",
   *             "propertyNames": {
   *               "enum": [
   *                 "describe",
   *                 "test",
   *                 "it"
   *               ]
   *             },
   *             "additionalProperties": {
   *               "oneOf": [
   *                 {
   *                   "type": "string"
   *                 },
   *                 {
   *                   "type": "array",
   *                   "items": {
   *                     "type": "string"
   *                   },
   *                   "minItems": 1,
   *                   "maxItems": 2,
   *                   "additionalItems": false
   *                 }
   *               ]
   *             }
   *           }
   *         ]
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type MustMatchType =
    | PatternOrPatternArray
    | Readonly<{
        describe?: PatternOrPatternArray;
        test?: PatternOrPatternArray;
        it?: PatternOrPatternArray;
      }>;

  export type PatternOrPatternArray =
    | string
    | readonly [string]
    | readonly [string, string];

  export type Options = Readonly<{
    /** @default false */
    ignoreSpaces?: boolean;
    /** @default false */
    ignoreTypeOfDescribeName?: boolean;
    /** @default false */
    ignoreTypeOfTestName?: boolean;
    disallowedWords?: readonly string[];
    mustMatch?: MustMatchType;
    mustNotMatch?: MustMatchType;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

export type EslintJestRules = Readonly<{
  'jest/consistent-test-it': ConsistentTestIt.RuleEntry;
  'jest/expect-expect': ExpectExpect.RuleEntry;
  'jest/max-expects': MaxExpects.RuleEntry;
  'jest/max-nested-describe': MaxNestedDescribe.RuleEntry;
  'jest/no-alias-methods': NoAliasMethods.RuleEntry;
  'jest/no-commented-out-tests': NoCommentedOutTests.RuleEntry;
  'jest/no-conditional-expect': NoConditionalExpect.RuleEntry;
  'jest/no-conditional-in-test': NoConditionalInTest.RuleEntry;
  'jest/no-confusing-set-timeout': NoConfusingSetTimeout.RuleEntry;
  'jest/no-deprecated-functions': NoDeprecatedFunctions.RuleEntry;
  'jest/no-disabled-tests': NoDisabledTests.RuleEntry;
  'jest/no-done-callback': NoDoneCallback.RuleEntry;
  'jest/no-duplicate-hooks': NoDuplicateHooks.RuleEntry;
  'jest/no-export': NoExport.RuleEntry;
  'jest/no-focused-tests': NoFocusedTests.RuleEntry;
  'jest/no-hooks': NoHooks.RuleEntry;
  'jest/no-identical-title': NoIdenticalTitle.RuleEntry;
  'jest/no-interpolation-in-snapshots': NoInterpolationInSnapshots.RuleEntry;
  'jest/no-jasmine-globals': NoJasmineGlobals.RuleEntry;
  'jest/no-large-snapshots': NoLargeSnapshots.RuleEntry;
  'jest/no-mocks-import': NoMocksImport.RuleEntry;
  'jest/no-restricted-jest-methods': NoRestrictedJestMethods.RuleEntry;
  'jest/no-restricted-matchers': NoRestrictedMatchers.RuleEntry;
  'jest/no-standalone-expect': NoStandaloneExpect.RuleEntry;
  'jest/no-test-prefixes': NoTestPrefixes.RuleEntry;
  'jest/no-test-return-statement': NoTestReturnStatement.RuleEntry;
  'jest/no-untyped-mock-factory': NoUntypedMockFactory.RuleEntry;
  'jest/padding-around-after-all-blocks': PaddingAroundAfterAllBlocks.RuleEntry;
  'jest/padding-around-after-each-blocks': PaddingAroundAfterEachBlocks.RuleEntry;
  'jest/padding-around-all': PaddingAroundAll.RuleEntry;
  'jest/padding-around-before-all-blocks': PaddingAroundBeforeAllBlocks.RuleEntry;
  'jest/padding-around-before-each-blocks': PaddingAroundBeforeEachBlocks.RuleEntry;
  'jest/padding-around-describe-blocks': PaddingAroundDescribeBlocks.RuleEntry;
  'jest/padding-around-expect-groups': PaddingAroundExpectGroups.RuleEntry;
  'jest/padding-around-test-blocks': PaddingAroundTestBlocks.RuleEntry;
  'jest/prefer-called-with': PreferCalledWith.RuleEntry;
  'jest/prefer-comparison-matcher': PreferComparisonMatcher.RuleEntry;
  'jest/prefer-each': PreferEach.RuleEntry;
  'jest/prefer-ending-with-an-expect': PreferEndingWithAnExpect.RuleEntry;
  'jest/prefer-equality-matcher': PreferEqualityMatcher.RuleEntry;
  'jest/prefer-expect-assertions': PreferExpectAssertions.RuleEntry;
  'jest/prefer-expect-resolves': PreferExpectResolves.RuleEntry;
  'jest/prefer-hooks-in-order': PreferHooksInOrder.RuleEntry;
  'jest/prefer-hooks-on-top': PreferHooksOnTop.RuleEntry;
  'jest/prefer-importing-jest-globals': PreferImportingJestGlobals.RuleEntry;
  'jest/prefer-jest-mocked': PreferJestMocked.RuleEntry;
  'jest/prefer-lowercase-title': PreferLowercaseTitle.RuleEntry;
  'jest/prefer-mock-promise-shorthand': PreferMockPromiseShorthand.RuleEntry;
  'jest/prefer-snapshot-hint': PreferSnapshotHint.RuleEntry;
  'jest/prefer-spy-on': PreferSpyOn.RuleEntry;
  'jest/prefer-strict-equal': PreferStrictEqual.RuleEntry;
  'jest/prefer-to-be': PreferToBe.RuleEntry;
  'jest/prefer-to-contain': PreferToContain.RuleEntry;
  'jest/prefer-to-have-length': PreferToHaveLength.RuleEntry;
  'jest/prefer-todo': PreferTodo.RuleEntry;
  'jest/require-hook': RequireHook.RuleEntry;
  'jest/require-to-throw-message': RequireToThrowMessage.RuleEntry;
  'jest/require-top-level-describe': RequireTopLevelDescribe.RuleEntry;
  'jest/unbound-method': UnboundMethod.RuleEntry;
  'jest/valid-describe-callback': ValidDescribeCallback.RuleEntry;
  'jest/valid-expect-in-promise': ValidExpectInPromise.RuleEntry;
  'jest/valid-expect': ValidExpect.RuleEntry;
  'jest/valid-mock-module-path': ValidMockModulePath.RuleEntry;
  'jest/valid-title': ValidTitle.RuleEntry;
}>;

export type EslintJestRulesOption = Readonly<{
  'jest/consistent-test-it': ConsistentTestIt.Options;
  'jest/expect-expect': ExpectExpect.Options;
  'jest/max-expects': MaxExpects.Options;
  'jest/max-nested-describe': MaxNestedDescribe.Options;
  'jest/no-hooks': NoHooks.Options;
  'jest/no-large-snapshots': NoLargeSnapshots.Options;
  'jest/no-restricted-jest-methods': NoRestrictedJestMethods.Options;
  'jest/no-restricted-matchers': NoRestrictedMatchers.Options;
  'jest/no-standalone-expect': NoStandaloneExpect.Options;
  'jest/prefer-ending-with-an-expect': PreferEndingWithAnExpect.Options;
  'jest/prefer-expect-assertions': PreferExpectAssertions.Options;
  'jest/prefer-importing-jest-globals': PreferImportingJestGlobals.Options;
  'jest/prefer-lowercase-title': PreferLowercaseTitle.Options;
  'jest/prefer-snapshot-hint': PreferSnapshotHint.Options;
  'jest/require-hook': RequireHook.Options;
  'jest/require-top-level-describe': RequireTopLevelDescribe.Options;
  'jest/unbound-method': UnboundMethod.Options;
  'jest/valid-expect': ValidExpect.Options;
  'jest/valid-mock-module-path': ValidMockModulePath.Options;
  'jest/valid-title': ValidTitle.Options;
}>;

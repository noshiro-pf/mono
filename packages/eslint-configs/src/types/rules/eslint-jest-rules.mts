/* cSpell:disable */
import { type Linter } from 'eslint';

type SpreadOptionsIfIsArray<T extends readonly [Linter.RuleLevel, unknown]> =
  T[1] extends readonly unknown[] ? readonly [Linter.RuleLevel, ...T[1]] : T;

/**
 * Enforce `test` and `it` usage conventions
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v28.8.0/docs/rules/consistent-test-it.md
 *
 *  ```md
 *  | key     | value      |
 *  | :------ | :--------- |
 *  | type    | suggestion |
 *  | fixable | code       |
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
  export type Options = {
    readonly fn?: 'it' | 'test';
    readonly withinDescribe?: 'it' | 'test';
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * Enforce assertion to be made in a test body
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v28.8.0/docs/rules/expect-expect.md
 *
 *  ```md
 *  | key  | value      |
 *  | :--- | :--------- |
 *  | type | suggestion |
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
  export type Options = {
    readonly assertFunctionNames?: readonly string[];
    readonly additionalTestBlockFunctions?: readonly string[];
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * Enforces a maximum number assertion calls in a test body
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v28.8.0/docs/rules/max-expects.md
 *
 *  ```md
 *  | key  | value      |
 *  | :--- | :--------- |
 *  | type | suggestion |
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
  export type Options = {
    readonly max?: number;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * Enforces a maximum depth to nested describe calls
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v28.8.0/docs/rules/max-nested-describe.md
 *
 *  ```md
 *  | key  | value      |
 *  | :--- | :--------- |
 *  | type | suggestion |
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
  export type Options = {
    readonly max?: number;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * Disallow alias methods
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v28.8.0/docs/rules/no-alias-methods.md
 *
 *  ```md
 *  | key     | value      |
 *  | :------ | :--------- |
 *  | type    | suggestion |
 *  | fixable | code       |
 *  ```
 */
namespace NoAliasMethods {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * Disallow commented out tests
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v28.8.0/docs/rules/no-commented-out-tests.md
 *
 *  ```md
 *  | key  | value      |
 *  | :--- | :--------- |
 *  | type | suggestion |
 *  ```
 */
namespace NoCommentedOutTests {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * Disallow calling `expect` conditionally
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v28.8.0/docs/rules/no-conditional-expect.md
 *
 *  ```md
 *  | key  | value   |
 *  | :--- | :------ |
 *  | type | problem |
 *  ```
 */
namespace NoConditionalExpect {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * Disallow conditional logic in tests
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v28.8.0/docs/rules/no-conditional-in-test.md
 *
 *  ```md
 *  | key  | value   |
 *  | :--- | :------ |
 *  | type | problem |
 *  ```
 */
namespace NoConditionalInTest {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * Disallow confusing usages of jest.setTimeout
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v28.8.0/docs/rules/no-confusing-set-timeout.md
 *
 *  ```md
 *  | key  | value   |
 *  | :--- | :------ |
 *  | type | problem |
 *  ```
 */
namespace NoConfusingSetTimeout {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * Disallow use of deprecated functions
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v28.8.0/docs/rules/no-deprecated-functions.md
 *
 *  ```md
 *  | key     | value      |
 *  | :------ | :--------- |
 *  | type    | suggestion |
 *  | fixable | code       |
 *  ```
 */
namespace NoDeprecatedFunctions {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * Disallow disabled tests
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v28.8.0/docs/rules/no-disabled-tests.md
 *
 *  ```md
 *  | key  | value      |
 *  | :--- | :--------- |
 *  | type | suggestion |
 *  ```
 */
namespace NoDisabledTests {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * Disallow using a callback in asynchronous tests and hooks
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v28.8.0/docs/rules/no-done-callback.md
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | hasSuggestions | true       |
 *  ```
 */
namespace NoDoneCallback {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * Disallow duplicate setup and teardown hooks
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v28.8.0/docs/rules/no-duplicate-hooks.md
 *
 *  ```md
 *  | key  | value      |
 *  | :--- | :--------- |
 *  | type | suggestion |
 *  ```
 */
namespace NoDuplicateHooks {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * Disallow using `exports` in files containing tests
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v28.8.0/docs/rules/no-export.md
 *
 *  ```md
 *  | key  | value      |
 *  | :--- | :--------- |
 *  | type | suggestion |
 *  ```
 */
namespace NoExport {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * Disallow focused tests
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v28.8.0/docs/rules/no-focused-tests.md
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | hasSuggestions | true       |
 *  ```
 */
namespace NoFocusedTests {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * Disallow setup and teardown hooks
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v28.8.0/docs/rules/no-hooks.md
 *
 *  ```md
 *  | key  | value      |
 *  | :--- | :--------- |
 *  | type | suggestion |
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
  export type Options = {
    readonly allow?: readonly unknown[];
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * Disallow identical titles
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v28.8.0/docs/rules/no-identical-title.md
 *
 *  ```md
 *  | key  | value      |
 *  | :--- | :--------- |
 *  | type | suggestion |
 *  ```
 */
namespace NoIdenticalTitle {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * Disallow string interpolation inside snapshots
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v28.8.0/docs/rules/no-interpolation-in-snapshots.md
 *
 *  ```md
 *  | key  | value   |
 *  | :--- | :------ |
 *  | type | problem |
 *  ```
 */
namespace NoInterpolationInSnapshots {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * Disallow Jasmine globals
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v28.8.0/docs/rules/no-jasmine-globals.md
 *
 *  ```md
 *  | key     | value      |
 *  | :------ | :--------- |
 *  | type    | suggestion |
 *  | fixable | code       |
 *  ```
 */
namespace NoJasmineGlobals {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * Disallow large snapshots
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v28.8.0/docs/rules/no-large-snapshots.md
 *
 *  ```md
 *  | key  | value      |
 *  | :--- | :--------- |
 *  | type | suggestion |
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
  export type Options = {
    readonly maxSize?: number;
    readonly inlineMaxSize?: number;
    readonly allowedSnapshots?: Record<string, readonly unknown[]>;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * Disallow manually importing from `__mocks__`
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v28.8.0/docs/rules/no-mocks-import.md
 *
 *  ```md
 *  | key  | value   |
 *  | :--- | :------ |
 *  | type | problem |
 *  ```
 */
namespace NoMocksImport {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * Disallow specific `jest.` methods
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v28.8.0/docs/rules/no-restricted-jest-methods.md
 *
 *  ```md
 *  | key  | value      |
 *  | :--- | :--------- |
 *  | type | suggestion |
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
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * Disallow specific matchers & modifiers
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v28.8.0/docs/rules/no-restricted-matchers.md
 *
 *  ```md
 *  | key  | value      |
 *  | :--- | :--------- |
 *  | type | suggestion |
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
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * Disallow using `expect` outside of `it` or `test` blocks
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v28.8.0/docs/rules/no-standalone-expect.md
 *
 *  ```md
 *  | key  | value      |
 *  | :--- | :--------- |
 *  | type | suggestion |
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
  export type Options = {
    readonly additionalTestBlockFunctions?: readonly string[];
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * Require using `.only` and `.skip` over `f` and `x`
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v28.8.0/docs/rules/no-test-prefixes.md
 *
 *  ```md
 *  | key     | value      |
 *  | :------ | :--------- |
 *  | type    | suggestion |
 *  | fixable | code       |
 *  ```
 */
namespace NoTestPrefixes {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * Disallow explicitly returning from tests
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v28.8.0/docs/rules/no-test-return-statement.md
 *
 *  ```md
 *  | key  | value      |
 *  | :--- | :--------- |
 *  | type | suggestion |
 *  ```
 */
namespace NoTestReturnStatement {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * Disallow using `jest.mock()` factories without an explicit type parameter
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v28.8.0/docs/rules/no-untyped-mock-factory.md
 *
 *  ```md
 *  | key     | value      |
 *  | :------ | :--------- |
 *  | type    | suggestion |
 *  | fixable | code       |
 *  ```
 */
namespace NoUntypedMockFactory {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * Enforce padding around `afterAll` blocks
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v28.8.0/docs/rules/padding-around-after-all-blocks.md
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
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * Enforce padding around `afterEach` blocks
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v28.8.0/docs/rules/padding-around-after-each-blocks.md
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
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * Enforce padding around Jest functions
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v28.8.0/docs/rules/padding-around-all.md
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
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * Enforce padding around `beforeAll` blocks
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v28.8.0/docs/rules/padding-around-before-all-blocks.md
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
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * Enforce padding around `beforeEach` blocks
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v28.8.0/docs/rules/padding-around-before-each-blocks.md
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
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * Enforce padding around `describe` blocks
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v28.8.0/docs/rules/padding-around-describe-blocks.md
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
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * Enforce padding around `expect` groups
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v28.8.0/docs/rules/padding-around-expect-groups.md
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
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * Enforce padding around afterAll blocks
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v28.8.0/docs/rules/padding-around-test-blocks.md
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
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * Suggest using `toBeCalledWith()` or `toHaveBeenCalledWith()`
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v28.8.0/docs/rules/prefer-called-with.md
 *
 *  ```md
 *  | key  | value      |
 *  | :--- | :--------- |
 *  | type | suggestion |
 *  ```
 */
namespace PreferCalledWith {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * Suggest using the built-in comparison matchers
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v28.8.0/docs/rules/prefer-comparison-matcher.md
 *
 *  ```md
 *  | key     | value      |
 *  | :------ | :--------- |
 *  | type    | suggestion |
 *  | fixable | code       |
 *  ```
 */
namespace PreferComparisonMatcher {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * Prefer using `.each` rather than manual loops
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v28.8.0/docs/rules/prefer-each.md
 *
 *  ```md
 *  | key  | value      |
 *  | :--- | :--------- |
 *  | type | suggestion |
 *  ```
 */
namespace PreferEach {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * Suggest using the built-in equality matchers
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v28.8.0/docs/rules/prefer-equality-matcher.md
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | hasSuggestions | true       |
 *  ```
 */
namespace PreferEqualityMatcher {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * Suggest using `expect.assertions()` OR `expect.hasAssertions()`
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v28.8.0/docs/rules/prefer-expect-assertions.md
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
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
  export type Options = {
    readonly onlyFunctionsWithAsyncKeyword?: boolean;
    readonly onlyFunctionsWithExpectInLoop?: boolean;
    readonly onlyFunctionsWithExpectInCallback?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * Prefer `await expect(...).resolves` over `expect(await ...)` syntax
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v28.8.0/docs/rules/prefer-expect-resolves.md
 *
 *  ```md
 *  | key     | value      |
 *  | :------ | :--------- |
 *  | type    | suggestion |
 *  | fixable | code       |
 *  ```
 */
namespace PreferExpectResolves {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * Prefer having hooks in a consistent order
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v28.8.0/docs/rules/prefer-hooks-in-order.md
 *
 *  ```md
 *  | key  | value      |
 *  | :--- | :--------- |
 *  | type | suggestion |
 *  ```
 */
namespace PreferHooksInOrder {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * Suggest having hooks before any test cases
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v28.8.0/docs/rules/prefer-hooks-on-top.md
 *
 *  ```md
 *  | key  | value      |
 *  | :--- | :--------- |
 *  | type | suggestion |
 *  ```
 */
namespace PreferHooksOnTop {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * Prefer importing Jest globals
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v28.8.0/docs/rules/prefer-importing-jest-globals.md
 *
 *  ```md
 *  | key     | value   |
 *  | :------ | :------ |
 *  | type    | problem |
 *  | fixable | code    |
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
  export type Options = {
    readonly types?: readonly (
      | 'describe'
      | 'expect'
      | 'hook'
      | 'jest'
      | 'test'
      | 'unknown'
    )[];
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * Prefer `jest.mocked()` over `fn as jest.Mock`
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v28.8.0/docs/rules/prefer-jest-mocked.md
 *
 *  ```md
 *  | key     | value      |
 *  | :------ | :--------- |
 *  | type    | suggestion |
 *  | fixable | code       |
 *  ```
 */
namespace PreferJestMocked {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * Enforce lowercase test names
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v28.8.0/docs/rules/prefer-lowercase-title.md
 *
 *  ```md
 *  | key     | value      |
 *  | :------ | :--------- |
 *  | type    | suggestion |
 *  | fixable | code       |
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
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly ignore?: readonly ('describe' | 'it' | 'test')[];
    readonly allowedPrefixes?: readonly string[];
    readonly ignoreTopLevelDescribe?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * Prefer mock resolved/rejected shorthands for promises
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v28.8.0/docs/rules/prefer-mock-promise-shorthand.md
 *
 *  ```md
 *  | key     | value      |
 *  | :------ | :--------- |
 *  | type    | suggestion |
 *  | fixable | code       |
 *  ```
 */
namespace PreferMockPromiseShorthand {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * Prefer including a hint with external snapshots
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v28.8.0/docs/rules/prefer-snapshot-hint.md
 *
 *  ```md
 *  | key  | value      |
 *  | :--- | :--------- |
 *  | type | suggestion |
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
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * Suggest using `jest.spyOn()`
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v28.8.0/docs/rules/prefer-spy-on.md
 *
 *  ```md
 *  | key     | value      |
 *  | :------ | :--------- |
 *  | type    | suggestion |
 *  | fixable | code       |
 *  ```
 */
namespace PreferSpyOn {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * Suggest using `toStrictEqual()`
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v28.8.0/docs/rules/prefer-strict-equal.md
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | hasSuggestions | true       |
 *  ```
 */
namespace PreferStrictEqual {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * Suggest using `toBe()` for primitive literals
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v28.8.0/docs/rules/prefer-to-be.md
 *
 *  ```md
 *  | key     | value      |
 *  | :------ | :--------- |
 *  | type    | suggestion |
 *  | fixable | code       |
 *  ```
 */
namespace PreferToBe {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * Suggest using `toContain()`
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v28.8.0/docs/rules/prefer-to-contain.md
 *
 *  ```md
 *  | key     | value      |
 *  | :------ | :--------- |
 *  | type    | suggestion |
 *  | fixable | code       |
 *  ```
 */
namespace PreferToContain {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * Suggest using `toHaveLength()`
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v28.8.0/docs/rules/prefer-to-have-length.md
 *
 *  ```md
 *  | key     | value      |
 *  | :------ | :--------- |
 *  | type    | suggestion |
 *  | fixable | code       |
 *  ```
 */
namespace PreferToHaveLength {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * Suggest using `test.todo`
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v28.8.0/docs/rules/prefer-todo.md
 *
 *  ```md
 *  | key     | value  |
 *  | :------ | :----- |
 *  | type    | layout |
 *  | fixable | code   |
 *  ```
 */
namespace PreferTodo {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * Require setup and teardown code to be within a hook
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v28.8.0/docs/rules/require-hook.md
 *
 *  ```md
 *  | key  | value      |
 *  | :--- | :--------- |
 *  | type | suggestion |
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
  export type Options = {
    readonly allowedFunctionCalls?: readonly string[];
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * Require a message for `toThrow()`
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v28.8.0/docs/rules/require-to-throw-message.md
 *
 *  ```md
 *  | key  | value      |
 *  | :--- | :--------- |
 *  | type | suggestion |
 *  ```
 */
namespace RequireToThrowMessage {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * Require test cases and hooks to be inside a `describe` block
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v28.8.0/docs/rules/require-top-level-describe.md
 *
 *  ```md
 *  | key  | value      |
 *  | :--- | :--------- |
 *  | type | suggestion |
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
  export type Options = {
    readonly maxNumberOfTopLevelDescribes?: number;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * Enforce unbound methods are called with their expected scope
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v28.8.0/docs/rules/unbound-method.md
 *
 *  ```md
 *  | key                  | value   |
 *  | :------------------- | :------ |
 *  | type                 | problem |
 *  | requiresTypeChecking | true    |
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
   *     "properties": {
   *       "ignoreStatic": {
   *         "description": "Whether to skip checking whether `static` methods are correctly bound.",
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    /** Whether to skip checking whether `static` methods are correctly bound. */
    readonly ignoreStatic?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * Enforce valid `describe()` callback
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v28.8.0/docs/rules/valid-describe-callback.md
 *
 *  ```md
 *  | key  | value   |
 *  | :--- | :------ |
 *  | type | problem |
 *  ```
 */
namespace ValidDescribeCallback {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * Require promises that have expectations in their chain to be valid
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v28.8.0/docs/rules/valid-expect-in-promise.md
 *
 *  ```md
 *  | key  | value      |
 *  | :--- | :--------- |
 *  | type | suggestion |
 *  ```
 */
namespace ValidExpectInPromise {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * Enforce valid `expect()` usage
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v28.8.0/docs/rules/valid-expect.md
 *
 *  ```md
 *  | key     | value      |
 *  | :------ | :--------- |
 *  | type    | suggestion |
 *  | fixable | code       |
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
   *         "minimum": 1
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
  export type Options = {
    readonly alwaysAwait?: boolean;
    readonly asyncMatchers?: readonly string[];
    readonly minArgs?: number;
    readonly maxArgs?: number;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * Enforce valid titles
 *
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v28.8.0/docs/rules/valid-title.md
 *
 *  ```md
 *  | key     | value      |
 *  | :------ | :--------- |
 *  | type    | suggestion |
 *  | fixable | code       |
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
  /* modified */
  export type Options = {
    readonly ignoreTypeOfDescribeName?: boolean;
    readonly disallowedWords?: readonly string[];
    readonly mustNotMatch?: MustMatchType | string;
    readonly mustMatch?: MustMatchType | string;
  };

  type MustMatchType = Readonly<
    Partial<Record<'describe' | 'it' | 'test', string>>
  >;

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

export type EslintJestRules = {
  readonly 'jest/consistent-test-it': ConsistentTestIt.RuleEntry;
  readonly 'jest/expect-expect': ExpectExpect.RuleEntry;
  readonly 'jest/max-expects': MaxExpects.RuleEntry;
  readonly 'jest/max-nested-describe': MaxNestedDescribe.RuleEntry;
  readonly 'jest/no-alias-methods': NoAliasMethods.RuleEntry;
  readonly 'jest/no-commented-out-tests': NoCommentedOutTests.RuleEntry;
  readonly 'jest/no-conditional-expect': NoConditionalExpect.RuleEntry;
  readonly 'jest/no-conditional-in-test': NoConditionalInTest.RuleEntry;
  readonly 'jest/no-confusing-set-timeout': NoConfusingSetTimeout.RuleEntry;
  readonly 'jest/no-deprecated-functions': NoDeprecatedFunctions.RuleEntry;
  readonly 'jest/no-disabled-tests': NoDisabledTests.RuleEntry;
  readonly 'jest/no-done-callback': NoDoneCallback.RuleEntry;
  readonly 'jest/no-duplicate-hooks': NoDuplicateHooks.RuleEntry;
  readonly 'jest/no-export': NoExport.RuleEntry;
  readonly 'jest/no-focused-tests': NoFocusedTests.RuleEntry;
  readonly 'jest/no-hooks': NoHooks.RuleEntry;
  readonly 'jest/no-identical-title': NoIdenticalTitle.RuleEntry;
  readonly 'jest/no-interpolation-in-snapshots': NoInterpolationInSnapshots.RuleEntry;
  readonly 'jest/no-jasmine-globals': NoJasmineGlobals.RuleEntry;
  readonly 'jest/no-large-snapshots': NoLargeSnapshots.RuleEntry;
  readonly 'jest/no-mocks-import': NoMocksImport.RuleEntry;
  readonly 'jest/no-restricted-jest-methods': NoRestrictedJestMethods.RuleEntry;
  readonly 'jest/no-restricted-matchers': NoRestrictedMatchers.RuleEntry;
  readonly 'jest/no-standalone-expect': NoStandaloneExpect.RuleEntry;
  readonly 'jest/no-test-prefixes': NoTestPrefixes.RuleEntry;
  readonly 'jest/no-test-return-statement': NoTestReturnStatement.RuleEntry;
  readonly 'jest/no-untyped-mock-factory': NoUntypedMockFactory.RuleEntry;
  readonly 'jest/padding-around-after-all-blocks': PaddingAroundAfterAllBlocks.RuleEntry;
  readonly 'jest/padding-around-after-each-blocks': PaddingAroundAfterEachBlocks.RuleEntry;
  readonly 'jest/padding-around-all': PaddingAroundAll.RuleEntry;
  readonly 'jest/padding-around-before-all-blocks': PaddingAroundBeforeAllBlocks.RuleEntry;
  readonly 'jest/padding-around-before-each-blocks': PaddingAroundBeforeEachBlocks.RuleEntry;
  readonly 'jest/padding-around-describe-blocks': PaddingAroundDescribeBlocks.RuleEntry;
  readonly 'jest/padding-around-expect-groups': PaddingAroundExpectGroups.RuleEntry;
  readonly 'jest/padding-around-test-blocks': PaddingAroundTestBlocks.RuleEntry;
  readonly 'jest/prefer-called-with': PreferCalledWith.RuleEntry;
  readonly 'jest/prefer-comparison-matcher': PreferComparisonMatcher.RuleEntry;
  readonly 'jest/prefer-each': PreferEach.RuleEntry;
  readonly 'jest/prefer-equality-matcher': PreferEqualityMatcher.RuleEntry;
  readonly 'jest/prefer-expect-assertions': PreferExpectAssertions.RuleEntry;
  readonly 'jest/prefer-expect-resolves': PreferExpectResolves.RuleEntry;
  readonly 'jest/prefer-hooks-in-order': PreferHooksInOrder.RuleEntry;
  readonly 'jest/prefer-hooks-on-top': PreferHooksOnTop.RuleEntry;
  readonly 'jest/prefer-importing-jest-globals': PreferImportingJestGlobals.RuleEntry;
  readonly 'jest/prefer-jest-mocked': PreferJestMocked.RuleEntry;
  readonly 'jest/prefer-lowercase-title': PreferLowercaseTitle.RuleEntry;
  readonly 'jest/prefer-mock-promise-shorthand': PreferMockPromiseShorthand.RuleEntry;
  readonly 'jest/prefer-snapshot-hint': PreferSnapshotHint.RuleEntry;
  readonly 'jest/prefer-spy-on': PreferSpyOn.RuleEntry;
  readonly 'jest/prefer-strict-equal': PreferStrictEqual.RuleEntry;
  readonly 'jest/prefer-to-be': PreferToBe.RuleEntry;
  readonly 'jest/prefer-to-contain': PreferToContain.RuleEntry;
  readonly 'jest/prefer-to-have-length': PreferToHaveLength.RuleEntry;
  readonly 'jest/prefer-todo': PreferTodo.RuleEntry;
  readonly 'jest/require-hook': RequireHook.RuleEntry;
  readonly 'jest/require-to-throw-message': RequireToThrowMessage.RuleEntry;
  readonly 'jest/require-top-level-describe': RequireTopLevelDescribe.RuleEntry;
  readonly 'jest/unbound-method': UnboundMethod.RuleEntry;
  readonly 'jest/valid-describe-callback': ValidDescribeCallback.RuleEntry;
  readonly 'jest/valid-expect-in-promise': ValidExpectInPromise.RuleEntry;
  readonly 'jest/valid-expect': ValidExpect.RuleEntry;
  readonly 'jest/valid-title': ValidTitle.RuleEntry;
};

export type EslintJestRulesOption = {
  readonly 'jest/consistent-test-it': ConsistentTestIt.Options;
  readonly 'jest/expect-expect': ExpectExpect.Options;
  readonly 'jest/max-expects': MaxExpects.Options;
  readonly 'jest/max-nested-describe': MaxNestedDescribe.Options;
  readonly 'jest/no-hooks': NoHooks.Options;
  readonly 'jest/no-large-snapshots': NoLargeSnapshots.Options;
  readonly 'jest/no-restricted-jest-methods': NoRestrictedJestMethods.Options;
  readonly 'jest/no-restricted-matchers': NoRestrictedMatchers.Options;
  readonly 'jest/no-standalone-expect': NoStandaloneExpect.Options;
  readonly 'jest/prefer-expect-assertions': PreferExpectAssertions.Options;
  readonly 'jest/prefer-importing-jest-globals': PreferImportingJestGlobals.Options;
  readonly 'jest/prefer-lowercase-title': PreferLowercaseTitle.Options;
  readonly 'jest/prefer-snapshot-hint': PreferSnapshotHint.Options;
  readonly 'jest/require-hook': RequireHook.Options;
  readonly 'jest/require-top-level-describe': RequireTopLevelDescribe.Options;
  readonly 'jest/unbound-method': UnboundMethod.Options;
  readonly 'jest/valid-expect': ValidExpect.Options;
  readonly 'jest/valid-title': ValidTitle.Options;
};

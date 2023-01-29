/* cSpell:disable */
/* eslint-disable @typescript-eslint/sort-type-constituents */
import { type Linter } from 'eslint';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type SpreadOptionsIfIsArray<T extends readonly [Linter.RuleLevel, unknown]> =
  T[1] extends readonly unknown[] ? readonly [Linter.RuleLevel, ...T[1]] : T;

/**
 * @description Enforce `test` and `it` usage conventions
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v27.2.1/docs/rules/consistent-test-it.md
 *
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | type        | suggestion     |
 *  | fixable     | code           |
 *  | category    | Best Practices |
 *  | recommended | false          |
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
   *         "enum": [
   *           "it",
   *           "test"
   *         ]
   *       },
   *       "withinDescribe": {
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
 * @description Enforce assertion to be made in a test body
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v27.2.1/docs/rules/expect-expect.md
 *
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | type        | suggestion     |
 *  | category    | Best Practices |
 *  | recommended | warn           |
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
   *         "items": [
   *           {
   *             "type": "string"
   *           }
   *         ]
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
    readonly assertFunctionNames?: readonly [] | readonly [string];
    readonly additionalTestBlockFunctions?: readonly string[];
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Enforces a maximum number assertion calls in a test body
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v27.2.1/docs/rules/max-expects.md
 *
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | type        | suggestion     |
 *  | category    | Best Practices |
 *  | recommended | false          |
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
 * @description Enforces a maximum depth to nested describe calls
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v27.2.1/docs/rules/max-nested-describe.md
 *
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | type        | suggestion     |
 *  | category    | Best Practices |
 *  | recommended | false          |
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
 * @description Disallow alias methods
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v27.2.1/docs/rules/no-alias-methods.md
 *
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | type        | suggestion     |
 *  | fixable     | code           |
 *  | category    | Best Practices |
 *  | recommended | error          |
 */
namespace NoAliasMethods {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow commented out tests
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v27.2.1/docs/rules/no-commented-out-tests.md
 *
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | type        | suggestion     |
 *  | category    | Best Practices |
 *  | recommended | warn           |
 */
namespace NoCommentedOutTests {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow calling `expect` conditionally
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v27.2.1/docs/rules/no-conditional-expect.md
 *
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | type        | problem        |
 *  | category    | Best Practices |
 *  | recommended | error          |
 */
namespace NoConditionalExpect {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow conditional logic in tests
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v27.2.1/docs/rules/no-conditional-in-test.md
 *
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | type        | problem        |
 *  | category    | Best Practices |
 *  | recommended | false          |
 */
namespace NoConditionalInTest {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow use of deprecated functions
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v27.2.1/docs/rules/no-deprecated-functions.md
 *
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | type        | suggestion     |
 *  | fixable     | code           |
 *  | category    | Best Practices |
 *  | recommended | error          |
 */
namespace NoDeprecatedFunctions {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow disabled tests
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v27.2.1/docs/rules/no-disabled-tests.md
 *
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | type        | suggestion     |
 *  | category    | Best Practices |
 *  | recommended | warn           |
 */
namespace NoDisabledTests {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow using a callback in asynchronous tests and hooks
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v27.2.1/docs/rules/no-done-callback.md
 *
 *  | key            | value          |
 *  | :------------- | :------------- |
 *  | type           | suggestion     |
 *  | hasSuggestions | true           |
 *  | category       | Best Practices |
 *  | recommended    | error          |
 */
namespace NoDoneCallback {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow duplicate setup and teardown hooks
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v27.2.1/docs/rules/no-duplicate-hooks.md
 *
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | type        | suggestion     |
 *  | category    | Best Practices |
 *  | recommended | false          |
 */
namespace NoDuplicateHooks {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow using `exports` in files containing tests
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v27.2.1/docs/rules/no-export.md
 *
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | type        | suggestion     |
 *  | category    | Best Practices |
 *  | recommended | error          |
 */
namespace NoExport {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow focused tests
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v27.2.1/docs/rules/no-focused-tests.md
 *
 *  | key            | value          |
 *  | :------------- | :------------- |
 *  | type           | suggestion     |
 *  | hasSuggestions | true           |
 *  | category       | Best Practices |
 *  | recommended    | error          |
 */
namespace NoFocusedTests {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow setup and teardown hooks
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v27.2.1/docs/rules/no-hooks.md
 *
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | type        | suggestion     |
 *  | category    | Best Practices |
 *  | recommended | false          |
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
 * @description Disallow identical titles
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v27.2.1/docs/rules/no-identical-title.md
 *
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | type        | suggestion     |
 *  | category    | Best Practices |
 *  | recommended | error          |
 */
namespace NoIdenticalTitle {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow conditional logic
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v27.2.1/docs/rules/no-if.md
 *
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | type        | suggestion     |
 *  | deprecated  | true           |
 *  | category    | Best Practices |
 *  | recommended | false          |
 */
namespace NoIf {
  export type RuleEntry = 'off';
}

/**
 * @description Disallow string interpolation inside snapshots
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v27.2.1/docs/rules/no-interpolation-in-snapshots.md
 *
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | type        | problem        |
 *  | category    | Best Practices |
 *  | recommended | error          |
 */
namespace NoInterpolationInSnapshots {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow Jasmine globals
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v27.2.1/docs/rules/no-jasmine-globals.md
 *
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | type        | suggestion     |
 *  | fixable     | code           |
 *  | category    | Best Practices |
 *  | recommended | error          |
 */
namespace NoJasmineGlobals {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow large snapshots
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v27.2.1/docs/rules/no-large-snapshots.md
 *
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | type        | suggestion     |
 *  | category    | Best Practices |
 *  | recommended | false          |
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
 * @description Disallow manually importing from `__mocks__`
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v27.2.1/docs/rules/no-mocks-import.md
 *
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | type        | problem        |
 *  | category    | Best Practices |
 *  | recommended | error          |
 */
namespace NoMocksImport {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow specific `jest.` methods
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v27.2.1/docs/rules/no-restricted-jest-methods.md
 *
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | type        | suggestion     |
 *  | category    | Best Practices |
 *  | recommended | false          |
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
 * @description Disallow specific matchers & modifiers
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v27.2.1/docs/rules/no-restricted-matchers.md
 *
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | type        | suggestion     |
 *  | category    | Best Practices |
 *  | recommended | false          |
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
 * @description Disallow using `expect` outside of `it` or `test` blocks
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v27.2.1/docs/rules/no-standalone-expect.md
 *
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | type        | suggestion     |
 *  | category    | Best Practices |
 *  | recommended | error          |
 */
namespace NoStandaloneExpect {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
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
 * @description Require using `.only` and `.skip` over `f` and `x`
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v27.2.1/docs/rules/no-test-prefixes.md
 *
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | type        | suggestion     |
 *  | fixable     | code           |
 *  | category    | Best Practices |
 *  | recommended | error          |
 */
namespace NoTestPrefixes {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow explicitly returning from tests
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v27.2.1/docs/rules/no-test-return-statement.md
 *
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | type        | suggestion     |
 *  | category    | Best Practices |
 *  | recommended | false          |
 */
namespace NoTestReturnStatement {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow using `jest.mock()` factories without an explicit type parameter
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v27.2.1/docs/rules/no-untyped-mock-factory.md
 *
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | type        | suggestion     |
 *  | fixable     | code           |
 *  | category    | Best Practices |
 *  | recommended | false          |
 */
namespace NoUntypedMockFactory {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Suggest using `toBeCalledWith()` or `toHaveBeenCalledWith()`
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v27.2.1/docs/rules/prefer-called-with.md
 *
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | type        | suggestion     |
 *  | category    | Best Practices |
 *  | recommended | false          |
 */
namespace PreferCalledWith {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Suggest using the built-in comparison matchers
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v27.2.1/docs/rules/prefer-comparison-matcher.md
 *
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | type        | suggestion     |
 *  | fixable     | code           |
 *  | category    | Best Practices |
 *  | recommended | false          |
 */
namespace PreferComparisonMatcher {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Prefer using `.each` rather than manual loops
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v27.2.1/docs/rules/prefer-each.md
 *
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | type        | suggestion     |
 *  | category    | Best Practices |
 *  | recommended | false          |
 */
namespace PreferEach {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Suggest using the built-in equality matchers
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v27.2.1/docs/rules/prefer-equality-matcher.md
 *
 *  | key            | value          |
 *  | :------------- | :------------- |
 *  | type           | suggestion     |
 *  | hasSuggestions | true           |
 *  | category       | Best Practices |
 *  | recommended    | false          |
 */
namespace PreferEqualityMatcher {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Suggest using `expect.assertions()` OR `expect.hasAssertions()`
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v27.2.1/docs/rules/prefer-expect-assertions.md
 *
 *  | key            | value          |
 *  | :------------- | :------------- |
 *  | type           | suggestion     |
 *  | hasSuggestions | true           |
 *  | category       | Best Practices |
 *  | recommended    | false          |
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
 * @description Prefer `await expect(...).resolves` over `expect(await ...)` syntax
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v27.2.1/docs/rules/prefer-expect-resolves.md
 *
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | type        | suggestion     |
 *  | fixable     | code           |
 *  | category    | Best Practices |
 *  | recommended | false          |
 */
namespace PreferExpectResolves {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Prefer having hooks in a consistent order
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v27.2.1/docs/rules/prefer-hooks-in-order.md
 *
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | type        | suggestion     |
 *  | category    | Best Practices |
 *  | recommended | false          |
 */
namespace PreferHooksInOrder {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Suggest having hooks before any test cases
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v27.2.1/docs/rules/prefer-hooks-on-top.md
 *
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | type        | suggestion     |
 *  | category    | Best Practices |
 *  | recommended | false          |
 */
namespace PreferHooksOnTop {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Enforce lowercase test names
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v27.2.1/docs/rules/prefer-lowercase-title.md
 *
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | type        | suggestion     |
 *  | fixable     | code           |
 *  | category    | Best Practices |
 *  | recommended | false          |
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
    readonly ignore?: readonly ('describe' | 'test' | 'it')[];
    readonly allowedPrefixes?: readonly string[];
    readonly ignoreTopLevelDescribe?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Prefer mock resolved/rejected shorthands for promises
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v27.2.1/docs/rules/prefer-mock-promise-shorthand.md
 *
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | type        | suggestion     |
 *  | fixable     | code           |
 *  | category    | Best Practices |
 *  | recommended | false          |
 */
namespace PreferMockPromiseShorthand {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Prefer including a hint with external snapshots
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v27.2.1/docs/rules/prefer-snapshot-hint.md
 *
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | type        | suggestion     |
 *  | category    | Best Practices |
 *  | recommended | false          |
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
 * @description Suggest using `jest.spyOn()`
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v27.2.1/docs/rules/prefer-spy-on.md
 *
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | type        | suggestion     |
 *  | fixable     | code           |
 *  | category    | Best Practices |
 *  | recommended | false          |
 */
namespace PreferSpyOn {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Suggest using `toStrictEqual()`
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v27.2.1/docs/rules/prefer-strict-equal.md
 *
 *  | key            | value          |
 *  | :------------- | :------------- |
 *  | type           | suggestion     |
 *  | hasSuggestions | true           |
 *  | category       | Best Practices |
 *  | recommended    | false          |
 */
namespace PreferStrictEqual {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Suggest using `toBe()` for primitive literals
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v27.2.1/docs/rules/prefer-to-be.md
 *
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | type        | suggestion     |
 *  | fixable     | code           |
 *  | category    | Best Practices |
 *  | recommended | false          |
 */
namespace PreferToBe {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Suggest using `toContain()`
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v27.2.1/docs/rules/prefer-to-contain.md
 *
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | type        | suggestion     |
 *  | fixable     | code           |
 *  | category    | Best Practices |
 *  | recommended | false          |
 */
namespace PreferToContain {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Suggest using `toHaveLength()`
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v27.2.1/docs/rules/prefer-to-have-length.md
 *
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | type        | suggestion     |
 *  | fixable     | code           |
 *  | category    | Best Practices |
 *  | recommended | false          |
 */
namespace PreferToHaveLength {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Suggest using `test.todo`
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v27.2.1/docs/rules/prefer-todo.md
 *
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | type        | layout         |
 *  | fixable     | code           |
 *  | category    | Best Practices |
 *  | recommended | false          |
 */
namespace PreferTodo {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Require setup and teardown code to be within a hook
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v27.2.1/docs/rules/require-hook.md
 *
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | type        | suggestion     |
 *  | category    | Best Practices |
 *  | recommended | false          |
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
 * @description Require a message for `toThrow()`
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v27.2.1/docs/rules/require-to-throw-message.md
 *
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | type        | suggestion     |
 *  | category    | Best Practices |
 *  | recommended | false          |
 */
namespace RequireToThrowMessage {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Require test cases and hooks to be inside a `describe` block
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v27.2.1/docs/rules/require-top-level-describe.md
 *
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | type        | suggestion     |
 *  | category    | Best Practices |
 *  | recommended | false          |
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
 * @description Enforce unbound methods are called with their expected scope
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v27.2.1/docs/rules/unbound-method.md
 *
 *  | key                  | value          |
 *  | :------------------- | :------------- |
 *  | type                 | problem        |
 *  | category             | Best Practices |
 *  | recommended          | false          |
 *  | requiresTypeChecking | true           |
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
    /**
     * Whether to skip checking whether `static` methods are correctly bound.
     */
    readonly ignoreStatic?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Enforce valid `describe()` callback
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v27.2.1/docs/rules/valid-describe-callback.md
 *
 *  | key         | value           |
 *  | :---------- | :-------------- |
 *  | type        | problem         |
 *  | category    | Possible Errors |
 *  | recommended | error           |
 */
namespace ValidDescribeCallback {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Require promises that have expectations in their chain to be valid
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v27.2.1/docs/rules/valid-expect-in-promise.md
 *
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | type        | suggestion     |
 *  | category    | Best Practices |
 *  | recommended | error          |
 */
namespace ValidExpectInPromise {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Enforce valid `expect()` usage
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v27.2.1/docs/rules/valid-expect.md
 *
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | type        | suggestion     |
 *  | category    | Best Practices |
 *  | recommended | error          |
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
 * @description Enforce valid titles
 * @link https://github.com/jest-community/eslint-plugin-jest/blob/v27.2.1/docs/rules/valid-title.md
 *
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | type        | suggestion     |
 *  | fixable     | code           |
 *  | category    | Best Practices |
 *  | recommended | error          |
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
   *       "ignoreTypeOfDescribeName": {
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
  // modified
  export type Options = {
    readonly ignoreTypeOfDescribeName?: boolean;
    readonly disallowedWords?: readonly string[];
    readonly mustNotMatch?: MustMatchType | string;
    readonly mustMatch?: MustMatchType | string;
  };

  type MustMatchType = Readonly<
    Partial<Record<'describe' | 'test' | 'it', string>>
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
  readonly 'jest/prefer-called-with': PreferCalledWith.RuleEntry;
  readonly 'jest/prefer-comparison-matcher': PreferComparisonMatcher.RuleEntry;
  readonly 'jest/prefer-each': PreferEach.RuleEntry;
  readonly 'jest/prefer-equality-matcher': PreferEqualityMatcher.RuleEntry;
  readonly 'jest/prefer-expect-assertions': PreferExpectAssertions.RuleEntry;
  readonly 'jest/prefer-expect-resolves': PreferExpectResolves.RuleEntry;
  readonly 'jest/prefer-hooks-in-order': PreferHooksInOrder.RuleEntry;
  readonly 'jest/prefer-hooks-on-top': PreferHooksOnTop.RuleEntry;
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

  // deprecated
  readonly 'jest/no-if': NoIf.RuleEntry;
};

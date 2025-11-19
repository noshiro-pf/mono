/* cSpell:disable */
import { type Linter } from 'eslint';

type SpreadOptionsIfIsArray<
  T extends readonly [Linter.StringSeverity, unknown],
> = T[1] extends readonly unknown[]
  ? readonly [Linter.StringSeverity, ...T[1]]
  : T;

/**
 * Require test file pattern
 *
 * @link https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/consistent-test-filename.md
 *
 *  ```md
 *  | key                  | value   |
 *  | :------------------- | :------ |
 *  | type                 | problem |
 *  | deprecated           | false   |
 *  | recommended          | false   |
 *  | requiresTypeChecking | false   |
 *  ```
 */
namespace ConsistentTestFilename {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "pattern": {
   *         "type": "string",
   *         "format": "regex",
   *         "default": ".*\\.test\\.[tj]sx?$"
   *       },
   *       "allTestPattern": {
   *         "type": "string",
   *         "format": "regex",
   *         "default": ".*\\.(test|spec)\\.[tj]sx?$"
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /** @default '.*\.test\.[tj]sx?$' */
    pattern?: string;
    /** @default '.*\.(test|spec)\.[tj]sx?$' */
    allTestPattern?: string;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Enforce using test or it but not both
 *
 * @link https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/consistent-test-it.md
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
   *           "test",
   *           "it"
   *         ]
   *       },
   *       "withinDescribe": {
   *         "type": "string",
   *         "enum": [
   *           "test",
   *           "it"
   *         ]
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    fn?: 'test' | 'it';
    withinDescribe?: 'test' | 'it';
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Enforce using vitest or vi but not both
 *
 * @link https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/consistent-vitest-vi.md
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
namespace ConsistentVitestVi {
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
   *           "vi",
   *           "vitest"
   *         ],
   *         "default": "vi"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /** @default 'vi' */
    fn?: 'vi' | 'vitest';
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Enforce having expectation in test body
 *
 * @link https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/expect-expect.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | recommended | false      |
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
 * Enforce hoisted APIs to be on top of the file
 *
 * @link https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/hoisted-apis-on-top.md
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | deprecated     | false      |
 *  | hasSuggestions | true       |
 *  ```
 */
namespace HoistedApisOnTop {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce a maximum number of expect per test
 *
 * @link https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/max-expects.md
 *
 *  ```md
 *  | key                  | value      |
 *  | :------------------- | :--------- |
 *  | type                 | suggestion |
 *  | deprecated           | false      |
 *  | recommended          | false      |
 *  | requiresTypeChecking | false      |
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
   *         "type": "number"
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
 * Require describe block to be less than set max value or default value
 *
 * @link https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/max-nested-describe.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | deprecated  | false   |
 *  | recommended | false   |
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
   *         "type": "number"
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
 * @link https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/no-alias-methods.md
 *
 *  ```md
 *  | key                  | value      |
 *  | :------------------- | :--------- |
 *  | type                 | suggestion |
 *  | deprecated           | false      |
 *  | fixable              | code       |
 *  | recommended          | false      |
 *  | requiresTypeChecking | false      |
 *  ```
 */
namespace NoAliasMethods {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow commented out tests
 *
 * @link https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/no-commented-out-tests.md
 *
 *  ```md
 *  | key                  | value      |
 *  | :------------------- | :--------- |
 *  | type                 | suggestion |
 *  | deprecated           | false      |
 *  | recommended          | false      |
 *  | requiresTypeChecking | false      |
 *  ```
 */
namespace NoCommentedOutTests {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow conditional expects
 *
 * @link https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/no-conditional-expect.md
 *
 *  ```md
 *  | key                  | value   |
 *  | :------------------- | :------ |
 *  | type                 | problem |
 *  | deprecated           | false   |
 *  | recommended          | false   |
 *  | requiresTypeChecking | false   |
 *  ```
 */
namespace NoConditionalExpect {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow conditional tests
 *
 * @link https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/no-conditional-in-test.md
 *
 *  ```md
 *  | key                  | value   |
 *  | :------------------- | :------ |
 *  | type                 | problem |
 *  | deprecated           | false   |
 *  | recommended          | false   |
 *  | requiresTypeChecking | false   |
 *  ```
 */
namespace NoConditionalInTest {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow conditional tests
 *
 * @link https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/no-conditional-tests.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | deprecated  | false   |
 *  | recommended | false   |
 *  ```
 */
namespace NoConditionalTests {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow disabled tests
 *
 * @link https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/no-disabled-tests.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | recommended | false      |
 *  ```
 */
namespace NoDisabledTests {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow using a callback in asynchronous tests and hooks
 *
 * @link https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/no-done-callback.md
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | deprecated     | true       |
 *  | hasSuggestions | true       |
 *  | recommended    | false      |
 *  ```
 */
namespace NoDoneCallback {
  export type RuleEntry = 0;
}

/**
 * Disallow duplicate hooks and teardown hooks
 *
 * @link https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/no-duplicate-hooks.md
 *
 *  ```md
 *  | key                  | value      |
 *  | :------------------- | :--------- |
 *  | type                 | suggestion |
 *  | deprecated           | false      |
 *  | recommended          | false      |
 *  | requiresTypeChecking | false      |
 *  ```
 */
namespace NoDuplicateHooks {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow focused tests
 *
 * @link https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/no-focused-tests.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | deprecated  | false   |
 *  | fixable     | code    |
 *  | recommended | false   |
 *  ```
 */
namespace NoFocusedTests {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "fixable": {
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
    fixable?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Disallow setup and teardown hooks
 *
 * @link https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/no-hooks.md
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
   *     "type": "object",
   *     "properties": {
   *       "allow": {
   *         "type": "array",
   *         "items": {
   *           "type": "string",
   *           "enum": [
   *             "beforeAll",
   *             "beforeEach",
   *             "afterAll",
   *             "afterEach"
   *           ]
   *         },
   *         "additionalItems": false,
   *         "uniqueItems": true,
   *         "description": "This array option controls which Vitest hooks are checked by this rule."
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /** This array option controls which Vitest hooks are checked by this rule. */
    allow?: readonly ('beforeAll' | 'beforeEach' | 'afterAll' | 'afterEach')[];
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Disallow identical titles
 *
 * @link https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/no-identical-title.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | deprecated  | false   |
 *  | fixable     | code    |
 *  | recommended | false   |
 *  ```
 */
namespace NoIdenticalTitle {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow importing `node:test`
 *
 * @link https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/no-import-node-test.md
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
namespace NoImportNodeTest {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow importing Vitest globals
 *
 * @link https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/no-importing-vitest-globals.md
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
namespace NoImportingVitestGlobals {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow string interpolation in snapshots
 *
 * @link https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/no-interpolation-in-snapshots.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | deprecated  | false   |
 *  | fixable     | code    |
 *  | recommended | false   |
 *  ```
 */
namespace NoInterpolationInSnapshots {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow large snapshots
 *
 * @link https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/no-large-snapshots.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | recommended | false      |
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
 * Disallow importing from **mocks** directory
 *
 * @link https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/no-mocks-import.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | deprecated  | false   |
 *  | recommended | false   |
 *  ```
 */
namespace NoMocksImport {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow the use of certain matchers
 *
 * @link https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/no-restricted-matchers.md
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
 * Disallow specific `vi.` methods
 *
 * @link https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/no-restricted-vi-methods.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | recommended | false      |
 *  ```
 */
namespace NoRestrictedViMethods {
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
 * @link https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/no-standalone-expect.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | recommended | false      |
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
 * Disallow using the `f` and `x` prefixes in favour of `.only` and `.skip`
 *
 * @link https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/no-test-prefixes.md
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
namespace NoTestPrefixes {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow return statements in tests
 *
 * @link https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/no-test-return-statement.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | deprecated  | false   |
 *  | recommended | false   |
 *  ```
 */
namespace NoTestReturnStatement {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce padding around `afterAll` blocks
 *
 * @link https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/padding-around-after-all-blocks.md
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
 * @link https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/padding-around-after-each-blocks.md
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
 * Enforce padding around vitest functions
 *
 * @link https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/padding-around-all.md
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
 * @link https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/padding-around-before-all-blocks.md
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
 * @link https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/padding-around-before-each-blocks.md
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
 * @link https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/padding-around-describe-blocks.md
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
 * @link https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/padding-around-expect-groups.md
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
 * Enforce padding around `test` blocks
 *
 * @link https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/padding-around-test-blocks.md
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
 * Prefer `toHaveBeenCalledExactlyOnceWith` over `toHaveBeenCalledOnce` and
 * `toHaveBeenCalledWith`
 *
 * @link https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/prefer-called-exactly-once-with.md
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  | fixable    | code       |
 *  ```
 */
namespace PreferCalledExactlyOnceWith {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce using `toBeCalledOnce()` or `toHaveBeenCalledOnce()`
 *
 * @link https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/prefer-called-once.md
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
namespace PreferCalledOnce {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce using `toBeCalledTimes(1)` or `toHaveBeenCalledTimes(1)`
 *
 * @link https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/prefer-called-times.md
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
namespace PreferCalledTimes {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce using `toBeCalledWith()` or `toHaveBeenCalledWith()`
 *
 * @link https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/prefer-called-with.md
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
namespace PreferCalledWith {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce using the built-in comparison matchers
 *
 * @link https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/prefer-comparison-matcher.md
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
 * Enforce using a function as a describe title over an equivalent string
 *
 * @link https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/prefer-describe-function-title.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | deprecated  | false   |
 *  | fixable     | code    |
 *  | recommended | false   |
 *  ```
 */
namespace PreferDescribeFunctionTitle {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce using `each` rather than manual loops
 *
 * @link https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/prefer-each.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | recommended | false      |
 *  ```
 */
namespace PreferEach {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce using the built-in quality matchers
 *
 * @link https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/prefer-equality-matcher.md
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
 * Enforce using expect assertions instead of callbacks
 *
 * @link https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/prefer-expect-assertions.md
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
 * Enforce using `expect().resolves` over `expect(await ...)` syntax
 *
 * @link https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/prefer-expect-resolves.md
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
namespace PreferExpectResolves {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce using `expectTypeOf` instead of `expect(typeof ...)`
 *
 * @link https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/prefer-expect-type-of.md
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
namespace PreferExpectTypeOf {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce having hooks in consistent order
 *
 * @link https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/prefer-hooks-in-order.md
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
 * Enforce having hooks before any test cases
 *
 * @link https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/prefer-hooks-on-top.md
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
 * Prefer dynamic import in mock
 *
 * @link https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/prefer-import-in-mock.md
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  | fixable    | code       |
 *  ```
 */
namespace PreferImportInMock {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce importing Vitest globals
 *
 * @link https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/prefer-importing-vitest-globals.md
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
namespace PreferImportingVitestGlobals {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce lowercase titles
 *
 * @link https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/prefer-lowercase-title.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | deprecated  | false   |
 *  | fixable     | code    |
 *  | recommended | false   |
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
   *         }
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
   *       "lowercaseFirstCharacterOnly": {
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
    ignore?: readonly ('describe' | 'test' | 'it')[];
    allowedPrefixes?: readonly string[];
    /** @default false */
    ignoreTopLevelDescribe?: boolean;
    /** @default true */
    lowercaseFirstCharacterOnly?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Enforce mock resolved/rejected shorthands for promises
 *
 * @link https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/prefer-mock-promise-shorthand.md
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
namespace PreferMockPromiseShorthand {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce including a hint with external snapshots
 *
 * @link https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/prefer-snapshot-hint.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | recommended | false      |
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
 * Enforce using `vi.spyOn`
 *
 * @link https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/prefer-spy-on.md
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
namespace PreferSpyOn {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce using `toBe(true)` and `toBe(false)` over matchers that coerce types
 * to boolean
 *
 * @link https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/prefer-strict-boolean-matchers.md
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
namespace PreferStrictBooleanMatchers {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce strict equal over equal
 *
 * @link https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/prefer-strict-equal.md
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
namespace PreferStrictEqual {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce using toBeFalsy()
 *
 * @link https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/prefer-to-be-falsy.md
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
namespace PreferToBeFalsy {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce using toBeObject()
 *
 * @link https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/prefer-to-be-object.md
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
namespace PreferToBeObject {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce using `toBeTruthy`
 *
 * @link https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/prefer-to-be-truthy.md
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
namespace PreferToBeTruthy {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce using toBe()
 *
 * @link https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/prefer-to-be.md
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
 * Enforce using toContain()
 *
 * @link https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/prefer-to-contain.md
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
 * Enforce using toHaveLength()
 *
 * @link https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/prefer-to-have-length.md
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
 * Enforce using `test.todo`
 *
 * @link https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/prefer-todo.md
 *
 *  ```md
 *  | key         | value  |
 *  | :---------- | :----- |
 *  | type        | layout |
 *  | deprecated  | false  |
 *  | fixable     | code   |
 *  | recommended | false  |
 *  ```
 */
namespace PreferTodo {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Require `vi.mocked()` over `fn as Mock`
 *
 * @link https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/prefer-vi-mocked.md
 *
 *  ```md
 *  | key                  | value      |
 *  | :------------------- | :--------- |
 *  | type                 | suggestion |
 *  | deprecated           | false      |
 *  | fixable              | code       |
 *  | recommended          | false      |
 *  | requiresTypeChecking | true       |
 *  ```
 */
namespace PreferViMocked {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Ensure that every `expect.poll` call is awaited
 *
 * @link https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/require-awaited-expect-poll.md
 *
 *  ```md
 *  | key                  | value   |
 *  | :------------------- | :------ |
 *  | type                 | problem |
 *  | deprecated           | false   |
 *  | recommended          | false   |
 *  | requiresTypeChecking | false   |
 *  ```
 */
namespace RequireAwaitedExpectPoll {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Require setup and teardown to be within a hook
 *
 * @link https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/require-hook.md
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
 * Require local Test Context for concurrent snapshot tests
 *
 * @link https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/require-local-test-context-for-concurrent-snapshots.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | deprecated  | false   |
 *  | recommended | false   |
 *  ```
 */
namespace RequireLocalTestContextForConcurrentSnapshots {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce using type parameters with vitest mock functions
 *
 * @link https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/require-mock-type-parameters.md
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
namespace RequireMockTypeParameters {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "checkImportFunctions": {
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    checkImportFunctions?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Require toThrow() to be called with an error message
 *
 * @link https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/require-to-throw-message.md
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
 * Enforce that all tests are in a top-level describe
 *
 * @link https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/require-top-level-describe.md
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
   *     "type": "object",
   *     "properties": {
   *       "maxNumberOfTopLevelDescribes": {
   *         "type": "number",
   *         "minimum": 1,
   *         "default": null
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /** @default null */
    maxNumberOfTopLevelDescribes?: number;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Enforce valid describe callback
 *
 * @link https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/valid-describe-callback.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | deprecated  | false   |
 *  | recommended | false   |
 *  ```
 */
namespace ValidDescribeCallback {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Require promises that have expectations in their chain to be valid
 *
 * @link https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/valid-expect-in-promise.md
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
 * @link https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/valid-expect.md
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
 * Enforce valid titles
 *
 * @link https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/valid-title.md
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
   *       "allowArguments": {
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
   *               "type": "string",
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
    ignoreTypeOfDescribeName?: boolean;
    /** @default false */
    allowArguments?: boolean;
    disallowedWords?: readonly string[];
    mustMatch?: MustMatchType;
    mustNotMatch?: MustMatchType;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Disallow `.todo` usage
 *
 * @link https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/warn-todo.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | recommended | false      |
 *  ```
 */
namespace WarnTodo {
  export type RuleEntry = Linter.StringSeverity;
}

export type EslintVitestRules = Readonly<{
  'vitest/consistent-test-filename': ConsistentTestFilename.RuleEntry;
  'vitest/consistent-test-it': ConsistentTestIt.RuleEntry;
  'vitest/consistent-vitest-vi': ConsistentVitestVi.RuleEntry;
  'vitest/expect-expect': ExpectExpect.RuleEntry;
  'vitest/hoisted-apis-on-top': HoistedApisOnTop.RuleEntry;
  'vitest/max-expects': MaxExpects.RuleEntry;
  'vitest/max-nested-describe': MaxNestedDescribe.RuleEntry;
  'vitest/no-alias-methods': NoAliasMethods.RuleEntry;
  'vitest/no-commented-out-tests': NoCommentedOutTests.RuleEntry;
  'vitest/no-conditional-expect': NoConditionalExpect.RuleEntry;
  'vitest/no-conditional-in-test': NoConditionalInTest.RuleEntry;
  'vitest/no-conditional-tests': NoConditionalTests.RuleEntry;
  'vitest/no-disabled-tests': NoDisabledTests.RuleEntry;
  'vitest/no-duplicate-hooks': NoDuplicateHooks.RuleEntry;
  'vitest/no-focused-tests': NoFocusedTests.RuleEntry;
  'vitest/no-hooks': NoHooks.RuleEntry;
  'vitest/no-identical-title': NoIdenticalTitle.RuleEntry;
  'vitest/no-import-node-test': NoImportNodeTest.RuleEntry;
  'vitest/no-importing-vitest-globals': NoImportingVitestGlobals.RuleEntry;
  'vitest/no-interpolation-in-snapshots': NoInterpolationInSnapshots.RuleEntry;
  'vitest/no-large-snapshots': NoLargeSnapshots.RuleEntry;
  'vitest/no-mocks-import': NoMocksImport.RuleEntry;
  'vitest/no-restricted-matchers': NoRestrictedMatchers.RuleEntry;
  'vitest/no-restricted-vi-methods': NoRestrictedViMethods.RuleEntry;
  'vitest/no-standalone-expect': NoStandaloneExpect.RuleEntry;
  'vitest/no-test-prefixes': NoTestPrefixes.RuleEntry;
  'vitest/no-test-return-statement': NoTestReturnStatement.RuleEntry;
  'vitest/padding-around-after-all-blocks': PaddingAroundAfterAllBlocks.RuleEntry;
  'vitest/padding-around-after-each-blocks': PaddingAroundAfterEachBlocks.RuleEntry;
  'vitest/padding-around-all': PaddingAroundAll.RuleEntry;
  'vitest/padding-around-before-all-blocks': PaddingAroundBeforeAllBlocks.RuleEntry;
  'vitest/padding-around-before-each-blocks': PaddingAroundBeforeEachBlocks.RuleEntry;
  'vitest/padding-around-describe-blocks': PaddingAroundDescribeBlocks.RuleEntry;
  'vitest/padding-around-expect-groups': PaddingAroundExpectGroups.RuleEntry;
  'vitest/padding-around-test-blocks': PaddingAroundTestBlocks.RuleEntry;
  'vitest/prefer-called-exactly-once-with': PreferCalledExactlyOnceWith.RuleEntry;
  'vitest/prefer-called-once': PreferCalledOnce.RuleEntry;
  'vitest/prefer-called-times': PreferCalledTimes.RuleEntry;
  'vitest/prefer-called-with': PreferCalledWith.RuleEntry;
  'vitest/prefer-comparison-matcher': PreferComparisonMatcher.RuleEntry;
  'vitest/prefer-describe-function-title': PreferDescribeFunctionTitle.RuleEntry;
  'vitest/prefer-each': PreferEach.RuleEntry;
  'vitest/prefer-equality-matcher': PreferEqualityMatcher.RuleEntry;
  'vitest/prefer-expect-assertions': PreferExpectAssertions.RuleEntry;
  'vitest/prefer-expect-resolves': PreferExpectResolves.RuleEntry;
  'vitest/prefer-expect-type-of': PreferExpectTypeOf.RuleEntry;
  'vitest/prefer-hooks-in-order': PreferHooksInOrder.RuleEntry;
  'vitest/prefer-hooks-on-top': PreferHooksOnTop.RuleEntry;
  'vitest/prefer-import-in-mock': PreferImportInMock.RuleEntry;
  'vitest/prefer-importing-vitest-globals': PreferImportingVitestGlobals.RuleEntry;
  'vitest/prefer-lowercase-title': PreferLowercaseTitle.RuleEntry;
  'vitest/prefer-mock-promise-shorthand': PreferMockPromiseShorthand.RuleEntry;
  'vitest/prefer-snapshot-hint': PreferSnapshotHint.RuleEntry;
  'vitest/prefer-spy-on': PreferSpyOn.RuleEntry;
  'vitest/prefer-strict-boolean-matchers': PreferStrictBooleanMatchers.RuleEntry;
  'vitest/prefer-strict-equal': PreferStrictEqual.RuleEntry;
  'vitest/prefer-to-be-falsy': PreferToBeFalsy.RuleEntry;
  'vitest/prefer-to-be-object': PreferToBeObject.RuleEntry;
  'vitest/prefer-to-be-truthy': PreferToBeTruthy.RuleEntry;
  'vitest/prefer-to-be': PreferToBe.RuleEntry;
  'vitest/prefer-to-contain': PreferToContain.RuleEntry;
  'vitest/prefer-to-have-length': PreferToHaveLength.RuleEntry;
  'vitest/prefer-todo': PreferTodo.RuleEntry;
  'vitest/prefer-vi-mocked': PreferViMocked.RuleEntry;
  'vitest/require-awaited-expect-poll': RequireAwaitedExpectPoll.RuleEntry;
  'vitest/require-hook': RequireHook.RuleEntry;
  'vitest/require-local-test-context-for-concurrent-snapshots': RequireLocalTestContextForConcurrentSnapshots.RuleEntry;
  'vitest/require-mock-type-parameters': RequireMockTypeParameters.RuleEntry;
  'vitest/require-to-throw-message': RequireToThrowMessage.RuleEntry;
  'vitest/require-top-level-describe': RequireTopLevelDescribe.RuleEntry;
  'vitest/valid-describe-callback': ValidDescribeCallback.RuleEntry;
  'vitest/valid-expect-in-promise': ValidExpectInPromise.RuleEntry;
  'vitest/valid-expect': ValidExpect.RuleEntry;
  'vitest/valid-title': ValidTitle.RuleEntry;
  'vitest/warn-todo': WarnTodo.RuleEntry;

  // deprecated
  'vitest/no-done-callback': NoDoneCallback.RuleEntry;
}>;

export type EslintVitestRulesOption = Readonly<{
  'vitest/consistent-test-filename': ConsistentTestFilename.Options;
  'vitest/consistent-test-it': ConsistentTestIt.Options;
  'vitest/consistent-vitest-vi': ConsistentVitestVi.Options;
  'vitest/expect-expect': ExpectExpect.Options;
  'vitest/max-expects': MaxExpects.Options;
  'vitest/max-nested-describe': MaxNestedDescribe.Options;
  'vitest/no-focused-tests': NoFocusedTests.Options;
  'vitest/no-hooks': NoHooks.Options;
  'vitest/no-large-snapshots': NoLargeSnapshots.Options;
  'vitest/no-restricted-matchers': NoRestrictedMatchers.Options;
  'vitest/no-restricted-vi-methods': NoRestrictedViMethods.Options;
  'vitest/no-standalone-expect': NoStandaloneExpect.Options;
  'vitest/prefer-expect-assertions': PreferExpectAssertions.Options;
  'vitest/prefer-lowercase-title': PreferLowercaseTitle.Options;
  'vitest/prefer-snapshot-hint': PreferSnapshotHint.Options;
  'vitest/require-hook': RequireHook.Options;
  'vitest/require-mock-type-parameters': RequireMockTypeParameters.Options;
  'vitest/require-top-level-describe': RequireTopLevelDescribe.Options;
  'vitest/valid-expect': ValidExpect.Options;
  'vitest/valid-title': ValidTitle.Options;
}>;

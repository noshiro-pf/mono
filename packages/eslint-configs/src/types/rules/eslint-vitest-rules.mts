/* cSpell:disable */
import { type Linter } from 'eslint';
import { type RuleSeverityWithDefaultOption } from '../rule-severity-branded.mjs';

type SpreadOptionsIfIsArray<
  T extends readonly [Linter.StringSeverity, unknown],
> = T[1] extends readonly unknown[]
  ? readonly [Linter.StringSeverity, ...T[1]]
  : T;

/**
 * Enforce lowercase titles
 *
 * @link https://github.com/veritem/eslint-plugin-vitest/blob/main/docs/rules/prefer-lowercase-title.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | deprecated  | false   |
 *  | fixable     | code    |
 *  | recommended | strict  |
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
   *           "enum": [
   *             "describe",
   *             "test",
   *             "it"
   *           ]
   *         },
   *         "additionalProperties": false
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
  export type Options = {
    readonly ignore?: readonly ('describe' | 'it' | 'test')[];
    readonly allowedPrefixes?: readonly string[];
    readonly ignoreTopLevelDescribe?: boolean;
    readonly lowercaseFirstCharacterOnly?: boolean;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Require describe block to be less than set max value or default value
 *
 * @link https://github.com/veritem/eslint-plugin-vitest/blob/main/docs/rules/max-nested-describe.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | deprecated  | false   |
 *  | recommended | strict  |
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
  export type Options = {
    readonly max?: number;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Disallow identical titles
 *
 * @link https://github.com/veritem/eslint-plugin-vitest/blob/main/docs/rules/no-identical-title.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | deprecated  | false   |
 *  | fixable     | code    |
 *  | recommended | strict  |
 *  ```
 */
namespace NoIdenticalTitle {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow focused tests
 *
 * @link https://github.com/veritem/eslint-plugin-vitest/blob/main/docs/rules/no-focused-tests.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | deprecated  | false   |
 *  | fixable     | code    |
 *  | recommended | strict  |
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
  export type Options = {
    readonly fixable?: boolean;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Disallow conditional tests
 *
 * @link https://github.com/veritem/eslint-plugin-vitest/blob/main/docs/rules/no-conditional-tests.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | deprecated  | false   |
 *  | recommended | strict  |
 *  ```
 */
namespace NoConditionalTests {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce having expectation in test body
 *
 * @link https://github.com/veritem/eslint-plugin-vitest/blob/main/docs/rules/expect-expect.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | recommended | strict     |
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
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Enforce using test or it but not both
 *
 * @link https://github.com/veritem/eslint-plugin-vitest/blob/main/docs/rules/consistent-test-it.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | fixable     | code       |
 *  | recommended | strict     |
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
  export type Options = {
    readonly fn?: 'it' | 'test';
    readonly withinDescribe?: 'it' | 'test';
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Enforce using toBe()
 *
 * @link https://github.com/veritem/eslint-plugin-vitest/blob/main/docs/rules/prefer-to-be.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | fixable     | code       |
 *  | recommended | strict     |
 *  ```
 */
namespace PreferToBe {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow setup and teardown hooks
 *
 * @link https://github.com/veritem/eslint-plugin-vitest/blob/main/docs/rules/no-hooks.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | recommended | strict     |
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
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Disallow specific `vi.` methods
 *
 * @link https://github.com/veritem/eslint-plugin-vitest/blob/main/docs/rules/no-restricted-vi-methods.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | recommended | strict     |
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
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Require .spec test file pattern
 *
 * @link https://github.com/veritem/eslint-plugin-vitest/blob/main/docs/rules/consistent-test-filename.md
 *
 *  ```md
 *  | key                  | value   |
 *  | :------------------- | :------ |
 *  | type                 | problem |
 *  | deprecated           | false   |
 *  | recommended          | strict  |
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
   *         "format": "regex",
   *         "default": ".*\\.test\\.[tj]sx?$"
   *       },
   *       "allTestPattern": {
   *         "format": "regex",
   *         "default": ".*\\.(test|spec)\\.[tj]sx?$"
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly pattern?: string;
    readonly allTestPattern?: string;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Enforce a maximum number of expect per test
 *
 * @link https://github.com/veritem/eslint-plugin-vitest/blob/main/docs/rules/max-expects.md
 *
 *  ```md
 *  | key                  | value      |
 *  | :------------------- | :--------- |
 *  | type                 | suggestion |
 *  | deprecated           | false      |
 *  | recommended          | strict     |
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
  export type Options = {
    readonly max?: number;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Disallow alias methods
 *
 * @link https://github.com/veritem/eslint-plugin-vitest/blob/main/docs/rules/no-alias-methods.md
 *
 *  ```md
 *  | key                  | value      |
 *  | :------------------- | :--------- |
 *  | type                 | suggestion |
 *  | deprecated           | false      |
 *  | fixable              | code       |
 *  | recommended          | strict     |
 *  | requiresTypeChecking | false      |
 *  ```
 */
namespace NoAliasMethods {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow commented out tests
 *
 * @link https://github.com/veritem/eslint-plugin-vitest/blob/main/docs/rules/no-commented-out-tests.md
 *
 *  ```md
 *  | key                  | value      |
 *  | :------------------- | :--------- |
 *  | type                 | suggestion |
 *  | deprecated           | false      |
 *  | recommended          | strict     |
 *  | requiresTypeChecking | false      |
 *  ```
 */
namespace NoCommentedOutTests {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow conditional expects
 *
 * @link https://github.com/veritem/eslint-plugin-vitest/blob/main/docs/rules/no-conditional-expect.md
 *
 *  ```md
 *  | key                  | value   |
 *  | :------------------- | :------ |
 *  | type                 | problem |
 *  | deprecated           | false   |
 *  | recommended          | strict  |
 *  | requiresTypeChecking | false   |
 *  ```
 */
namespace NoConditionalExpect {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow conditional tests
 *
 * @link https://github.com/veritem/eslint-plugin-vitest/blob/main/docs/rules/no-conditional-in-test.md
 *
 *  ```md
 *  | key                  | value   |
 *  | :------------------- | :------ |
 *  | type                 | problem |
 *  | deprecated           | false   |
 *  | recommended          | strict  |
 *  | requiresTypeChecking | false   |
 *  ```
 */
namespace NoConditionalInTest {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow disabled tests
 *
 * @link https://github.com/veritem/eslint-plugin-vitest/blob/main/docs/rules/no-disabled-tests.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | recommended | strict     |
 *  ```
 */
namespace NoDisabledTests {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow using a callback in asynchronous tests and hooks
 *
 * @link https://github.com/veritem/eslint-plugin-vitest/blob/main/docs/rules/no-done-callback.md
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | deprecated     | true       |
 *  | hasSuggestions | true       |
 *  | recommended    | strict     |
 *  ```
 */
namespace NoDoneCallback {
  export type RuleEntry = 0;
}

/**
 * Disallow duplicate hooks and teardown hooks
 *
 * @link https://github.com/veritem/eslint-plugin-vitest/blob/main/docs/rules/no-duplicate-hooks.md
 *
 *  ```md
 *  | key                  | value      |
 *  | :------------------- | :--------- |
 *  | type                 | suggestion |
 *  | deprecated           | false      |
 *  | recommended          | strict     |
 *  | requiresTypeChecking | false      |
 *  ```
 */
namespace NoDuplicateHooks {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow large snapshots
 *
 * @link https://github.com/veritem/eslint-plugin-vitest/blob/main/docs/rules/no-large-snapshots.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | recommended | strict     |
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
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Disallow string interpolation in snapshots
 *
 * @link https://github.com/veritem/eslint-plugin-vitest/blob/main/docs/rules/no-interpolation-in-snapshots.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | deprecated  | false   |
 *  | fixable     | code    |
 *  | recommended | strict  |
 *  ```
 */
namespace NoInterpolationInSnapshots {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow importing from **mocks** directory
 *
 * @link https://github.com/veritem/eslint-plugin-vitest/blob/main/docs/rules/no-mocks-import.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | deprecated  | false   |
 *  | recommended | error   |
 *  ```
 */
namespace NoMocksImport {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow the use of certain matchers
 *
 * @link https://github.com/veritem/eslint-plugin-vitest/blob/main/docs/rules/no-restricted-matchers.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | recommended | strict     |
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
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Disallow using `expect` outside of `it` or `test` blocks
 *
 * @link https://github.com/veritem/eslint-plugin-vitest/blob/main/docs/rules/no-standalone-expect.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | recommended | strict     |
 *  ```
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
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Disallow using `test` as a prefix
 *
 * @link https://github.com/veritem/eslint-plugin-vitest/blob/main/docs/rules/no-test-prefixes.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | fixable     | code       |
 *  | recommended | strict     |
 *  ```
 */
namespace NoTestPrefixes {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow return statements in tests
 *
 * @link https://github.com/veritem/eslint-plugin-vitest/blob/main/docs/rules/no-test-return-statement.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | deprecated  | false   |
 *  | recommended | strict  |
 *  ```
 */
namespace NoTestReturnStatement {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow importing `node:test`
 *
 * @link https://github.com/veritem/eslint-plugin-vitest/blob/main/docs/rules/no-import-node-test.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | fixable     | code       |
 *  | recommended | strict     |
 *  ```
 */
namespace NoImportNodeTest {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce using `toBeCalledWith()` or `toHaveBeenCalledWith()`
 *
 * @link https://github.com/veritem/eslint-plugin-vitest/blob/main/docs/rules/prefer-called-with.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | fixable     | code       |
 *  | recommended | strict     |
 *  ```
 */
namespace PreferCalledWith {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce valid titles
 *
 * @link https://github.com/veritem/eslint-plugin-vitest/blob/main/docs/rules/valid-title.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | fixable     | code       |
 *  | recommended | strict     |
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
    readonly allowArguments?: boolean;
    readonly disallowedWords?: readonly string[];
    readonly mustNotMatch?: MustMatchType | string;
    readonly mustMatch?: MustMatchType | string;
  };

  type MustMatchType = Readonly<
    Partial<Record<'describe' | 'it' | 'test', string>>
  >;

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Enforce valid `expect()` usage
 *
 * @link https://github.com/veritem/eslint-plugin-vitest/blob/main/docs/rules/valid-expect.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | recommended | strict     |
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
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Enforce using toBeFalsy()
 *
 * @link https://github.com/veritem/eslint-plugin-vitest/blob/main/docs/rules/prefer-to-be-falsy.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | fixable     | code       |
 *  | recommended | strict     |
 *  ```
 */
namespace PreferToBeFalsy {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce using toBeObject()
 *
 * @link https://github.com/veritem/eslint-plugin-vitest/blob/main/docs/rules/prefer-to-be-object.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | fixable     | code       |
 *  | recommended | strict     |
 *  ```
 */
namespace PreferToBeObject {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce using `toBeTruthy`
 *
 * @link https://github.com/veritem/eslint-plugin-vitest/blob/main/docs/rules/prefer-to-be-truthy.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | fixable     | code       |
 *  | recommended | strict     |
 *  ```
 */
namespace PreferToBeTruthy {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce using toHaveLength()
 *
 * @link https://github.com/veritem/eslint-plugin-vitest/blob/main/docs/rules/prefer-to-have-length.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | fixable     | code       |
 *  | recommended | strict     |
 *  ```
 */
namespace PreferToHaveLength {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce using the built-in quality matchers
 *
 * @link https://github.com/veritem/eslint-plugin-vitest/blob/main/docs/rules/prefer-equality-matcher.md
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | deprecated     | false      |
 *  | hasSuggestions | true       |
 *  | recommended    | strict     |
 *  ```
 */
namespace PreferEqualityMatcher {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce strict equal over equal
 *
 * @link https://github.com/veritem/eslint-plugin-vitest/blob/main/docs/rules/prefer-strict-equal.md
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | deprecated     | false      |
 *  | hasSuggestions | true       |
 *  | recommended    | strict     |
 *  ```
 */
namespace PreferStrictEqual {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce using `expect().resolves` over `expect(await ...)` syntax
 *
 * @link https://github.com/veritem/eslint-plugin-vitest/blob/main/docs/rules/prefer-expect-resolves.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | fixable     | code       |
 *  | recommended | strict     |
 *  ```
 */
namespace PreferExpectResolves {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce using `each` rather than manual loops
 *
 * @link https://github.com/veritem/eslint-plugin-vitest/blob/main/docs/rules/prefer-each.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | recommended | strict     |
 *  ```
 */
namespace PreferEach {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce having hooks before any test cases
 *
 * @link https://github.com/veritem/eslint-plugin-vitest/blob/main/docs/rules/prefer-hooks-on-top.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | recommended | strict     |
 *  ```
 */
namespace PreferHooksOnTop {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce having hooks in consistent order
 *
 * @link https://github.com/veritem/eslint-plugin-vitest/blob/main/docs/rules/prefer-hooks-in-order.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | recommended | strict     |
 *  ```
 */
namespace PreferHooksInOrder {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Require local Test Context for concurrent snapshot tests
 *
 * @link https://github.com/veritem/eslint-plugin-vitest/blob/main/docs/rules/require-local-test-context-for-concurrent-snapshots.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | deprecated  | false   |
 *  | recommended | strict  |
 *  ```
 */
namespace RequireLocalTestContextForConcurrentSnapshots {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce mock resolved/rejected shorthands for promises
 *
 * @link https://github.com/veritem/eslint-plugin-vitest/blob/main/docs/rules/prefer-mock-promise-shorthand.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | fixable     | code       |
 *  | recommended | strict     |
 *  ```
 */
namespace PreferMockPromiseShorthand {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce including a hint with external snapshots
 *
 * @link https://github.com/veritem/eslint-plugin-vitest/blob/main/docs/rules/prefer-snapshot-hint.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | recommended | strict     |
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
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Enforce valid describe callback
 *
 * @link https://github.com/veritem/eslint-plugin-vitest/blob/main/docs/rules/valid-describe-callback.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | deprecated  | false   |
 *  | recommended | strict  |
 *  ```
 */
namespace ValidDescribeCallback {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce that all tests are in a top-level describe
 *
 * @link https://github.com/veritem/eslint-plugin-vitest/blob/main/docs/rules/require-top-level-describe.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | recommended | strict     |
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
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Require toThrow() to be called with an error message
 *
 * @link https://github.com/veritem/eslint-plugin-vitest/blob/main/docs/rules/require-to-throw-message.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | recommended | strict     |
 *  ```
 */
namespace RequireToThrowMessage {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Require setup and teardown to be within a hook
 *
 * @link https://github.com/veritem/eslint-plugin-vitest/blob/main/docs/rules/require-hook.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | recommended | strict     |
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
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Enforce using `test.todo`
 *
 * @link https://github.com/veritem/eslint-plugin-vitest/blob/main/docs/rules/prefer-todo.md
 *
 *  ```md
 *  | key         | value  |
 *  | :---------- | :----- |
 *  | type        | layout |
 *  | deprecated  | false  |
 *  | fixable     | code   |
 *  | recommended | strict |
 *  ```
 */
namespace PreferTodo {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce using `vi.spyOn`
 *
 * @link https://github.com/veritem/eslint-plugin-vitest/blob/main/docs/rules/prefer-spy-on.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | fixable     | code       |
 *  | recommended | strict     |
 *  ```
 */
namespace PreferSpyOn {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce using the built-in comparison matchers
 *
 * @link https://github.com/veritem/eslint-plugin-vitest/blob/main/docs/rules/prefer-comparison-matcher.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | fixable     | code       |
 *  | recommended | strict     |
 *  ```
 */
namespace PreferComparisonMatcher {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce using toContain()
 *
 * @link https://github.com/veritem/eslint-plugin-vitest/blob/main/docs/rules/prefer-to-contain.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | fixable     | code       |
 *  | recommended | strict     |
 *  ```
 */
namespace PreferToContain {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce using expect assertions instead of callbacks
 *
 * @link https://github.com/veritem/eslint-plugin-vitest/blob/main/docs/rules/prefer-expect-assertions.md
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | deprecated     | false      |
 *  | hasSuggestions | true       |
 *  | recommended    | strict     |
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
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

export type EslintVitestRules = {
  readonly 'vitest/prefer-lowercase-title': PreferLowercaseTitle.RuleEntry;
  readonly 'vitest/max-nested-describe': MaxNestedDescribe.RuleEntry;
  readonly 'vitest/no-identical-title': NoIdenticalTitle.RuleEntry;
  readonly 'vitest/no-focused-tests': NoFocusedTests.RuleEntry;
  readonly 'vitest/no-conditional-tests': NoConditionalTests.RuleEntry;
  readonly 'vitest/expect-expect': ExpectExpect.RuleEntry;
  readonly 'vitest/consistent-test-it': ConsistentTestIt.RuleEntry;
  readonly 'vitest/prefer-to-be': PreferToBe.RuleEntry;
  readonly 'vitest/no-hooks': NoHooks.RuleEntry;
  readonly 'vitest/no-restricted-vi-methods': NoRestrictedViMethods.RuleEntry;
  readonly 'vitest/consistent-test-filename': ConsistentTestFilename.RuleEntry;
  readonly 'vitest/max-expects': MaxExpects.RuleEntry;
  readonly 'vitest/no-alias-methods': NoAliasMethods.RuleEntry;
  readonly 'vitest/no-commented-out-tests': NoCommentedOutTests.RuleEntry;
  readonly 'vitest/no-conditional-expect': NoConditionalExpect.RuleEntry;
  readonly 'vitest/no-conditional-in-test': NoConditionalInTest.RuleEntry;
  readonly 'vitest/no-disabled-tests': NoDisabledTests.RuleEntry;
  readonly 'vitest/no-duplicate-hooks': NoDuplicateHooks.RuleEntry;
  readonly 'vitest/no-large-snapshots': NoLargeSnapshots.RuleEntry;
  readonly 'vitest/no-interpolation-in-snapshots': NoInterpolationInSnapshots.RuleEntry;
  readonly 'vitest/no-mocks-import': NoMocksImport.RuleEntry;
  readonly 'vitest/no-restricted-matchers': NoRestrictedMatchers.RuleEntry;
  readonly 'vitest/no-standalone-expect': NoStandaloneExpect.RuleEntry;
  readonly 'vitest/no-test-prefixes': NoTestPrefixes.RuleEntry;
  readonly 'vitest/no-test-return-statement': NoTestReturnStatement.RuleEntry;
  readonly 'vitest/no-import-node-test': NoImportNodeTest.RuleEntry;
  readonly 'vitest/prefer-called-with': PreferCalledWith.RuleEntry;
  readonly 'vitest/valid-title': ValidTitle.RuleEntry;
  readonly 'vitest/valid-expect': ValidExpect.RuleEntry;
  readonly 'vitest/prefer-to-be-falsy': PreferToBeFalsy.RuleEntry;
  readonly 'vitest/prefer-to-be-object': PreferToBeObject.RuleEntry;
  readonly 'vitest/prefer-to-be-truthy': PreferToBeTruthy.RuleEntry;
  readonly 'vitest/prefer-to-have-length': PreferToHaveLength.RuleEntry;
  readonly 'vitest/prefer-equality-matcher': PreferEqualityMatcher.RuleEntry;
  readonly 'vitest/prefer-strict-equal': PreferStrictEqual.RuleEntry;
  readonly 'vitest/prefer-expect-resolves': PreferExpectResolves.RuleEntry;
  readonly 'vitest/prefer-each': PreferEach.RuleEntry;
  readonly 'vitest/prefer-hooks-on-top': PreferHooksOnTop.RuleEntry;
  readonly 'vitest/prefer-hooks-in-order': PreferHooksInOrder.RuleEntry;
  readonly 'vitest/require-local-test-context-for-concurrent-snapshots': RequireLocalTestContextForConcurrentSnapshots.RuleEntry;
  readonly 'vitest/prefer-mock-promise-shorthand': PreferMockPromiseShorthand.RuleEntry;
  readonly 'vitest/prefer-snapshot-hint': PreferSnapshotHint.RuleEntry;
  readonly 'vitest/valid-describe-callback': ValidDescribeCallback.RuleEntry;
  readonly 'vitest/require-top-level-describe': RequireTopLevelDescribe.RuleEntry;
  readonly 'vitest/require-to-throw-message': RequireToThrowMessage.RuleEntry;
  readonly 'vitest/require-hook': RequireHook.RuleEntry;
  readonly 'vitest/prefer-todo': PreferTodo.RuleEntry;
  readonly 'vitest/prefer-spy-on': PreferSpyOn.RuleEntry;
  readonly 'vitest/prefer-comparison-matcher': PreferComparisonMatcher.RuleEntry;
  readonly 'vitest/prefer-to-contain': PreferToContain.RuleEntry;
  readonly 'vitest/prefer-expect-assertions': PreferExpectAssertions.RuleEntry;

  // deprecated
  readonly 'vitest/no-done-callback': NoDoneCallback.RuleEntry;
};

export type EslintVitestRulesOption = {
  readonly 'vitest/prefer-lowercase-title': PreferLowercaseTitle.Options;
  readonly 'vitest/max-nested-describe': MaxNestedDescribe.Options;
  readonly 'vitest/no-focused-tests': NoFocusedTests.Options;
  readonly 'vitest/expect-expect': ExpectExpect.Options;
  readonly 'vitest/consistent-test-it': ConsistentTestIt.Options;
  readonly 'vitest/no-hooks': NoHooks.Options;
  readonly 'vitest/no-restricted-vi-methods': NoRestrictedViMethods.Options;
  readonly 'vitest/consistent-test-filename': ConsistentTestFilename.Options;
  readonly 'vitest/max-expects': MaxExpects.Options;
  readonly 'vitest/no-large-snapshots': NoLargeSnapshots.Options;
  readonly 'vitest/no-restricted-matchers': NoRestrictedMatchers.Options;
  readonly 'vitest/no-standalone-expect': NoStandaloneExpect.Options;
  readonly 'vitest/valid-title': ValidTitle.Options;
  readonly 'vitest/valid-expect': ValidExpect.Options;
  readonly 'vitest/prefer-snapshot-hint': PreferSnapshotHint.Options;
  readonly 'vitest/require-top-level-describe': RequireTopLevelDescribe.Options;
  readonly 'vitest/require-hook': RequireHook.Options;
  readonly 'vitest/prefer-expect-assertions': PreferExpectAssertions.Options;
};

/* cSpell:disable */
import { type Linter } from 'eslint';

type SpreadOptionsIfIsArray<T extends readonly [Linter.RuleSeverity, unknown]> =
  T[1] extends readonly unknown[] ? readonly [Linter.RuleSeverity, ...T[1]] : T;

/**
 * Enforce promises from async event methods are handled
 *
 * @link https://github.com/testing-library/eslint-plugin-testing-library/tree/main/docs/rules/await-async-events.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | fixable     | code    |
 *  | recommended | false   |
 *  ```
 */
namespace AwaitAsyncEvents {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "default": {},
   *     "additionalProperties": false,
   *     "properties": {
   *       "eventModule": {
   *         "default": "userEvent",
   *         "oneOf": [
   *           {
   *             "type": "string",
   *             "enum": [
   *               "fireEvent",
   *               "userEvent"
   *             ]
   *           },
   *           {
   *             "type": "array",
   *             "items": {
   *               "type": "string",
   *               "enum": [
   *                 "fireEvent",
   *                 "userEvent"
   *               ]
   *             }
   *           }
   *         ]
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly eventModule?:
      | readonly ('fireEvent' | 'userEvent')[]
      | 'fireEvent'
      | 'userEvent';
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Enforce promises from async queries to be handled
 *
 * @link https://github.com/testing-library/eslint-plugin-testing-library/tree/main/docs/rules/await-async-queries.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | false   |
 *  ```
 */
namespace AwaitAsyncQueries {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Enforce promises from async utils to be awaited properly
 *
 * @link https://github.com/testing-library/eslint-plugin-testing-library/tree/main/docs/rules/await-async-utils.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | false   |
 *  ```
 */
namespace AwaitAsyncUtils {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Ensures consistent usage of `data-testid`
 *
 * @link https://github.com/testing-library/eslint-plugin-testing-library/tree/main/docs/rules/consistent-data-testid.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 *  ```
 */
namespace ConsistentDataTestid {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "default": {},
   *     "additionalProperties": false,
   *     "required": [
   *       "testIdPattern"
   *     ],
   *     "properties": {
   *       "testIdPattern": {
   *         "type": "string"
   *       },
   *       "testIdAttribute": {
   *         "default": "data-testid",
   *         "oneOf": [
   *           {
   *             "type": "string"
   *           },
   *           {
   *             "type": "array",
   *             "items": {
   *               "type": "string"
   *             }
   *           }
   *         ]
   *       },
   *       "customMessage": {
   *         "type": "string"
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly testIdPattern: string;
    readonly testIdAttribute?: string | readonly string[];
    readonly customMessage?: string;
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Disallow unnecessary `await` for sync events
 *
 * @link https://github.com/testing-library/eslint-plugin-testing-library/tree/main/docs/rules/no-await-sync-events.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | false   |
 *  ```
 */
namespace NoAwaitSyncEvents {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "eventModules": {
   *         "type": "array",
   *         "items": {
   *           "type": "string",
   *           "enum": [
   *             "fire-event",
   *             "user-event"
   *           ]
   *         },
   *         "minItems": 1,
   *         "default": [
   *           "fire-event"
   *         ]
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    /** @minItems 1 */
    readonly eventModules?: readonly [
      'fire-event' | 'user-event',
      ...(readonly ('fire-event' | 'user-event')[]),
    ];
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Disallow unnecessary `await` for sync queries
 *
 * @link https://github.com/testing-library/eslint-plugin-testing-library/tree/main/docs/rules/no-await-sync-queries.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | false   |
 *  ```
 */
namespace NoAwaitSyncQueries {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow the use of `container` methods
 *
 * @link https://github.com/testing-library/eslint-plugin-testing-library/tree/main/docs/rules/no-container.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | false   |
 *  ```
 */
namespace NoContainer {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow the use of debugging utilities like `debug`
 *
 * @link https://github.com/testing-library/eslint-plugin-testing-library/tree/main/docs/rules/no-debugging-utils.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | false   |
 *  ```
 */
namespace NoDebuggingUtils {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "utilsToCheckFor": {
   *         "type": "object",
   *         "properties": {
   *           "prettyFormat": {
   *             "type": "boolean"
   *           },
   *           "logDOM": {
   *             "type": "boolean"
   *           },
   *           "logRoles": {
   *             "type": "boolean"
   *           },
   *           "prettyDOM": {
   *             "type": "boolean"
   *           },
   *           "logTestingPlaygroundURL": {
   *             "type": "boolean"
   *           },
   *           "debug": {
   *             "type": "boolean"
   *           }
   *         },
   *         "additionalProperties": false
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly utilsToCheckFor?: {
      readonly prettyFormat?: boolean;
      readonly logDOM?: boolean;
      readonly logRoles?: boolean;
      readonly prettyDOM?: boolean;
      readonly logTestingPlaygroundURL?: boolean;
      readonly debug?: boolean;
    };
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Disallow importing from DOM Testing Library
 *
 * @link https://github.com/testing-library/eslint-plugin-testing-library/tree/main/docs/rules/no-dom-import.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | fixable     | code    |
 *  | recommended | false   |
 *  ```
 */
namespace NoDomImport {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "string"
   *   }
   * ]
   * ```
   */
  export type Options = string;

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Disallow the use of the global RegExp flag (/g) in queries
 *
 * @link https://github.com/testing-library/eslint-plugin-testing-library/tree/main/docs/rules/no-global-regexp-flag-in-query.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | false      |
 *  ```
 */
namespace NoGlobalRegexpFlagInQuery {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow the use of `cleanup`
 *
 * @link https://github.com/testing-library/eslint-plugin-testing-library/tree/main/docs/rules/no-manual-cleanup.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | false   |
 *  ```
 */
namespace NoManualCleanup {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow direct Node access
 *
 * @link https://github.com/testing-library/eslint-plugin-testing-library/tree/main/docs/rules/no-node-access.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | false   |
 *  ```
 */
namespace NoNodeAccess {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "allowContainerFirstChild": {
   *         "type": "boolean"
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly allowContainerFirstChild?: boolean;
    readonly [k: string]: unknown;
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Disallow the use of promises passed to a `fireEvent` method
 *
 * @link https://github.com/testing-library/eslint-plugin-testing-library/tree/main/docs/rules/no-promise-in-fire-event.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | false   |
 *  ```
 */
namespace NoPromiseInFireEvent {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow the use of `render` in testing frameworks setup functions
 *
 * @link https://github.com/testing-library/eslint-plugin-testing-library/tree/main/docs/rules/no-render-in-lifecycle.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | false   |
 *  ```
 */
namespace NoRenderInLifecycle {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "allowTestingFrameworkSetupHook": {
   *         "enum": [
   *           "beforeEach",
   *           "beforeAll"
   *         ]
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly allowTestingFrameworkSetupHook?: 'beforeAll' | 'beforeEach';
    readonly [k: string]: unknown;
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Disallow wrapping Testing Library utils or empty callbacks in `act`
 *
 * @link https://github.com/testing-library/eslint-plugin-testing-library/tree/main/docs/rules/no-unnecessary-act.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | false   |
 *  ```
 */
namespace NoUnnecessaryAct {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "isStrict": {
   *         "type": "boolean"
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly isStrict?: boolean;
    readonly [k: string]: unknown;
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Disallow the use of multiple `expect` calls inside `waitFor`
 *
 * @link https://github.com/testing-library/eslint-plugin-testing-library/tree/main/docs/rules/no-wait-for-multiple-assertions.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 *  ```
 */
namespace NoWaitForMultipleAssertions {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow the use of side effects in `waitFor`
 *
 * @link https://github.com/testing-library/eslint-plugin-testing-library/tree/main/docs/rules/no-wait-for-side-effects.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 *  ```
 */
namespace NoWaitForSideEffects {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Ensures no snapshot is generated inside of a `waitFor` call
 *
 * @link https://github.com/testing-library/eslint-plugin-testing-library/tree/main/docs/rules/no-wait-for-snapshot.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | false   |
 *  ```
 */
namespace NoWaitForSnapshot {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Suggest using explicit assertions rather than standalone queries
 *
 * @link https://github.com/testing-library/eslint-plugin-testing-library/tree/main/docs/rules/prefer-explicit-assert.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 *  ```
 */
namespace PreferExplicitAssert {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "assertion": {
   *         "type": "string",
   *         "enum": [
   *           "toBeOnTheScreen",
   *           "toBeInTheDocument",
   *           "toBeTruthy",
   *           "toBeDefined"
   *         ]
   *       },
   *       "includeFindQueries": {
   *         "type": "boolean"
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly assertion?:
      | 'toBeDefined'
      | 'toBeInTheDocument'
      | 'toBeOnTheScreen'
      | 'toBeTruthy';
    readonly includeFindQueries?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Suggest using `find(All)By*` query instead of `waitFor` + `get(All)By*` to
 * wait for elements
 *
 * @link https://github.com/testing-library/eslint-plugin-testing-library/tree/main/docs/rules/prefer-find-by.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | false      |
 *  ```
 */
namespace PreferFindBy {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Suggest using implicit assertions for getBy* & findBy* queries
 *
 * @link https://github.com/testing-library/eslint-plugin-testing-library/tree/main/docs/rules/prefer-implicit-assert.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 *  ```
 */
namespace PreferImplicitAssert {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Ensure appropriate `get*`/`query*` queries are used with their respective
 * matchers
 *
 * @link https://github.com/testing-library/eslint-plugin-testing-library/tree/main/docs/rules/prefer-presence-queries.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 *  ```
 */
namespace PreferPresenceQueries {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "presence": {
   *         "type": "boolean"
   *       },
   *       "absence": {
   *         "type": "boolean"
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly presence?: boolean;
    readonly absence?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Suggest using `queryBy*` queries when waiting for disappearance
 *
 * @link https://github.com/testing-library/eslint-plugin-testing-library/tree/main/docs/rules/prefer-query-by-disappearance.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | false   |
 *  ```
 */
namespace PreferQueryByDisappearance {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Ensure the configured `get*`/`query*` query is used with the corresponding
 * matchers
 *
 * @link https://github.com/testing-library/eslint-plugin-testing-library/tree/main/docs/rules/prefer-query-matchers.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 *  ```
 */
namespace PreferQueryMatchers {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "validEntries": {
   *         "type": "array",
   *         "items": {
   *           "type": "object",
   *           "properties": {
   *             "query": {
   *               "type": "string",
   *               "enum": [
   *                 "get",
   *                 "query"
   *               ]
   *             },
   *             "matcher": {
   *               "type": "string"
   *             }
   *           }
   *         }
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly validEntries?: readonly {
      readonly query?: 'get' | 'query';
      readonly matcher?: string;
      readonly [k: string]: unknown;
    }[];
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Suggest using `screen` while querying
 *
 * @link https://github.com/testing-library/eslint-plugin-testing-library/tree/main/docs/rules/prefer-screen-queries.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 *  ```
 */
namespace PreferScreenQueries {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Suggest using `userEvent` over `fireEvent` for simulating user interactions
 *
 * @link https://github.com/testing-library/eslint-plugin-testing-library/tree/main/docs/rules/prefer-user-event.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 *  ```
 */
namespace PreferUserEvent {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "allowedMethods": {
   *         "type": "array"
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly allowedMethods?: readonly unknown[];
    readonly [k: string]: unknown;
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Enforce a valid naming for return value from `render`
 *
 * @link https://github.com/testing-library/eslint-plugin-testing-library/tree/main/docs/rules/render-result-naming-convention.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 *  ```
 */
namespace RenderResultNamingConvention {
  export type RuleEntry = Linter.RuleSeverity;
}

export type EslintTestingLibraryRules = {
  readonly 'testing-library/await-async-events': AwaitAsyncEvents.RuleEntry;
  readonly 'testing-library/await-async-queries': AwaitAsyncQueries.RuleEntry;
  readonly 'testing-library/await-async-utils': AwaitAsyncUtils.RuleEntry;
  readonly 'testing-library/consistent-data-testid': ConsistentDataTestid.RuleEntry;
  readonly 'testing-library/no-await-sync-events': NoAwaitSyncEvents.RuleEntry;
  readonly 'testing-library/no-await-sync-queries': NoAwaitSyncQueries.RuleEntry;
  readonly 'testing-library/no-container': NoContainer.RuleEntry;
  readonly 'testing-library/no-debugging-utils': NoDebuggingUtils.RuleEntry;
  readonly 'testing-library/no-dom-import': NoDomImport.RuleEntry;
  readonly 'testing-library/no-global-regexp-flag-in-query': NoGlobalRegexpFlagInQuery.RuleEntry;
  readonly 'testing-library/no-manual-cleanup': NoManualCleanup.RuleEntry;
  readonly 'testing-library/no-node-access': NoNodeAccess.RuleEntry;
  readonly 'testing-library/no-promise-in-fire-event': NoPromiseInFireEvent.RuleEntry;
  readonly 'testing-library/no-render-in-lifecycle': NoRenderInLifecycle.RuleEntry;
  readonly 'testing-library/no-unnecessary-act': NoUnnecessaryAct.RuleEntry;
  readonly 'testing-library/no-wait-for-multiple-assertions': NoWaitForMultipleAssertions.RuleEntry;
  readonly 'testing-library/no-wait-for-side-effects': NoWaitForSideEffects.RuleEntry;
  readonly 'testing-library/no-wait-for-snapshot': NoWaitForSnapshot.RuleEntry;
  readonly 'testing-library/prefer-explicit-assert': PreferExplicitAssert.RuleEntry;
  readonly 'testing-library/prefer-find-by': PreferFindBy.RuleEntry;
  readonly 'testing-library/prefer-implicit-assert': PreferImplicitAssert.RuleEntry;
  readonly 'testing-library/prefer-presence-queries': PreferPresenceQueries.RuleEntry;
  readonly 'testing-library/prefer-query-by-disappearance': PreferQueryByDisappearance.RuleEntry;
  readonly 'testing-library/prefer-query-matchers': PreferQueryMatchers.RuleEntry;
  readonly 'testing-library/prefer-screen-queries': PreferScreenQueries.RuleEntry;
  readonly 'testing-library/prefer-user-event': PreferUserEvent.RuleEntry;
  readonly 'testing-library/render-result-naming-convention': RenderResultNamingConvention.RuleEntry;
};

export type EslintTestingLibraryRulesOption = {
  readonly 'testing-library/await-async-events': AwaitAsyncEvents.Options;
  readonly 'testing-library/consistent-data-testid': ConsistentDataTestid.Options;
  readonly 'testing-library/no-await-sync-events': NoAwaitSyncEvents.Options;
  readonly 'testing-library/no-debugging-utils': NoDebuggingUtils.Options;
  readonly 'testing-library/no-dom-import': NoDomImport.Options;
  readonly 'testing-library/no-node-access': NoNodeAccess.Options;
  readonly 'testing-library/no-render-in-lifecycle': NoRenderInLifecycle.Options;
  readonly 'testing-library/no-unnecessary-act': NoUnnecessaryAct.Options;
  readonly 'testing-library/prefer-explicit-assert': PreferExplicitAssert.Options;
  readonly 'testing-library/prefer-presence-queries': PreferPresenceQueries.Options;
  readonly 'testing-library/prefer-query-matchers': PreferQueryMatchers.Options;
  readonly 'testing-library/prefer-user-event': PreferUserEvent.Options;
};

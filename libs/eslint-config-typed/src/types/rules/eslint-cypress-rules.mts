/* cSpell:disable */
import { type Linter } from 'eslint';

type SpreadOptionsIfIsArray<
  T extends readonly [Linter.StringSeverity, unknown],
> = T[1] extends readonly unknown[]
  ? readonly [Linter.StringSeverity, ...T[1]]
  : T;

/**
 * Require screenshots to be preceded by an assertion
 *
 * @link https://github.com/cypress-io/eslint-plugin-cypress/blob/master/docs/rules/assertion-before-screenshot.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | deprecated  | false   |
 *  | recommended | false   |
 *  ```
 */
namespace AssertionBeforeScreenshot {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow assigning return values of `cy` calls
 *
 * @link https://github.com/cypress-io/eslint-plugin-cypress/blob/master/docs/rules/no-assigning-return-values.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | deprecated  | false   |
 *  | recommended | true    |
 *  ```
 */
namespace NoAssigningReturnValues {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow using `async`/`await` in Cypress `before` methods
 *
 * @link https://github.com/cypress-io/eslint-plugin-cypress/blob/master/docs/rules/no-async-before.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | deprecated  | false   |
 *  | recommended | true    |
 *  ```
 */
namespace NoAsyncBefore {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow using `async`/`await` in Cypress test cases
 *
 * @link https://github.com/cypress-io/eslint-plugin-cypress/blob/master/docs/rules/no-async-tests.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | deprecated  | false   |
 *  | recommended | true    |
 *  ```
 */
namespace NoAsyncTests {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow chain of `cy.get()` calls
 *
 * @link https://github.com/cypress-io/eslint-plugin-cypress/blob/master/docs/rules/no-chained-get.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | deprecated  | false   |
 *  | recommended | false   |
 *  ```
 */
namespace NoChainedGet {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow using `cy.debug()` calls
 *
 * @link https://github.com/cypress-io/eslint-plugin-cypress/blob/master/docs/rules/no-debug.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | recommended | false      |
 *  ```
 */
namespace NoDebug {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow using `force: true` with action commands
 *
 * @link https://github.com/cypress-io/eslint-plugin-cypress/blob/master/docs/rules/no-force.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | recommended | false      |
 *  ```
 */
namespace NoForce {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow using `cy.pause()` calls
 *
 * @link https://github.com/cypress-io/eslint-plugin-cypress/blob/master/docs/rules/no-pause.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | recommended | false      |
 *  ```
 */
namespace NoPause {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow waiting for arbitrary time periods
 *
 * @link https://github.com/cypress-io/eslint-plugin-cypress/blob/master/docs/rules/no-unnecessary-waiting.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | deprecated  | false   |
 *  | recommended | true    |
 *  ```
 */
namespace NoUnnecessaryWaiting {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow using `cy.xpath()` calls
 *
 * @link https://github.com/cypress-io/eslint-plugin-cypress/blob/master/docs/rules/no-xpath.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | recommended | false      |
 *  ```
 */
namespace NoXpath {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Require `data-*` attribute selectors
 *
 * @link https://github.com/cypress-io/eslint-plugin-cypress/blob/master/docs/rules/require-data-selectors.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | recommended | false      |
 *  ```
 */
namespace RequireDataSelectors {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow actions within chains
 *
 * @link https://github.com/cypress-io/eslint-plugin-cypress/blob/master/docs/rules/unsafe-to-chain-command.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | deprecated  | false   |
 *  | recommended | true    |
 *  ```
 */
namespace UnsafeToChainCommand {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "title": "rules",
   *     "description": "disallow actions within chains",
   *     "type": "object",
   *     "properties": {
   *       "methods": {
   *         "type": "array",
   *         "description": "An additional list of methods to check for unsafe chaining.",
   *         "default": []
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  /** Disallow actions within chains */
  export type Options = Readonly<{
    /**
     * An additional list of methods to check for unsafe chaining.
     *
     * @default [ ]
     */
    methods?: readonly unknown[];
    [k: string]: unknown;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

export type EslintCypressRules = Readonly<{
  'cypress/assertion-before-screenshot': AssertionBeforeScreenshot.RuleEntry;
  'cypress/no-assigning-return-values': NoAssigningReturnValues.RuleEntry;
  'cypress/no-async-before': NoAsyncBefore.RuleEntry;
  'cypress/no-async-tests': NoAsyncTests.RuleEntry;
  'cypress/no-chained-get': NoChainedGet.RuleEntry;
  'cypress/no-debug': NoDebug.RuleEntry;
  'cypress/no-force': NoForce.RuleEntry;
  'cypress/no-pause': NoPause.RuleEntry;
  'cypress/no-unnecessary-waiting': NoUnnecessaryWaiting.RuleEntry;
  'cypress/no-xpath': NoXpath.RuleEntry;
  'cypress/require-data-selectors': RequireDataSelectors.RuleEntry;
  'cypress/unsafe-to-chain-command': UnsafeToChainCommand.RuleEntry;
}>;

export type EslintCypressRulesOption = Readonly<{
  'cypress/unsafe-to-chain-command': UnsafeToChainCommand.Options;
}>;

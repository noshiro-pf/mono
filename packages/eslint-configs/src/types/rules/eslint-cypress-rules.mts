/* cSpell:disable */
import { type Linter } from 'eslint';

type SpreadOptionsIfIsArray<T extends readonly [Linter.RuleSeverity, unknown]> =
  T[1] extends readonly unknown[] ? readonly [Linter.RuleSeverity, ...T[1]] : T;

/**
 * Disallow assigning return values of `cy` calls
 *
 * @link https://github.com/cypress-io/eslint-plugin-cypress/blob/master/docs/rules/no-assigning-return-values.md
 *
 *  ```md
 *  | key         | value           |
 *  | :---------- | :-------------- |
 *  | type        | problem         |
 *  | category    | Possible Errors |
 *  | recommended | true            |
 *  ```
 */
namespace NoAssigningReturnValues {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow actions within chains
 *
 * @link https://github.com/cypress-io/eslint-plugin-cypress/blob/master/docs/rules/unsafe-to-chain-command.md
 *
 *  ```md
 *  | key         | value           |
 *  | :---------- | :-------------- |
 *  | type        | problem         |
 *  | category    | Possible Errors |
 *  | recommended | true            |
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
  export type Options = {
    /** An additional list of methods to check for unsafe chaining. */
    readonly methods?: readonly unknown[];
    readonly [k: string]: unknown;
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Disallow waiting for arbitrary time periods
 *
 * @link https://github.com/cypress-io/eslint-plugin-cypress/blob/master/docs/rules/no-unnecessary-waiting.md
 *
 *  ```md
 *  | key         | value           |
 *  | :---------- | :-------------- |
 *  | type        | problem         |
 *  | category    | Possible Errors |
 *  | recommended | true            |
 *  ```
 */
namespace NoUnnecessaryWaiting {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow using `async`/`await` in Cypress `before` methods
 *
 * @link https://github.com/cypress-io/eslint-plugin-cypress/blob/master/docs/rules/no-async-before.md
 *
 *  ```md
 *  | key         | value           |
 *  | :---------- | :-------------- |
 *  | type        | problem         |
 *  | category    | Possible Errors |
 *  | recommended | true            |
 *  ```
 */
namespace NoAsyncBefore {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow using `async`/`await` in Cypress test cases
 *
 * @link https://github.com/cypress-io/eslint-plugin-cypress/blob/master/docs/rules/no-async-tests.md
 *
 *  ```md
 *  | key         | value           |
 *  | :---------- | :-------------- |
 *  | type        | problem         |
 *  | category    | Possible Errors |
 *  | recommended | true            |
 *  ```
 */
namespace NoAsyncTests {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Require screenshots to be preceded by an assertion
 *
 * @link https://github.com/cypress-io/eslint-plugin-cypress/blob/master/docs/rules/assertion-before-screenshot.md
 *
 *  ```md
 *  | key         | value           |
 *  | :---------- | :-------------- |
 *  | type        | problem         |
 *  | category    | Possible Errors |
 *  | recommended | false           |
 *  ```
 */
namespace AssertionBeforeScreenshot {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Require `data-*` attribute selectors
 *
 * @link https://github.com/cypress-io/eslint-plugin-cypress/blob/master/docs/rules/require-data-selectors.md
 *
 *  ```md
 *  | key         | value           |
 *  | :---------- | :-------------- |
 *  | type        | suggestion      |
 *  | category    | Possible Errors |
 *  | recommended | false           |
 *  ```
 */
namespace RequireDataSelectors {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow using `force: true` with action commands
 *
 * @link https://github.com/cypress-io/eslint-plugin-cypress/blob/master/docs/rules/no-force.md
 *
 *  ```md
 *  | key         | value           |
 *  | :---------- | :-------------- |
 *  | type        | suggestion      |
 *  | category    | Possible Errors |
 *  | recommended | false           |
 *  ```
 */
namespace NoForce {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow using `cy.pause()` calls
 *
 * @link https://github.com/cypress-io/eslint-plugin-cypress/blob/master/docs/rules/no-pause.md
 *
 *  ```md
 *  | key         | value           |
 *  | :---------- | :-------------- |
 *  | type        | suggestion      |
 *  | category    | Possible Errors |
 *  | recommended | false           |
 *  ```
 */
namespace NoPause {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow using `cy.debug()` calls
 *
 * @link https://github.com/cypress-io/eslint-plugin-cypress/blob/master/docs/rules/no-debug.md
 *
 *  ```md
 *  | key         | value           |
 *  | :---------- | :-------------- |
 *  | type        | suggestion      |
 *  | category    | Possible Errors |
 *  | recommended | false           |
 *  ```
 */
namespace NoDebug {
  export type RuleEntry = Linter.RuleSeverity;
}

export type EslintCypressRules = {
  readonly 'cypress/no-assigning-return-values': NoAssigningReturnValues.RuleEntry;
  readonly 'cypress/unsafe-to-chain-command': UnsafeToChainCommand.RuleEntry;
  readonly 'cypress/no-unnecessary-waiting': NoUnnecessaryWaiting.RuleEntry;
  readonly 'cypress/no-async-before': NoAsyncBefore.RuleEntry;
  readonly 'cypress/no-async-tests': NoAsyncTests.RuleEntry;
  readonly 'cypress/assertion-before-screenshot': AssertionBeforeScreenshot.RuleEntry;
  readonly 'cypress/require-data-selectors': RequireDataSelectors.RuleEntry;
  readonly 'cypress/no-force': NoForce.RuleEntry;
  readonly 'cypress/no-pause': NoPause.RuleEntry;
  readonly 'cypress/no-debug': NoDebug.RuleEntry;
};

export type EslintCypressRulesOption = {
  readonly 'cypress/unsafe-to-chain-command': UnsafeToChainCommand.Options;
};
/* cSpell:disable */
import { type Linter } from 'eslint';

type SpreadOptionsIfIsArray<T extends readonly [Linter.RuleLevel, unknown]> =
  T[1] extends readonly unknown[] ? readonly [Linter.RuleLevel, ...T[1]] : T;

/**
 * @description Prevent assigning return values of cy calls
 * @link https://on.cypress.io/best-practices#Assigning-Return-Values
 *
 *  | key         | value           |
 *  | :---------- | :-------------- |
 *  | category    | Possible Errors |
 *  | recommended | true            |
 */
namespace NoAssigningReturnValues {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Actions should be in the end of chains, not in the middle
 * @link https://docs.cypress.io/guides/core-concepts/retry-ability#Actions-should-be-at-the-end-of-chains-not-the-middle
 *
 *  | key         | value           |
 *  | :---------- | :-------------- |
 *  | category    | Possible Errors |
 *  | recommended | true            |
 */
namespace UnsafeToChainCommand {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "title": "rules",
   *     "description": "Actions should be in the end of chains, not in the middle",
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
  /**
   * Actions should be in the end of chains, not in the middle
   */
  export type Options = {
    /**
     * An additional list of methods to check for unsafe chaining.
     */
    readonly methods?: readonly unknown[];
    readonly [k: string]: unknown;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Prevent waiting for arbitrary time periods
 * @link https://on.cypress.io/best-practices#Unnecessary-Waiting
 *
 *  | key         | value           |
 *  | :---------- | :-------------- |
 *  | category    | Possible Errors |
 *  | recommended | true            |
 */
namespace NoUnnecessaryWaiting {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Prevent using async/await in Cypress test cases
 *
 *  | key         | value           |
 *  | :---------- | :-------------- |
 *  | category    | Possible Errors |
 *  | recommended | true            |
 */
namespace NoAsyncTests {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Assert on the page state before taking a screenshot, so the screenshot is consistent
 *
 *  | key         | value           |
 *  | :---------- | :-------------- |
 *  | category    | Possible Errors |
 *  | recommended | false           |
 */
namespace AssertionBeforeScreenshot {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Use data-* attributes to provide context to your selectors and insulate them from CSS or JS changes https://docs.cypress.io/guides/references/best-practices.html#Selecting-Elements
 * @link https://docs.cypress.io/guides/references/best-practices.html#Selecting-Elements
 *
 *  | key         | value           |
 *  | :---------- | :-------------- |
 *  | category    | Possible Errors |
 *  | recommended | false           |
 */
namespace RequireDataSelectors {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow using of 'force: true' option for click and type calls
 *
 *  | key         | value           |
 *  | :---------- | :-------------- |
 *  | category    | Possible Errors |
 *  | recommended | false           |
 */
namespace NoForce {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow using of 'cy.pause' calls
 *
 *  | key         | value           |
 *  | :---------- | :-------------- |
 *  | category    | Possible Errors |
 *  | recommended | false           |
 */
namespace NoPause {
  export type RuleEntry = Linter.RuleLevel;
}

export type EslintCypressRules = {
  readonly 'cypress/no-assigning-return-values': NoAssigningReturnValues.RuleEntry;
  readonly 'cypress/unsafe-to-chain-command': UnsafeToChainCommand.RuleEntry;
  readonly 'cypress/no-unnecessary-waiting': NoUnnecessaryWaiting.RuleEntry;
  readonly 'cypress/no-async-tests': NoAsyncTests.RuleEntry;
  readonly 'cypress/assertion-before-screenshot': AssertionBeforeScreenshot.RuleEntry;
  readonly 'cypress/require-data-selectors': RequireDataSelectors.RuleEntry;
  readonly 'cypress/no-force': NoForce.RuleEntry;
  readonly 'cypress/no-pause': NoPause.RuleEntry;
};

export type EslintCypressRulesOption = {
  readonly 'cypress/unsafe-to-chain-command': UnsafeToChainCommand.Options;
};

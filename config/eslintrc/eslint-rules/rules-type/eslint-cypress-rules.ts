/* cSpell:disable */
/* eslint-disable functional/no-mixed-types */
/* eslint-disable functional/readonly-type */
/* eslint-disable @typescript-eslint/sort-type-constituents */
import { type Linter } from 'eslint';

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
  readonly 'cypress/no-unnecessary-waiting': NoUnnecessaryWaiting.RuleEntry;
  readonly 'cypress/no-async-tests': NoAsyncTests.RuleEntry;
  readonly 'cypress/assertion-before-screenshot': AssertionBeforeScreenshot.RuleEntry;
  readonly 'cypress/require-data-selectors': RequireDataSelectors.RuleEntry;
  readonly 'cypress/no-force': NoForce.RuleEntry;
  readonly 'cypress/no-pause': NoPause.RuleEntry;
};

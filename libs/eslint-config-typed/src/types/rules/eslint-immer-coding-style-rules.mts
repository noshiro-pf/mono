/* cSpell:disable */
import type { Linter } from 'eslint';

/**
 * @description Require the `mut_` prefix on the draft parameter of an immer recipe.
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  | fixable    | code       |
 *  ```
 */
namespace MutPrefixedDraft {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prefer the curried overload of immer produce for shorter updater definitions.
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  | fixable    | code       |
 *  ```
 */
namespace PreferCurriedProduce {
  export type RuleEntry = Linter.StringSeverity;
}

export type EslintImmerCodingStyleRules = Readonly<{
  'immer-coding-style/mut-prefixed-draft': MutPrefixedDraft.RuleEntry;
  'immer-coding-style/prefer-curried-produce': PreferCurriedProduce.RuleEntry;
}>;

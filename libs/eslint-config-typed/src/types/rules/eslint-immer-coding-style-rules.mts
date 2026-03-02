/* cSpell:disable */
import { type Linter } from 'eslint';

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
  'immer-coding-style/prefer-curried-produce': PreferCurriedProduce.RuleEntry;
}>;

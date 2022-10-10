/* cSpell:disable */
/* eslint-disable @typescript-eslint/sort-type-union-intersection-members */
import type { Linter } from 'eslint';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type SpreadOptionsIfIsArray<T extends readonly [Linter.RuleLevel, unknown]> =
  T[1] extends readonly unknown[] ? readonly [Linter.RuleLevel, ...T[1]] : T;

/**
 * @description enforces the Rules of Hooks
 * @link https://reactjs.org/docs/hooks-rules.html
 *
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | true    |
 */
namespace RulesOfHooks {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description verifies the list of dependencies for Hooks like useEffect and similar
 * @link https://github.com/facebook/react/issues/14920
 *
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 *  | recommended    | true       |
 */
namespace ExhaustiveDeps {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "enableDangerousAutofixThisMayCauseInfiniteLoops": false,
   *     "properties": {
   *       "additionalHooks": {
   *         "type": "string"
   *       },
   *       "enableDangerousAutofixThisMayCauseInfiniteLoops": {
   *         "type": "boolean"
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly additionalHooks?: string;
    readonly enableDangerousAutofixThisMayCauseInfiniteLoops?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

export type EslintReactHooksRules = {
  readonly 'react-hooks/rules-of-hooks': RulesOfHooks.RuleEntry;
  readonly 'react-hooks/exhaustive-deps': ExhaustiveDeps.RuleEntry;
};

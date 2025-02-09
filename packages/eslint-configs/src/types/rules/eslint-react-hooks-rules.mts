/* cSpell:disable */
import { type Linter } from 'eslint';
import { type RuleSeverityWithDefaultOption } from '../rule-severity-branded.mjs';

type SpreadOptionsIfIsArray<
  T extends readonly [Linter.StringSeverity, unknown],
> = T[1] extends readonly unknown[]
  ? readonly [Linter.StringSeverity, ...T[1]]
  : T;

/**
 * Enforces the Rules of Hooks
 *
 * @link https://reactjs.org/docs/hooks-rules.html
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | true    |
 *  ```
 */
namespace RulesOfHooks {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Verifies the list of dependencies for Hooks like useEffect and similar
 *
 * @link https://github.com/facebook/react/issues/14920
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 *  | recommended    | true       |
 *  ```
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
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

export type EslintReactHooksRules = {
  readonly 'react-hooks/rules-of-hooks': RulesOfHooks.RuleEntry;
  readonly 'react-hooks/exhaustive-deps': ExhaustiveDeps.RuleEntry;
};

export type EslintReactHooksRulesOption = {
  readonly 'react-hooks/exhaustive-deps': ExhaustiveDeps.Options;
};

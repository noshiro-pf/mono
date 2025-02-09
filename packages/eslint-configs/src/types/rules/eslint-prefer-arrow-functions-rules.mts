/* cSpell:disable */
import { type Linter } from 'eslint';
import { type RuleSeverityWithDefaultOption } from '../rule-severity-branded.mjs';

type SpreadOptionsIfIsArray<
  T extends readonly [Linter.StringSeverity, unknown],
> = T[1] extends readonly unknown[]
  ? readonly [Linter.StringSeverity, ...T[1]]
  : T;

/**
 * Auto-fix plain Functions into Arrow Functions, in all cases where conversion
 * would result in the same behaviour
 *
 * @link https://github.com/JamieMason/prefer-arrow-functions
 *
 *  ```md
 *  | key     | value      |
 *  | :------ | :--------- |
 *  | type    | suggestion |
 *  | fixable | code       |
 *  ```
 */
namespace PreferArrowFunctions {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "additionalProperties": false,
   *     "properties": {
   *       "allowedNames": {
   *         "default": [],
   *         "items": {
   *           "type": "string"
   *         },
   *         "type": "array"
   *       },
   *       "allowNamedFunctions": {
   *         "default": false,
   *         "type": "boolean"
   *       },
   *       "allowObjectProperties": {
   *         "default": false,
   *         "type": "boolean"
   *       },
   *       "classPropertiesAllowed": {
   *         "default": false,
   *         "type": "boolean"
   *       },
   *       "disallowPrototype": {
   *         "default": false,
   *         "type": "boolean"
   *       },
   *       "returnStyle": {
   *         "default": "unchanged",
   *         "pattern": "^(explicit|implicit|unchanged)$",
   *         "type": "string"
   *       },
   *       "singleReturnOnly": {
   *         "default": false,
   *         "type": "boolean"
   *       }
   *     },
   *     "type": "object"
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly allowedNames?: readonly string[];
    readonly allowNamedFunctions?: boolean;
    readonly allowObjectProperties?: boolean;
    readonly classPropertiesAllowed?: boolean;
    readonly disallowPrototype?: boolean;
    readonly returnStyle?: 'explicit' | 'implicit' | 'unchanged'; // modified
    readonly singleReturnOnly?: boolean;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

export type EslintPreferArrowFunctionRules = {
  readonly 'prefer-arrow-functions/prefer-arrow-functions': PreferArrowFunctions.RuleEntry;
};

export type EslintPreferArrowFunctionRulesOption = {
  readonly 'prefer-arrow-functions/prefer-arrow-functions': PreferArrowFunctions.Options;
};

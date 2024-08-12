/* cSpell:disable */
import { type Linter } from 'eslint';

type SpreadOptionsIfIsArray<T extends readonly [Linter.RuleLevel, unknown]> =
  T[1] extends readonly unknown[] ? readonly [Linter.RuleLevel, ...T[1]] : T;

/**
 * Prefer arrow functions
 *
 * ```md
 * | key         | value       |
 * | :---------- | :---------- |
 * | fixable     | code        |
 * | category    | ecmascript6 |
 * | recommended | false       |
 * ```
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
   *       "allowNamedFunctions": {
   *         "type": "boolean"
   *       },
   *       "classPropertiesAllowed": {
   *         "type": "boolean"
   *       },
   *       "disallowPrototype": {
   *         "type": "boolean"
   *       },
   *       "returnStyle": {
   *         "default": "unchanged",
   *         "pattern": "^(explicit|implicit|unchanged)$",
   *         "type": "string"
   *       },
   *       "singleReturnOnly": {
   *         "type": "boolean"
   *       }
   *     },
   *     "type": "object"
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly allowNamedFunctions?: boolean;
    readonly classPropertiesAllowed?: boolean;
    readonly disallowPrototype?: boolean;
    readonly returnStyle?: 'explicit' | 'implicit' | 'unchanged'; // modified
    readonly singleReturnOnly?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

export type EslintPreferArrowFunctionRules = {
  readonly 'prefer-arrow-functions/prefer-arrow-functions': PreferArrowFunctions.RuleEntry;
};

export type EslintPreferArrowFunctionRulesOption = {
  readonly 'prefer-arrow-functions/prefer-arrow-functions': PreferArrowFunctions.Options;
};

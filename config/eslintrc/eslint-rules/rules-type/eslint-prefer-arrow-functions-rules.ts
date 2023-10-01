/* cSpell:disable */
/* eslint-disable functional/no-mixed-types */
/* eslint-disable functional/readonly-type */
/* eslint-disable @typescript-eslint/sort-type-constituents */
import { type Linter } from 'eslint';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type SpreadOptionsIfIsArray<T extends readonly [Linter.RuleLevel, unknown]> =
  T[1] extends readonly unknown[] ? readonly [Linter.RuleLevel, ...T[1]] : T;

/**
 * @description prefer arrow functions
 *
 *  | key         | value       |
 *  | :---------- | :---------- |
 *  | fixable     | code        |
 *  | category    | emcascript6 |
 *  | recommended | false       |
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
    readonly classPropertiesAllowed?: boolean;
    readonly disallowPrototype?: boolean;
    /* modified */
    readonly returnStyle?: 'explicit' | 'implicit' | 'unchanged';
    readonly singleReturnOnly?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

export type PreferArrowFunctionRules = {
  readonly 'prefer-arrow-functions/prefer-arrow-functions': PreferArrowFunctions.RuleEntry;
};

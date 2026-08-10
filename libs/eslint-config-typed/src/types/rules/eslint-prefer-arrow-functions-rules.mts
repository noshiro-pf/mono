/* cSpell:disable */
import { type Linter } from 'eslint';

type SpreadOptionsIfIsArray<
  T extends readonly [Linter.StringSeverity, unknown],
> = T[1] extends readonly unknown[]
  ? readonly [Linter.StringSeverity, ...T[1]]
  : T;

/**
 * @description Auto-fix plain Functions into Arrow Functions, in all cases where conversion would result in the same behaviour
 * @link https://github.com/JamieMason/prefer-arrow-functions
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  | fixable    | code       |
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
   *         "oneOf": [
   *           {
   *             "type": "boolean"
   *           },
   *           {
   *             "type": "string",
   *             "enum": [
   *               "only-expressions"
   *             ]
   *           }
   *         ]
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
   *         "type": "string",
   *         "enum": [
   *           "explicit",
   *           "implicit",
   *           "unchanged"
   *         ]
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
  export type Options = Readonly<{
    /**
     * @default []
     */
    allowedNames?: readonly string[];
    /**
     * @default false
     */
    allowNamedFunctions?: boolean | 'only-expressions';
    /**
     * @default false
     */
    allowObjectProperties?: boolean;
    /**
     * @default false
     */
    classPropertiesAllowed?: boolean;
    /**
     * @default false
     */
    disallowPrototype?: boolean;
    /**
     * @default "unchanged"
     */
    returnStyle?: 'explicit' | 'implicit' | 'unchanged';
    /**
     * @default false
     */
    singleReturnOnly?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

export type EslintPreferArrowFunctionRules = Readonly<{
  'prefer-arrow-functions/prefer-arrow-functions': PreferArrowFunctions.RuleEntry;
}>;

export type EslintPreferArrowFunctionRulesOption = Readonly<{
  'prefer-arrow-functions/prefer-arrow-functions': PreferArrowFunctions.Options;
}>;

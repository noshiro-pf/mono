/* cSpell:disable */
import { type Linter } from 'eslint';

type SpreadOptionsIfIsArray<
  T extends readonly [Linter.StringSeverity, unknown],
> = T[1] extends readonly unknown[]
  ? readonly [Linter.StringSeverity, ...T[1]]
  : T;

/**
 * @description Ensure all properties are destructured from an object when explicitly requested
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  ```
 */
namespace CheckDestructuringCompleteness {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "alwaysCheckReactComponentProps": {
   *         "type": "boolean",
   *         "description": "Always check React component props destructuring without directive keyword"
   *       },
   *       "directiveKeyword": {
   *         "type": "string",
   *         "description": "Custom directive keyword to enable checking (default: \"@check-destructuring-completeness\")"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /**
     * Always check React component props destructuring without directive keyword
     */
    alwaysCheckReactComponentProps?: boolean;
    /**
     * Custom directive keyword to enable checking (default: "@check-destructuring-completeness")
     */
    directiveKeyword?: string;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Disallow type assertions with specified type names
 *
 *  ```md
 *  | key        | value   |
 *  | :--------- | :------ |
 *  | type       | problem |
 *  | deprecated | false   |
 *  | fixable    | code    |
 *  ```
 */
namespace NoRestrictedCastName {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "array",
   *     "items": {
   *       "oneOf": [
   *         {
   *           "type": "string"
   *         },
   *         {
   *           "type": "object",
   *           "properties": {
   *             "name": {
   *               "type": "string"
   *             },
   *             "fixWith": {
   *               "type": "object",
   *               "oneOf": [
   *                 {
   *                   "type": "object",
   *                   "properties": {
   *                     "kind": {
   *                       "type": "string",
   *                       "enum": [
   *                         "type"
   *                       ]
   *                     },
   *                     "name": {
   *                       "type": "string"
   *                     }
   *                   },
   *                   "required": [
   *                     "kind",
   *                     "name"
   *                   ],
   *                   "additionalProperties": false
   *                 },
   *                 {
   *                   "type": "object",
   *                   "properties": {
   *                     "kind": {
   *                       "type": "string",
   *                       "enum": [
   *                         "function"
   *                       ]
   *                     },
   *                     "name": {
   *                       "type": "string"
   *                     }
   *                   },
   *                   "required": [
   *                     "kind",
   *                     "name"
   *                   ],
   *                   "additionalProperties": false
   *                 }
   *               ]
   *             }
   *           },
   *           "required": [
   *             "name"
   *           ],
   *           "additionalProperties": false
   *         }
   *       ]
   *     },
   *     "uniqueItems": true,
   *     "minItems": 0
   *   }
   * ]
   * ```
   */
  /**
   * @minItems 0
   */
  export type Options = readonly (
    | string
    | Readonly<{
        name: string;
        fixWith?: Readonly<
          | {
              kind: 'type';
              name: string;
            }
          | {
              kind: 'function';
              name: string;
            }
        >;
      }>
  )[];

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Disallow specified syntax
 * @link https://eslint.org/docs/latest/rules/no-restricted-syntax
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | recommended | false      |
 *  ```
 */
namespace NoRestrictedSyntax {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "array",
   *     "items": {
   *       "oneOf": [
   *         {
   *           "type": "string"
   *         },
   *         {
   *           "type": "object",
   *           "properties": {
   *             "selector": {
   *               "type": "string"
   *             },
   *             "message": {
   *               "type": "string"
   *             }
   *           },
   *           "required": [
   *             "selector"
   *           ],
   *           "additionalProperties": false
   *         }
   *       ]
   *     },
   *     "uniqueItems": true,
   *     "minItems": 0
   *   }
   * ]
   * ```
   */
  /**
   * @minItems 0
   */
  export type Options = readonly (
    | string
    | Readonly<{
        selector: string;
        message?: string;
      }>
  )[];

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

export type EslintTsRestrictionsRules = Readonly<{
  'ts-restrictions/check-destructuring-completeness': CheckDestructuringCompleteness.RuleEntry;
  'ts-restrictions/no-restricted-cast-name': NoRestrictedCastName.RuleEntry;
  'ts-restrictions/no-restricted-syntax': NoRestrictedSyntax.RuleEntry;
}>;

export type EslintTsRestrictionsRulesOption = Readonly<{
  'ts-restrictions/check-destructuring-completeness': CheckDestructuringCompleteness.Options;
  'ts-restrictions/no-restricted-cast-name': NoRestrictedCastName.Options;
  'ts-restrictions/no-restricted-syntax': NoRestrictedSyntax.Options;
}>;

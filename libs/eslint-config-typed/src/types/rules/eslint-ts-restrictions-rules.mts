/* cSpell:disable */
import { type Linter } from 'eslint';

type SpreadOptionsIfIsArray<
  T extends readonly [Linter.StringSeverity, unknown],
> = T[1] extends readonly unknown[]
  ? readonly [Linter.StringSeverity, ...T[1]]
  : T;

/**
 * Disallow type assertions with specified type names
 *
 * ```md
 * | key        | value   |
 * | :--------- | :------ |
 * | type       | problem |
 * | deprecated | false   |
 * | fixable    | code    |
 * ```
 */
namespace NoRestrictedCastName {
  /**
   * ### schema
   *
   * ```json
   * {
   *   "type": "array",
   *   "items": {
   *     "oneOf": [
   *       {
   *         "type": "string"
   *       },
   *       {
   *         "type": "object",
   *         "properties": {
   *           "name": {
   *             "type": "string"
   *           },
   *           "fixWith": {
   *             "type": "object",
   *             "oneOf": [
   *               {
   *                 "type": "object",
   *                 "properties": {
   *                   "kind": {
   *                     "type": "string",
   *                     "enum": ["type"]
   *                   },
   *                   "name": {
   *                     "type": "string"
   *                   }
   *                 },
   *                 "required": ["kind", "name"],
   *                 "additionalProperties": false
   *               },
   *               {
   *                 "type": "object",
   *                 "properties": {
   *                   "kind": {
   *                     "type": "string",
   *                     "enum": ["function"]
   *                   },
   *                   "name": {
   *                     "type": "string"
   *                   }
   *                 },
   *                 "required": ["kind", "name"],
   *                 "additionalProperties": false
   *               }
   *             ]
   *           }
   *         },
   *         "required": ["name"],
   *         "additionalProperties": false
   *       }
   *     ]
   *   },
   *   "uniqueItems": true,
   *   "minItems": 0
   * }
   * ```
   */
  /** @minItems 0 */
  export type Options = readonly (
    | string
    | {
        readonly name: string;
        readonly fixWith?:
          | {
              readonly kind: 'function';
              readonly name: string;
            }
          | {
              readonly kind: 'type';
              readonly name: string;
            };
      }
  )[];

  export type RuleEntry =
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Disallow specified syntax
 *
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
   * {
   *   "type": "array",
   *   "items": {
   *     "oneOf": [
   *       {
   *         "type": "string"
   *       },
   *       {
   *         "type": "object",
   *         "properties": {
   *           "selector": {
   *             "type": "string"
   *           },
   *           "message": {
   *             "type": "string"
   *           }
   *         },
   *         "required": ["selector"],
   *         "additionalProperties": false
   *       }
   *     ]
   *   },
   *   "uniqueItems": true,
   *   "minItems": 0
   * }
   * ```
   */
  /** @minItems 0 */
  export type Options = readonly (
    | string
    | {
        readonly selector: string;
        readonly message?: string;
      }
  )[];

  export type RuleEntry =
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

export type EslintTsRestrictionsRules = {
  readonly 'ts-restrictions/no-restricted-cast-name': NoRestrictedCastName.RuleEntry;
  readonly 'ts-restrictions/no-restricted-syntax': NoRestrictedSyntax.RuleEntry;
};

export type EslintTsRestrictionsRulesOption = {
  readonly 'ts-restrictions/no-restricted-cast-name': NoRestrictedCastName.Options;
  readonly 'ts-restrictions/no-restricted-syntax': NoRestrictedSyntax.Options;
};

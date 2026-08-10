/* cSpell:disable */
import { type Linter } from 'eslint';

namespace StrictDependencies {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "array",
   *     "items": {
   *       "type": "object",
   *       "additionalProperties": false,
   *       "required": [
   *         "module",
   *         "allowReferenceFrom"
   *       ],
   *       "properties": {
   *         "module": {
   *           "type": "string"
   *         },
   *         "allowReferenceFrom": {
   *           "type": "array",
   *           "items": {
   *             "type": "string"
   *           }
   *         },
   *         "allowSameModule": {
   *           "type": "boolean"
   *         },
   *         "targetMembers": {
   *           "type": "array",
   *           "items": {
   *             "type": "string"
   *           }
   *         },
   *         "excludeTypeImportChecks": {
   *           "type": "boolean"
   *         }
   *       }
   *     }
   *   },
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "resolveRelativeImport": {
   *         "type": "boolean"
   *       },
   *       "pathIndexMap": {
   *         "type": "object",
   *         "additionalProperties": {
   *           "type": "number"
   *         }
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options0 = readonly Readonly<{
    module: string;
    allowReferenceFrom: readonly string[];
    allowSameModule?: boolean;
    targetMembers?: readonly string[];
    excludeTypeImportChecks?: boolean;
  }>[];

  export type Options1 = Readonly<{
    resolveRelativeImport?: boolean;
    pathIndexMap?: Readonly<Record<string, number>>;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | readonly [Linter.StringSeverity, Options0]
    | readonly [Linter.StringSeverity, Options0, Options1];
}

export type EslintStrictDependenciesRules = Readonly<{
  'strict-dependencies/strict-dependencies': StrictDependencies.RuleEntry;
}>;

export type EslintStrictDependenciesRulesOption = Readonly<{
  'strict-dependencies/strict-dependencies': readonly [
    StrictDependencies.Options0,
    StrictDependencies.Options1,
  ];
}>;

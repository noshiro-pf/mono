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
  export type Options0 = readonly {
    readonly module: string;
    readonly allowReferenceFrom: readonly string[];
    readonly allowSameModule?: boolean;
    readonly targetMembers?: readonly string[];
    readonly excludeTypeImportChecks?: boolean;
  }[];

  export type Options1 = {
    readonly resolveRelativeImport?: boolean;
    readonly pathIndexMap?: Record<string, number>;
  };

  export type RuleEntry =
    | Linter.Severity
    | readonly [Linter.StringSeverity, Options0, Options1]
    | readonly [Linter.StringSeverity, Options0]
    | 'off';
}

export type EslintStrictDependenciesRules = {
  readonly 'strict-dependencies/strict-dependencies': StrictDependencies.RuleEntry;
};

export type EslintStrictDependenciesRulesOption = {
  readonly 'strict-dependencies/strict-dependencies': readonly [
    StrictDependencies.Options0,
    StrictDependencies.Options1,
  ];
};

/* cSpell:disable */
import { type Linter } from 'eslint';
import { type RuleSeverityWithDefaultOption } from '../rule-severity-branded.mjs';

namespace StrictDependencies {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "array",
   *     "items": [
   *       {
   *         "type": "object",
   *         "properties": {
   *           "module": {
   *             "type": "string"
   *           },
   *           "allowReferenceFrom": {
   *             "type": "array",
   *             "items": [
   *               {
   *                 "type": "string"
   *               }
   *             ]
   *           },
   *           "allowSameModule": {
   *             "type": "boolean"
   *           },
   *           "excludeTypeImportChecks": {
   *             "type": "boolean"
   *           }
   *         }
   *       }
   *     ]
   *   },
   *   {
   *     "type": "object",
   *     "properties": {
   *       "resolveRelativeImport": {
   *         "type": "boolean"
   *       },
   *       "pathIndexMap": {
   *         "type": "object"
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options0 =
    | readonly [
        {
          readonly module?: string;
          readonly allowReferenceFrom?: readonly [] | readonly [string];
          readonly allowSameModule?: boolean;
          readonly excludeTypeImportChecks?: boolean;
          readonly [k: string]: unknown;
        },
      ]
    | readonly [];

  export type Options1 = {
    readonly resolveRelativeImport?: boolean;
    readonly pathIndexMap?: UnknownRecord;
    readonly [k: string]: unknown;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
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

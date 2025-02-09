/* cSpell:disable */
import { type Linter } from 'eslint';
import { type RuleSeverityWithDefaultOption } from '../rule-severity-branded.mjs';

type SpreadOptionsIfIsArray<
  T extends readonly [Linter.StringSeverity, unknown],
> = T[1] extends readonly unknown[]
  ? readonly [Linter.StringSeverity, ...T[1]]
  : T;

namespace OnlyExportComponents {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "allowExportNames": {
   *         "type": "array",
   *         "items": {
   *           "type": "string"
   *         }
   *       },
   *       "allowConstantExport": {
   *         "type": "boolean"
   *       },
   *       "customHOCs": {
   *         "type": "array",
   *         "items": {
   *           "type": "string"
   *         }
   *       },
   *       "checkJS": {
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly allowExportNames?: readonly string[];
    readonly allowConstantExport?: boolean;
    readonly customHOCs?: readonly string[];
    readonly checkJS?: boolean;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

export type EslintReactRefreshRules = {
  readonly 'react-refresh/only-export-components': OnlyExportComponents.RuleEntry;
};

export type EslintReactRefreshRulesOption = {
  readonly 'react-refresh/only-export-components': OnlyExportComponents.Options;
};

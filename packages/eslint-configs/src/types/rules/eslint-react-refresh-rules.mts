/* cSpell:disable */
import { type Linter } from 'eslint';

type SpreadOptionsIfIsArray<T extends readonly [Linter.RuleSeverity, unknown]> =
  T[1] extends readonly unknown[] ? readonly [Linter.RuleSeverity, ...T[1]] : T;

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
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

export type EslintReactRefreshRules = {
  readonly 'react-refresh/only-export-components': OnlyExportComponents.RuleEntry;
};

export type EslintReactRefreshRulesOption = {
  readonly 'react-refresh/only-export-components': OnlyExportComponents.Options;
};

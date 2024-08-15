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
   *       "allowConstantExport": {
   *         "type": "boolean"
   *       },
   *       "checkJS": {
   *         "type": "boolean"
   *       },
   *       "allowExportNames": {
   *         "type": "array",
   *         "items": {
   *           "type": "string"
   *         }
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly allowConstantExport?: boolean;
    readonly checkJS?: boolean;
    readonly allowExportNames?: readonly string[];
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

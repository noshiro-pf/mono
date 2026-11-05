/* cSpell:disable */
import type { Linter } from 'eslint';

namespace OnlyExportComponents {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "extraHOCs": {
   *         "type": "array",
   *         "items": {
   *           "type": "string"
   *         }
   *       },
   *       "allowExportNames": {
   *         "type": "array",
   *         "items": {
   *           "type": "string"
   *         }
   *       },
   *       "allowConstantExport": {
   *         "type": "boolean"
   *       },
   *       "allowCompoundComponents": {
   *         "type": "boolean"
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
  export type Options = Readonly<{
    extraHOCs?: readonly string[];
    allowExportNames?: readonly string[];
    allowConstantExport?: boolean;
    allowCompoundComponents?: boolean;
    checkJS?: boolean;
  }>;

  export type RuleEntry =
    'off' | Linter.Severity | readonly [Linter.StringSeverity, Options];
}

export type EslintReactRefreshRules = Readonly<{
  'react-refresh/only-export-components': OnlyExportComponents.RuleEntry;
}>;

export type EslintReactRefreshRulesOption = Readonly<{
  'react-refresh/only-export-components': OnlyExportComponents.Options;
}>;

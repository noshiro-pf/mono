/* cSpell:disable */
import { type Linter } from 'eslint';

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
  export type Options = Readonly<{
    allowExportNames?: readonly string[];
    allowConstantExport?: boolean;
    customHOCs?: readonly string[];
    checkJS?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

export type EslintReactRefreshRules = Readonly<{
  'react-refresh/only-export-components': OnlyExportComponents.RuleEntry;
}>;

export type EslintReactRefreshRulesOption = Readonly<{
  'react-refresh/only-export-components': OnlyExportComponents.Options;
}>;

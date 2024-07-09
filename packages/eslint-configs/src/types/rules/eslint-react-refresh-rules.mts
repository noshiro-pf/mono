/* cSpell:disable */
import { type Linter } from 'eslint';

type SpreadOptionsIfIsArray<T extends readonly [Linter.RuleLevel, unknown]> =
  T[1] extends readonly unknown[] ? readonly [Linter.RuleLevel, ...T[1]] : T;

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
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

export type EslintReactRefresh = {
  readonly 'react-refresh/only-export-components': OnlyExportComponents.RuleEntry;
};

export type EslintReactRefreshOption = {
  readonly 'react-refresh/only-export-components': OnlyExportComponents.Options;
};

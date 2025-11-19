/* cSpell:disable */
import { type Linter } from 'eslint';

type SpreadOptionsIfIsArray<
  T extends readonly [Linter.StringSeverity, unknown],
> = T[1] extends readonly unknown[]
  ? readonly [Linter.StringSeverity, ...T[1]]
  : T;

/**
 * Require object destructure keys to be sorted
 *
 * ```md
 * | key         | value |
 * | :---------- | :---- |
 * | deprecated  | false |
 * | fixable     | code  |
 * | recommended | false |
 * ```
 */
namespace SortDestructureKeys {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "caseSensitive": {
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    caseSensitive?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

export type EslintPluginSortDestructureKeysRules = Readonly<{
  'sort-destructure-keys/sort-destructure-keys': SortDestructureKeys.RuleEntry;
}>;

export type EslintPluginSortDestructureKeysRulesOption = Readonly<{
  'sort-destructure-keys/sort-destructure-keys': SortDestructureKeys.Options;
}>;

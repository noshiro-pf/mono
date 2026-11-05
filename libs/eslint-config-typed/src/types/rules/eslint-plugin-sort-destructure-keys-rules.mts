/* cSpell:disable */
import type { Linter } from 'eslint';

/**
 * @description require object destructure keys to be sorted
 *
 *  ```md
 *  | key         | value |
 *  | :---------- | :---- |
 *  | deprecated  | false |
 *  | fixable     | code  |
 *  | recommended | false |
 *  ```
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
    'off' | Linter.Severity | readonly [Linter.StringSeverity, Options];
}

export type EslintPluginSortDestructureKeysRules = Readonly<{
  'sort-destructure-keys/sort-destructure-keys': SortDestructureKeys.RuleEntry;
}>;

export type EslintPluginSortDestructureKeysRulesOption = Readonly<{
  'sort-destructure-keys/sort-destructure-keys': SortDestructureKeys.Options;
}>;

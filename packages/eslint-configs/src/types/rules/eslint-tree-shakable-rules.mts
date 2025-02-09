/* cSpell:disable */
import { type Linter } from 'eslint';

/**
 * Forbits non-tree-shakable access to module name space objects.
 *
 * ```md
 * | key         | value   |
 * | :---------- | :------ |
 * | type        | problem |
 * | recommended | error   |
 * ```
 */
namespace ImportStar {
  export type RuleEntry = Linter.StringSeverity;
}

export type EslintTreeShakableRules = {
  readonly 'tree-shakable/import-star': ImportStar.RuleEntry;
};

/* cSpell:disable */
import { type Linter } from 'eslint';

/**
 * Do not use deprecated APIs.
 *
 * @link https://github.com/gund/eslint-plugin-deprecation
 *
 *  ```md
 *  | key                  | value   |
 *  | :------------------- | :------ |
 *  | type                 | problem |
 *  | requiresTypeChecking | true    |
 *  ```
 */
namespace Deprecation {
  export type RuleEntry = Linter.RuleSeverity;
}

export type EslintDeprecationRules = {
  readonly 'deprecation/deprecation': Deprecation.RuleEntry;
};

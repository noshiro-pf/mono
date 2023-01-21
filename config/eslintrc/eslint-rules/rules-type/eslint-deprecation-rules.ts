/* cSpell:disable */
/* eslint-disable @typescript-eslint/sort-type-constituents */
import type { Linter } from 'eslint';

/**
 * @description Do not use deprecated APIs.
 * @link https://github.com/gund/eslint-plugin-deprecation
 *
 *  | key                  | value   |
 *  | :------------------- | :------ |
 *  | type                 | problem |
 *  | recommended          | warn    |
 *  | requiresTypeChecking | true    |
 */
namespace Deprecation {
  export type RuleEntry = Linter.RuleLevel;
}

export type EslintDeprecationRules = {
  readonly 'deprecation/deprecation': Deprecation.RuleEntry;
};
